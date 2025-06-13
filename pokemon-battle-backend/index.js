const express = require('express');
const bodyParser = require('body-parser');
const { getPokemonDetails } = require('./pokemonData'); // Import Pokemon data handler

const app = express();
const port = process.env.PORT || 3000;

// In-memory store for game states
const games = {};

app.use(bodyParser.json());

// Route to create a new game
app.post('/game', (req, res) => {
    const gameId = `game_${Date.now()}`;
    games[gameId] = {
        id: gameId,
        players: [],
        state: 'waiting_for_players', // Possible states: waiting_for_players, selecting_pokemon, battle, finished
        turn: null,
        winner: null,
    };
    console.log(`[Game ${gameId}] Created`);
    res.status(201).json({ gameId, message: 'Game created successfully. Waiting for players to join.' });
});

// Route to join an existing game
app.post('/game/:id/join', (req, res) => {
    const gameId = req.params.id;
    const { playerId } = req.body;

    if (!games[gameId]) {
        return res.status(404).json({ message: 'Game not found.' });
    }

    const game = games[gameId];

    if (game.players.length >= 2) {
        return res.status(400).json({ message: 'Game is already full.' });
    }
    if (!playerId) {
        return res.status(400).json({ message: 'Player ID is required to join the game.' });
    }
    if (game.players.find(p => p.id === playerId)) {
        return res.status(400).json({ message: `Player ${playerId} already joined this game.` });
    }

    game.players.push({
        id: playerId,
        pokemon: null, // Pokemon (with full stats) will be stored here
        hasSelectedPokemon: false
    });
    console.log(`[Game ${gameId}] Player ${playerId} joined`);

    if (game.players.length === 2) {
        game.state = 'selecting_pokemon';
        console.log(`[Game ${gameId}] State changed to 'selecting_pokemon'`);
        res.json({ gameId, message: `Player ${playerId} joined. Both players joined. Game is ready for Pokemon selection.` });
    } else {
        res.json({ gameId, message: `Player ${playerId} joined. Waiting for another player.` });
    }
});

// Route to allow a player to select their Pokemon
app.post('/game/:id/select-pokemon', (req, res) => {
    const gameId = req.params.id;
    const { playerId, pokemonName } = req.body;

    if (!games[gameId]) {
        return res.status(404).json({ message: 'Game not found.' });
    }
    const game = games[gameId];

    if (game.state !== 'selecting_pokemon') {
        return res.status(400).json({ message: 'Game is not in Pokemon selection phase.' });
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
        return res.status(404).json({ message: 'Player not found in this game.' });
    }
    if (player.hasSelectedPokemon) {
        return res.status(400).json({ message: `Player ${playerId} has already selected a Pokemon.` });
    }
    if (!pokemonName) {
        return res.status(400).json({ message: 'Pokemon name is required.' });
    }

    const pokemonDetails = getPokemonDetails(pokemonName);
    if (!pokemonDetails) {
        return res.status(404).json({ message: `Pokemon named ${pokemonName} not found.` });
    }

    // Store the full Pokemon details and initialize currentHp
    player.pokemon = {
        ...pokemonDetails,
        currentHp: pokemonDetails.stats.hp // Initialize current HP to max HP
    };
    player.hasSelectedPokemon = true;
    console.log(`[Game ${gameId}] Player ${playerId} selected ${pokemonName}`);

    const allPlayersSelected = game.players.every(p => p.hasSelectedPokemon);
    if (allPlayersSelected) {
        game.state = 'battle';
        // Randomly decide who goes first
        game.turn = game.players[Math.floor(Math.random() * game.players.length)].id;
        console.log(`[Game ${gameId}] State changed to 'battle'. It's ${game.turn}'s turn.`);
        res.json({
            gameId,
            message: `All Pokemon selected. Battle begins! It's ${game.turn}'s turn.`,
            currentTurn: game.turn,
            player1: {id: game.players[0].id, pokemon: game.players[0].pokemon},
            player2: {id: game.players[1].id, pokemon: game.players[1].pokemon}
        });
    } else {
        res.json({ gameId, message: `Player ${playerId} selected ${pokemonName}. Waiting for other player.` });
    }
});

