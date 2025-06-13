import React, { useState } from 'react';

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

const MAX_SELECTION = 6;

function PokemonSelection({ onSelectionConfirmed, playerId, gameId }) {
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPokemon = (pokemon) => {
    setError('');
    if (selectedPokemon.find(p => p.id === pokemon.id)) {
      setSelectedPokemon(selectedPokemon.filter(p => p.id !== pokemon.id));
    } else {
      if (selectedPokemon.length < MAX_SELECTION) {
        setSelectedPokemon([...selectedPokemon, pokemon]);
      } else {
        setError(`You can only select up to ${MAX_SELECTION} Pokemon.`);
      }
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedPokemon.length === 0) {
      setError('Please select at least one Pokemon.');
      return;
    }
    if (selectedPokemon.length > MAX_SELECTION) {
        setError(`You can only select up to ${MAX_SELECTION} Pokemon.`);
        return;
    }

    // For this subtask, we are only selecting one Pokemon for the battle as per backend logic.
    // The UI allows selecting up to 6, but we'll send the first one.
    // This can be adjusted later if the game logic changes to support a team.
    if (selectedPokemon.length > 0) {
        const primaryPokemon = selectedPokemon[0];
        console.log(`Player ${playerId} confirmed selection of ${primaryPokemon.name} for game ${gameId}`);
        setIsLoading(true);
        setError('');
        try {
            // The actual API call will be done in App.jsx as per the subtask description.
            // This component will just pass the selected Pokemon (or the primary one) back.
            onSelectionConfirmed(primaryPokemon); // Pass the first selected Pokemon
        } catch (err) {
            setError(err.message || 'Failed to confirm selection.');
        } finally {
            setIsLoading(false);
        }
    } else {
        setError('Please select your Pokemon.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Select Your Pokemon (Choose 1 for Battle)</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '5px', background: '#f9f9f9' }}>
        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Your Selection:</h3>
        {selectedPokemon.length === 0 ? (
          <p>No Pokemon selected yet. Click on a Pokemon below to select it.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap' }}>
            {selectedPokemon.map(p => (
              <li key={p.id} style={{ margin: '5px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', textAlign: 'center', width: '100px' }}>
                <img src={p.sprite} alt={p.name} style={{ width: '50px', height: '50px' }} />
                <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{p.name}</p>
              </li>
            ))}
          </ul>
        )}
        {selectedPokemon.length > 0 && <p>Selected: {selectedPokemon.length} / {MAX_SELECTION}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
        {AVAILABLE_POKEMON.map(pokemon => (
          <div
            key={pokemon.id}
            onClick={() => handleSelectPokemon(pokemon)}
            style={{
              padding: '10px',
              border: selectedPokemon.find(p => p.id === pokemon.id) ? '2px solid #4CAF50' : '1px solid #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
              boxShadow: selectedPokemon.find(p => p.id === pokemon.id) ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src={pokemon.sprite} alt={pokemon.name} style={{ width: '70px', height: '70px', marginBottom: '5px' }} />
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{pokemon.name}</p>
            <p style={{ margin: '5px 0 0', fontSize: '10px', color: '#555' }}>{pokemon.type}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleConfirmSelection}
        disabled={isLoading || selectedPokemon.length === 0}
        style={{
          display: 'block',
          width: 'calc(100% - 40px)',
          padding: '15px',
          margin: '30px auto 0',
          backgroundColor: (isLoading || selectedPokemon.length === 0) ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '18px',
          cursor: (isLoading || selectedPokemon.length === 0) ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Confirming...' : `Confirm Selection (${selectedPokemon.length > 0 ? selectedPokemon[0].name : 'None'})`}
      </button>
      <p style={{textAlign: 'center', marginTop: '10px', fontSize: '12px', color: '#777'}}>
        Note: The backend currently supports one Pokémon for battle. The first Pokémon you selected will be used.
      </p>
    </div>
  );
}

export default PokemonSelection;
