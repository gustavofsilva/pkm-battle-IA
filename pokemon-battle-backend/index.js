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
wss.on('connection', (ws, req) => { /* ... (as before) ... */ });

app.post('/game', (req, res) => { /* ... (as before) ... */ });
app.post('/game/:id/join', (req, res) => { /* ... (as before) ... */ });

app.post('/game/:id/select-pokemon', (req, res) => {
    const gameId = req.params.id;
    const { playerId, pokemonNames } = req.body;

    if (!games[gameId]) return res.status(404).json({ message: 'Game not found.' });
    const game = games[gameId];
    const player = game.players.find(p => p.id === playerId);
    const gameMaxTeamSize = game.maxTeamSize || DEFAULT_MAX_TEAM_SIZE;

    if (!player) return res.status(404).json({ message: 'Player not found.' });
    if (game.state !== 'selecting_pokemon' && !(game.state === 'opponent_disconnected' && !player.hasSelectedParty)) {
        return res.status(400).json({ message: 'Not in selection phase or already selected.' });
    }
    if (player.hasSelectedParty && game.state !== 'opponent_disconnected' ) {
        return res.status(400).json({ message: 'Party already selected.' });
    }
    if (!Array.isArray(pokemonNames) || pokemonNames.length === 0 || pokemonNames.length > gameMaxTeamSize) {
        return res.status(400).json({ message: `Invalid team: Must be 1 to ${gameMaxTeamSize} Pokemon.` });
    }

    const newParty = [];
    for (const name of pokemonNames) {
        const pokemonDetails = getPokemonDetails(name);
        if (!pokemonDetails) return res.status(400).json({ message: `Invalid Pokemon name: ${name}.` });

        const instantiatedMoves = pokemonDetails.moves.map(move => ({
            ...move,
            currentPp: move.pp
        }));

        newParty.push({
            details: {
                ...pokemonDetails,
                moves: instantiatedMoves
            },
            currentHp: pokemonDetails.stats.hp,
            maxHp: pokemonDetails.stats.hp,
            status: 'healthy',
            activeStatus: null,
            statusTurnCounter: 0 // Initialize statusTurnCounter
        });
    }

    player.party = newParty;
    player.activePokemonIndex = newParty.length > 0 ? 0 : -1;
    player.pokemonLeft = newParty.length;
    player.hasSelectedParty = true;
    console.log(`[Game ${gameId}] Player ${playerId} selected party of ${newParty.length} (max: ${gameMaxTeamSize}).`);

    let message = `Player ${playerId} selected their party.`;
    const allPlayersSelected = game.players.every(p => p.hasSelectedParty);

    if (game.state === 'opponent_disconnected') { /* ... (as before) ... */ }
    else if (allPlayersSelected) { /* ... (as before) ... */ }
    else { message += ` Waiting for other player.`; }

    broadcastGameState(gameId);
    res.json({ gameId, message, currentTurn: game.turn, currentGameState: game.state, maxTeamSize: game.maxTeamSize });
});

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

    game.lastBattleMessage = ""; // Reset battle message at start of turn processing

    // --- Pre-Attack Status Checks for Attacker ---
    if (attackerActivePokemon.activeStatus === 'sleep') {
        attackerActivePokemon.statusTurnCounter--;
        if (attackerActivePokemon.statusTurnCounter <= 0) {
            attackerActivePokemon.activeStatus = null;
            game.lastBattleMessage += `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} woke up! `;
        } else {
            game.lastBattleMessage += `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} is fast asleep. `;
            applyEndOfTurnStatusEffects(attackerPlayer, game); // Apply poison/burn if also present
            if (game.state !== 'finished' && game.state !== 'waiting_for_switch') { game.turn = defenderPlayer.id; }
            broadcastGameState(gameId);
            return res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
        }
    }

    if (attackerActivePokemon.activeStatus === 'confusion') {
        attackerActivePokemon.statusTurnCounter--;
        game.lastBattleMessage += `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} is confused. `;
        if (attackerActivePokemon.statusTurnCounter <= 0) {
            attackerActivePokemon.activeStatus = null;
            game.lastBattleMessage += `It snapped out of confusion! `;
        } else {
            if (Math.random() * 100 < 50) { // 50% chance to hit self
                const selfHitPower = 40;
                const selfDamage = Math.floor(((((2 * 50 / 5 + 2) * selfHitPower * (attackerActivePokemon.details.stats.attack / attackerActivePokemon.details.stats.defense)) / 50) + 2) * ((Math.random() * (1.0 - 0.85)) + 0.85));
                attackerActivePokemon.currentHp -= selfDamage;
                game.lastBattleMessage += `It hurt itself in its confusion and took ${selfDamage} damage! `;
                if (attackerActivePokemon.currentHp <= 0) {
                    attackerActivePokemon.currentHp = 0; attackerActivePokemon.status = 'fainted';
                    attackerPlayer.pokemonLeft = attackerPlayer.party.filter(p => p.status === 'healthy').length;
                    game.lastBattleMessage += `${attackerActivePokemon.details.name} fainted! `;
                    if (attackerPlayer.pokemonLeft <= 0) {
                        game.state = 'finished'; game.winner = defenderPlayer.id;
                        game.lastBattleMessage += `All of ${attackerPlayer.id}'s Pokemon fainted! ${defenderPlayer.id} wins!`;
                    } else {
                        game.state = 'waiting_for_switch'; game.turn = attackerPlayer.id;
                    }
                }
                applyEndOfTurnStatusEffects(attackerPlayer, game);
                if (game.state !== 'finished' && game.state !== 'waiting_for_switch') { game.turn = defenderPlayer.id; }
                broadcastGameState(gameId);
                return res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
            }
            game.lastBattleMessage += `It managed to use its move! `;
        }
    }

    if (attackerActivePokemon.activeStatus === 'paralysis') { /* ... (existing paralysis check) ... */ }

    let chosenMove;
    let useStruggle = false;
    const availableMoves = attackerActivePokemon.details.moves.filter(move => move.currentPp > 0);
    if (availableMoves.length === 0) { /* ... (existing struggle logic) ... */ }
    else { /* ... (existing move selection logic) ... */ }

    if (!defenderPlayer || defenderPlayer.activePokemonIndex < 0 || !defenderPlayer.party[defenderPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Defender has no valid active Pokemon.' });
    let defenderActivePokemon = defenderPlayer.party[defenderPlayer.activePokemonIndex];

    if (defenderActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Opponent_s active Pokemon is already fainted! They should switch.'});

    if (!defenderPlayer.ws || defenderPlayer.ws.readyState !== WebSocket.OPEN) { /* ... (existing check) ... */ }

    if (!useStruggle) {
        game.lastBattleMessage += `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} used ${chosenMove.name}.`;
    } // Struggle message already set

    if (!useStruggle && chosenMove.currentPp > 0) { chosenMove.currentPp--; }

    if (!useStruggle && chosenMove.accuracy && Math.random() * 100 > chosenMove.accuracy) {  /* ... (existing miss logic) ... */ }

    // ... (rest of damage calculation, status application to defender, fainting checks for defender) ...
    // ... (end-of-turn status for attacker, final turn setting, broadcast) ...
    // The existing structure for these parts should largely remain, just ensure messages are appended to game.lastBattleMessage

    // --- Refined Status Application to Defender ---
    if (!useStruggle && chosenMove.effect && chosenMove.effect.status && effectiveness > 0) {
        if (defenderActivePokemon.status === 'healthy' && (!defenderActivePokemon.activeStatus || defenderActivePokemon.activeStatus.length === 0)) {
            if (Math.random() * 100 < chosenMove.effect.chance) {
                defenderActivePokemon.activeStatus = chosenMove.effect.status;
                if (chosenMove.effect.duration) { // Set duration if applicable
                    defenderActivePokemon.statusTurnCounter = Math.floor(Math.random() * (chosenMove.effect.duration[1] - chosenMove.effect.duration[0] + 1)) + chosenMove.effect.duration[0];
                } else {
                    defenderActivePokemon.statusTurnCounter = 0; // For statuses without explicit duration like poison/burn
                }
                game.lastBattleMessage += ` ${defenderActivePokemon.details.name} was ${chosenMove.effect.status}!`;
                console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} afflicted with ${chosenMove.effect.status} for ${defenderActivePokemon.statusTurnCounter} turns.`);
            }
        }
    }
    // The rest of the attack logic (damage, defender fainting, attacker end-of-turn status, etc.) follows...
    // This is a simplified integration point for the new status effect application.
    // The full integration into the damage/fainting sequence is complex and was outlined previously.
    // For brevity, I'm focusing on the direct changes requested for this specific step.
    // The complete, correct sequence of operations within the attack route is critical.

    // (The existing logic for damage, defender fainting, attacker end-of-turn status, etc. follows from here)
    // Ensure game.lastBattleMessage is consistently built.
    // The final part of the attack route after all effects and checks:
    let attackerFaintedFromOwnStatusOrRecoil = false; // Assume this flag is managed correctly by prior logic

    if (useStruggle) { /* ... (existing struggle recoil and fainting logic) ... */ }

    if (defenderActivePokemon.currentHp <= 0) { /* ... (existing defender fainted logic) ... */ }

    if (game.state !== 'finished' && game.state !== 'waiting_for_switch') {
        if (!useStruggle) {
            applyEndOfTurnStatusEffects(attackerPlayer, game);
            attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];
            if (attackerActivePokemon.status === 'fainted') {
                attackerFaintedFromOwnStatusOrRecoil = true;
            }
        }
    }

    if (attackerFaintedFromOwnStatusOrRecoil && game.state !== 'finished') { /* ... (existing attacker fainted from status logic) ... */ }

    if (game.state === 'battle' && !attackerFaintedFromOwnStatusOrRecoil) {
        game.turn = defenderPlayer.id;
    }
    // Make sure lastBattleMessage is updated before broadcast if not already fully set
    if (game.state === 'battle' && game.turn === defenderPlayer.id && !game.lastBattleMessage.includes("It's now")) {
        game.lastBattleMessage += ` It's now ${defenderPlayer.id}'s turn.`;
    }

    broadcastGameState(gameId);
    res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
});

app.get('/game/:id', (req, res) => { /* ... (no change) ... */ });
server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});
module.exports = { app, server };
