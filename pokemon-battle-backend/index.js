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

const TYPE_EFFECTIVENESS = { /* ... (as previously defined) ... */
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

function getAttackEffectiveness(moveType, defenderTypes) { /* ... (as previously defined) ... */
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

const getSanitizedGameState = (gameId) => { /* ... (no change) ... */
    if (!games[gameId]) return null;
    const game = games[gameId];
    const gameCopy = JSON.parse(JSON.stringify(game));
    if (gameCopy.players) {
        gameCopy.players.forEach(p => { delete p.ws; });
    }
    return gameCopy;
};
const broadcastGameState = (gameId) => { /* ... (no change) ... */
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

// --- Helper Function for End-of-Turn Status Effects ---
function applyEndOfTurnStatusEffects(player, game) {
    if (!player || player.activePokemonIndex < 0 || !player.party[player.activePokemonIndex]) return;

    const activePokemon = player.party[player.activePokemonIndex];
    if (activePokemon.status === 'fainted' || !activePokemon.activeStatus) return;

    let statusDamage = 0;
    let statusMessage = "";

    if (activePokemon.activeStatus === 'poison' || activePokemon.activeStatus === 'burn') {
        statusDamage = Math.max(1, Math.floor(activePokemon.maxHp / 16)); // Standard 1/16, can be 1/8 for toxic/badly poisoned
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
            game.winner = opponent ? opponent.id : 'draw'; // Should ideally be opponent
            statusMessage += ` All of ${player.id}'s Pokemon have fainted! ${game.winner} wins!`;
            console.log(`[Game ${game.id}] State -> 'finished'. Winner: ${game.winner}`);
        } else {
            game.state = 'waiting_for_switch';
            game.turn = player.id; // Player whose Pokemon fainted needs to switch
            statusMessage += ` ${player.id} must switch Pokemon.`;
            console.log(`[Game ${game.id}] State -> 'waiting_for_switch' due to status. Turn: ${player.id}`);
        }
    }
    if (statusMessage) { // Append to game's battle log
        game.lastBattleMessage = game.lastBattleMessage ? `${game.lastBattleMessage} ${statusMessage}` : statusMessage;
    }
}


wss.on('connection', (ws, req) => { /* ... (no change to core connection logic) ... */
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

    ws.on('message', (messageString) => { /* ... (switchPokemon logic remains the same) ... */
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
    ws.on('close', () => { /* ... (no change) ... */ });
    ws.on('error', (error) => { /* ... (no change) ... */ });
});

app.post('/game', (req, res) => { /* ... (no change) ... */ });
app.post('/game/:id/join', (req, res) => { /* ... (no change) ... */ });
app.post('/game/:id/select-pokemon', (req, res) => { /* ... (no change) ... */ });

app.post('/game/:id/attack', (req, res) => {
    const gameId = req.params.id;
    const { playerId, moveIndex } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];

    if (game.state !== 'battle') return res.status(400).json({ message: 'Not in battle phase.' });
    if (game.turn !== playerId) return res.status(400).json({ message: `Not player ${playerId}'s turn.` });

    const attackerPlayer = game.players.find(p => p.id === playerId);
    const defenderPlayer = game.players.find(p => p.id !== playerId);

    if (!attackerPlayer || attackerPlayer.activePokemonIndex < 0 || !attackerPlayer.party[attackerPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Attacker has no valid active Pokemon.' });

    let attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];

    if (attackerActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Your active Pokemon is fainted and cannot attack!'});

    // --- Paralysis Check ---
    if (attackerActivePokemon.activeStatus === 'paralysis') {
        if (Math.random() * 100 < 25) { // 25% chance
            game.lastBattleMessage = `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} is fully paralyzed and can't move!`;
            game.turn = defenderPlayer.id; // Switch turn
            applyEndOfTurnStatusEffects(attackerPlayer, game); // Attacker still takes status damage if any
            broadcastGameState(gameId);
            return res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
        }
    }

    if (moveIndex == null || !attackerActivePokemon.details.moves || !attackerActivePokemon.details.moves[moveIndex]) {
        return res.status(400).json({ message: 'Invalid move selected.' });
    }
    const chosenMove = attackerActivePokemon.details.moves[moveIndex];

    if (!defenderPlayer || defenderPlayer.activePokemonIndex < 0 || !defenderPlayer.party[defenderPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Defender has no valid active Pokemon.' });
    let defenderActivePokemon = defenderPlayer.party[defenderPlayer.activePokemonIndex];

    if (defenderActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Opponent_s active Pokemon is already fainted! They should switch.'});

    if (!defenderPlayer.ws || defenderPlayer.ws.readyState !== WebSocket.OPEN) {
        game.state = 'opponent_disconnected'; game.turn = null;
        broadcastGameState(gameId);
        return res.status(400).json({ message: 'Opponent not connected. Cannot attack.', currentGameState: game.state });
    }

    let message = `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} used ${chosenMove.name}.`;

    if (Math.random() * 100 > chosenMove.accuracy) {
        message += " The attack missed!";
        game.turn = defenderPlayer.id;
        applyEndOfTurnStatusEffects(attackerPlayer, game); // Attacker's turn ends, apply their status effects
        game.lastBattleMessage = message;
        broadcastGameState(gameId);
        return res.json({ gameId, message, currentGameState: game.state });
    }

    const stab = attackerActivePokemon.details.types.includes(chosenMove.type) ? 1.5 : 1;
    const effectiveness = getAttackEffectiveness(chosenMove.type, defenderActivePokemon.details.types);
    if (effectiveness > 1) message += " It's super effective!";
    if (effectiveness < 1 && effectiveness > 0) message += " It's not very effective...";
    if (effectiveness === 0) message += " It had no effect!";

    let damage = 0;
    if (chosenMove.power > 0 && effectiveness > 0) {
        const baseDamage = chosenMove.power + (attackerActivePokemon.details.stats.attack / 10);
        const randomFactor = (Math.random() * (1.0 - 0.85)) + 0.85;
        damage = Math.floor(baseDamage * stab * effectiveness * randomFactor);
        damage = Math.max(1, damage);
    }

    defenderActivePokemon.currentHp -= damage;
    message += ` ${defenderPlayer.id}'s ${defenderActivePokemon.details.name} took ${damage} damage.`;
    console.log(`[Game ${gameId}] ${attackerActivePokemon.details.name} dealt ${damage} to ${defenderActivePokemon.details.name}. Defender HP: ${defenderActivePokemon.currentHp}`);

    if (chosenMove.effect && chosenMove.effect.status && effectiveness > 0) {
        if (defenderActivePokemon.status === 'healthy' && (!defenderActivePokemon.activeStatus || defenderActivePokemon.activeStatus.length === 0) ) {
            if (Math.random() * 100 < chosenMove.effect.chance) {
                defenderActivePokemon.activeStatus = chosenMove.effect.status;
                message += ` ${defenderActivePokemon.details.name} was ${chosenMove.effect.status}!`;
                console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} afflicted with ${chosenMove.effect.status}.`);
            }
        }
    }

    let attackerFaintedFromOwnStatus = false;

    if (defenderActivePokemon.currentHp <= 0) {
        defenderActivePokemon.currentHp = 0;
        defenderActivePokemon.status = 'fainted';
        defenderPlayer.pokemonLeft = defenderPlayer.party.filter(p => p.status === 'healthy').length;
        message += ` ${defenderActivePokemon.details.name} fainted.`;
        console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} fainted. ${defenderPlayer.id} has ${defenderPlayer.pokemonLeft} Pokemon left.`);

        if (defenderPlayer.pokemonLeft <= 0) {
            game.state = 'finished'; game.winner = attackerPlayer.id;
            message += ` All of ${defenderPlayer.id}'s Pokemon have fainted! ${attackerPlayer.id} wins!`;
        } else {
            game.state = 'waiting_for_switch'; game.turn = defenderPlayer.id;
            message += ` ${defenderPlayer.id} must switch Pokemon.`;
        }
    } else {
        // If defender didn't faint from attack, apply their potential end-of-turn status damage (e.g. from an existing burn/poison)
        // This is complex: usually, status damage is applied to the one whose turn it *was*.
        // Let's stick to applying to attacker after their move.
    }

    // Apply end-of-turn status effects for the attacker *after* their attack is resolved
    // but *before* officially passing the turn if no fainting occurred that requires a switch
    if (game.state !== 'finished' && game.state !== 'waiting_for_switch') {
        applyEndOfTurnStatusEffects(attackerPlayer, game); // This might change game.state and game.turn
        // Re-fetch attacker's active Pokemon in case it fainted from status
        attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];
        if (attackerActivePokemon.status === 'fainted' && attackerPlayer.pokemonLeft > 0 && game.state !== 'finished') {
             game.state = 'waiting_for_switch';
             game.turn = attackerPlayer.id; // Attacker needs to switch
             message += ` ${attackerPlayer.id}'s ${attackerActivePokemon.details.name} fainted from its status condition! ${attackerPlayer.id} must switch.`;
             attackerFaintedFromOwnStatus = true;
        } else if (attackerPlayer.pokemonLeft <= 0 && game.state !== 'finished') {
            game.state = 'finished';
            game.winner = defenderPlayer.id;
            message += ` All of ${attackerPlayer.id}'s Pokemon have fainted! ${defenderPlayer.id} wins!`;
            attackerFaintedFromOwnStatus = true;
        }
    }

    // If no fainting caused a switch or game end, and attacker didn't faint from own status, it's defender's turn.
    if (game.state === 'battle' && !attackerFaintedFromOwnStatus) {
        game.turn = defenderPlayer.id;
        message += ` It's now ${defenderPlayer.id}'s turn.`;
    }

    game.lastBattleMessage = message;
    broadcastGameState(gameId);
    res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
});

app.get('/game/:id', (req, res) => { /* ... (no change) ... */ });
server.listen(port, () => { /* ... (no change) ... */ });
module.exports = { app, server };
