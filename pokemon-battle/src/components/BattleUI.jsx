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
  // Ensure PartyStatusDisplay itself can be styled with z-index if needed
  return <div className="party-status-display" style={{ position: 'relative', zIndex: 1 }}>{partySlots}</div>;
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
   // Opponent's active Pokemon can be missing if it fainted and they are switching, or if game ended.
   // So we don't strictly need to return loading message for opponent if details are missing,
   // but we do need to ensure we don't crash trying to access details.sprite later.
   // The rendering logic for opponent card already handles this.


  const getHPRatio = (currentHp, maxHp) => {
    if (!maxHp || maxHp === 0) return 0; // Prevent division by zero
    return Math.max(0, (currentHp / maxHp) * 100); // Ensure HP doesn't go below 0% visual
  };

  const canAttack = gameData.state === 'battle' &&
                    gameData.turn === playerId &&
                    playerActivePokemon && playerActivePokemon.status !== 'fainted' &&
                    opponentActivePokemon && opponentActivePokemon.status !== 'fainted'; // Ensure opponent also not fainted for attack logic

  // --- START OF MODIFIED LOGGING (before return) ---
  const activePokemonMoves = playerActivePokemon?.details?.moves;
  console.log('[BattleUI.jsx] Assigned activePokemonMoves variable:', JSON.stringify(activePokemonMoves, null, 2)); // New log for the variable

  console.log('[BattleUI.jsx] gameData received (full):', JSON.stringify(gameData, null, 2)); // Renamed for clarity
  if (playerInfo && playerInfo.party && playerInfo.activePokemonIndex !== -1 && playerInfo.activePokemonIndex < playerInfo.party.length) {
      const activePkmFromBattleUI = playerInfo.party[playerInfo.activePokemonIndex];
      if (activePkmFromBattleUI && activePkmFromBattleUI.details) {
          console.log('[BattleUI.jsx] playerActivePokemon.details:', JSON.stringify(activePkmFromBattleUI.details, null, 2));
          console.log('[BattleUI.jsx] playerActivePokemon.details.moves:', JSON.stringify(activePkmFromBattleUI.details.moves, null, 2));
          if (!activePkmFromBattleUI.details.moves || activePkmFromBattleUI.details.moves.length === 0) {
              console.warn('[BattleUI.jsx] MOVES ARE MISSING OR EMPTY HERE!');
          }
      } else {
          console.log('[BattleUI.jsx] Active Pokemon or its details are missing in BattleUI playerInfo.');
      }
  } else {
      console.log('[BattleUI.jsx] playerInfo, party, or activePokemonIndex is not set as expected or index out of bounds.');
  }
  // --- END OF ADDED LOGGING (before return) ---

  return (
    <div className="battle-container">
      <h2 className="battle-title">
        {gameData.state === 'finished' ? 'Game Over!' : 'Battle In Progress!'}
      </h2>

      {gameData.state !== 'finished' && (
        <p className="turn-indicator">
          {gameData.turn === playerId ? "Your Turn" : (gameData.turn ? `Opponent's Turn (${opponentInfo?.id || 'Opponent'})` : "Waiting...")}
        </p>
      )}


      <div className="pokemon-display-area">
        {/* Player's Side */}
        <div className={`pokemon-card player-card ${gameData.turn === playerId && gameData.state === 'battle' ? 'active-turn-battle' : ''}`}>
          {playerActivePokemon && playerActivePokemon.details && playerActivePokemon.details.sprite && (
            <div
              className="card-background-image-display"
              style={{ backgroundImage: `url(${playerActivePokemon.details.sprite})` }}
            />
          )}
          <h3>You ({playerInfo?.id || 'Player'})</h3>
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
          {opponentActivePokemon && opponentActivePokemon.details && opponentActivePokemon.details.sprite && (
            <div
              className="card-background-image-display"
              style={{ backgroundImage: `url(${opponentActivePokemon.details.sprite})` }}
            />
          )}
          <h3>Opponent ({opponentInfo?.id || 'Opponent'})</h3>
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

      {gameData.state === 'battle' && gameData.turn === playerId && playerActivePokemon && playerActivePokemon.details && (
      <>
        {/* This log uses the new variable too for consistency in what's being checked by the log vs. the code */}
        {console.log('[BattleUI.jsx] Rendering moves section. activePokemonMoves variable:', activePokemonMoves, 'Length:', activePokemonMoves ? activePokemonMoves.length : 'N/A')}

        <div className="attack-button-container" style={{position: 'relative', zIndex: 1}}>
           <h3>Choose an Attack:</h3>
           {activePokemonMoves && activePokemonMoves.length > 0 ? ( // Use variable here
             activePokemonMoves.map((move) => ( // Use variable here
               <button
                 key={move.name}
                 onClick={() => onAttack(move.name)}
                 disabled={isLoading || !canAttack}
                 className="attack-button"
               >
                 {move.name} (Type: {move.type || 'Unknown'}, Power: {move.power || 'N/A'})
               </button>
             ))
           ) : (
             <>
               <p>No moves available.</p>
               {/* Diagnostic logs using activePokemonMoves or the original path for clarity */}
               {playerActivePokemon && playerActivePokemon.details && activePokemonMoves && activePokemonMoves.length === 0 &&
                 console.warn('[BattleUI.jsx] activePokemonMoves is an EMPTY ARRAY.')
               }
               {playerActivePokemon && playerActivePokemon.details && !playerActivePokemon.details.hasOwnProperty('moves') && // Check original path for this specific warning
                 console.warn('[BattleUI.jsx] playerActivePokemon.details does NOT HAVE a "moves" property (so activePokemonMoves is undefined).')
               }
                {!activePokemonMoves && !(playerActivePokemon && playerActivePokemon.details) && // If activePokemonMoves is falsy due to missing details
                 console.warn('[BattleUI.jsx] activePokemonMoves is undefined because playerActivePokemon or its .details are missing.')
               }
             </>
           )}
        </div>
      </>
      )}

      {gameData.state === 'finished' && (
        <div className="game-over-message">
          <h3>{gameData.winner === playerId ? "🎉 Congratulations, you won! 🎉" : "💔 You lost. Better luck next time! 💔"}</h3>
          {/* Consider adding a button to go back to lobby or start new game */}
        </div>
      )}
       {gameData.state === 'opponent_disconnected' && (
        <div className="opponent-disconnected-message">
            <p>Opponent has disconnected. You win by default, or wait for them to rejoin if implemented.</p>
            {/* Consider adding a button to go back to lobby */}
        </div>
      )}
    </div>
  );
}

export default BattleUI;
