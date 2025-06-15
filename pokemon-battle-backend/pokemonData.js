// pokemonData.js
const POKEMON_DATA = {
  "venusaur": {
    "id": 3, "name": "venusaur",
    "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    "moves": [
      { "name": "Razor Leaf", "power": 55 },
      { "name": "Sludge Bomb", "power": 90 },
      { "name": "Solar Beam", "power": 120 },
      { "name": "Tackle", "power": 40 }
    ]
  },
  "charizard": {
    "id": 6, "name": "charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    "moves": [
      { "name": "Flamethrower", "power": 90 },
      { "name": "Air Slash", "power": 75 },
      { "name": "Dragon Claw", "power": 80 },
      { "name": "Scratch", "power": 40 }
    ]
  },
  "blastoise": {
    "id": 9, "name": "blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    "moves": [
      { "name": "Hydro Pump", "power": 110 },
      { "name": "Ice Beam", "power": 90 },
      { "name": "Skull Bash", "power": 100 },
      { "name": "Water Gun", "power": 40 }
    ]
  },
  "pidgeot": { // Example of a Pokémon that would have had generic moves
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png",
    "moves": [ // Using the "generic" set for this one as an example
      { "name": "Tackle", "power": 40 },
      { "name": "Quick Attack", "power": 40 },
      { "name": "Wing Attack", "power": 60 },
      { "name": "Hyper Beam", "power": 150 }
    ]
  }
  // For this focused fix, we are only including these 4 Pokémon.
  // The full list would be restored later.
};

function getPokemonDetails(pokemonName) {
    if (!pokemonName || typeof pokemonName !== 'string') {
        return null;
    }
    const normalizedName = pokemonName.toLowerCase();
    // Directly access using the normalized name if keys are already lowercase
    if (POKEMON_DATA[normalizedName]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[normalizedName]));
    }
    // Fallback for keys that might have different casing (though current POKEMON_DATA is all lowercase)
    const foundKey = Object.keys(POKEMON_DATA).find(key => key.toLowerCase() === normalizedName);
    if (foundKey && POKEMON_DATA[foundKey]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[foundKey]));
    }
    return null;
}

module.exports = { POKEMON_DATA, getPokemonDetails };
