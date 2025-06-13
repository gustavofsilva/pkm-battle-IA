// pokemonData.js
// Curated dataset: Final evolutions and single-stage Pokemon from Pokedex #1-251.
// Structure: id, name (lowercase), stats (hp, attack, defense, specialAttack, specialDefense, speed), types (array), sprite URL

const POKEMON_DATA = {
  "venusaur": {
    "id": 3, "name": "venusaur",
    "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png"
  },
  "charizard": {
    "id": 6, "name": "charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
  },
  "blastoise": {
    "id": 9, "name": "blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
  },
  "butterfree": {
    "id": 12, "name": "butterfree",
    "stats": { "hp": 60, "attack": 45, "defense": 50, "specialAttack": 90, "specialDefense": 80, "speed": 70 },
    "types": ["bug", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png"
  },
  "pidgeot": {
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png"
  },
  "raichu": {
    "id": 26, "name": "raichu",
    "stats": { "hp": 60, "attack": 90, "defense": 55, "specialAttack": 90, "specialDefense": 80, "speed": 110 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png"
  },
  "nidoqueen": {
    "id": 31, "name": "nidoqueen",
    "stats": { "hp": 90, "attack": 92, "defense": 87, "specialAttack": 75, "specialDefense": 85, "speed": 76 },
    "types": ["poison", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png"
  },
  "nidoking": {
    "id": 34, "name": "nidoking",
    "stats": { "hp": 81, "attack": 102, "defense": 77, "specialAttack": 85, "specialDefense": 75, "speed": 85 },
    "types": ["poison", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png"
  },
  "clefable": {
    "id": 36, "name": "clefable",
    "stats": { "hp": 95, "attack": 70, "defense": 73, "specialAttack": 95, "specialDefense": 90, "speed": 60 },
    "types": ["fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png"
  },
  "ninetales": {
    "id": 38, "name": "ninetales",
    "stats": { "hp": 73, "attack": 76, "defense": 75, "specialAttack": 81, "specialDefense": 100, "speed": 100 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png"
  },
  "wigglytuff": {
    "id": 40, "name": "wigglytuff",
    "stats": { "hp": 140, "attack": 70, "defense": 45, "specialAttack": 85, "specialDefense": 50, "speed": 45 },
    "types": ["normal", "fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png"
  },
  "arcanine": {
    "id": 59, "name": "arcanine",
    "stats": { "hp": 90, "attack": 110, "defense": 80, "specialAttack": 100, "specialDefense": 80, "speed": 95 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png"
  },
  "alakazam": {
    "id": 65, "name": "alakazam",
    "stats": { "hp": 55, "attack": 50, "defense": 45, "specialAttack": 135, "specialDefense": 95, "speed": 120 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png"
  },
  "machamp": {
    "id": 68, "name": "machamp",
    "stats": { "hp": 90, "attack": 130, "defense": 80, "specialAttack": 65, "specialDefense": 85, "speed": 55 },
    "types": ["fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png"
  },
  "golem": {
    "id": 76, "name": "golem",
    "stats": { "hp": 80, "attack": 120, "defense": 130, "specialAttack": 55, "specialDefense": 65, "speed": 45 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png"
  },
  "gengar": {
    "id": 94, "name": "gengar",
    "stats": { "hp": 60, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 75, "speed": 110 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
  },
  "lapras": {
    "id": 131, "name": "lapras",
    "stats": { "hp": 130, "attack": 85, "defense": 80, "specialAttack": 85, "specialDefense": 95, "speed": 60 },
    "types": ["water", "ice"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png"
  },
  "vaporeon": {
    "id": 134, "name": "vaporeon",
    "stats": { "hp": 130, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 65 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png"
  },
  "jolteon": {
    "id": 135, "name": "jolteon",
    "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 130 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png"
  },
  "flareon": {
    "id": 136, "name": "flareon",
    "stats": { "hp": 65, "attack": 130, "defense": 60, "specialAttack": 95, "specialDefense": 110, "speed": 65 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png"
  },
  "snorlax": {
    "id": 143, "name": "snorlax",
    "stats": { "hp": 160, "attack": 110, "defense": 65, "specialAttack": 65, "specialDefense": 110, "speed": 30 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
  },
  "dragonite": {
    "id": 149, "name": "dragonite",
    "stats": { "hp": 91, "attack": 134, "defense": 95, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["dragon", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png"
  },
  "mewtwo": {
    "id": 150, "name": "mewtwo",
    "stats": { "hp": 106, "attack": 110, "defense": 90, "specialAttack": 154, "specialDefense": 90, "speed": 130 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
  },
  "mew": {
    "id": 151, "name": "mew",
    "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
  },
  "meganium": {
    "id": 154, "name": "meganium",
    "stats": { "hp": 80, "attack": 82, "defense": 100, "specialAttack": 83, "specialDefense": 100, "speed": 80 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png"
  },
  "typhlosion": {
    "id": 157, "name": "typhlosion",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png"
  },
  "feraligatr": {
    "id": 160, "name": "feraligatr",
    "stats": { "hp": 85, "attack": 105, "defense": 100, "specialAttack": 79, "specialDefense": 83, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/160.png"
  },
  "crobat": {
    "id": 169, "name": "crobat",
    "stats": { "hp": 85, "attack": 90, "defense": 80, "specialAttack": 70, "specialDefense": 80, "speed": 130 },
    "types": ["poison", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/169.png"
  },
  "ampharos": {
    "id": 181, "name": "ampharos",
    "stats": { "hp": 90, "attack": 75, "defense": 85, "specialAttack": 115, "specialDefense": 90, "speed": 55 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/181.png"
  },
  "espeon": {
    "id": 196, "name": "espeon",
    "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 95, "speed": 110 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png"
  },
  "umbreon": {
    "id": 197, "name": "umbreon",
    "stats": { "hp": 95, "attack": 65, "defense": 110, "specialAttack": 60, "specialDefense": 130, "speed": 65 },
    "types": ["dark"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png"
  },
  "kingdra": {
    "id": 230, "name": "kingdra",
    "stats": { "hp": 75, "attack": 95, "defense": 95, "specialAttack": 95, "specialDefense": 95, "speed": 85 },
    "types": ["water", "dragon"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/230.png"
  },
  "scizor": {
    "id": 212, "name": "scizor",
    "stats": { "hp": 70, "attack": 130, "defense": 100, "specialAttack": 55, "specialDefense": 80, "speed": 65 },
    "types": ["bug", "steel"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png"
  },
  "heracross": {
    "id": 214, "name": "heracross",
    "stats": { "hp": 80, "attack": 125, "defense": 75, "specialAttack": 40, "specialDefense": 95, "speed": 85 },
    "types": ["bug", "fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/214.png"
  },
  "houndoom": {
    "id": 229, "name": "houndoom",
    "stats": { "hp": 75, "attack": 90, "defense": 50, "specialAttack": 110, "specialDefense": 80, "speed": 95 },
    "types": ["dark", "fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/229.png"
  },
  "tyranitar": {
    "id": 248, "name": "tyranitar",
    "stats": { "hp": 100, "attack": 134, "defense": 110, "specialAttack": 95, "specialDefense": 100, "speed": 61 },
    "types": ["rock", "dark"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png"
  },
  "blissey": {
    "id": 242, "name": "blissey",
    "stats": { "hp": 255, "attack": 10, "defense": 10, "specialAttack": 75, "specialDefense": 135, "speed": 55 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/242.png"
  },
  "lugia": {
    "id": 249, "name": "lugia",
    "stats": { "hp": 106, "attack": 90, "defense": 130, "specialAttack": 90, "specialDefense": 154, "speed": 110 },
    "types": ["psychic", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png"
  },
  "ho-oh": {
    "id": 250, "name": "ho-oh",
    "stats": { "hp": 106, "attack": 130, "defense": 90, "specialAttack": 110, "specialDefense": 154, "speed": 90 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png"
  },
  "celebi": {
    "id": 251, "name": "celebi",
    "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 },
    "types": ["psychic", "grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png"
  }
};

// Helper function to get a deep copy of Pokemon details by name
// Ensures case-insensitivity for pokemonName lookup
function getPokemonDetails(pokemonName) {
    if (!pokemonName || typeof pokemonName !== 'string') {
        return null;
    }
    // Find the key in POKEMON_DATA that matches pokemonName case-insensitively
    const foundKey = Object.keys(POKEMON_DATA).find(key => key.toLowerCase() === pokemonName.toLowerCase());

    if (foundKey && POKEMON_DATA[foundKey]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[foundKey]));
    }
    return null;
}

module.exports = { POKEMON_DATA, getPokemonDetails };
