const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getPokemonDetails } = require('./pokemonData');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;
const DEFAULT_MAX_TEAM_SIZE = 6; // Default team size
const ABSOLUTE_MAX_TEAM_SIZE = 6; // System-wide maximum, can be different from default

const games = {};

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const getSanitizedGameState = (gameId) => {
    if (!games[gameId]) return null;
    const game = games[gameId];
    const gameCopy = JSON.parse(JSON.stringify(game));
    if (gameCopy.players) {
        gameCopy.players.forEach(p => { delete p.ws; });
    }
    return gameCopy;
};

const broadcastGameState = (gameId) => {
    const game = games[gameId];
    if (!game) { console.log(`[WS] Broadcast: Game ${gameId} not found.`); return; }
    const sanitizedGameState = getSanitizedGameState(gameId);
    if (!sanitizedGameState) { console.log(`[WS] Broadcast: Sanitized GState for ${gameId} is null.`); return; }
    console.log(`[WS] Broadcasting GState for ${gameId} to ${game.players.length} players.`);
    game.players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(JSON.stringify({ type: 'gameStateUpdate', payload: sanitizedGameState }));
            } catch (error) { console.error(`[WS] Error sending state to ${player.id} in ${gameId}:`, error); }
        }
    });
};

wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const gameId = parameters.gameId;
    const connectingPlayerId = parameters.playerId;

    if (!gameId || !connectingPlayerId) { ws.terminate(); return; }
    if (!games[gameId]) { ws.send(JSON.stringify({ type: 'error', message: 'Game not found.' })); ws.terminate(); return; }

    const game = games[gameId];
    let player = game.players.find(p => p.id === connectingPlayerId);

    if (!player && game.players.length >= 2) { ws.send(JSON.stringify({ type: 'error', message: 'Game is full.' })); ws.terminate(); return; }
    if (!player) { ws.send(JSON.stringify({ type: 'error', message: 'Player not found. Join via HTTP first.' })); ws.terminate(); return; }
    if (player.ws && player.ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify({ type: 'error', message: 'Already connected.' })); ws.terminate(); return; }

    player.ws = ws;
    console.log(`[WS] Client connected: gameId=${gameId}, playerId=${connectingPlayerId}`);
    ws.send(JSON.stringify({ type: 'connection_ack', message: `Connected to game ${gameId} as ${connectingPlayerId}`}));

    if (game.state === 'opponent_disconnected' && game.players.length === 2) {
        const otherPlayer = game.players.find(p => p.id !== connectingPlayerId);
        if (otherPlayer && otherPlayer.ws && otherPlayer.ws.readyState === WebSocket.OPEN) {
            if (game.players.every(p => p.hasSelectedParty)) {
                game.state = 'battle';
                 if (!game.turn) game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
            } else {
                game.state = 'selecting_pokemon';
            }
            console.log(`[WS] Player ${connectingPlayerId} reconnected. Game ${gameId} state -> ${game.state}.`);
        }
    }
    broadcastGameState(gameId);

    ws.on('message', (messageString) => {
        console.log(`[WS] Msg from ${connectingPlayerId}@${gameId}: ${messageString}`);
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(messageString);
        } catch (error) {
            console.error(`[WS] Failed to parse message from ${connectingPlayerId}: ${messageString}`);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format.' }));
            return;
        }

        if (parsedMessage.type === 'switchPokemon') {
            const { newActivePokemonIndex } = parsedMessage.payload;

            if (game.state !== 'waiting_for_switch') {
                ws.send(JSON.stringify({ type: 'error', message: 'Not the time to switch Pokemon.' })); return;
            }
            if (game.turn !== connectingPlayerId) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn to switch.' })); return;
            }
            if (newActivePokemonIndex == null || player.party[newActivePokemonIndex] == null) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid Pokemon index for switch.' })); return;
            }
            if (player.party[newActivePokemonIndex].status === 'fainted') {
                ws.send(JSON.stringify({ type: 'error', message: 'Cannot switch to a fainted Pokemon.' })); return;
            }
            if (player.activePokemonIndex === newActivePokemonIndex) {
                 ws.send(JSON.stringify({ type: 'error', message: 'This Pokemon is already active.' })); return;
            }

            player.activePokemonIndex = newActivePokemonIndex;
            game.state = 'battle';

            const opponentPlayer = game.players.find(p => p.id !== connectingPlayerId);
            if (opponentPlayer) { game.turn = opponentPlayer.id; }
            else { console.error(`[Game ${gameId}] Opponent not found for turn switch!`); game.turn = null; }

            console.log(`[Game ${gameId}] Player ${connectingPlayerId} switched to Pokemon at index ${newActivePokemonIndex}. Game state -> 'battle'. Turn -> ${game.turn}`);
            broadcastGameState(gameId);
        }
    });

    ws.on('close', () => { /* ... (existing close logic) ... */ });
    ws.on('error', (error) => { /* ... (existing error logic) ... */ });
});

