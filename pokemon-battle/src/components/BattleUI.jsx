import React from 'react';
import './BattleUI.css';

const MAX_TEAM_SIZE_DISPLAY = 6; // For rendering empty slots if team is smaller

// Helper component for Pokeball icons
const PokeballIcon = ({ status, isActive }) => {
  let ballClass = 'pokeball-icon';
  if (status === 'fainted') ballClass += ' fainted';
  else if (status === 'healthy') ballClass += ' healthy';
  else ballClass += ' empty'; // For empty slots in party

  if (isActive) ballClass += ' active';

  return <div className={ballClass} title={isActive ? `Active: ${status}` : status}></div>;
};

// Helper component for displaying a player's party status
const PartyStatusDisplay = ({ party, activePokemonIndex }) => {
  const partySlots = [];
  for (let i = 0; i < MAX_TEAM_SIZE_DISPLAY; i++) {
    const pokemon = party?.[i]; // Use optional chaining in case party is not fully populated
    partySlots.push(
      <PokeballIcon
        key={i}
        status={pokemon ? pokemon.status : 'empty'}
        isActive={i === activePokemonIndex && pokemon && pokemon.status !== 'fainted'} // Active only if not fainted
      />
    );
  }
  return <div className="party-status-display">{partySlots}</div>;
};