// Route to allow a player to attack
app.post('/game/:id/attack', (req, res) => {
    const gameId = req.params.id;
    const { playerId, attackName } = req.body; // attackName can be used later for specific moves

    if (!games[gameId]) {
        return res.status(404).json({ message: 'Game not found.' });
    }
    const game = games[gameId];

    if (game.state !== 'battle') {
        return res.status(400).json({ message: 'Game is not in battle phase.' });
    }
    if (game.turn !== playerId) {
        return res.status(400).json({ message: `It's not player ${playerId}'s turn. It's ${game.turn}'s turn.` });
    }

    const attackerPlayer = game.players.find(p => p.id === playerId);
    const defenderPlayer = game.players.find(p => p.id !== playerId);

    if (!attackerPlayer || !defenderPlayer || !attackerPlayer.pokemon || !defenderPlayer.pokemon) {
        return res.status(500).json({ message: 'Error retrieving player or Pokemon data for battle.' });
    }

    const attackerPokemon = attackerPlayer.pokemon;
    const defenderPokemon = defenderPlayer.pokemon;

    // Simple damage calculation: Attacker's Attack stat vs. Defender's Defense stat
    // Add a random factor for variability, ensure minimum damage if attack > defense
    let damage = Math.max(1, Math.floor(attackerPokemon.stats.attack * (Math.random() * 0.2 + 0.9)) - Math.floor(defenderPokemon.stats.defense * 0.5));

    // Ensure damage is at least 1 if attacker's attack is greater than half of defender's defense, otherwise it could be 0 or negative.
    // A more sophisticated formula would be better here.
    if (attackerPokemon.stats.attack > defenderPokemon.stats.defense / 2 && damage <= 0) {
        damage = 1 + Math.floor(Math.random() * 5); // Small random damage if calculation results in <=0
    } else if (damage <=0) {
        damage = 1; // Minimum 1 damage
    }


    defenderPokemon.currentHp -= damage;
    const usedAttack = attackName || "basic attack"; // Use provided attack name or default

    console.log(`[Game ${gameId}] Player ${playerId} (${attackerPokemon.name}) attacked ${defenderPlayer.id} (${defenderPokemon.name}) with ${usedAttack} for ${damage} damage. ${defenderPlayer.id} HP: ${defenderPokemon.currentHp}/${defenderPokemon.stats.hp}`);

    if (defenderPokemon.currentHp <= 0) {
        defenderPokemon.currentHp = 0; // Ensure HP doesn't go negative
        game.state = 'finished';
        game.winner = playerId;
        console.log(`[Game ${gameId}] State changed to 'finished'. Winner: ${playerId}`);
        res.json({
            gameId,
            message: `Player ${playerId} (${attackerPokemon.name}) wins! ${defenderPlayer.id}'s ${defenderPokemon.name} fainted.`,
            winner: playerId,
            attacker: { id: attackerPlayer.id, pokemon: attackerPokemon },
            defender: { id: defenderPlayer.id, pokemon: defenderPokemon },
        });
    } else {
        // Switch turns
        game.turn = defenderPlayer.id;
        res.json({
            gameId,
            message: `Player ${playerId} (${attackerPokemon.name}) attacked with ${usedAttack} for ${damage} damage. ${defenderPlayer.id}'s ${defenderPokemon.name} has ${defenderPokemon.currentHp}/${defenderPokemon.stats.hp} HP left. It's ${defenderPlayer.id}'s turn.`,
            attacker: { id: attackerPlayer.id, pokemon: attackerPokemon },
            defender: { id: defenderPlayer.id, pokemon: defenderPokemon },
            nextTurn: defenderPlayer.id,
        });
    }
});

// Route to get game state
app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    if (!games[gameId]) {
        return res.status(404).json({ message: 'Game not found.' });
    }
    // Return a safe copy of the game state, perhaps omitting sensitive details if any in future
    const game = games[gameId];
    const playersSanitized = game.players.map(player => ({
        id: player.id,
        hasSelectedPokemon: player.hasSelectedPokemon,
        pokemon: player.pokemon ? {
            name: player.pokemon.name,
            type: player.pokemon.type,
            sprite: player.pokemon.sprite,
            stats: player.pokemon.stats, // Send all stats
            currentHp: player.pokemon.currentHp,
            // Potentially omit full base stats if client doesn't need all of them once selected
        } : null
    }));

    res.json({
        id: game.id,
        state: game.state,
        turn: game.turn,
        winner: game.winner,
        players: playersSanitized,
    });
});

app.listen(port, () => {
    console.log(`Pokemon Battle Backend listening at http://localhost:${port}`);
});

module.exports = app;