// --- Express Routes ---
app.post('/game', (req, res) => {
    const gameId = `game_${Date.now()}`;
    let requestedMaxTeamSize = req.body.settings?.maxTeamSize;

    let chosenMaxTeamSize = DEFAULT_MAX_TEAM_SIZE;
    if (typeof requestedMaxTeamSize === 'number' &&
        requestedMaxTeamSize >= 1 &&
        requestedMaxTeamSize <= ABSOLUTE_MAX_TEAM_SIZE) {
        chosenMaxTeamSize = Math.floor(requestedMaxTeamSize);
    } else if (requestedMaxTeamSize !== undefined) {
        // Invalid value provided, could log a warning or send a specific message.
        // For now, defaults silently.
        console.log(`[Game ${gameId}] Invalid maxTeamSize requested (${requestedMaxTeamSize}), defaulting to ${DEFAULT_MAX_TEAM_SIZE}.`);
    }

    games[gameId] = {
        id: gameId,
        players: [],
        state: 'waiting_for_players',
        turn: null,
        winner: null,
        maxTeamSize: chosenMaxTeamSize // Store the chosen team size
    };
    console.log(`[Game ${gameId}] Created with max team size: ${chosenMaxTeamSize}`);
    res.status(201).json({ gameId, message: `Game created with max team size ${chosenMaxTeamSize}. Join via /game/:id/join and connect WebSocket.`, settings: { maxTeamSize: chosenMaxTeamSize } });
});

