// pokemon-battle-backend/scripts/fetchPokemonData.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const OUTPUT_FILE_PATH = path.join(__dirname, '..', 'pokemonDataGenerated.js');
const START_ID = 1;
const END_ID = 151; // Fetching Gen 1 only to reduce script runtime & complexity for now

// Helper to get stat value
const getStat = (stats, statName) => {
    const foundStat = stats.find(s => s.stat.name === statName);
    return foundStat ? foundStat.base_stat : 0;
};

// Helper to check if a Pokemon is a final evolution
async function isFinalEvolution(speciesUrl, pokemonNameToCheck) {
    try {
        const speciesResponse = await axios.get(speciesUrl);
        const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
        const evolutionChainResponse = await axios.get(evolutionChainUrl);

        let currentEvolution = evolutionChainResponse.data.chain;

        // Function to find the specific pokemon in the chain and check if it's a terminal node
        function checkChain(chain) {
            if (chain.species.name === pokemonNameToCheck) {
                return chain.evolves_to.length === 0; // It's final if it evolves to nothing
            }
            // If not this one, check its evolutions
            for (const evo of chain.evolves_to) {
                if (checkChain(evo)) { // If any path starting from here leads to it being final
                    return true;
                }
            }
            return false; // Not found in this path or not final in this path
        }

        // Simplified: We are checking if the Pokemon *itself* is a final stage.
        // The API structure means we need to find our specific Pokemon in the possibly branching chain.
        let queue = [evolutionChainResponse.data.chain];
        while(queue.length > 0) {
            let currentLink = queue.shift();
            if (currentLink.species.name === pokemonNameToCheck) {
                return currentLink.evolves_to.length === 0;
            }
            currentLink.evolves_to.forEach(evo => queue.push(evo));
        }
        // If the specific Pokemon is not found in the main chain (e.g. some baby Pokemon might be listed under their own species evolution)
        // or if it's a Pokemon that doesn't evolve at all.
        if (speciesResponse.data.evolves_from_species === null && speciesResponse.data.evolution_chain.url) {
             // It doesn't evolve from anything, check if it has evolutions
             // This check is essentially covered by the chain traversal for the named pokemon.
        }
        // Fallback if not found explicitly in the chain by name (shouldn't happen for valid Pokemon)
        // or for Pokemon that don't evolve at all (their chain.evolves_to will be empty).
        // The problem is complex for branched evolutions if we are not careful.
        // The check above (finding the pokemon by name in the chain and checking its evolves_to) is more direct.
        return false; // Default to not final if complex branching makes it hard or not found by name in chain.

    } catch (error) {
        console.error(`Error checking evolution chain for ${pokemonNameToCheck} (${speciesUrl}):`, error.message);
        return false; // Assume not final if error occurs
    }
}

