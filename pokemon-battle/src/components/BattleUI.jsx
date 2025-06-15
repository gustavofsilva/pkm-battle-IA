import React from 'react';
import './BattleUI.css';

const MAX_TEAM_SIZE_DISPLAY = 6;

const PokeballIcon = ({ status, isActive }) => {
  let ballClass = 'pokeball-icon';
  if (status === 'fainted') ballClass += ' fainted';
  else if (status === 'healthy') ballClass += ' healthy';
  else ballClass += ' empty';

  if (isActive) ballClass += ' active';

  return <div className={ballClass} title={isActive ? `Active: ${status}` : status}></div>;
};

const PartyStatusDisplay = ({ party, activePokemonIndex }) => {
  const partySlots = [];
  for (let i = 0; i < MAX_TEAM_SIZE_DISPLAY; i++) {
    const pokemon = party?.[i];
    partySlots.push(
      <PokeballIcon
        key={i}
        status={pokemon ? pokemon.status : 'empty'}
        isActive={i === activePokemonIndex && pokemon && pokemon.status !== 'fainted'}
      />
    );
  }
  return <div className="party-status-display">{partySlots}</div>;
};

const getStatusAbbreviation = (status) => {
    if (!status) return '';
    switch (status.toLowerCase()) {
        case 'poison': return 'PSN';
        case 'burn': return 'BRN';
        case 'paralysis': return 'PAR';
        case 'sleep': return 'SLP';
        case 'freeze': return 'FRZ';
        case 'confusion': return 'CNF'; // Added confusion
        default: return status.toUpperCase().substring(0, 3);
    }
};


