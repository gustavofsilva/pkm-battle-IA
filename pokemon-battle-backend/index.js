const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getPokemonDetails } = require('./pokemonData');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const app = express();
const port = process.env.PORT || 3000;
const DEFAULT_MAX_TEAM_SIZE = 6;
const ABSOLUTE_MAX_TEAM_SIZE = 6;

const games = {};

const TYPE_EFFECTIVENESS = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
    flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
    fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

function getAttackEffectiveness(moveType, defenderTypes) {
    let totalEffectiveness = 1;
    if (!TYPE_EFFECTIVENESS[moveType]) return 1;
    for (const type of defenderTypes) {
        totalEffectiveness *= TYPE_EFFECTIVENESS[moveType]?.[type] ?? 1;
    }
    return totalEffectiveness;
}

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

function applyEndOfTurnStatusEffects(player, game) { /* ... (as previously defined, no changes here) ... */
    if (!player || player.activePokemonIndex < 0 || !player.party[player.activePokemonIndex]) return;
    const activePokemon = player.party[player.activePokemonIndex];
    if (activePokemon.status === 'fainted' || !activePokemon.activeStatus) return;
    let statusDamage = 0;
    let statusMessage = "";
    if (activePokemon.activeStatus === 'poison' || activePokemon.activeStatus === 'burn') {
        statusDamage = Math.max(1, Math.floor(activePokemon.maxHp / 16));
        activePokemon.currentHp -= statusDamage;
        statusMessage = `${player.id}'s ${activePokemon.details.name} took ${statusDamage} damage from ${activePokemon.activeStatus}.`;
        console.log(`[Game ${game.id}] ${statusMessage}`);
    }
    if (activePokemon.currentHp <= 0) {
        activePokemon.currentHp = 0;
        activePokemon.status = 'fainted';
        player.pokemonLeft = player.party.filter(p => p.status === 'healthy').length;
        statusMessage += ` ${activePokemon.details.name} fainted from its status condition!`;
        console.log(`[Game ${game.id}] ${activePokemon.details.name} fainted from status. ${player.id} has ${player.pokemonLeft} Pokemon left.`);
        if (player.pokemonLeft <= 0) {
            game.state = 'finished';
            const opponent = game.players.find(p => p.id !== player.id);
            game.winner = opponent ? opponent.id : 'draw';
            statusMessage += ` All of ${player.id}'s Pokemon have fainted! ${game.winner} wins!`;
            console.log(`[Game ${game.id}] State -> 'finished'. Winner: ${game.winner}`);
        } else {
            game.state = 'waiting_for_switch';
            game.turn = player.id;
            statusMessage += ` ${player.id} must switch Pokemon.`;
            console.log(`[Game ${game.id}] State -> 'waiting_for_switch' due to status. Turn: ${player.id}`);
        }
    }
    if (statusMessage) {
        game.lastBattleMessage = game.lastBattleMessage ? `${game.lastBattleMessage} ${statusMessage}` : statusMessage;
    }
}

wss.on('connection', (ws, req) => { /* ... (no change) ... */ });

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
        console.log(`[Game ${gameId}] Invalid maxTeamSize requested (${requestedMaxTeamSize}), defaulting to ${DEFAULT_MAX_TEAM_SIZE}.`);
    }

    games[gameId] = {
        id: gameId,
        players: [],
        state: 'waiting_for_players',
        turn: null,
        winner: null,
        maxTeamSize: chosenMaxTeamSize,
        lastBattleMessage: "" // Initialize last battle message
    };
    console.log(`[Game ${gameId}] Created with max team size: ${chosenMaxTeamSize}`);
    // Respond immediately after creating the game structure
    res.status(201).json({
        gameId: gameId,
        message: `Game created with Game ID: ${gameId} and max team size ${chosenMaxTeamSize}. Waiting for players.`,
        settings: { maxTeamSize: chosenMaxTeamSize },
        currentGameState: games[gameId].state // Send initial state
    });
});

app.post('/game/:id/join', (req, res) => {
    const gameId = req.params.id;
    const { playerId } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];

    if (!playerId) return res.status(400).json({ message: 'Player ID required.' });

    let player = game.players.find(p => p.id === playerId);

    if (player && player.ws && player.ws.readyState === WebSocket.OPEN) {
        // Player might be trying to rejoin via HTTP after WS was already connected
        // Or this is a redundant call. We can just send current state.
        console.log(`[Game ${gameId}] Player ${playerId} attempting to join but might already be connected/exist.`);
        // return res.status(400).json({ message: `Player ${playerId} already actively connected or in game. Try connecting WebSocket directly.` });
    }

    if (!player && game.players.length >= 2) {
        return res.status(400).json({ message: 'Game is already full.' });
    }

    if (!player) {
         player = {
            id: playerId, party: [], activePokemonIndex: -1,
            pokemonLeft: 0, hasSelectedParty: false, ws: null
        };
         game.players.push(player);
         console.log(`[Game ${gameId}] Player ${playerId} added to game.`);
    } else {
        console.log(`[Game ${gameId}] Player ${playerId} re-confirmed in game.`);
        // Ensure new fields if somehow an old player object existed without them
        if (!player.party) player.party = [];
        if (player.activePokemonIndex === undefined) player.activePokemonIndex = -1;
        if (player.pokemonLeft === undefined) player.pokemonLeft = 0;
        if (player.hasSelectedParty === undefined) player.hasSelectedParty = false;
    }

    let responseMessage = `Player ${playerId} successfully joined game ${gameId}.`;
    if (game.players.length === 2 && game.state === 'waiting_for_players') {
        game.state = 'selecting_pokemon';
        responseMessage = `Both players joined. Game ready for Pokemon selection. Max team size: ${game.maxTeamSize}.`;
        console.log(`[Game ${gameId}] State -> 'selecting_pokemon'`);
    } else if (game.players.length < 2) {
        responseMessage = `Player ${playerId} joined. Waiting for opponent.`;
    } else if (game.players.length === 2 && game.state !== 'waiting_for_players') {
        responseMessage = `Player ${playerId} is in game ${gameId}. Current state: ${game.state}.`;
    }

    broadcastGameState(gameId); // Inform all clients (including this one if WS is up)
    // Send HTTP response
    res.json({
        gameId,
        playerId,
        message: responseMessage,
        maxTeamSize: game.maxTeamSize,
        currentGameState: game.state,
        playerData: getSanitizedGameState(gameId)?.players.find(p=>p.id === playerId) // Send back this player's data
    });
});

app.post('/game/:id/select-pokemon', (req, res) => { /* ... (no change, should be sending response) ... */ });
app.post('/game/:id/attack', (req, res) => { /* ... (no change, should be sending response) ... */ });

app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    const sanitizedGameState = getSanitizedGameState(gameId);
    if (!sanitizedGameState) {
        return res.status(404).json({ message: 'Game not found' }); // Ensure 404 for not found
    }
    res.json(sanitizedGameState); // Send the sanitized state
});

server.listen(port, () => {
    // Restored correct startup log message
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});

module.exports = { app, server };
