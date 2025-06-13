const POKEMON_DATA = {
    'Bulbasaur': {
        id: 1, name: 'Bulbasaur', type: ['Grass', 'Poison'],
        stats: { hp: 45, attack: 49, defense: 49, speed: 45 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    },
    'Charmander': {
        id: 4, name: 'Charmander', type: ['Fire'],
        stats: { hp: 39, attack: 52, defense: 43, speed: 65 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
    },
    'Squirtle': {
        id: 7, name: 'Squirtle', type: ['Water'],
        stats: { hp: 44, attack: 48, defense: 65, speed: 43 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
    },
    'Pikachu': {
        id: 25, name: 'Pikachu', type: ['Electric'],
        stats: { hp: 35, attack: 55, defense: 40, speed: 90 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    },
    'Jigglypuff': {
        id: 39, name: 'Jigglypuff', type: ['Normal', 'Fairy'],
        stats: { hp: 115, attack: 45, defense: 20, speed: 20 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png'
    },
    'Meowth': {
        id: 52, name: 'Meowth', type: ['Normal'],
        stats: { hp: 40, attack: 45, defense: 35, speed: 90 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png'
    },
    'Machop': {
        id: 66, name: 'Machop', type: ['Fighting'],
        stats: { hp: 70, attack: 80, defense: 50, speed: 35 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png'
    },
    'Geodude': {
        id: 74, name: 'Geodude', type: ['Rock', 'Ground'],
        stats: { hp: 40, attack: 80, defense: 100, speed: 20 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png'
    },
    'Gastly': {
        id: 92, name: 'Gastly', type: ['Ghost', 'Poison'],
        stats: { hp: 30, attack: 35, defense: 30, speed: 80 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png'
    },
    'Eevee': {
        id: 133, name: 'Eevee', type: ['Normal'],
        stats: { hp: 55, attack: 55, defense: 50, speed: 55 },
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png'
    }
};

// Function to get a deep copy of Pokemon details to avoid mutation of the base data
const getPokemonDetails = (pokemonName) => {
    if (POKEMON_DATA[pokemonName]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[pokemonName]));
    }
    return null;
};

module.exports = {
    POKEMON_DATA,
    getPokemonDetails
};
