import React, { useState, useEffect } from 'react';

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
  // Add more if desired, up to a reasonable number for display
];

const MAX_TEAM_SIZE = 6;

// Renamed onSelectionConfirmed to onTeamConfirmed for clarity
function PokemonSelection({ onTeamConfirmed, playerId, gameId, gameData, isLoading: propIsLoading }) {
  const [selectedTeam, setSelectedTeam] = useState([]); // Array of Pokemon objects
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlayerInGame = gameData?.players?.find(p => p.id === playerId);
  // Check if the player's party is selected and has members on the backend
  const hasPlayerConfirmedPartyBackend = !!currentPlayerInGame?.hasSelectedParty && currentPlayerInGame?.party?.length > 0;

  useEffect(() => {
    // If gameData shows this player has already selected their party,
    // update local selection to reflect that.
    if (hasPlayerConfirmedPartyBackend && currentPlayerInGame.party) {
        const confirmedPartyDetails = currentPlayerInGame.party.map(p => {
            // Find the full details from AVAILABLE_POKEMON to ensure consistency (e.g. sprite)
            return AVAILABLE_POKEMON.find(ap => ap.name === p.details.name) || p.details; // Fallback to details if not in AVAILABLE_POKEMON
        });
        setSelectedTeam(confirmedPartyDetails);
    } else {
        setSelectedTeam([]); // Reset if not confirmed or party is empty
    }
  }, [hasPlayerConfirmedPartyBackend, currentPlayerInGame]);


  const handleSelectPokemon = (pokemon) => {
    if (hasPlayerConfirmedPartyBackend) return;

    setError('');
    const isAlreadySelected = selectedTeam.find(p => p.id === pokemon.id);

    if (isAlreadySelected) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== pokemon.id));
    } else {
      if (selectedTeam.length < MAX_TEAM_SIZE) {
        setSelectedTeam([...selectedTeam, pokemon]);
      } else {
        setError(`You can only select up to ${MAX_TEAM_SIZE} Pokemon.`);
      }
    }
  };

  const handleConfirmTeam = async () => {
    if (selectedTeam.length === 0) {
      setError(`Please select at least 1 Pokemon for your team.`);
      return;
    }
    if (selectedTeam.length > MAX_TEAM_SIZE) { // Should not happen with UI checks, but good validation
        setError(`Your team cannot exceed ${MAX_TEAM_SIZE} Pokemon.`);
        return;
    }
    if (hasPlayerConfirmedPartyBackend) {
        setError("You have already confirmed your team.");
        return;
    }

    const teamToConfirmNames = selectedTeam.map(p => p.name);
    console.log(`Player ${playerId} confirming team: ${teamToConfirmNames.join(', ')} for game ${gameId}`);
    setIsSubmitting(true);
    setError('');
    try {
      await onTeamConfirmed(teamToConfirmNames); // Pass array of names
    } catch (err) {
      setError(err.message || 'Failed to confirm team selection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = propIsLoading || isSubmitting;

  const renderSelectedTeamUI = (teamArray, isConfirmedView = false) => (
    <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', background: '#f9f9f9' }}>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        {isConfirmedView ? "Your Confirmed Team" : `Your Team (${teamArray.length}/${MAX_TEAM_SIZE})`}
      </h3>
      {teamArray.length === 0 && !isConfirmedView ? (
        <p>No Pokemon selected yet. Click on a Pokemon below to add to your team.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {teamArray.map((p, index) => (
            <li key={p.id || p.details?.id || index} style={{ margin: '5px', padding: '10px', border: '1px solid #4CAF50', borderRadius: '5px', textAlign: 'center', width: '100px' }}>
              <img src={p.sprite || p.details?.sprite} alt={p.name || p.details?.name} style={{ width: '50px', height: '50px' }} />
              <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{p.name || p.details?.name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        {hasPlayerConfirmedPartyBackend ? 'Your Team is Selected!' : `Select Your Team (1-${MAX_TEAM_SIZE} Pokemon)`}
      </h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {hasPlayerConfirmedPartyBackend && currentPlayerInGame?.party ? (
        renderSelectedTeamUI(currentPlayerInGame.party, true)
      ) : (
        renderSelectedTeamUI(selectedTeam)
      )}

      {!hasPlayerConfirmedPartyBackend && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginTop: '20px', opacity: hasPlayerConfirmedPartyBackend ? 0.5 : 1, pointerEvents: hasPlayerConfirmedPartyBackend ? 'none' : 'auto' }}>
            {AVAILABLE_POKEMON.map(pokemon => (
              <div
                key={pokemon.id}
                onClick={() => handleSelectPokemon(pokemon)}
                style={{
                  padding: '10px',
                  border: selectedTeam.find(p => p.id === pokemon.id) ? '3px solid #2ecc71' : '1px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: hasPlayerConfirmedPartyBackend ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.2s, border-color 0.2s',
                  boxShadow: selectedTeam.find(p => p.id === pokemon.id) ? '0 0 12px rgba(46, 204, 113, 0.6)' : '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: hasPlayerConfirmedPartyBackend ? '#f0f0f0' : '#fff',
                  opacity: (selectedTeam.length >= MAX_TEAM_SIZE && !selectedTeam.find(p => p.id === pokemon.id)) ? 0.6 : 1, // Dim if max reached and not selected
                }}
                onMouseOver={e => { if (!hasPlayerConfirmedPartyBackend) e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={e => { if (!hasPlayerConfirmedPartyBackend) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '70px', height: '70px', marginBottom: '5px' }} />
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{pokemon.name}</p>
                <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#555' }}>{pokemon.type}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleConfirmTeam}
            disabled={isLoading || selectedTeam.length === 0 || hasPlayerConfirmedPartyBackend}
            style={{
              display: 'block',
              width: 'calc(100% - 40px)',
              padding: '15px',
              margin: '30px auto 0',
              backgroundColor: (isLoading || selectedTeam.length === 0 || hasPlayerConfirmedPartyBackend) ? '#ccc' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '18px',
              cursor: (isLoading || selectedTeam.length === 0 || hasPlayerConfirmedPartyBackend) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Confirming Team...' : `Confirm Team (${selectedTeam.length}/${MAX_TEAM_SIZE})`}
          </button>
        </>
      )}
    </div>
  );
}

export default PokemonSelection;
