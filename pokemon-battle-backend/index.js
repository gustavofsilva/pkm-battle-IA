const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getPokemonDetails } = require('./pokemonData');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;

const games = {};

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Helper function to sanitize game state for broadcasting (remove ws objects)
const getSanitizedGameState = (gameId) => {
    if (!games[gameId]) return null;
    const game = games[gameId];
    // Create a deep copy to avoid mutating the original 'ws' property on players
    const gameCopy = JSON.parse(JSON.stringify(game));
    gameCopy.players.forEach(p => delete p.ws); // Remove ws from the copy
    return gameCopy;
};

// Helper function to broadcast game state to all connected clients in a game
const broadcastGameState = (gameId) => {
    const game = games[gameId];
    if (!game) {
        console.log(`[WebSocket] Broadcast: Game ${gameId} not found, cannot broadcast.`);
        return;
    }

    const sanitizedGameState = getSanitizedGameState(gameId); // Use the modified sanitizer
    if (!sanitizedGameState) {
        console.log(`[WebSocket] Broadcast: Sanitized game state for ${gameId} is null, cannot broadcast.`);
        return;
    }

    console.log(`[WebSocket] Broadcasting game state for game ${gameId} to players.`);
    game.players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(JSON.stringify({ type: 'gameStateUpdate', payload: sanitizedGameState }));
            } catch (error) {
                console.error(`[WebSocket] Error sending state to player ${player.id} in game ${gameId}:`, error);
            }
        }
    });
};

wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const gameId = parameters.gameId;
    const connectingPlayerId = parameters.playerId; // Renamed to avoid conflict with 'player' variable

    if (!gameId || !connectingPlayerId) {
        console.log('[WebSocket] Connection rejected: Missing gameId or playerId.');
        ws.terminate();
        return;
    }

    if (!games[gameId]) {
        console.log(`[WebSocket] Game ${gameId} not found for player ${connectingPlayerId}. Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found. Ensure Game ID is correct.' }));
        ws.terminate();
        return;
    }

    const game = games[gameId];
    let player = game.players.find(p => p.id === connectingPlayerId);

    if (!player && game.players.length >= 2) {
        console.log(`[WebSocket] Game ${gameId} is full. Player ${connectingPlayerId} cannot join. Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'This game is already full.' }));
        ws.terminate();
        return;
    }

    if (!player) {
        console.log(`[WebSocket] Player ${connectingPlayerId} not found in game ${gameId} (must join via HTTP first). Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Player not found in this game. Please join via HTTP POST first.' }));
        ws.terminate();
        return;
    }

    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
        console.log(`[WebSocket] Player ${connectingPlayerId} in game ${gameId} already has an active WebSocket connection. Terminating new connection.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Already connected. Closing this new connection.'}));
        ws.terminate();
        return;
    }

    player.ws = ws; // Assign the WebSocket connection to the player object
    console.log(`[WebSocket] Client connected and associated: gameId=${gameId}, playerId=${connectingPlayerId}`);
    ws.send(JSON.stringify({ type: 'connection_ack', message: `Connected to game ${gameId} as player ${connectingPlayerId}`}));

    // If the other player was waiting due to a disconnection, update game state
    if (game.state === 'opponent_disconnected' && game.players.length === 2) {
        // Check if both players are now connected
        const otherPlayer = game.players.find(p => p.id !== connectingPlayerId);
        if (otherPlayer && otherPlayer.ws && otherPlayer.ws.readyState === WebSocket.OPEN) {
            // Both players are connected, revert to previous active state (e.g. battle or selection)
            // This needs more sophisticated state tracking to know what the "previous" state was.
            // For now, let's assume if both selected pokemon, go to battle, else selection.
            if (game.players.every(p => p.hasSelectedPokemon)) {
                game.state = 'battle';
                 if (!game.turn) { // If turn wasn't set or needs resetting
                    game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
                }
            } else {
                game.state = 'selecting_pokemon';
            }
            console.log(`[WebSocket] Player ${connectingPlayerId} reconnected. Game ${gameId} state changed to ${game.state}.`);
        }
    }
    broadcastGameState(gameId); // Send current state to all, including newly connected/reconnected

    ws.on('message', (message) => {
        console.log(`[WebSocket] Msg from ${connectingPlayerId}@${gameId}: ${message}`);
    });

    ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected: gameId=${gameId}, playerId=${connectingPlayerId}`);
        if (player) player.ws = null;

        // Check if the game should be marked as opponent_disconnected
        // Only if game was in an active state and not already finished
        if (game && (game.state === 'battle' || game.state === 'selecting_pokemon' || game.state === 'waiting_for_other_player_selection')) {
            // Check if the other player is still connected
            const otherPlayer = game.players.find(p => p.id !== connectingPlayerId);
            if (otherPlayer) { // If there is another player
                game.state = 'opponent_disconnected';
                game.turn = null; // No one's turn if someone is disconnected
                console.log(`[Game ${gameId}] Player ${connectingPlayerId} disconnected. State changed to 'opponent_disconnected'.`);
                broadcastGameState(gameId);
            } else {
                // If no other player, game might effectively end or reset (e.g. if only one player ever joined)
                // For now, just log. If this was a 1-player game that got disconnected.
                console.log(`[Game ${gameId}] Player ${connectingPlayerId} disconnected. No other players.`);
            }
        } else if (game && game.state === 'opponent_disconnected') {
            // If one player disconnects, and then the other also disconnects while state is 'opponent_disconnected'
            // The game is effectively abandoned. Could reset or mark as finished with no winner.
            // For now, no further state change, just ensure ws is null.
            console.log(`[Game ${gameId}] Player ${connectingPlayerId} disconnected while game was already in 'opponent_disconnected' state.`);
        }
    });

    ws.on('error', (error) => {
        console.error(`[WebSocket] Error for ${connectingPlayerId}@${gameId}:`, error);
        if (player) player.ws = null; // Clean up on error too
         if (game && (game.state === 'battle' || game.state === 'selecting_pokemon' || game.state === 'waiting_for_other_player_selection')) {
            game.state = 'opponent_disconnected'; // Treat error same as close for game state
            game.turn = null;
            console.log(`[Game ${gameId}] Error on WS for ${connectingPlayerId}. State changed to 'opponent_disconnected'.`);
            broadcastGameState(gameId);
        }
    });
});

// --- Express Routes --- (No changes to routes needed for this specific subtask)

app.post('/game', (req, res) => {
    const gameId = `game_${Date.now()}`;
    games[gameId] = { id: gameId, players: [], state: 'waiting_for_players', turn: null, winner: null };
    console.log(`[Game ${gameId}] Created`);
    res.status(201).json({ gameId, message: 'Game created. Join via /game/:id/join and connect WebSocket.' });
});

app.post('/game/:id/join', (req, res) => {
    const gameId = req.params.id;
    const { playerId } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    let player = game.players.find(p => p.id === playerId);

    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        return res.status(400).json({ message: `Player ${playerId} already actively connected.` });
    }
    if (!player && game.players.length >= 2) {
        return res.status(400).json({ message: 'Game is already full.' });
    }
    if (!playerId) return res.status(400).json({ message: 'Player ID required.' });

    if (!player) {
         player = { id: playerId, pokemon: null, hasSelectedPokemon: false, ws: null };
         game.players.push(player);
         console.log(`[Game ${gameId}] Player ${playerId} added to game`);
    } else {
        console.log(`[Game ${gameId}] Player ${playerId} re-confirmed in game.`);
    }

    let message = `Player ${playerId} in game ${gameId}.`;
    if (game.players.length === 2 && game.state === 'waiting_for_players') {
        game.state = 'selecting_pokemon';
        message = `Both players joined. Game ready for Pokemon selection.`;
        console.log(`[Game ${gameId}] State changed to 'selecting_pokemon'`);
    } else if (game.players.length < 2) {
        message = `Player ${playerId} joined. Waiting for opponent.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message, playerPId: player.id, currentGameState: game.state });
});

