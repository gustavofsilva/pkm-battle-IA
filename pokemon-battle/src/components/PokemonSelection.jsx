import React, { useState, useEffect } from 'react';

// Hardcoded list of available Pokemon for now
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
];

const MAX_SELECTION_UI = 6; // UI can allow selecting more for future team features
const POKEMON_FOR_BATTLE = 1; // Currently, only 1 Pokemon is sent to backend

function PokemonSelection({ onSelectionConfirmed, playerId, gameId, gameData, isLoading: propIsLoading }) {
  const [selectedPokemonLocal, setSelectedPokemonLocal] = useState([]); // Stores array of Pokemon objects
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlayerInGame = gameData?.players?.find(p => p.id === playerId);
  const hasPlayerConfirmedBackend = !!currentPlayerInGame?.pokemon; // Check if backend has pokemon assigned

  useEffect(() => {
    // If gameData shows this player has already selected (e.g., on reconnect/refresh),
    // update local selection to reflect that.
    if (hasPlayerConfirmedBackend && currentPlayerInGame.pokemon) {
        // Find the equivalent from AVAILABLE_POKEMON to ensure we have all local details like sprite
        const confirmedPokemonDetails = AVAILABLE_POKEMON.find(p => p.name === currentPlayerInGame.pokemon.name);
        if (confirmedPokemonDetails) {
            setSelectedPokemonLocal([confirmedPokemonDetails]);
        }
    }
  }, [hasPlayerConfirmedBackend, currentPlayerInGame]);


  const handleSelectPokemon = (pokemon) => {
    if (hasPlayerConfirmedBackend) return; // Don't allow changes if already confirmed on backend

    setError('');
    // For current game logic, we only care about 1 pokemon for battle
    // So, selecting a new one will just replace the old one in the local selection array.
    if (selectedPokemonLocal.find(p => p.id === pokemon.id)) {
      setSelectedPokemonLocal([]); // Deselect if clicking the same one
    } else {
      setSelectedPokemonLocal([pokemon]); // Select the new one (max 1 for battle)
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedPokemonLocal.length === 0) {
      setError(`Please select ${POKEMON_FOR_BATTLE} Pokemon.`);
      return;
    }
    if (hasPlayerConfirmedBackend) {
        setError("You have already confirmed your selection.");
        return;
    }

    const pokemonToConfirm = selectedPokemonLocal[0]; // Backend expects one Pokemon for now
    console.log(`Player ${playerId} confirming selection of ${pokemonToConfirm.name} for game ${gameId}`);
    setIsSubmitting(true);
    setError('');
    try {
      await onSelectionConfirmed(pokemonToConfirm); // Prop function from App.jsx
      // No need to set hasPlayerConfirmedBackend here, it will come via gameData prop update
    } catch (err) {
      setError(err.message || 'Failed to confirm selection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = propIsLoading || isSubmitting;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>
        {hasPlayerConfirmedBackend ? 'Your Pokemon is Selected!' : `Select Your Pokemon (Choose ${POKEMON_FOR_BATTLE} for Battle)`}
      </h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      {hasPlayerConfirmedBackend && currentPlayerInGame?.pokemon && (
        <div style={{ textAlign: 'center', margin: '20px 0', padding: '15px', background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '5px'}}>
          <h3 style={{color: '#2e7d32'}}>Selection Confirmed!</h3>
          <p>You have selected: <strong>{currentPlayerInGame.pokemon.name}</strong></p>
          <img src={currentPlayerInGame.pokemon.sprite || AVAILABLE_POKEMON.find(p => p.name === currentPlayerInGame.pokemon.name)?.sprite} alt={currentPlayerInGame.pokemon.name} style={{width: '96px', height: '96px'}}/>
        </div>
      )}

      {!hasPlayerConfirmedBackend && (
        <>
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', background: '#f9f9f9' }}>
            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Your Choice for Battle:</h3>
            {selectedPokemonLocal.length === 0 ? (
              <p>No Pokemon selected yet. Click on a Pokemon below to select it.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'center' }}>
                {selectedPokemonLocal.map(p => (
                  <li key={p.id} style={{ margin: '5px', padding: '10px', border: '1px solid #4CAF50', borderRadius: '5px', textAlign: 'center', width: '100px' }}>
                    <img src={p.sprite} alt={p.name} style={{ width: '50px', height: '50px' }} />
                    <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{p.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', opacity: hasPlayerConfirmedBackend ? 0.5 : 1, pointerEvents: hasPlayerConfirmedBackend ? 'none' : 'auto' }}>
            {AVAILABLE_POKEMON.map(pokemon => (
              <div
                key={pokemon.id}
                onClick={() => handleSelectPokemon(pokemon)}
                style={{
                  padding: '10px',
                  border: selectedPokemonLocal.find(p => p.id === pokemon.id) ? '2px solid #4CAF50' : '1px solid #ddd',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: hasPlayerConfirmedBackend ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  boxShadow: selectedPokemonLocal.find(p => p.id === pokemon.id) ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none',
                  backgroundColor: hasPlayerConfirmedBackend ? '#f0f0f0' : '#fff'
                }}
                onMouseOver={e => { if (!hasPlayerConfirmedBackend) e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseOut={e => { if (!hasPlayerConfirmedBackend) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '70px', height: '70px', marginBottom: '5px' }} />
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{pokemon.name}</p>
                <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#555' }}>{pokemon.type}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {!hasPlayerConfirmedBackend && (
        <button
          onClick={handleConfirmSelection}
          disabled={isLoading || selectedPokemonLocal.length === 0 || hasPlayerConfirmedBackend}
          style={{
            display: 'block',
            width: 'calc(100% - 40px)',
            padding: '15px',
            margin: '30px auto 0',
            backgroundColor: (isLoading || selectedPokemonLocal.length === 0 || hasPlayerConfirmedBackend) ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            cursor: (isLoading || selectedPokemonLocal.length === 0 || hasPlayerConfirmedBackend) ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Confirming...' : `Confirm Selection (${selectedPokemonLocal.length > 0 ? selectedPokemonLocal[0].name : 'None'})`}
        </button>
      )}
      {!hasPlayerConfirmedBackend && (
        <p style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#777'}}>
          Note: The backend currently supports one Pokémon for battle. Your first choice will be used.
        </p>
      )}
    </div>
  );
}

export default PokemonSelection;
