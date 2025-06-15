import React, { useState, useEffect } from 'react';
import './PokemonSelection.css'; // Import the new CSS

// This POKEMON_DATA_FRONTEND will be an exact copy of POKEMON_DATA from the backend
const POKEMON_DATA_FRONTEND = {
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
  "pidgeot": {
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png",
    "moves": [
      { "name": "Tackle", "power": 40 },
      { "name": "Quick Attack", "power": 40 },
      { "name": "Wing Attack", "power": 60 },
      { "name": "Hyper Beam", "power": 150 }
    ]
  }
};
// The AVAILABLE_POKEMON list will be automatically rebuilt from this.

const AVAILABLE_POKEMON = Object.values(POKEMON_DATA_FRONTEND).sort((a, b) => a.id - b.id);

const DEFAULT_MAX_TEAM_SIZE = 6;

function PokemonSelection({ onTeamConfirmed, playerId, gameData, isLoading: propIsLoading }) {
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredPokemonSprite, setHoveredPokemonSprite] = useState('');

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

  const handlePokemonCardHover = (spriteUrl) => {
    setHoveredPokemonSprite(spriteUrl);
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
              {hoveredPokemonSprite && (
                <div
                  className="pokemon-hover-background-preview"
                  style={{ backgroundImage: `url(${hoveredPokemonSprite})` }}
                />
              )}
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
                      onMouseEnter={() => handlePokemonCardHover(pokemon.sprite)}
                      onMouseLeave={() => handlePokemonCardHover('')}
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