app.post('/game/:id/select-pokemon', (req, res) => {
    const gameId = req.params.id;
    const { playerId, pokemonName } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    if (game.state !== 'selecting_pokemon' && game.state !== 'opponent_disconnected') {
        // Allow selection if opponent disconnected and player needs to re-select or was in selection
        if (!(game.state === 'opponent_disconnected' && game.players.find(p => p.id === playerId && !p.hasSelectedPokemon))) {
            return res.status(400).json({ message: 'Not in selection phase.' });
        }
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) return res.status(404).json({ message: 'Player not found.' });
    if (player.hasSelectedPokemon && game.state !== 'opponent_disconnected') {
        return res.status(400).json({ message: 'Already selected.' });
    }
    if (!pokemonName) return res.status(400).json({ message: 'Pokemon name required.' });

    const pokemonDetails = getPokemonDetails(pokemonName);
    if (!pokemonDetails) return res.status(404).json({ message: `Pokemon ${pokemonName} not found.` });

    player.pokemon = { ...pokemonDetails, currentHp: pokemonDetails.stats.hp };
    player.hasSelectedPokemon = true;
    console.log(`[Game ${gameId}] Player ${playerId} selected ${pokemonName}`);

    let message = `Player ${playerId} selected ${pokemonName}.`;
    const allPlayersSelected = game.players.every(p => p.hasSelectedPokemon);

    if (game.state === 'opponent_disconnected') { // If one player selected while other was disconnected
        const otherPlayer = game.players.find(p => p.id !== playerId);
        if (otherPlayer && otherPlayer.ws && otherPlayer.ws.readyState === WebSocket.OPEN) { // If other player reconnected
            if (allPlayersSelected) {
                game.state = 'battle';
                game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
                message = `All Pokemon selected after reconnection. Battle begins! It's ${game.turn}'s turn.`;
            } else {
                game.state = 'selecting_pokemon'; // Back to selection if other player still needs to select
                message = `Player ${playerId} selected. Waiting for other player to select after reconnection.`;
            }
        } else {
             message += ` Waiting for opponent to reconnect.`; // Stay in opponent_disconnected or similar
        }
    } else if (allPlayersSelected) {
        game.state = 'battle';
        game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
        message = `All Pokemon selected. Battle begins! It's ${game.turn}'s turn.`;
        console.log(`[Game ${gameId}] State changed to 'battle'. Turn: ${game.turn}`);
    } else {
        message += ` Waiting for other player.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message, currentTurn: game.turn, currentGameState: game.state });
});

app.post('/game/:id/attack', (req, res) => {
    const gameId = req.params.id;
    const { playerId, attackName } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    if (game.state !== 'battle') return res.status(400).json({ message: 'Not in battle phase.' });
    if (game.turn !== playerId) return res.status(400).json({ message: `Not player ${playerId}'s turn.` });

    const attackerPlayer = game.players.find(p => p.id === playerId);
    const defenderPlayer = game.players.find(p => p.id !== playerId);

    if (!attackerPlayer?.pokemon || !defenderPlayer?.pokemon) {
        return res.status(500).json({ message: 'Player or Pokemon data missing.' });
    }
    // Check if opponent is actually connected for an attack to be valid
    if (!defenderPlayer.ws || defenderPlayer.ws.readyState !== WebSocket.OPEN) {
        game.state = 'opponent_disconnected';
        game.turn = null; // No one's turn
        broadcastGameState(gameId);
        return res.status(400).json({ message: 'Opponent is not connected. Cannot attack.', currentGameState: game.state });
    }

    const attackerPokemon = attackerPlayer.pokemon;
    const defenderPokemon = defenderPlayer.pokemon;
    let damage = Math.max(1, Math.floor(attackerPokemon.stats.attack * (Math.random()*0.2 + 0.9)) - Math.floor(defenderPokemon.stats.defense * 0.5));
    if (attackerPokemon.stats.attack > defenderPokemon.stats.defense / 2 && damage <= 0) damage = 1 + Math.floor(Math.random()*5);
    else if (damage <= 0) damage = 1;

    defenderPokemon.currentHp -= damage;
    const usedAttack = attackName || "basic attack";
    console.log(`[Game ${gameId}] ${playerId} (${attackerPokemon.name}) attacked ${defenderPlayer.id} (${defenderPokemon.name}) for ${damage}. Defender HP: ${defenderPokemon.currentHp}`);

    let message;
    if (defenderPokemon.currentHp <= 0) {
        defenderPokemon.currentHp = 0;
        game.state = 'finished';
        game.winner = playerId;
        message = `${playerId} (${attackerPokemon.name}) wins! ${defenderPlayer.id}'s ${defenderPokemon.name} fainted.`;
        console.log(`[Game ${gameId}] State changed to 'finished'. Winner: ${playerId}`);
    } else {
        game.turn = defenderPlayer.id;
        message = `${playerId} (${attackerPokemon.name}) attacked. ${defenderPlayer.id}'s ${defenderPokemon.name} has ${defenderPokemon.currentHp} HP. Turn: ${defenderPlayer.id}.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message, currentGameState: game.state, currentTurn: game.turn, winner: game.winner });
});

app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    const sanitizedGameState = getSanitizedGameState(gameId);
    if (!sanitizedGameState) {
        return res.status(404).json({ message: 'Game not found.' });
    }
    res.json(sanitizedGameState);
});

server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});

module.exports = { app, server };
