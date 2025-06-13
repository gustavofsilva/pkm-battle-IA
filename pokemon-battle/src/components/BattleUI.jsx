import React from 'react';
import './BattleUI.css'; // We'll create this for styling

function BattleUI({ gameData, playerId, onAttack, isLoading }) {
  if (!gameData || !gameData.players || gameData.players.length < 2) {
    return <p>Waiting for game data or opponent...</p>;
  }

  const playerInfo = gameData.players.find(p => p.id === playerId);
  const opponentInfo = gameData.players.find(p => p.id !== playerId);

  if (!playerInfo || !playerInfo.pokemon) {
    return <p>Waiting for your Pokemon data...</p>;
  }
  if (!opponentInfo || !opponentInfo.pokemon) {
    return <p>Waiting for opponent's Pokemon data...</p>;
  }

  const playerPokemon = playerInfo.pokemon;
  const opponentPokemon = opponentInfo.pokemon;

  const getHPRatio = (currentHp, maxHp) => {
    if (maxHp === 0) return 0;
    return (currentHp / maxHp) * 100;
  };

  return (
    <div className="battle-container">
      <h2 className="battle-title">Battle In Progress!</h2>
      <p className="turn-indicator">
        {gameData.turn === playerId ? "Your Turn" : `Opponent's Turn (${gameData.turn})`}
      </p>

      <div className="pokemon-display-area">
        {/* Player's Pokemon */}
        <div className={`pokemon-card player-card ${gameData.turn === playerId ? 'active-turn' : ''}`}>
          <h3>You ({playerInfo.id})</h3>
          <img src={playerPokemon.sprite} alt={playerPokemon.name} className="pokemon-sprite" />
          <h4>{playerPokemon.name}</h4>
          <div className="hp-bar-container">
            <div
              className="hp-bar"
              style={{ width: `${getHPRatio(playerPokemon.currentHp, playerPokemon.stats.hp)}%` }}
            ></div>
          </div>
          <p className="hp-text">HP: {playerPokemon.currentHp} / {playerPokemon.stats.hp}</p>
          <p className="stats-text">Atk: {playerPokemon.stats.attack} / Def: {playerPokemon.stats.defense}</p>
        </div>

        <div className="vs-separator">VS</div>

        {/* Opponent's Pokemon */}
        <div className={`pokemon-card opponent-card ${gameData.turn !== playerId ? 'active-turn' : ''}`}>
          <h3>Opponent ({opponentInfo.id})</h3>
          <img src={opponentPokemon.sprite} alt={opponentPokemon.name} className="pokemon-sprite" />
          <h4>{opponentPokemon.name}</h4>
          <div className="hp-bar-container">
            <div
              className="hp-bar opponent-hp-bar"
              style={{ width: `${getHPRatio(opponentPokemon.currentHp, opponentPokemon.stats.hp)}%` }}
            ></div>
          </div>
          <p className="hp-text">HP: {opponentPokemon.currentHp} / {opponentPokemon.stats.hp}</p>
           <p className="stats-text">Atk: {opponentPokemon.stats.attack} / Def: {opponentPokemon.stats.defense}</p>
        </div>
      </div>

      {gameData.state === 'battle' && gameData.turn === playerId && (
        <button
          onClick={onAttack}
          disabled={isLoading}
          className="attack-button"
        >
          {isLoading ? 'Attacking...' : 'Attack!'}
        </button>
      )}

      {gameData.state === 'finished' && (
        <div className="game-over-message">
          <h3>Game Over!</h3>
          <p>{gameData.winner === playerId ? "Congratulations, you won!" : "You lost. Better luck next time!"}</p>
        </div>
      )}
    </div>
  );
}

export default BattleUI;