function BattleUI({ gameData, playerId, onAttack, isLoading }) {
  if (!gameData || !gameData.players || gameData.players.length < 2) {
    return <p className="battle-loading-message">Waiting for full game data or opponent...</p>;
  }

  const playerInfo = gameData.players.find(p => p.id === playerId);
  const opponentInfo = gameData.players.find(p => p.id !== playerId);

  if (!playerInfo || !playerInfo.party || playerInfo.activePokemonIndex == null || playerInfo.activePokemonIndex < 0 || !playerInfo.party[playerInfo.activePokemonIndex]) {
    return <p className="battle-loading-message">Waiting for your player data to fully load...</p>;
  }

  const playerActivePokemon = playerInfo.party[playerInfo.activePokemonIndex];
  const opponentActivePokemon = opponentInfo.party?.[opponentInfo.activePokemonIndex];


  if (!playerActivePokemon || !playerActivePokemon.details) {
    return <p className="battle-loading-message">Your active Pokémon data is missing. Game state: {gameData.state}</p>;
  }

  const getHPRatio = (currentHp, maxHp) => {
    if (!maxHp || maxHp === 0) return 0;
    return Math.max(0, (currentHp / maxHp) * 100);
  };

  const isPlayerTurn = gameData.state === 'battle' && gameData.turn === playerId;
  const canPlayerAttack = isPlayerTurn &&
                          playerActivePokemon && playerActivePokemon.status !== 'fainted' &&
                          (!opponentActivePokemon || opponentActivePokemon.status !== 'fainted'); // Allow attack if opponent has no active (e.g. mid-switch) but UI should ideally prevent this.

  return (
    <div className="battle-container">
      <h2 className="battle-title">
        {gameData.state === 'finished' ? 'Game Over!' :
         gameData.state === 'waiting_for_switch' && gameData.turn === playerId ? 'Your Pokemon Fainted! Switch!' :
         gameData.state === 'waiting_for_switch' && gameData.turn !== playerId ? "Opponent is switching..." :
         'Battle In Progress!'}
      </h2>

      {gameData.state !== 'finished' && gameData.state !== 'waiting_for_switch' && (
        <p className="turn-indicator">
          {gameData.turn === playerId ? "Your Turn" : (gameData.turn ? `Opponent's Turn (${gameData.turn})` : "Waiting...")}
        </p>
      )}
      {gameData.lastBattleMessage && <p className="battle-log-message">{gameData.lastBattleMessage}</p>}


      <div className="pokemon-display-area">
        {/* Player's Side */}
        <div className={`pokemon-card player-card ${isPlayerTurn ? 'active-turn-battle' : ''}`}>
          <h3>You ({playerInfo.id})</h3>
          <PartyStatusDisplay party={playerInfo.party} activePokemonIndex={playerInfo.activePokemonIndex} />
          {playerActivePokemon && playerActivePokemon.details && (
            <>
              <img src={playerActivePokemon.details.sprite} alt={playerActivePokemon.details.name} className="pokemon-sprite" />
              <h4>
                {playerActivePokemon.details.name.charAt(0).toUpperCase() + playerActivePokemon.details.name.slice(1)}
                {playerActivePokemon.activeStatus && (
                  <span className={`status-indicator status-${playerActivePokemon.activeStatus.toLowerCase()}`}>
                    {getStatusAbbreviation(playerActivePokemon.activeStatus)}
                  </span>
                )}
                <span className="pokemon-status-ingame">({playerActivePokemon.status})</span>
              </h4>
              <div className="hp-bar-container">
                <div
                  className="hp-bar"
                  style={{ width: `${getHPRatio(playerActivePokemon.currentHp, playerActivePokemon.maxHp)}%` }}
                ></div>
              </div>
              <p className="hp-text">HP: {playerActivePokemon.currentHp} / {playerActivePokemon.maxHp}</p>
              <p className="stats-text">
                Atk: {playerActivePokemon.details.stats.attack} / Def: {playerActivePokemon.details.stats.defense} <br/>
                SpA: {playerActivePokemon.details.stats.specialAttack} / SpD: {playerActivePokemon.details.stats.specialDefense} | Spd: {playerActivePokemon.details.stats.speed}
              </p>
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
              <h4>
                {opponentActivePokemon.details.name.charAt(0).toUpperCase() + opponentActivePokemon.details.name.slice(1)}
                {opponentActivePokemon.activeStatus && (
                  <span className={`status-indicator status-${opponentActivePokemon.activeStatus.toLowerCase()}`}>
                    {getStatusAbbreviation(opponentActivePokemon.activeStatus)}
                  </span>
                )}
                <span className="pokemon-status-ingame">({opponentActivePokemon.status})</span>
                </h4>
              <div className="hp-bar-container">
                <div
                  className="hp-bar opponent-hp-bar"
                  style={{ width: `${getHPRatio(opponentActivePokemon.currentHp, opponentActivePokemon.maxHp)}%` }}
                ></div>
              </div>
              <p className="hp-text">HP: {opponentActivePokemon.currentHp} / {opponentActivePokemon.maxHp}</p>
               <p className="stats-text">
                Atk: {opponentActivePokemon.details.stats.attack} / Def: {opponentActivePokemon.details.stats.defense} <br/>
                SpA: {opponentActivePokemon.details.stats.specialAttack} / SpD: {opponentActivePokemon.details.stats.specialDefense} | Spd: {opponentActivePokemon.details.stats.speed}
              </p>
            </>
          ) : (
            <div className="pokemon-placeholder">
                <p>{gameData.state === 'waiting_for_switch' && gameData.turn === opponentInfo.id ? "Opponent choosing Pokemon..." : "Waiting for opponent's Pokemon..."}</p>
            </div>
          )}
        </div>
      </div>

      {isPlayerTurn && playerActivePokemon && playerActivePokemon.status !== 'fainted' && (
        <div className="move-list-container">
          <h4>Choose a Move:</h4>
          <div className="moves-grid">
            {(playerActivePokemon.details.moves || []).map((move, index) => {
              const hasNoPP = move.currentPp <= 0;
              return (
                <button
                  key={index}
                  className={`move-button type-${move.type.toLowerCase()} ${hasNoPP ? 'no-pp' : ''}`}
                  onClick={() => onAttack(index)}
                  disabled={isLoading || !canPlayerAttack || hasNoPP}
                  title={`Power: ${move.power || '-'}, Acc: ${move.accuracy || '-'}, PP: ${move.currentPp}/${move.pp}`}
                >
                  <span className="move-name">{move.name}</span>
                  <span className="move-details">Type: {move.type} | PP: {move.currentPp}/{move.pp}</span>
                </button>
              );
            })}
            {(!playerActivePokemon.details.moves || playerActivePokemon.details.moves.length === 0) && <p>No moves available!</p>}
          </div>
        </div>
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
