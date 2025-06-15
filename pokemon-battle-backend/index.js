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

const TYPE_EFFECTIVENESS = { /* ... (as before) ... */ };
function getAttackEffectiveness(moveType, defenderTypes) { /* ... (as before) ... */ }
function getModifiedStat(baseStat, stage) { /* ... (as before) ... */ }

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
app.post('/game/:id/select-pokemon', (req, res) => { /* ... (as before) ... */ });

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

    game.lastBattleMessage = "";

    // --- Pre-Attack Status Checks for Attacker (Order: Flinch -> Sleep -> Confusion -> Paralysis) ---
    if (attackerActivePokemon.isFlinched) { /* ... (Flinch logic as before) ... */ }
    if (attackerActivePokemon.activeStatus === 'sleep') { /* ... (Sleep logic as before) ... */ }
    if (attackerActivePokemon.activeStatus === 'confusion') { /* ... (Confusion logic as before) ... */ }
    if (attackerActivePokemon.activeStatus === 'paralysis') { /* ... (Paralysis logic as before) ... */ }

    let chosenMove;
    let useStruggle = false;
    const availableMoves = attackerActivePokemon.details.moves.filter(move => move.currentPp > 0);
    if (availableMoves.length === 0) { /* ... (Struggle logic as before) ... */ }
    else { /* ... (Move selection & PP check as before) ... */ }

    if (!defenderPlayer || defenderPlayer.activePokemonIndex < 0 || !defenderPlayer.party[defenderPlayer.activePokemonIndex])
        return res.status(500).json({ message: 'Defender has no valid active Pokemon.' });
    let defenderActivePokemon = defenderPlayer.party[defenderPlayer.activePokemonIndex];

    if (defenderActivePokemon.status === 'fainted')
        return res.status(400).json({message: 'Opponent_s active Pokemon is already fainted! They should switch.'});

    if (!defenderPlayer.ws || defenderPlayer.ws.readyState !== WebSocket.OPEN) { /* ... (Opponent disconnected check) ... */ }

    if (!useStruggle) {
        game.lastBattleMessage += `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} used ${chosenMove.name}.`;
    }

    if (!useStruggle && chosenMove.currentPp > 0) { chosenMove.currentPp--; }

    let attackHits = true;
    if (!useStruggle && chosenMove.accuracy && Math.random() * 100 > chosenMove.accuracy) {
        game.lastBattleMessage += " The attack missed!";
        attackHits = false;
    }

    let damage = 0;
    let effectiveness = 1;

    if (attackHits) {
        if (useStruggle) { /* ... (Struggle damage logic as before, using getModifiedStat) ... */ }
        else {
            stab = attackerActivePokemon.details.types.includes(chosenMove.type) ? 1.5 : 1;
            effectiveness = getAttackEffectiveness(chosenMove.type, defenderActivePokemon.details.types);

            if (effectiveness > 1) game.lastBattleMessage += " It's super effective!";
            if (effectiveness < 1 && effectiveness > 0) game.lastBattleMessage += " It's not very effective...";
            if (effectiveness === 0) game.lastBattleMessage += " It had no effect!";

            if (chosenMove.category !== 'status' && chosenMove.power > 0 && effectiveness > 0) {
                let offensiveStat, defensiveStat;
                if (chosenMove.category === 'special') {
                    offensiveStat = getModifiedStat(attackerActivePokemon.details.stats.specialAttack, attackerActivePokemon.statStages.specialAttack);
                    defensiveStat = getModifiedStat(defenderActivePokemon.details.stats.specialDefense, defenderActivePokemon.statStages.specialDefense);
                } else {
                    offensiveStat = getModifiedStat(attackerActivePokemon.details.stats.attack, attackerActivePokemon.statStages.attack);
                    defensiveStat = getModifiedStat(defenderActivePokemon.details.stats.defense, defenderActivePokemon.statStages.defense);
                }
                damage = Math.floor(((((2 * 50 / 5 + 2) * chosenMove.power * (offensiveStat / defensiveStat)) / 50) + 2) * stab * effectiveness * ((Math.random() * (1.0 - 0.85)) + 0.85));
                damage = Math.max(1, damage);
            }
        } // End normal move calculation

        if (damage > 0) {
            defenderActivePokemon.currentHp -= damage;
            game.lastBattleMessage += ` ${defenderPlayer.id}'s ${defenderActivePokemon.details.name} took ${damage} damage.`;
        }
        console.log(`[Game ${gameId}] ${attackerActivePokemon.details.name} dealt ${damage} to ${defenderActivePokemon.details.name}. Defender HP: ${defenderActivePokemon.currentHp}`);

        // --- Apply Move Effects (Status, Stat Change, Healing) ---
        if (!useStruggle && chosenMove.effect && (effectiveness > 0 || chosenMove.category === 'status')) { // Effects can apply even if no type effectiveness for status moves
            // Status Infliction
            if (chosenMove.effect.status && chosenMove.effect.target === 'opponent') {
                if (defenderActivePokemon.status === 'healthy' && (!defenderActivePokemon.activeStatus || defenderActivePokemon.activeStatus.length === 0) ) {
                    if (Math.random() * 100 < chosenMove.effect.chance) {
                        defenderActivePokemon.activeStatus = chosenMove.effect.status;
                        if (chosenMove.effect.duration && Array.isArray(chosenMove.effect.duration) && chosenMove.effect.duration.length === 2) {
                            defenderActivePokemon.statusTurnCounter = Math.floor(Math.random() * (chosenMove.effect.duration[1] - chosenMove.effect.duration[0] + 1)) + chosenMove.effect.duration[0];
                        } else { defenderActivePokemon.statusTurnCounter = 0; }
                        if (chosenMove.effect.status === 'flinch') defenderActivePokemon.isFlinched = true;
                        game.lastBattleMessage += ` ${defenderActivePokemon.details.name} was ${chosenMove.effect.status}!`;
                    }
                }
            }
            // Stat Changes
            if (chosenMove.effect.stat_change && (!chosenMove.effect.chance || Math.random() * 100 < chosenMove.effect.chance)) { /* ... (existing stat change logic) ... */ }

            // Pure Healing Moves (e.g., Recover, Roost)
            if (chosenMove.effect.heal_percent && chosenMove.effect.target === 'self') {
                const healAmount = Math.floor(attackerActivePokemon.maxHp * (chosenMove.effect.heal_percent / 100));
                attackerActivePokemon.currentHp = Math.min(attackerActivePokemon.maxHp, attackerActivePokemon.currentHp + healAmount);
                game.lastBattleMessage += ` ${attackerActivePokemon.details.name} recovered health!`;
            }
            // Full Heal + Status (Rest)
            if (chosenMove.effect.heal === "full" && chosenMove.effect.target === 'self') {
                attackerActivePokemon.currentHp = attackerActivePokemon.maxHp;
                if (chosenMove.effect.status) { // Apply associated status like sleep
                    attackerActivePokemon.activeStatus = chosenMove.effect.status;
                    if (chosenMove.effect.duration && Array.isArray(chosenMove.effect.duration) && chosenMove.effect.duration.length === 2) {
                         attackerActivePokemon.statusTurnCounter = Math.floor(Math.random() * (chosenMove.effect.duration[1] - chosenMove.effect.duration[0] + 1)) + chosenMove.effect.duration[0];
                         if (chosenMove.effect.status === "sleep" && chosenMove.effect.duration[0] === 2 && chosenMove.effect.duration[1] === 2) { // Specific for Rest
                            attackerActivePokemon.statusTurnCounter = 2;
                         }
                    }
                    game.lastBattleMessage += ` ${attackerActivePokemon.details.name} used ${chosenMove.name}, became fully healed and went to sleep!`;
                } else {
                    game.lastBattleMessage += ` ${attackerActivePokemon.details.name} used ${chosenMove.name} and became fully healed!`;
                }
            }
            // Drain-Type Moves (Heal from Damage Dealt) - applied *after* damage is dealt
            if (chosenMove.effect.heal_from_damage_percent && chosenMove.effect.target === 'self' && damage > 0) {
              const healAmount = Math.max(1, Math.floor(damage * (chosenMove.effect.heal_from_damage_percent / 100)));
              attackerActivePokemon.currentHp = Math.min(attackerActivePokemon.maxHp, attackerActivePokemon.currentHp + healAmount);
              game.lastBattleMessage += ` ${attackerActivePokemon.details.name} drained some health!`;
            }
        }
    } // End if attackHits

    // --- Post-Attack Fainting & Status ---
    // (The rest of the logic: Struggle recoil, defender fainting, attacker status/recoil, turn passing remains largely the same)
    // Ensure attackerActivePokemon is updated if it healed itself.
    attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];
    let attackerFaintedFromOwnStatusOrRecoil = false;
    if (useStruggle) { /* ... (Struggle recoil logic as before, ensure message is appended to game.lastBattleMessage) ... */ }
    if (defenderActivePokemon.currentHp <= 0) { /* ... (Defender fainted logic as before, ensure message is appended) ... */ }
    if (defenderActivePokemon && defenderPlayer.id !== game.turn) { defenderActivePokemon.isFlinched = false; }
    if (game.state !== 'finished' && game.state !== 'waiting_for_switch') {
        if (!useStruggle) {
            applyEndOfTurnStatusEffects(attackerPlayer, game);
            attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex];
            if (attackerActivePokemon.status === 'fainted') {
                attackerFaintedFromOwnStatusOrRecoil = true;
            }
        }
    }
    if (attackerFaintedFromOwnStatusOrRecoil && game.state !== 'finished') { /* ... (Attacker fainted logic as before, ensure message is appended) ... */ }
    if (game.state === 'battle' && !attackerFaintedFromOwnStatusOrRecoil) { game.turn = defenderPlayer.id; }
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
