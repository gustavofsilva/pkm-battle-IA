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

const TYPE_EFFECTIVENESS = { /* ... (contents as before) ... */
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
function getAttackEffectiveness(moveType, defenderTypes) { /* ... (as before) ... */
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

const getSanitizedGameState = (gameId) => { /* ... (as before) ... */ };
const broadcastGameState = (gameId) => { /* ... (as before) ... */ };
function applyEndOfTurnStatusEffects(player, game) { /* ... (as before) ... */ }

wss.on('connection', (ws, req) => {
    console.log('[WS_CONNECT_TRACE] New WebSocket connection attempt.');
    const parameters = url.parse(req.url, true).query;
    const gameId = parameters.gameId;
    const connectingPlayerId = parameters.playerId;
    console.log(`[WS_CONNECT_TRACE] Attempting for gameId: ${gameId}, playerId: ${connectingPlayerId}`);

    if (!gameId || !connectingPlayerId) {
        console.log(`[WS_CONNECT_TRACE] Terminating: Missing gameId or playerId. gameId: ${gameId}, playerId: ${connectingPlayerId}`);
        ws.terminate();
        return;
    }

    const game = games[gameId];
    if (!game) {
        console.log(`[WS_CONNECT_TRACE] Terminating: Game not found for gameId: ${gameId}`);
        ws.send(JSON.stringify({ type: 'error', message: 'Game not found.' }));
        ws.terminate();
        return;
    }
    console.log(`[WS_CONNECT_TRACE] Game ${gameId} found. Players in game: ${game.players.map(p => p.id).join(', ')}`);

    let player = game.players.find(p => p.id === connectingPlayerId);
    if (!player) {
        console.log(`[WS_CONNECT_TRACE] Terminating: Player ${connectingPlayerId} not found in game ${gameId}.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Player not found in game. Please join via HTTP first.' }));
        ws.terminate();
        return;
    }
    console.log(`[WS_CONNECT_TRACE] Player ${connectingPlayerId} found in game ${gameId}. Current player.ws state: ${player.ws ? player.ws.readyState : 'null'}`);

    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
        console.log(`[WS_CONNECT_TRACE] Terminating: Player ${connectingPlayerId} already has an active OPEN WebSocket connection.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Player already has an active connection.' }));
        ws.terminate();
        return;
    }
    if (player.ws && player.ws.readyState === WebSocket.CONNECTING) {
        console.log(`[WS_CONNECT_TRACE] Warning: Player ${connectingPlayerId} has a WebSocket connection in CONNECTING state. Allowing new connection to proceed.`);
    }

    player.ws = ws;
    console.log(`[WS] Client connected: gameId=${gameId}, playerId=${connectingPlayerId}. player.ws.readyState: ${player.ws.readyState}`);

    ws.send(JSON.stringify({ type: 'connection_ack', message: `Connected to game ${gameId} as ${connectingPlayerId}`}));

    const initialGameStatePayload = getSanitizedGameState(gameId);
    if (initialGameStatePayload) {
        ws.send(JSON.stringify({ type: 'gameStateUpdate', payload: initialGameStatePayload }));
        console.log(`[WS] Sent initial gameStateUpdate directly to player ${connectingPlayerId} in game ${gameId}.`);
    } else {
        console.error(`[WS] CRITICAL: Could not get initial game state for ${gameId} to send directly to ${connectingPlayerId}.`);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to retrieve initial game state for you.' }));
    }

    if (game.state === 'opponent_disconnected' && game.players.length === 2) {
        const otherPlayer = game.players.find(p => p.id !== connectingPlayerId);
        if (otherPlayer && otherPlayer.ws && otherPlayer.ws.readyState === WebSocket.OPEN) {
            if (game.players.every(p => p.hasSelectedParty)) {
                game.state = 'battle';
                 if (!game.turn) game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
            } else {
                game.state = 'selecting_pokemon';
            }
            console.log(`[WS_CONNECT_TRACE] Player ${connectingPlayerId} reconnected. Game ${gameId} state -> ${game.state}.`);
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
            if (newActivePokemonIndex == null || !player.party[newActivePokemonIndex]) {
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

            game.lastBattleMessage = `${player.id} switched to ${player.party[newActivePokemonIndex].details.name}. It's now ${game.turn}'s turn.`;
            console.log(`[Game ${gameId}] Player ${connectingPlayerId} switched to ${player.party[newActivePokemonIndex].details.name}. State -> 'battle'. Turn -> ${game.turn}`);
            broadcastGameState(gameId);
        }
    });

    ws.on('close', () => {
        console.log(`[WS_CONNECT_TRACE] Client disconnected: gameId=${gameId}, playerId=${connectingPlayerId}`);
        if (player) player.ws = null;
        if (game && ['battle', 'selecting_pokemon', 'waiting_for_other_player_selection', 'waiting_for_switch'].includes(game.state)) {
            const otherPlayer = game.players.find(p => p.id !== connectingPlayerId);
            if (otherPlayer) {
                game.state = 'opponent_disconnected'; game.turn = null;
                console.log(`[WS_CONNECT_TRACE][Game ${gameId}] ${connectingPlayerId} disconnected. State -> 'opponent_disconnected'.`);
                broadcastGameState(gameId);
            } else { console.log(`[WS_CONNECT_TRACE][Game ${gameId}] ${connectingPlayerId} disconnected. No other players.`); }
        } else if (game && game.state === 'opponent_disconnected') {
            console.log(`[WS_CONNECT_TRACE][Game ${gameId}] ${connectingPlayerId} disconnected while already 'opponent_disconnected'.`);
        }
    });

    ws.on('error', (error) => {
        console.error(`[WS_CONNECT_TRACE] Error for ${connectingPlayerId}@${gameId}:`, error);
        if (player) player.ws = null;
         if (game && ['battle', 'selecting_pokemon', 'waiting_for_other_player_selection', 'waiting_for_switch'].includes(game.state)) {
            game.state = 'opponent_disconnected'; game.turn = null;
            console.log(`[WS_CONNECT_TRACE][Game ${gameId}] Error on WS for ${connectingPlayerId}. State -> 'opponent_disconnected'.`);
            broadcastGameState(gameId);
        }
    });
});

// --- Express Routes --- (no changes below this line for this subtask)
app.post('/game', (req, res) => { /* ... */ });
app.post('/game/:id/join', (req, res) => { /* ... */ });
app.post('/game/:id/select-pokemon', (req, res) => { /* ... */ });
app.post('/game/:id/attack', (req, res) => { /* ... */ });
app.get('/game/:id', (req, res) => { /* ... */ });
server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});
module.exports = { app, server };
