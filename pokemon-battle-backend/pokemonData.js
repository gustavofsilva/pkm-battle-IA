// pokemonData.js
// Manually curated dataset with a wider variety of Pokemon (Gen 1 & 2 focus)
// Structure: id, name (lowercase), stats (hp, attack, defense, specialAttack, specialDefense, speed), types (array), sprite URL

const POKEMON_DATA = {
  "bulbasaur": {
    "id": 1, "name": "bulbasaur",
    "stats": { "hp": 45, "attack": 49, "defense": 49, "specialAttack": 65, "specialDefense": 65, "speed": 45 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
  },
  "ivysaur": {
    "id": 2, "name": "ivysaur",
    "stats": { "hp": 60, "attack": 62, "defense": 63, "specialAttack": 80, "specialDefense": 80, "speed": 60 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png"
  },
  "venusaur": {
    "id": 3, "name": "venusaur",
    "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png"
  },
  "charmander": {
    "id": 4, "name": "charmander",
    "stats": { "hp": 39, "attack": 52, "defense": 43, "specialAttack": 60, "specialDefense": 50, "speed": 65 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
  },
  "charmeleon": {
    "id": 5, "name": "charmeleon",
    "stats": { "hp": 58, "attack": 64, "defense": 58, "specialAttack": 80, "specialDefense": 65, "speed": 80 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png"
  },
  "charizard": {
    "id": 6, "name": "charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
  },
  "squirtle": {
    "id": 7, "name": "squirtle",
    "stats": { "hp": 44, "attack": 48, "defense": 65, "specialAttack": 50, "specialDefense": 64, "speed": 43 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png"
  },
  "wartortle": {
    "id": 8, "name": "wartortle",
    "stats": { "hp": 59, "attack": 63, "defense": 80, "specialAttack": 65, "specialDefense": 80, "speed": 58 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png"
  },
  "blastoise": {
    "id": 9, "name": "blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
  },
  "caterpie": {
    "id": 10, "name": "caterpie",
    "stats": { "hp": 45, "attack": 30, "defense": 35, "specialAttack": 20, "specialDefense": 20, "speed": 45 },
    "types": ["bug"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png"
  },
  "metapod": {
    "id": 11, "name": "metapod",
    "stats": { "hp": 50, "attack": 20, "defense": 55, "specialAttack": 25, "specialDefense": 25, "speed": 30 },
    "types": ["bug"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png"
  },
  "butterfree": {
    "id": 12, "name": "butterfree",
    "stats": { "hp": 60, "attack": 45, "defense": 50, "specialAttack": 90, "specialDefense": 80, "speed": 70 },
    "types": ["bug", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png"
  },
  "pidgey": {
    "id": 16, "name": "pidgey",
    "stats": { "hp": 40, "attack": 45, "defense": 40, "specialAttack": 35, "specialDefense": 35, "speed": 56 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png"
  },
  "pidgeotto": {
    "id": 17, "name": "pidgeotto",
    "stats": { "hp": 63, "attack": 60, "defense": 55, "specialAttack": 50, "specialDefense": 50, "speed": 71 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png"
  },
  "pidgeot": {
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png"
  },
  "pikachu": {
    "id": 25, "name": "pikachu",
    "stats": { "hp": 35, "attack": 55, "defense": 40, "specialAttack": 50, "specialDefense": 50, "speed": 90 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
  },
  "raichu": {
    "id": 26, "name": "raichu",
    "stats": { "hp": 60, "attack": 90, "defense": 55, "specialAttack": 90, "specialDefense": 80, "speed": 110 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png"
  },
  "jigglypuff": {
    "id": 39, "name": "jigglypuff",
    "stats": { "hp": 115, "attack": 45, "defense": 20, "specialAttack": 45, "specialDefense": 25, "speed": 20 },
    "types": ["normal", "fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png"
  },
  "wigglytuff": {
    "id": 40, "name": "wigglytuff",
    "stats": { "hp": 140, "attack": 70, "defense": 45, "specialAttack": 85, "specialDefense": 50, "speed": 45 },
    "types": ["normal", "fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png"
  },
  "abra": {
    "id": 63, "name": "abra",
    "stats": { "hp": 25, "attack": 20, "defense": 15, "specialAttack": 105, "specialDefense": 55, "speed": 90 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png"
  },
  "kadabra": {
    "id": 64, "name": "kadabra",
    "stats": { "hp": 40, "attack": 35, "defense": 30, "specialAttack": 120, "specialDefense": 70, "speed": 105 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png"
  },
  "alakazam": {
    "id": 65, "name": "alakazam",
    "stats": { "hp": 55, "attack": 50, "defense": 45, "specialAttack": 135, "specialDefense": 95, "speed": 120 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png"
  },
  "gastly": {
    "id": 92, "name": "gastly",
    "stats": { "hp": 30, "attack": 35, "defense": 30, "specialAttack": 100, "specialDefense": 35, "speed": 80 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png"
  },
  "haunter": {
    "id": 93, "name": "haunter",
    "stats": { "hp": 45, "attack": 50, "defense": 45, "specialAttack": 115, "specialDefense": 55, "speed": 95 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png"
  },
  "gengar": {
    "id": 94, "name": "gengar",
    "stats": { "hp": 60, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 75, "speed": 110 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
  },
  "eevee": {
    "id": 133, "name": "eevee",
    "stats": { "hp": 55, "attack": 55, "defense": 50, "specialAttack": 45, "specialDefense": 65, "speed": 55 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
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
  "dratini": {
    "id": 147, "name": "dratini",
    "stats": { "hp": 41, "attack": 64, "defense": 45, "specialAttack": 50, "specialDefense": 50, "speed": 50 },
    "types": ["dragon"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png"
  },
  "dragonair": {
    "id": 148, "name": "dragonair",
    "stats": { "hp": 61, "attack": 84, "defense": 65, "specialAttack": 70, "specialDefense": 70, "speed": 70 },
    "types": ["dragon"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png"
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
  "chikorita": {
    "id": 152, "name": "chikorita",
    "stats": { "hp": 45, "attack": 49, "defense": 65, "specialAttack": 49, "specialDefense": 65, "speed": 45 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png"
  },
  "bayleef": {
    "id": 153, "name": "bayleef",
    "stats": { "hp": 60, "attack": 62, "defense": 80, "specialAttack": 63, "specialDefense": 80, "speed": 60 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/153.png"
  },
  "meganium": {
    "id": 154, "name": "meganium",
    "stats": { "hp": 80, "attack": 82, "defense": 100, "specialAttack": 83, "specialDefense": 100, "speed": 80 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png"
  },
  "cyndaquil": {
    "id": 155, "name": "cyndaquil",
    "stats": { "hp": 39, "attack": 52, "defense": 43, "specialAttack": 60, "specialDefense": 50, "speed": 65 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png"
  },
  "quilava": {
    "id": 156, "name": "quilava",
    "stats": { "hp": 58, "attack": 64, "defense": 58, "specialAttack": 80, "specialDefense": 65, "speed": 80 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/156.png"
  },
  "typhlosion": {
    "id": 157, "name": "typhlosion",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png"
  },
  "totodile": {
    "id": 158, "name": "totodile",
    "stats": { "hp": 50, "attack": 65, "defense": 64, "specialAttack": 44, "specialDefense": 48, "speed": 43 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png"
  },
  "croconaw": {
    "id": 159, "name": "croconaw",
    "stats": { "hp": 65, "attack": 80, "defense": 80, "specialAttack": 59, "specialDefense": 63, "speed": 58 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/159.png"
  },
  "feraligatr": {
    "id": 160, "name": "feraligatr",
    "stats": { "hp": 85, "attack": 105, "defense": 100, "specialAttack": 79, "specialDefense": 83, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/160.png"
  },
  "togepi": {
    "id": 175, "name": "togepi",
    "stats": { "hp": 35, "attack": 20, "defense": 65, "specialAttack": 40, "specialDefense": 65, "speed": 20 },
    "types": ["fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png"
  },
  "togetic": {
    "id": 176, "name": "togetic",
    "stats": { "hp": 55, "attack": 40, "defense": 85, "specialAttack": 80, "specialDefense": 105, "speed": 40 },
    "types": ["fairy", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/176.png"
  },
   "mareep": {
    "id": 179, "name": "mareep",
    "stats": { "hp": 55, "attack": 40, "defense": 40, "specialAttack": 65, "specialDefense": 45, "speed": 35 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/179.png"
  },
  "flaaffy": {
    "id": 180, "name": "flaaffy",
    "stats": { "hp": 70, "attack": 55, "defense": 55, "specialAttack": 80, "specialDefense": 60, "speed": 45 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/180.png"
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
  "larvitar": {
    "id": 246, "name": "larvitar",
    "stats": { "hp": 50, "attack": 64, "defense": 50, "specialAttack": 45, "specialDefense": 50, "speed": 41 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/246.png"
  },
  "pupitar": {
    "id": 247, "name": "pupitar",
    "stats": { "hp": 70, "attack": 84, "defense": 70, "specialAttack": 65, "specialDefense": 70, "speed": 51 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/247.png"
  },
  "tyranitar": {
    "id": 248, "name": "tyranitar",
    "stats": { "hp": 100, "attack": 134, "defense": 110, "specialAttack": 95, "specialDefense": 100, "speed": 61 },
    "types": ["rock", "dark"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png"
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
