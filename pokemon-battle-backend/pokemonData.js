// pokemonData.js
// Curated dataset: Final evolutions and specified single-stage Pokemon from Pokedex #1-251.
// Each Pokemon now has 4 moves, with category, and sleep/confusion/flinch effects have duration.

const POKEMON_DATA = {
  "venusaur": {
    "id": 3, "name": "venusaur",
    "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    "moves": [
      { "name": "Giga Drain", "power": 75, "type": "grass", "accuracy": 100, "pp": 10, "category": "special", "effect": {"heal_from_damage_percent": 50, "target": "self"} },
      { "name": "Sludge Bomb", "power": 90, "type": "poison", "accuracy": 100, "pp": 10, "category": "special", "effect": { "status": "poison", "chance": 30, "target": "opponent" } },
      { "name": "Sleep Powder", "power": 0, "type": "grass", "accuracy": 75, "pp": 15, "category": "status", "effect": { "status": "sleep", "chance": 100, "target": "opponent", "duration": [1, 3] } },
      { "name": "Earthquake", "power": 100, "type": "ground", "accuracy": 100, "pp": 10, "category": "physical", "effect": null }
    ]
  },
  "charizard": {
    "id": 6, "name": "charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    "moves": [
      { "name": "Flamethrower", "power": 90, "type": "fire", "accuracy": 100, "pp": 15, "category": "special", "effect": { "status": "burn", "chance": 10, "target": "opponent" } },
      { "name": "Air Slash", "power": 75, "type": "flying", "accuracy": 95, "pp": 15, "category": "special", "effect": { "status": "flinch", "chance": 30, "target": "opponent" } },
      { "name": "Dragon Pulse", "power": 85, "type": "dragon", "accuracy": 100, "pp": 10, "category": "special", "effect": null },
      { "name": "Earthquake", "power": 100, "type": "ground", "accuracy": 100, "pp": 10, "category": "physical", "effect": null }
    ]
  },
  "blastoise": {
    "id": 9, "name": "blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    "moves": [
      { "name": "Hydro Pump", "power": 110, "type": "water", "accuracy": 80, "pp": 5, "category": "special", "effect": null },
      { "name": "Ice Beam", "power": 90, "type": "ice", "accuracy": 100, "pp": 10, "category": "special", "effect": { "status": "freeze", "chance": 10, "target": "opponent" } },
      { "name": "Flash Cannon", "power": 80, "type": "steel", "accuracy": 100, "pp": 10, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 10, "target": "opponent" } } },
      { "name": "Aura Sphere", "power": 80, "type": "fighting", "accuracy": 100, "pp": 20, "category": "special", "effect": null } // Never misses
    ]
  },
  "butterfree": {
    "id": 12, "name": "butterfree",
    "stats": { "hp": 60, "attack": 45, "defense": 50, "specialAttack": 90, "specialDefense": 80, "speed": 70 },
    "types": ["bug", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png",
    "moves": [
      { "name": "Sleep Powder", "power": 0, "type": "grass", "accuracy": 75, "pp": 15, "category": "status", "effect": { "status": "sleep", "chance": 100, "target": "opponent", "duration": [1, 3] } },
      { "name": "Bug Buzz", "power": 90, "type": "bug", "accuracy": 100, "pp": 10, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 10, "target": "opponent" } } },
      { "name": "Psychic", "power": 90, "type": "psychic", "accuracy": 100, "pp": 10, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 10, "target": "opponent" } } },
      { "name": "Quiver Dance", "power": 0, "type": "bug", "accuracy": 100, "pp": 20, "category": "status", "effect": { "stat_change": { "stat": ["specialAttack", "specialDefense", "speed"], "stages": 1, "chance": 100, "target": "self" } } }
    ]
  },
  "beedrill": {
    "id": 15, "name": "beedrill",
    "stats": { "hp": 65, "attack": 90, "defense": 40, "specialAttack": 45, "specialDefense": 80, "speed": 75 },
    "types": ["bug", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png",
    "moves": [
        { "name": "Twineedle", "power": 25, "type": "bug", "accuracy": 100, "pp": 20, "category": "physical", "effect": { "status": "poison", "chance": 20, "target": "opponent" } },
        { "name": "Poison Jab", "power": 80, "type": "poison", "accuracy": 100, "pp": 20, "category": "physical", "effect": { "status": "poison", "chance": 30, "target": "opponent" } },
        { "name": "X-Scissor", "power": 80, "type": "bug", "accuracy": 100, "pp": 15, "category": "physical", "effect": null },
        { "name": "Swords Dance", "power": 0, "type": "normal", "accuracy": 100, "pp": 20, "category": "status", "effect": { "stat_change": { "stat": "attack", "stages": 2, "chance": 100, "target": "self" } } }
    ]
  },
  "pidgeot": {
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png",
    "moves": [
        { "name": "Hurricane", "power": 110, "type": "flying", "accuracy": 70, "pp": 10, "category": "special", "effect": { "status": "confusion", "chance": 30, "target": "opponent", "duration": [1,4] } },
        { "name": "Quick Attack", "power": 40, "type": "normal", "accuracy": 100, "pp": 30, "category": "physical", "effect": null },
        { "name": "Heat Wave", "power": 95, "type": "fire", "accuracy": 90, "pp": 10, "category": "special", "effect": { "status": "burn", "chance": 10, "target": "opponent" } },
        { "name": "Roost", "power": 0, "type": "flying", "accuracy": 100, "pp": 10, "category": "status", "effect": { "heal_percent": 50, "target": "self" } }
    ]
  },
  "raticate": {
    "id": 20, "name": "raticate",
    "stats": { "hp": 55, "attack": 81, "defense": 60, "specialAttack": 50, "specialDefense": 70, "speed": 97 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png",
    "moves": [
        { "name": "Hyper Fang", "power": 80, "type": "normal", "accuracy": 90, "pp": 15, "category": "physical", "effect": { "status": "flinch", "chance": 10, "target": "opponent" } },
        { "name": "Crunch", "power": 80, "type": "dark", "accuracy": 100, "pp": 15, "category": "physical", "effect": { "stat_change": { "stat": "defense", "stages": -1, "chance": 20, "target": "opponent" } } },
        { "name": "Sucker Punch", "power": 70, "type": "dark", "accuracy": 100, "pp": 5, "category": "physical", "effect": null },
        { "name": "Swords Dance", "power": 0, "type": "normal", "accuracy": 100, "pp": 20, "category": "status", "effect": { "stat_change": { "stat": "attack", "stages": 2, "chance": 100, "target": "self" } } }
    ]
  },
  "fearow": {
    "id": 22, "name": "fearow",
    "stats": { "hp": 65, "attack": 90, "defense": 65, "specialAttack": 61, "specialDefense": 61, "speed": 100 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png",
    "moves": [
        { "name": "Drill Peck", "power": 80, "type": "flying", "accuracy": 100, "pp": 20, "category": "physical", "effect": null },
        { "name": "Tri Attack", "power": 80, "type": "normal", "accuracy": 100, "pp": 10, "category": "special", "effect": { "status_multi": ["burn", "paralysis", "freeze"], "chance": 20, "target": "opponent" } },
        { "name": "Hyper Beam", "power": 150, "type": "normal", "accuracy": 90, "pp": 5, "category": "special", "effect": null },
        { "name": "Agility", "power": 0, "type": "psychic", "accuracy": 100, "pp": 30, "category": "status", "effect": { "stat_change": { "stat": "speed", "stages": 2, "chance": 100, "target": "self" } } }
    ]
  },
   "alakazam": {
    "id": 65, "name": "alakazam",
    "stats": { "hp": 55, "attack": 50, "defense": 45, "specialAttack": 135, "specialDefense": 95, "speed": 120 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
    "moves": [
      { "name": "Psychic", "power": 90, "type": "psychic", "accuracy": 100, "pp": 10, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 10, "target": "opponent" } } },
      { "name": "Shadow Ball", "power": 80, "type": "ghost", "accuracy": 100, "pp": 15, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 20, "target": "opponent" } } },
      { "name": "Focus Blast", "power": 120, "type": "fighting", "accuracy": 70, "pp": 5, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 10, "target": "opponent" } } },
      { "name": "Recover", "power": 0, "type": "normal", "accuracy": 100, "pp": 5, "category": "status", "effect": { "heal_percent": 50, "target": "self" } }
    ]
  },
  "gengar": {
    "id": 94, "name": "gengar",
    "stats": { "hp": 60, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 75, "speed": 110 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    "moves": [
      { "name": "Shadow Ball", "power": 80, "type": "ghost", "accuracy": 100, "pp": 15, "category": "special", "effect": { "stat_change": { "stat": "specialDefense", "stages": -1, "chance": 20, "target": "opponent" } } },
      { "name": "Sludge Bomb", "power": 90, "type": "poison", "accuracy": 100, "pp": 10, "category": "special", "effect": { "status": "poison", "chance": 30, "target": "opponent" } },
      { "name": "Confuse Ray", "power": 0, "type": "ghost", "accuracy": 100, "pp": 10, "category": "status", "effect": { "status": "confusion", "chance": 100, "target": "opponent", "duration": [1, 4] } },
      { "name": "Hypnosis", "power": 0, "type": "psychic", "accuracy": 60, "pp": 20, "category": "status", "effect": { "status": "sleep", "chance": 100, "target": "opponent", "duration": [1, 3] } }
    ]
  },
  "snorlax": {
    "id": 143, "name": "snorlax",
    "stats": { "hp": 160, "attack": 110, "defense": 65, "specialAttack": 65, "specialDefense": 110, "speed": 30 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    "moves": [
      { "name": "Body Slam", "power": 85, "type": "normal", "accuracy": 100, "pp": 15, "category": "physical", "effect": { "status": "paralysis", "chance": 30, "target": "opponent" } },
      { "name": "Rest", "power": 0, "type": "normal", "accuracy": 100, "pp": 5, "category": "status", "effect": { "status": "sleep", "duration": [2, 2], "heal": "full", "target": "self" } },
      { "name": "Earthquake", "power": 100, "type": "ground", "accuracy": 100, "pp": 10, "category": "physical", "effect": null },
      { "name": "Crunch", "power": 80, "type": "dark", "accuracy": 100, "pp": 15, "category": "physical", "effect": { "stat_change": { "stat": "defense", "stages": -1, "chance": 20, "target": "opponent" } } }
    ]
  },
  "dragonite": {
    "id": 149, "name": "dragonite",
    "stats": { "hp": 91, "attack": 134, "defense": 95, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["dragon", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    "moves": [
      { "name": "Outrage", "power": 120, "type": "dragon", "accuracy": 100, "pp": 10, "category": "physical", "effect": null },
      { "name": "Hurricane", "power": 110, "type": "flying", "accuracy": 70, "pp": 10, "category": "special", "effect": { "status": "confusion", "chance": 30, "target": "opponent", "duration": [1,4] } },
      { "name": "Fire Punch", "power": 75, "type": "fire", "accuracy": 100, "pp": 15, "category": "physical", "effect": { "status": "burn", "chance": 10, "target": "opponent" } },
      { "name": "Dragon Dance", "power": 0, "type": "dragon", "accuracy": 100, "pp": 20, "category": "status", "effect": { "stat_change": { "stat": ["attack", "speed"], "stages": 1, "chance": 100, "target": "self" } } }
    ]
  }
  // ... (The rest of the POKEMON_DATA object would be similarly updated for all Pokemon)
};

function getPokemonDetails(pokemonName) {
    if (!pokemonName || typeof pokemonName !== 'string') {
        return null;
    }
    const foundKey = Object.keys(POKEMON_DATA).find(key => key.toLowerCase() === pokemonName.toLowerCase());
    if (foundKey && POKEMON_DATA[foundKey]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[foundKey]));
    }
    return null;
}

module.exports = { POKEMON_DATA, getPokemonDetails };
