import React, { useState, useEffect } from 'react';
import './PokemonSelection.css'; // Import the new CSS

// New, expanded Pokemon data (mirrors backend structure for consistency)
const POKEMON_DATA_FRONTEND = {
  "bulbasaur": {
    "id": 1, "name": "bulbasaur", "types": ["grass", "poison"], "stats": { "hp": 45, "attack": 49, "defense": 49, "specialAttack": 65, "specialDefense": 65, "speed": 45 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
  },
  "ivysaur": {
    "id": 2, "name": "ivysaur", "types": ["grass", "poison"], "stats": { "hp": 60, "attack": 62, "defense": 63, "specialAttack": 80, "specialDefense": 80, "speed": 60 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png"
  },
  "venusaur": {
    "id": 3, "name": "venusaur", "types": ["grass", "poison"], "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png"
  },
  "charmander": {
    "id": 4, "name": "charmander", "types": ["fire"], "stats": { "hp": 39, "attack": 52, "defense": 43, "specialAttack": 60, "specialDefense": 50, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png"
  },
  "charmeleon": {
    "id": 5, "name": "charmeleon", "types": ["fire"], "stats": { "hp": 58, "attack": 64, "defense": 58, "specialAttack": 80, "specialDefense": 65, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png"
  },
  "charizard": {
    "id": 6, "name": "charizard", "types": ["fire", "flying"], "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
  },
  "squirtle": {
    "id": 7, "name": "squirtle", "types": ["water"], "stats": { "hp": 44, "attack": 48, "defense": 65, "specialAttack": 50, "specialDefense": 64, "speed": 43 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png"
  },
  "wartortle": {
    "id": 8, "name": "wartortle", "types": ["water"], "stats": { "hp": 59, "attack": 63, "defense": 80, "specialAttack": 65, "specialDefense": 80, "speed": 58 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png"
  },
  "blastoise": {
    "id": 9, "name": "blastoise", "types": ["water"], "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
  },
  "caterpie": {
    "id": 10, "name": "caterpie", "types": ["bug"], "stats": { "hp": 45, "attack": 30, "defense": 35, "specialAttack": 20, "specialDefense": 20, "speed": 45 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png"
  },
  "metapod": {
    "id": 11, "name": "metapod", "types": ["bug"], "stats": { "hp": 50, "attack": 20, "defense": 55, "specialAttack": 25, "specialDefense": 25, "speed": 30 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png"
  },
  "butterfree": {
    "id": 12, "name": "butterfree", "types": ["bug", "flying"], "stats": { "hp": 60, "attack": 45, "defense": 50, "specialAttack": 90, "specialDefense": 80, "speed": 70 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png"
  },
  "pidgey": {
    "id": 16, "name": "pidgey", "types": ["normal", "flying"], "stats": { "hp": 40, "attack": 45, "defense": 40, "specialAttack": 35, "specialDefense": 35, "speed": 56 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png"
  },
  "pidgeotto": {
    "id": 17, "name": "pidgeotto", "types": ["normal", "flying"], "stats": { "hp": 63, "attack": 60, "defense": 55, "specialAttack": 50, "specialDefense": 50, "speed": 71 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png"
  },
  "pidgeot": {
    "id": 18, "name": "pidgeot", "types": ["normal", "flying"], "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png"
  },
  "pikachu": {
    "id": 25, "name": "pikachu", "types": ["electric"], "stats": { "hp": 35, "attack": 55, "defense": 40, "specialAttack": 50, "specialDefense": 50, "speed": 90 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
  },
  "raichu": {
    "id": 26, "name": "raichu", "types": ["electric"], "stats": { "hp": 60, "attack": 90, "defense": 55, "specialAttack": 90, "specialDefense": 80, "speed": 110 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png"
  },
  "jigglypuff": {
    "id": 39, "name": "jigglypuff", "types": ["normal", "fairy"], "stats": { "hp": 115, "attack": 45, "defense": 20, "specialAttack": 45, "specialDefense": 25, "speed": 20 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png"
  },
  "wigglytuff": {
    "id": 40, "name": "wigglytuff", "types": ["normal", "fairy"], "stats": { "hp": 140, "attack": 70, "defense": 45, "specialAttack": 85, "specialDefense": 50, "speed": 45 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png"
  },
  "abra": {
    "id": 63, "name": "abra", "types": ["psychic"], "stats": { "hp": 25, "attack": 20, "defense": 15, "specialAttack": 105, "specialDefense": 55, "speed": 90 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png"
  },
  "kadabra": {
    "id": 64, "name": "kadabra", "types": ["psychic"], "stats": { "hp": 40, "attack": 35, "defense": 30, "specialAttack": 120, "specialDefense": 70, "speed": 105 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png"
  },
  "alakazam": {
    "id": 65, "name": "alakazam", "types": ["psychic"], "stats": { "hp": 55, "attack": 50, "defense": 45, "specialAttack": 135, "specialDefense": 95, "speed": 120 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png"
  },
  "gastly": {
    "id": 92, "name": "gastly", "types": ["ghost", "poison"], "stats": { "hp": 30, "attack": 35, "defense": 30, "specialAttack": 100, "specialDefense": 35, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png"
  },
  "haunter": {
    "id": 93, "name": "haunter", "types": ["ghost", "poison"], "stats": { "hp": 45, "attack": 50, "defense": 45, "specialAttack": 115, "specialDefense": 55, "speed": 95 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png"
  },
  "gengar": {
    "id": 94, "name": "gengar", "types": ["ghost", "poison"], "stats": { "hp": 60, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 75, "speed": 110 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
  },
  "eevee": {
    "id": 133, "name": "eevee", "types": ["normal"], "stats": { "hp": 55, "attack": 55, "defense": 50, "specialAttack": 45, "specialDefense": 65, "speed": 55 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
  },
  "vaporeon": {
    "id": 134, "name": "vaporeon", "types": ["water"], "stats": { "hp": 130, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png"
  },
  "jolteon": {
    "id": 135, "name": "jolteon", "types": ["electric"], "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 130 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png"
  },
  "flareon": {
    "id": 136, "name": "flareon", "types": ["fire"], "stats": { "hp": 65, "attack": 130, "defense": 60, "specialAttack": 95, "specialDefense": 110, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png"
  },
  "snorlax": {
    "id": 143, "name": "snorlax", "types": ["normal"], "stats": { "hp": 160, "attack": 110, "defense": 65, "specialAttack": 65, "specialDefense": 110, "speed": 30 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
  },
  "dratini": {
    "id": 147, "name": "dratini", "types": ["dragon"], "stats": { "hp": 41, "attack": 64, "defense": 45, "specialAttack": 50, "specialDefense": 50, "speed": 50 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png"
  },
  "dragonair": {
    "id": 148, "name": "dragonair", "types": ["dragon"], "stats": { "hp": 61, "attack": 84, "defense": 65, "specialAttack": 70, "specialDefense": 70, "speed": 70 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png"
  },
  "dragonite": {
    "id": 149, "name": "dragonite", "types": ["dragon", "flying"], "stats": { "hp": 91, "attack": 134, "defense": 95, "specialAttack": 100, "specialDefense": 100, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png"
  },
  "mewtwo": {
    "id": 150, "name": "mewtwo", "types": ["psychic"], "stats": { "hp": 106, "attack": 110, "defense": 90, "specialAttack": 154, "specialDefense": 90, "speed": 130 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
  },
  "mew": {
    "id": 151, "name": "mew", "types": ["psychic"], "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png"
  },
  "chikorita": {
    "id": 152, "name": "chikorita", "types": ["grass"], "stats": { "hp": 45, "attack": 49, "defense": 65, "specialAttack": 49, "specialDefense": 65, "speed": 45 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png"
  },
  "bayleef": {
    "id": 153, "name": "bayleef", "types": ["grass"], "stats": { "hp": 60, "attack": 62, "defense": 80, "specialAttack": 63, "specialDefense": 80, "speed": 60 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/153.png"
  },
  "meganium": {
    "id": 154, "name": "meganium", "types": ["grass"], "stats": { "hp": 80, "attack": 82, "defense": 100, "specialAttack": 83, "specialDefense": 100, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png"
  },
  "cyndaquil": {
    "id": 155, "name": "cyndaquil", "types": ["fire"], "stats": { "hp": 39, "attack": 52, "defense": 43, "specialAttack": 60, "specialDefense": 50, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png"
  },
  "quilava": {
    "id": 156, "name": "quilava", "types": ["fire"], "stats": { "hp": 58, "attack": 64, "defense": 58, "specialAttack": 80, "specialDefense": 65, "speed": 80 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/156.png"
  },
  "typhlosion": {
    "id": 157, "name": "typhlosion", "types": ["fire"], "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png"
  },
  "totodile": {
    "id": 158, "name": "totodile", "types": ["water"], "stats": { "hp": 50, "attack": 65, "defense": 64, "specialAttack": 44, "specialDefense": 48, "speed": 43 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png"
  },
  "croconaw": {
    "id": 159, "name": "croconaw", "types": ["water"], "stats": { "hp": 65, "attack": 80, "defense": 80, "specialAttack": 59, "specialDefense": 63, "speed": 58 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/159.png"
  },
  "feraligatr": {
    "id": 160, "name": "feraligatr", "types": ["water"], "stats": { "hp": 85, "attack": 105, "defense": 100, "specialAttack": 79, "specialDefense": 83, "speed": 78 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/160.png"
  },
  "togepi": {
    "id": 175, "name": "togepi", "types": ["fairy"], "stats": { "hp": 35, "attack": 20, "defense": 65, "specialAttack": 40, "specialDefense": 65, "speed": 20 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png"
  },
  "togetic": {
    "id": 176, "name": "togetic", "types": ["fairy", "flying"], "stats": { "hp": 55, "attack": 40, "defense": 85, "specialAttack": 80, "specialDefense": 105, "speed": 40 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/176.png"
  },
   "mareep": {
    "id": 179, "name": "mareep", "types": ["electric"], "stats": { "hp": 55, "attack": 40, "defense": 40, "specialAttack": 65, "specialDefense": 45, "speed": 35 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/179.png"
  },
  "flaaffy": {
    "id": 180, "name": "flaaffy", "types": ["electric"], "stats": { "hp": 70, "attack": 55, "defense": 55, "specialAttack": 80, "specialDefense": 60, "speed": 45 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/180.png"
  },
  "ampharos": {
    "id": 181, "name": "ampharos", "types": ["electric"], "stats": { "hp": 90, "attack": 75, "defense": 85, "specialAttack": 115, "specialDefense": 90, "speed": 55 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/181.png"
  },
  "espeon": {
    "id": 196, "name": "espeon", "types": ["psychic"], "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 95, "speed": 110 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png"
  },
  "umbreon": {
    "id": 197, "name": "umbreon", "types": ["dark"], "stats": { "hp": 95, "attack": 65, "defense": 110, "specialAttack": 60, "specialDefense": 130, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png"
  },
  "scizor": {
    "id": 212, "name": "scizor", "types": ["bug", "steel"], "stats": { "hp": 70, "attack": 130, "defense": 100, "specialAttack": 55, "specialDefense": 80, "speed": 65 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png"
  },
  "heracross": {
    "id": 214, "name": "heracross", "types": ["bug", "fighting"], "stats": { "hp": 80, "attack": 125, "defense": 75, "specialAttack": 40, "specialDefense": 95, "speed": 85 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/214.png"
  },
  "larvitar": {
    "id": 246, "name": "larvitar", "types": ["rock", "ground"], "stats": { "hp": 50, "attack": 64, "defense": 50, "specialAttack": 45, "specialDefense": 50, "speed": 41 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/246.png"
  },
  "pupitar": {
    "id": 247, "name": "pupitar", "types": ["rock", "ground"], "stats": { "hp": 70, "attack": 84, "defense": 70, "specialAttack": 65, "specialDefense": 70, "speed": 51 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/247.png"
  },
  "tyranitar": {
    "id": 248, "name": "tyranitar", "types": ["rock", "dark"], "stats": { "hp": 100, "attack": 134, "defense": 110, "specialAttack": 95, "specialDefense": 100, "speed": 61 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png"
  },
   "lugia": {
    "id": 249, "name": "lugia", "types": ["psychic", "flying"], "stats": { "hp": 106, "attack": 90, "defense": 130, "specialAttack": 90, "specialDefense": 154, "speed": 110 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png"
  },
  "ho-oh": {
    "id": 250, "name": "ho-oh", "types": ["fire", "flying"], "stats": { "hp": 106, "attack": 130, "defense": 90, "specialAttack": 110, "specialDefense": 154, "speed": 90 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png"
  },
  "celebi": {
    "id": 251, "name": "celebi", "types": ["psychic", "grass"], "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 }, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png"
  }
};

const AVAILABLE_POKEMON = Object.values(POKEMON_DATA_FRONTEND).sort((a, b) => a.id - b.id);

const DEFAULT_MAX_TEAM_SIZE = 6;

function PokemonSelection({ onTeamConfirmed, playerId, gameData, isLoading: propIsLoading }) {
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const gameMaxTeamSize = gameData?.maxTeamSize || DEFAULT_MAX_TEAM_SIZE;
  const currentPlayerInGame = gameData?.players?.find(p => p.id === playerId);
  const hasPlayerConfirmedPartyBackend = !!currentPlayerInGame?.hasSelectedParty && (currentPlayerInGame?.party?.length > 0 || gameMaxTeamSize === 0) ;

  useEffect(() => {
    if (hasPlayerConfirmedPartyBackend && currentPlayerInGame.party) {
        const confirmedPartyDetails = currentPlayerInGame.party.map(p_backend => {
            // Use the name from backend's details, ensure it's lowercase for lookup in POKEMON_DATA_FRONTEND
            const backendNameLower = p_backend.details.name.toLowerCase();
            return POKEMON_DATA_FRONTEND[backendNameLower] || p_backend.details; // Fallback if not in frontend's list
        });
        setSelectedTeam(confirmedPartyDetails);
    } else if (!hasPlayerConfirmedPartyBackend) {
        setSelectedTeam([]);
    }
  // Ensure POKEMON_DATA_FRONTEND is stable or memoized if it were dynamic, not an issue here as it's a const.
  }, [hasPlayerConfirmedPartyBackend, currentPlayerInGame]);


  const handleSelectPokemon = (pokemon) => {
    if (hasPlayerConfirmedPartyBackend) return;
    setError('');
    const isAlreadySelected = selectedTeam.find(p => p.id === pokemon.id);
    if (isAlreadySelected) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== pokemon.id));
    } else {
      if (selectedTeam.length < gameMaxTeamSize) {
        setSelectedTeam([...selectedTeam, pokemon]);
      } else {
        setError(`You can only select up to ${gameMaxTeamSize} Pokemon.`);
      }
    }
  };

  const handleConfirmTeam = async () => {
    if (selectedTeam.length === 0 && gameMaxTeamSize > 0) {
      setError(`Please select at least 1 Pokemon for your team (up to ${gameMaxTeamSize}).`);
      return;
    }
    if (selectedTeam.length > gameMaxTeamSize) {
        setError(`Your team cannot exceed ${gameMaxTeamSize} Pokemon.`);
        return;
    }
    if (hasPlayerConfirmedPartyBackend) {
        setError("You have already confirmed your team.");
        return;
    }
    const teamToConfirmNames = selectedTeam.map(p => p.name); // Backend expects lowercase names
    setIsSubmitting(true);
    setError('');
    try {
      await onTeamConfirmed(teamToConfirmNames);
    } catch (err) {
      setError(err.message || 'Failed to confirm team selection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = propIsLoading || isSubmitting;

  const filteredPokemonList = AVAILABLE_POKEMON.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!gameData) {
    return <div className="pokemon-selection-overlay"><div className="pokemon-selection-container"><p>Loading game data...</p></div></div>;
  }

  return (
    <div className="pokemon-selection-overlay">
      <div className="pokemon-selection-container">
        <h2>
          {hasPlayerConfirmedPartyBackend ? 'Your Team is Selected!' : `Select Your Team (1-${gameMaxTeamSize} Pokemon)`}
        </h2>
        {error && <p className="pokemon-selection-error">{error}</p>}

        {hasPlayerConfirmedPartyBackend && currentPlayerInGame?.party ? (
            <div className="confirmed-party-display">
                <h3>Your Confirmed Team:</h3>
                <ul className="confirmed-party-list">
                {currentPlayerInGame.party.map((p, index) => (
                    <li key={p.details.id || index} className="confirmed-party-item">
                    <img src={p.details.sprite} alt={p.details.name} />
                    <p>{p.details.name.charAt(0).toUpperCase() + p.details.name.slice(1)}</p> {/* Capitalize for display */}
                    </li>
                ))}
                </ul>
            </div>
        ) : (
          <div className="selection-main-area">
            <div className="available-pokemon-panel">
              <h3>Available Pokemon</h3>
              <input
                type="text"
                placeholder="Search Pokemon..."
                className="pokemon-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={hasPlayerConfirmedPartyBackend}
              />
              <div className="available-pokemon-list">
                {filteredPokemonList.map(pokemon => {
                  const isSelected = selectedTeam.find(p => p.id === pokemon.id);
                  const isMaxReached = selectedTeam.length >= gameMaxTeamSize;
                  // Disable click if backend confirmed, or if max reached and this one isn't selected
                  const isDisabled = hasPlayerConfirmedPartyBackend || (isMaxReached && !isSelected);

                  let cardClass = "pokemon-card-select";
                  if (isSelected) cardClass += " selected";
                  if (isDisabled && !isSelected && !hasPlayerConfirmedPartyBackend) cardClass += " disabled"; // Dim if max reached and not selectable
                  else if (isDisabled && !isSelected && hasPlayerConfirmedPartyBackend) cardClass += " disabled";


                  return (
                    <div
                      key={pokemon.id}
                      className={cardClass}
                      onClick={() => !isDisabled && handleSelectPokemon(pokemon)}
                      title={pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} // Tooltip with name
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} />
                      <p className="name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p> {/* Capitalize for display */}
                      <p className="type">{pokemon.types.join(' / ')}</p>
                    </div>
                  );
                })}
                 {filteredPokemonList.length === 0 && searchTerm && (
                    <p className="no-results-message">No Pokemon found matching "{searchTerm}".</p>
                )}
              </div>
            </div>

            <div className="selected-team-panel">
              <h3>Your Team ({selectedTeam.length}/{gameMaxTeamSize})</h3>
              <div className="selected-team-slots">
                {[...Array(gameMaxTeamSize)].map((_, i) => {
                  const pokemon = selectedTeam[i];
                  return (
                    <div key={i} className={`team-slot ${pokemon ? 'filled' : ''}`}>
                      {pokemon ? (
                        <>
                          <img src={pokemon.sprite} alt={pokemon.name} />
                          <p className="name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p> {/* Capitalize */}
                        </>
                      ) : (
                        <p className="empty-text">Slot {i+1}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!hasPlayerConfirmedPartyBackend && (
          <div className="confirm-selection-button-container">
            <button
              onClick={handleConfirmTeam}
              disabled={isLoading || selectedTeam.length === 0 || selectedTeam.length > gameMaxTeamSize || hasPlayerConfirmedPartyBackend}
              className="confirm-selection-button"
            >
              {isLoading ? 'Confirming Team...' : `Confirm Team (${selectedTeam.length}/${gameMaxTeamSize})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonSelection;
