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

const getSanitizedGameState = (gameId) => { /* ... (no change) ... */ };
const broadcastGameState = (gameId) => { /* ... (no change) ... */ };
function applyEndOfTurnStatusEffects(player, game) { /* ... (no change) ... */ }
wss.on('connection', (ws, req) => { /* ... (no change) ... */ });

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

    if (attackerActivePokemon.activeStatus === 'paralysis') {
        if (Math.random() * 100 < 25) {
            game.lastBattleMessage = `${attackerPlayer.id}'s ${attackerActivePokemon.details.name} is fully paralyzed and can't move!`;
            // Turn still passes to defender after paralysis, but attacker's end-of-turn effects apply first
            applyEndOfTurnStatusEffects(attackerPlayer, game);
            if (game.state !== 'finished' && game.state !== 'waiting_for_switch') { // If attacker didn't faint from status
                game.turn = defenderPlayer.id;
            }
            broadcastGameState(gameId);
            return res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
        }
    }

    if (moveIndex == null || !attackerActivePokemon.details.moves || !attackerActivePokemon.details.moves[moveIndex]) {
        return res.status(400).json({ message: 'Invalid move selected.' });
    }
    const chosenMove = attackerActivePokemon.details.moves[moveIndex];

    // PP check (simple version: if PP is 0, cannot use)
    if (chosenMove.pp === 0) { // Assuming pp is current pp, if not, this logic needs adjustment
        game.lastBattleMessage = `${attackerActivePokemon.details.name} has no PP left for ${chosenMove.name}!`;
        // Turn does NOT pass here, player must choose another move or switch.
        // This creates a scenario where the player might be stuck if all moves have 0 PP.
        // For now, just send message and don't proceed with attack. Player can try another move.
        // A more complete implementation would require a "Struggle" move.
        broadcastGameState(gameId); // Broadcast to show message
        return res.status(400).json({ message: game.lastBattleMessage, currentGameState: game.state });
    }
    // Decrement PP (if we were tracking current PP)
    // chosenMove.currentPp = (chosenMove.currentPp || chosenMove.pp) - 1; // Need to store currentPp on pokemon instance in party

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
    game.lastBattleMessage = message; // Initialize for this turn

    if (chosenMove.accuracy && Math.random() * 100 > chosenMove.accuracy) { // Check for null/100 accuracy
        game.lastBattleMessage += " The attack missed!";
        game.turn = defenderPlayer.id;
        applyEndOfTurnStatusEffects(attackerPlayer, game);
        broadcastGameState(gameId);
        return res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
    }

    const stab = attackerActivePokemon.details.types.includes(chosenMove.type) ? 1.5 : 1;
    const effectiveness = getAttackEffectiveness(chosenMove.type, defenderActivePokemon.details.types);

    let damage = 0;
    if (chosenMove.category !== 'status' && chosenMove.power > 0 && effectiveness > 0) {
        let attackStat, defenseStat;
        if (chosenMove.category === 'special') {
            attackStat = attackerActivePokemon.details.stats.specialAttack;
            defenseStat = defenderActivePokemon.details.stats.specialDefense;
        } else { // physical or category undefined (default to physical)
            attackStat = attackerActivePokemon.details.stats.attack;
            defenseStat = defenderActivePokemon.details.stats.defense;
        }

        // Standard-ish damage formula (Level 50 assumed)
        damage = Math.floor(((((2 * 50 / 5 + 2) * chosenMove.power * (attackStat / defenseStat)) / 50) + 2) * stab * effectiveness * ((Math.random() * (1.0 - 0.85)) + 0.85));
        damage = Math.max(1, damage);
    }

    if (effectiveness > 1) game.lastBattleMessage += " It's super effective!";
    if (effectiveness < 1 && effectiveness > 0) game.lastBattleMessage += " It's not very effective...";
    if (effectiveness === 0) game.lastBattleMessage += " It had no effect!";

    if (damage > 0) {
        defenderActivePokemon.currentHp -= damage;
        game.lastBattleMessage += ` ${defenderPlayer.id}'s ${defenderActivePokemon.details.name} took ${damage} damage.`;
    }
    console.log(`[Game ${gameId}] ${attackerActivePokemon.details.name} (Atk: ${chosenMove.category === 'special' ? attackerActivePokemon.details.stats.specialAttack : attackerActivePokemon.details.stats.attack}) dealt ${damage} to ${defenderActivePokemon.details.name} (Def: ${chosenMove.category === 'special' ? defenderActivePokemon.details.stats.specialDefense : defenderActivePokemon.details.stats.defense}). Defender HP: ${defenderActivePokemon.currentHp}`);


    if (chosenMove.effect && chosenMove.effect.status && effectiveness > 0) {
        if (defenderActivePokemon.status === 'healthy' && (!defenderActivePokemon.activeStatus || defenderActivePokemon.activeStatus.length === 0) ) {
            if (Math.random() * 100 < chosenMove.effect.chance) {
                defenderActivePokemon.activeStatus = chosenMove.effect.status;
                game.lastBattleMessage += ` ${defenderActivePokemon.details.name} was ${chosenMove.effect.status}!`;
                console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} afflicted with ${chosenMove.effect.status}.`);
            }
        }
    }
    // TODO: Implement stat change effects: chosenMove.effect.stat_change

    let attackerFaintedFromOwnStatus = false;

    if (defenderActivePokemon.currentHp <= 0) {
        defenderActivePokemon.currentHp = 0;
        defenderActivePokemon.status = 'fainted';
        defenderPlayer.pokemonLeft = defenderPlayer.party.filter(p => p.status === 'healthy').length;
        game.lastBattleMessage += ` ${defenderActivePokemon.details.name} fainted.`;
        console.log(`[Game ${gameId}] ${defenderActivePokemon.details.name} fainted. ${defenderPlayer.id} has ${defenderPlayer.pokemonLeft} Pokemon left.`);

        if (defenderPlayer.pokemonLeft <= 0) {
            game.state = 'finished'; game.winner = attackerPlayer.id;
            game.lastBattleMessage += ` All of ${defenderPlayer.id}'s Pokemon have fainted! ${attackerPlayer.id} wins!`;
        } else {
            game.state = 'waiting_for_switch'; game.turn = defenderPlayer.id;
            game.lastBattleMessage += ` ${defenderPlayer.id} must switch Pokemon.`;
        }
    }

    // Apply end-of-turn status effects for the attacker if the game hasn't ended or isn't waiting for defender to switch
    if (game.state !== 'finished' && game.state !== 'waiting_for_switch') {
        applyEndOfTurnStatusEffects(attackerPlayer, game);
        attackerActivePokemon = attackerPlayer.party[attackerPlayer.activePokemonIndex]; // Re-check after status
        if (attackerActivePokemon.status === 'fainted') {
            attackerFaintedFromOwnStatus = true;
            if (attackerPlayer.pokemonLeft > 0) {
                 game.state = 'waiting_for_switch';
                 game.turn = attackerPlayer.id;
            } else { // Attacker fainted and has no more Pokemon
                game.state = 'finished';
                game.winner = defenderPlayer.id; // Defender wins
                game.lastBattleMessage += ` All of ${attackerPlayer.id}'s Pokemon have fainted! ${defenderPlayer.id} wins!`;
            }
        }
    }

    if (game.state === 'battle' && !attackerFaintedFromOwnStatus) {
        game.turn = defenderPlayer.id;
        // game.lastBattleMessage += ` It's now ${defenderPlayer.id}'s turn.`; // This might be too verbose if added every time
    }

    broadcastGameState(gameId);
    res.json({ gameId, message: game.lastBattleMessage, currentGameState: game.state });
});

app.get('/game/:id', (req, res) => { /* ... (no change) ... */ });
server.listen(port, () => {
    console.log(`Pokemon Battle Backend with WebSocket server listening at http://localhost:${port}`);
});
module.exports = { app, server };