function BattleUI({ gameData, playerId, onAttack, isLoading }) {
  if (!gameData || !gameData.players || gameData.players.length < 2) {
    return <p className="battle-loading-message">Waiting for full game data or opponent...</p>;
  }

  const playerInfo = gameData.players.find(p => p.id === playerId);
  const opponentInfo = gameData.players.find(p => p.id !== playerId);

  // Validate essential data before trying to render
  if (!playerInfo || !playerInfo.party || playerInfo.activePokemonIndex == null || playerInfo.activePokemonIndex < 0) {
    return <p className="battle-loading-message">Waiting for your player data to fully load...</p>;
  }
  if (!opponentInfo || !opponentInfo.party || opponentInfo.activePokemonIndex == null || opponentInfo.activePokemonIndex < 0 ) {
    // Opponent might not have selected party yet, or data is still loading
     // Check if opponent has selected party, if not, show different message
     if (!opponentInfo.hasSelectedParty && gameData.state === 'selecting_pokemon') {
        return <p className="battle-loading-message">Waiting for opponent to select their team...</p>;
    }
    return <p className="battle-loading-message">Waiting for opponent's data to fully load...</p>;
  }

  const playerActivePokemon = playerInfo.party[playerInfo.activePokemonIndex];
  const opponentActivePokemon = opponentInfo.party[opponentInfo.activePokemonIndex];

  if (!playerActivePokemon || !playerActivePokemon.details) {
    return <p className="battle-loading-message">Your active Pokémon data is missing. Game state: {gameData.state}</p>;
  }
   if (!opponentActivePokemon || !opponentActivePokemon.details) {
    // This can happen if opponent's active Pokemon fainted and they are in 'waiting_for_switch'
    if (gameData.state === 'waiting_for_switch' && gameData.turn === opponentInfo.id) {
        // UI should show opponent is switching, BattleUI might not be the primary view then
        // or it shows a placeholder for opponent's active Pokemon.
    } else if (gameData.state !== 'finished'){ // Don't show error if game is finished
       return <p className="battle-loading-message">Opponent's active Pokémon data is missing. Game state: {gameData.state}</p>;
    }
  }


  const getHPRatio = (currentHp, maxHp) => {
    if (!maxHp || maxHp === 0) return 0; // Prevent division by zero
    return Math.max(0, (currentHp / maxHp) * 100); // Ensure HP doesn't go below 0% visual
  };

  const canAttack = gameData.state === 'battle' &&
                    gameData.turn === playerId &&
                    playerActivePokemon && playerActivePokemon.status !== 'fainted' &&
                    opponentActivePokemon && opponentActivePokemon.status !== 'fainted';

  return (
    <div className="battle-container">
      <h2 className="battle-title">
        {gameData.state === 'finished' ? 'Game Over!' : 'Battle In Progress!'}
      </h2>

      {gameData.state !== 'finished' && (
        <p className="turn-indicator">
          {gameData.turn === playerId ? "Your Turn" : (gameData.turn ? `Opponent's Turn (${gameData.turn})` : "Waiting...")}
        </p>
      )}


      <div className="pokemon-display-area">
        {/* Player's Side */}
        <div className={`pokemon-card player-card ${gameData.turn === playerId && gameData.state === 'battle' ? 'active-turn-battle' : ''}`}>
          <h3>You ({playerInfo.id})</h3>
          <PartyStatusDisplay party={playerInfo.party} activePokemonIndex={playerInfo.activePokemonIndex} />
          {playerActivePokemon && playerActivePokemon.details && (
            <>
              <img src={playerActivePokemon.details.sprite} alt={playerActivePokemon.details.name} className="pokemon-sprite" />
              <h4>{playerActivePokemon.details.name} <span className="pokemon-status-ingame">({playerActivePokemon.status})</span></h4>
              <div className="hp-bar-container">
                <div
                  className="hp-bar"
                  style={{ width: `${getHPRatio(playerActivePokemon.currentHp, playerActivePokemon.maxHp)}%` }}
                ></div>
              </div>
              <p className="hp-text">HP: {playerActivePokemon.currentHp} / {playerActivePokemon.maxHp}</p>
              <p className="stats-text">Atk: {playerActivePokemon.details.stats.attack} / Def: {playerActivePokemon.details.stats.defense}</p>
            </>
          )}
        </div>

        <div className="vs-separator">VS</div>

        {/* Opponent's Side */}
        <div className={`pokemon-card opponent-card ${gameData.turn !== playerId && gameData.state === 'battle' ? 'active-turn-battle' : ''}`}>
          <h3>Opponent ({opponentInfo.id})</h3>
          <PartyStatusDisplay party={opponentInfo.party} activePokemonIndex={opponentInfo.activePokemonIndex} />
          {opponentActivePokemon && opponentActivePokemon.details ? (
            <>
              <img src={opponentActivePokemon.details.sprite} alt={opponentActivePokemon.details.name} className="pokemon-sprite" />
              <h4>{opponentActivePokemon.details.name} <span className="pokemon-status-ingame">({opponentActivePokemon.status})</span></h4>
              <div className="hp-bar-container">
                <div
                  className="hp-bar opponent-hp-bar"
                  style={{ width: `${getHPRatio(opponentActivePokemon.currentHp, opponentActivePokemon.maxHp)}%` }}
                ></div>
              </div>
              <p className="hp-text">HP: {opponentActivePokemon.currentHp} / {opponentActivePokemon.maxHp}</p>
              <p className="stats-text">Atk: {opponentActivePokemon.details.stats.attack} / Def: {opponentActivePokemon.details.stats.defense}</p>
            </>
          ) : (
            <div className="pokemon-placeholder">
                <p>Waiting for opponent's Pokemon...</p>
                {/* Or show a question mark sprite */}
            </div>
          )}
        </div>
      </div>

      {gameData.state === 'battle' && gameData.turn === playerId && (
        <button
          onClick={onAttack}
          disabled={isLoading || !canAttack}
          className="attack-button"
        >
          {isLoading ? 'Attacking...' : 'Attack!'}
        </button>
      )}

      {gameData.state === 'finished' && (
        <div className="game-over-message">
          <h3>{gameData.winner === playerId ? "🎉 Congratulations, you won! 🎉" : "💔 You lost. Better luck next time! 💔"}</h3>
        </div>
      )}
       {gameData.state === 'opponent_disconnected' && (
        <div className="opponent-disconnected-message">
            <p>Opponent has disconnected. Waiting for them to rejoin...</p>
        </div>
      )}
    </div>
  );
}

export default BattleUI;
