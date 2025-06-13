import React, { useState, useEffect } from 'react';
import './PokemonSelection.css'; // Import the new CSS

const AVAILABLE_POKEMON = [
  { id: 1, name: 'Bulbasaur', type: 'Grass/Poison', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
  { id: 4, name: 'Charmander', type: 'Fire', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
  { id: 7, name: 'Squirtle', type: 'Water', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
  { id: 25, name: 'Pikachu', type: 'Electric', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
  { id: 39, name: 'Jigglypuff', type: 'Normal/Fairy', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
  { id: 52, name: 'Meowth', type: 'Normal', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
  { id: 66, name: 'Machop', type: 'Fighting', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png' },
  { id: 74, name: 'Geodude', type: 'Rock/Ground', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png' },
  { id: 92, name: 'Gastly', type: 'Ghost/Poison', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png' },
  { id: 133, name: 'Eevee', type: 'Normal', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
  { id: 143, name: 'Snorlax', type: 'Normal', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
  { id: 150, name: 'Mewtwo', type: 'Psychic', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
];

const DEFAULT_MAX_TEAM_SIZE = 6;

function PokemonSelection({ onTeamConfirmed, playerId, gameData, isLoading: propIsLoading }) {
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  const gameMaxTeamSize = gameData?.maxTeamSize || DEFAULT_MAX_TEAM_SIZE;
  const currentPlayerInGame = gameData?.players?.find(p => p.id === playerId);
  const hasPlayerConfirmedPartyBackend = !!currentPlayerInGame?.hasSelectedParty && (currentPlayerInGame?.party?.length > 0 || gameMaxTeamSize === 0) ;

  useEffect(() => {
    if (hasPlayerConfirmedPartyBackend && currentPlayerInGame.party) {
        const confirmedPartyDetails = currentPlayerInGame.party.map(p_backend => {
            return AVAILABLE_POKEMON.find(ap => ap.name === p_backend.details.name) || p_backend.details;
        });
        setSelectedTeam(confirmedPartyDetails);
    } else if (!hasPlayerConfirmedPartyBackend) {
        setSelectedTeam([]);
    }
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
    const teamToConfirmNames = selectedTeam.map(p => p.name);
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
                    <p>{p.details.name}</p>
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
                  const isDisabled = hasPlayerConfirmedPartyBackend || (isMaxReached && !isSelected);

                  let cardClass = "pokemon-card-select";
                  if (isSelected) cardClass += " selected";
                  if (isDisabled && !isSelected) cardClass += " disabled";
                  if (isMaxReached && !isSelected && !hasPlayerConfirmedPartyBackend) cardClass += " max-reached";

                  return (
                    <div
                      key={pokemon.id}
                      className={cardClass}
                      onClick={() => !isDisabled && handleSelectPokemon(pokemon)}
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} />
                      <p className="name">{pokemon.name}</p>
                      <p className="type">{pokemon.type}</p>
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
                          <p className="name">{pokemon.name}</p>
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
