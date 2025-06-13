import React from 'react';
import './PokemonSwitchUI.css'; // Create this file for styling

function PokemonSwitchUI({ playerParty, onPokemonSwitchSelected, activePokemonIndex }) {
  if (!playerParty || playerParty.length === 0) {
    return (
      <div className="switch-ui-overlay">
        <div className="switch-ui-modal">
          <h2>Error: No Pokemon in Party</h2>
          <p>Cannot switch Pokemon as your party is empty.</p>
        </div>
      </div>
    );
  }

  const availableToSwitch = playerParty.filter((pokemon, index) =>
    pokemon.status !== 'fainted' && index !== activePokemonIndex
  );

  return (
    <div className="switch-ui-overlay">
      <div className="switch-ui-modal">
        <h2>Your Pokemon Fainted!</h2>
        <p>Choose your next Pokemon to send into battle:</p>
        {availableToSwitch.length === 0 ? (
          <p>No other Pokemon available to switch to!</p>
        ) : (
          <div className="pokemon-options-grid">
            {playerParty.map((pokemon, index) => {
              const isFainted = pokemon.status === 'fainted';
              const isActive = index === activePokemonIndex; // The one that just fainted (or is currently active but needs switch)

              // Do not allow selecting the currently active Pokemon (which just fainted) or other fainted Pokemon
              const isDisabled = isFainted || isActive;

              return (
                <div
                  key={pokemon.details.id || index} // Use a stable key
                  className={`pokemon-option ${isDisabled ? 'disabled' : ''} ${isActive ? 'just-fainted' : ''}`}
                  onClick={() => !isDisabled && onPokemonSwitchSelected(index)}
                >
                  <img
                    src={pokemon.details.sprite}
                    alt={pokemon.details.name}
                    className="pokemon-sprite-option"
                  />
                  <p className="pokemon-name-option">{pokemon.details.name}</p>
                  <p className="pokemon-hp-option">
                    HP: {pokemon.currentHp} / {pokemon.maxHp}
                  </p>
                  {isFainted && <p className="pokemon-status-fainted">(Fainted)</p>}
                  {isActive && !isFainted && <p className="pokemon-status-active">(Currently Active - Cannot Switch To)</p>}
                   {isActive && isFainted && <p className="pokemon-status-active">(Just Fainted)</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonSwitchUI;
