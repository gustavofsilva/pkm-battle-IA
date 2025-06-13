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
    // console.log(`[WS] Broadcasting GState for ${gameId} to ${game.players.length} players.`); // Can be too verbose
    game.players.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(JSON.stringify({ type: 'gameStateUpdate', payload: sanitizedGameState }));
            } catch (error) { console.error(`[WS] Error sending state to ${player.id} in ${gameId}:`, error); }
        }
    });
};

function applyEndOfTurnStatusEffects(player, game) { /* ... (no change) ... */ }

wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true).query;
    const gameId = parameters.gameId;
    const connectingPlayerId = parameters.playerId;

    if (!gameId || !connectingPlayerId) {
        console.log('[WS] Connection rejected: Missing gameId or playerId.');
        ws.terminate(); return;
    }
    if (!games[gameId]) {
        console.log(`[WS] Game ${gameId} not found for player ${connectingPlayerId}. Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found.' }));
        ws.terminate(); return;
    }

    const game = games[gameId];
    let player = game.players.find(p => p.id === connectingPlayerId);

    if (!player && game.players.length >= 2) {
        console.log(`[WS] Game ${gameId} is full. Player ${connectingPlayerId} cannot join. Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full.' }));
        ws.terminate(); return;
    }
    if (!player) {
        console.log(`[WS] Player ${connectingPlayerId} not found in game ${gameId}. Must join via HTTP. Terminating.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Player not found. Join via HTTP first.' }));
        ws.terminate(); return;
    }
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
        console.log(`[WS] Player ${connectingPlayerId} in game ${gameId} already has active WS. Terminating new one.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Already connected. Closing this new connection.'}));
        ws.terminate(); return;
    }

    player.ws = ws;
    console.log(`[WS] Client connected: gameId=${gameId}, playerId=${connectingPlayerId}`);
    ws.send(JSON.stringify({ type: 'connection_ack', message: `Connected to game ${gameId} as player ${connectingPlayerId}`}));

    // --- Start of Correction ---
    // Send initial game state directly to the newly connected player
    const initialGameStatePayload = getSanitizedGameState(gameId);
    if (initialGameStatePayload) {
        ws.send(JSON.stringify({ type: 'gameStateUpdate', payload: initialGameStatePayload }));
        console.log(`[WS] Sent initial gameStateUpdate directly to player ${connectingPlayerId} in game ${gameId}.`);
    } else {
        console.error(`[WS] CRITICAL: Could not get initial game state for ${gameId} to send directly to ${connectingPlayerId}.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to retrieve initial game state for you.' }));
    }
    // --- End of Correction ---

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
    // General broadcast to update all, including this new player again (which is fine)
    // and to inform the other player if this connection changed game state (e.g. from opponent_disconnected)
    broadcastGameState(gameId);

    ws.on('message', (messageString) => { /* ... (no change) ... */ });
    ws.on('close', () => { /* ... (no change) ... */ });
    ws.on('error', (error) => { /* ... (no change) ... */ });
});

app.post('/game', (req, res) => { /* ... (no change) ... */ });
app.post('/game/:id/join', (req, res) => { /* ... (no change) ... */ });
app.post('/game/:id/select-pokemon', (req, res) => { /* ... (no change) ... */ });
app.post('/game/:id/attack', (req, res) => { /* ... (no change) ... */ });
app.get('/game/:id', (req, res) => { /* ... (no change) ... */ });

server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});

module.exports = { app, server };