async function fetchAllPokemonData() {
    const allPokemonData = {};
    console.log(`Fetching Pokemon data from ID ${START_ID} to ${END_ID}...`);

    for (let id = START_ID; id <= END_ID; id++) {
        try {
            console.log(`Fetching Pokemon ID: ${id}`);
            const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${id}`);
            const pokemon = response.data;
            const pokemonName = pokemon.name;

            // Check if it's a "final evolution" (or a Pokemon that doesn't evolve)
            // This is a simplified check; true evolution chains can be complex.
            // We will fetch the species data and check if 'evolves_to' is empty for this specific Pokemon.
            const speciesResponse = await axios.get(pokemon.species.url);
            const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
            const evolutionChainResponse = await axios.get(evolutionChainUrl);
            let chain = evolutionChainResponse.data.chain;

            let isThisPokemonFinalInItsBranch = false;
            const findAndCheckIfFinal = (node, name) => {
                if (node.species.name === name) {
                    if (node.evolves_to.length === 0) {
                        isThisPokemonFinalInItsBranch = true;
                    }
                    return true; // Found it
                }
                for (const evo of node.evolves_to) {
                    if (findAndCheckIfFinal(evo, name)) return true;
                }
                return false;
            };

            findAndCheckIfFinal(chain, pokemonName);


            if (!isThisPokemonFinalInItsBranch) {
                 // Additional check for Pokemon that don't evolve at all (e.g. Pinsir, Tauros)
                 // Such Pokemon might not have an 'evolves_to' in the main chain structure for *them*,
                 // but their species data indicates no further evolution.
                 if (speciesResponse.data.evolves_from_species === null && chain.species.name === pokemonName && chain.evolves_to.length === 0) {
                     console.log(`${pokemonName} (ID: ${id}) does not evolve. Processing...`);
                 } else if (speciesResponse.data.evolves_from_species !== null && !isThisPokemonFinalInItsBranch) { // only skip if it evolves from something AND is not final in its branch
                    console.log(`Skipping ${pokemonName} (ID: ${id}) - not a final evolution in its branch.`);
                    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
                    continue;
                 } else if (speciesResponse.data.evolves_from_species === null && !isThisPokemonFinalInItsBranch && chain.species.name !== pokemonName) {
                    // This case implies it's a base form of a branching evolution that itself evolves, skip.
                    // Or it's a Pokemon that doesn't evolve but wasn't the start of the chain.
                    console.log(`Skipping ${pokemonName} (ID: ${id}) - complex case or not final.`);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    continue;
                 }
                 // If it doesn't evolve from anything, AND it was found and its evolves_to is empty, it's already true.
                 // If it doesn't evolve from anything, and it IS the start of the chain, but has evolutions, it's not final.
                 // This is tricky. The `isThisPokemonFinalInItsBranch` should ideally be the main flag.
            }

            console.log(`${pokemonName} (ID: ${id}) is considered final or non-evolving. Processing...`);

            const types = pokemon.types.map(typeInfo => typeInfo.type.name);
            const sprite = pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default || pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || '';


            allPokemonData[pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)] = { // Capitalize first letter of name
                id: pokemon.id,
                name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
                stats: {
                    hp: getStat(pokemon.stats, 'hp'),
                    attack: getStat(pokemon.stats, 'attack'),
                    defense: getStat(pokemon.stats, 'defense'),
                    specialAttack: getStat(pokemon.stats, 'special-attack'), // API uses 'special-attack'
                    specialDefense: getStat(pokemon.stats, 'special-defense'), // API uses 'special-defense'
                    speed: getStat(pokemon.stats, 'speed'),
                },
                types: types,
                sprite: sprite,
            };
            await new Promise(resolve => setTimeout(resolve, 150)); // Increased delay
        } catch (error) {
            console.error(`Failed to fetch data for Pokemon ID ${id}:`, error.message);
            if (error.response?.status === 404) {
                console.log(`Pokemon ID ${id} not found, skipping.`);
            }
            await new Promise(resolve => setTimeout(resolve, 150)); // Delay even on error
        }
    }

    console.log(`\nFetched data for ${Object.keys(allPokemonData).length} Pokemon.`);

    const outputContent = \`// Generated on ${new Date().toISOString()}
// Fetched IDs: ${START_ID}-${END_ID}
// Only includes Pokemon considered final evolutions or those that don't evolve.

const POKEMON_DATA = ${JSON.stringify(allPokemonData, null, 2)};

// Helper function to get a deep copy of Pokemon details by name
function getPokemonDetails(pokemonName) {
    const normalizedName = Object.keys(POKEMON_DATA).find(key => key.toLowerCase() === pokemonName.toLowerCase());
    if (POKEMON_DATA[normalizedName]) {
        return JSON.parse(JSON.stringify(POKEMON_DATA[normalizedName]));
    }
    return null;
}

module.exports = { POKEMON_DATA, getPokemonDetails };
\`;

    try {
        fs.writeFileSync(OUTPUT_FILE_PATH, outputContent);
        console.log(\`Pokemon data successfully written to ${OUTPUT_FILE_PATH}\`);
    } catch (error) {
        console.error(\`Error writing to file ${OUTPUT_FILE_PATH}:\`, error.message);
    }
}

fetchAllPokemonData();