app.post('/game/:id/join', (req, res) => {
    const gameId = req.params.id;
    const { playerId } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    let player = game.players.find(p => p.id === playerId);

    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) return res.status(400).json({ message: `Player ${playerId} already actively connected.` });
    if (!player && game.players.length >= 2) return res.status(400).json({ message: 'Game is already full.' });
    if (!playerId) return res.status(400).json({ message: 'Player ID required.' });

    if (!player) {
         player = {
            id: playerId, party: [], activePokemonIndex: -1,
            pokemonLeft: 0, hasSelectedParty: false, ws: null
        };
         game.players.push(player);
         console.log(`[Game ${gameId}] Player ${playerId} added with new party structure.`);
    } else {
        console.log(`[Game ${gameId}] Player ${playerId} re-confirmed.`);
        if (!player.party) player.party = [];
        if (player.activePokemonIndex === undefined) player.activePokemonIndex = -1;
        if (player.pokemonLeft === undefined) player.pokemonLeft = 0;
        if (player.hasSelectedParty === undefined) player.hasSelectedParty = false;
    }

    let message = `Player ${playerId} in game ${gameId}.`;
    if (game.players.length === 2 && game.state === 'waiting_for_players') {
        game.state = 'selecting_pokemon';
        message = `Both players joined. Ready for Pokemon selection. Max team size: ${game.maxTeamSize}.`;
        console.log(`[Game ${gameId}] State -> 'selecting_pokemon'`);
    } else if (game.players.length < 2) {
        message = `Player ${playerId} joined. Waiting for opponent.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message, playerPId: player.id, currentGameState: game.state, maxTeamSize: game.maxTeamSize });
});

app.post('/game/:id/select-pokemon', (req, res) => {
    const gameId = req.params.id;
    const { playerId, pokemonNames } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    const player = game.players.find(p => p.id === playerId);
    const gameMaxTeamSize = game.maxTeamSize || DEFAULT_MAX_TEAM_SIZE; // Use game-specific or default

    if (!player) return res.status(404).json({ message: 'Player not found.' });
    if (game.state !== 'selecting_pokemon' && !(game.state === 'opponent_disconnected' && !player.hasSelectedParty)) {
        return res.status(400).json({ message: 'Not in selection phase or already selected.' });
    }
    if (player.hasSelectedParty && game.state !== 'opponent_disconnected' ) {
        return res.status(400).json({ message: 'Party already selected.' });
    }
    // Use gameMaxTeamSize for validation
    if (!Array.isArray(pokemonNames) || pokemonNames.length === 0 || pokemonNames.length > gameMaxTeamSize) {
        return res.status(400).json({ message: `Invalid team: Must be 1 to ${gameMaxTeamSize} Pokemon.` });
    }

    const newParty = [];
    for (const name of pokemonNames) {
        const pokemonDetails = getPokemonDetails(name);
        if (!pokemonDetails) return res.status(400).json({ message: `Invalid Pokemon name: ${name}.` });
        newParty.push({
            details: pokemonDetails, currentHp: pokemonDetails.stats.hp,
            maxHp: pokemonDetails.stats.hp, status: 'healthy'
        });
    }

    player.party = newParty;
    player.activePokemonIndex = newParty.length > 0 ? 0 : -1;
    player.pokemonLeft = newParty.length;
    player.hasSelectedParty = true;
    console.log(`[Game ${gameId}] Player ${playerId} selected party of ${newParty.length} (max: ${gameMaxTeamSize}).`);

    let message = `Player ${playerId} selected their party.`;
    const allPlayersSelected = game.players.every(p => p.hasSelectedParty);

    if (game.state === 'opponent_disconnected') {
        const otherPlayer = game.players.find(p => p.id !== playerId);
        if (otherPlayer && otherPlayer.ws && otherPlayer.ws.readyState === WebSocket.OPEN) {
            if (allPlayersSelected) {
                game.state = 'battle';
                game.turn = game.players.find(p => p.id === playerId)?.id || game.players[0].id;
                message = `All parties selected after reconnection. Battle begins! It's ${game.turn}'s turn.`;
            } else {
                game.state = 'selecting_pokemon';
                message = `Player ${playerId} selected. Waiting for other player after reconnection.`;
            }
        } else { message += ` Waiting for opponent to reconnect.`; }
    } else if (allPlayersSelected) {
        game.state = 'battle';
        game.turn = game.players[0].id;
        message = `All parties selected. Battle begins! It's ${game.turn}'s turn.`;
        console.log(`[Game ${gameId}] State -> 'battle'. Turn: ${game.turn}`);
    } else { message += ` Waiting for other player.`; }

    broadcastGameState(gameId);
    res.json({ gameId, message, currentTurn: game.turn, currentGameState: game.state, maxTeamSize: game.maxTeamSize });
});

// ... (attack route and other routes remain the same for now) ...
app.post('/game/:id/attack', (req, res) => {
    const gameId = req.params.id;
    const { playerId, attackName } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];

    if (game.state !== 'battle') return res.status(400).json({ message: 'Not in battle phase.' });
    if (game.turn !== playerId) return res.status(400).json({ message: `Not player ${playerId}'s turn.` });

    const attackerPlayer = game.players.find(p => p.id === playerId);
    const defenderPlayer = game.players.find(p => p.id !== playerId);

    if (!attackerPlayer || attackerPlayer.activePokemonIndex < 0 || !attackerPlayer.party[attackerPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Attacker has no valid active Pokemon.' });
    if (!defenderPlayer || defenderPlayer.activePokemonIndex < 0 || !defenderPlayer.party[defenderPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Defender has no valid active Pokemon.' });

    const attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];
    const defenderActivePokemon = defenderPlayer.party[defenderPlayer.activePokemonIndex];

    if (attackerActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Your active Pokemon is fainted and cannot attack!'});
    if (defenderActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Opponent_s active Pokemon is already fainted! They should switch.'});

    if (!defenderPlayer.ws || defenderPlayer.ws.readyState !== WebSocket.OPEN) {
        game.state = 'opponent_disconnected'; game.turn = null;
        broadcastGameState(gameId);
        return res.status(400).json({ message: 'Opponent not connected. Cannot attack.', currentGameState: game.state });
    }

    let damage = Math.max(1, Math.floor(attackerActivePokemon.details.stats.attack * (Math.random()*0.2 + 0.9)) - Math.floor(defenderActivePokemon.details.stats.defense * 0.5));
    if (attackerActivePokemon.details.stats.attack > defenderActivePokemon.details.stats.defense / 2 && damage <= 0) damage = 1 + Math.floor(Math.random()*5);
    else if (damage <= 0) damage = 1;

    defenderActivePokemon.currentHp -= damage;
    const usedAttackName = attackName || "basic attack";
    console.log(`[Game ${gameId}] ${playerId} (${attackerActivePokemon.details.name}) attacked ${defenderPlayer.id} (${defenderActivePokemon.details.name}) for ${damage}. Defender HP: ${defenderActivePokemon.currentHp}`);

    let message;
    if (defenderActivePokemon.currentHp <= 0) {
        defenderActivePokemon.currentHp = 0;
        defenderActivePokemon.status = 'fainted';
        defenderPlayer.pokemonLeft = defenderPlayer.party.filter(p => p.status === 'healthy').length;

        console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} fainted. ${defenderPlayer.id} has ${defenderPlayer.pokemonLeft} Pokemon left.`);

        if (defenderPlayer.pokemonLeft <= 0) {
            game.state = 'finished'; game.winner = attackerPlayer.id;
            message = `${attackerPlayer.id} (${attackerActivePokemon.details.name}) wins! All of ${defenderPlayer.id}'s Pokemon have fainted.`;
            console.log(`[Game ${gameId}] State -> 'finished'. Winner: ${attackerPlayer.id}`);
        } else {
            game.state = 'waiting_for_switch';
            game.turn = defenderPlayer.id;
            message = `${attackerActivePokemon.details.name} fainted ${defenderActivePokemon.details.name}! ${defenderPlayer.id} must switch Pokemon.`;
            console.log(`[Game ${gameId}] State -> 'waiting_for_switch'. Turn: ${defenderPlayer.id}`);
        }
    } else {
        game.turn = defenderPlayer.id;
        message = `${attackerActivePokemon.details.name} attacked ${defenderActivePokemon.details.name} for ${damage} damage. ${defenderActivePokemon.details.name} has ${defenderActivePokemon.currentHp} HP. Turn: ${defenderPlayer.id}.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message, currentGameState: game.state });
});

app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    const sanitizedGameState = getSanitizedGameState(gameId);
    if (!sanitizedGameState) return res.status(404).json({ message: 'Game not found.' });
    res.json(sanitizedGameState);
});

server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});

module.exports = { app, server };
