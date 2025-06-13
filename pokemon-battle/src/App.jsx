import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PokemonSelection from './components/PokemonSelection';
import BattleUI from './components/BattleUI';
import PokemonSwitchUI from './components/PokemonSwitchUI';

const API_BASE_URL = 'https://pkm-battle-ia.onrender.com';
const WS_BASE_URL = 'wss://pkm-battle-ia.onrender.com';
const ABSOLUTE_MAX_TEAM_SIZE = 6;

function App() {
  const [gameState, setGameState] = useState('initial');
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWsLoading, setIsWsLoading] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [newGameMaxTeamSize, setNewGameMaxTeamSize] = useState(ABSOLUTE_MAX_TEAM_SIZE);
  const [newGameBattleType, setNewGameBattleType] = useState('1v1');
  const [copyButtonText, setCopyButtonText] = useState('Copy Game ID');

  const updateFullGameState = (newGameData, sourceMessage = "") => {
    console.log(`[StateUpdate] Source: ${sourceMessage}`, newGameData);
    setGameData(newGameData);
    setGameState(newGameData.state);

    let statusMessage = "";
    const currentPlayer = newGameData.players?.find(p => p.id === playerId);
    const opponentPlayer = newGameData.players?.find(p => p.id !== playerId);
    const currentPlayerPartySelected = !!currentPlayer?.hasSelectedParty;
    const opponentPlayerPartySelected = !!opponentPlayer?.hasSelectedParty;

    if (sourceMessage === "WebSocket Game Update") {
        statusMessage = `Game state: ${newGameData.state}.`;
    } else {
        statusMessage = sourceMessage || `Game state: ${newGameData.state}.`;
    }

    const teamSizeForMessage = newGameData.maxTeamSize || ABSOLUTE_MAX_TEAM_SIZE;

    if (newGameData.state === 'battle') {
      statusMessage = `Battle ongoing! Turn: ${newGameData.turn === playerId ? 'Your' : "Opponent's"} turn. (Team Size: ${teamSizeForMessage})`;
    } else if (newGameData.state === 'selecting_pokemon') {
      if (currentPlayerPartySelected && !opponentPlayerPartySelected) {
        statusMessage = `Your team (max ${teamSizeForMessage}) is confirmed! Waiting for opponent...`;
      } else if (!currentPlayerPartySelected) {
        statusMessage = `Select your team (up to ${teamSizeForMessage} Pokemon).`;
      } else {
        statusMessage = `Both players selected teams (max ${teamSizeForMessage})! Starting battle...`;
      }
       if (newGameData.players.length < 2 && !currentPlayerPartySelected) statusMessage = `Waiting for opponent to join (Game for ${teamSizeForMessage} Pokemon teams).`;
    } else if (newGameData.state === 'waiting_for_opponent') {
        statusMessage = `Game ID: ${newGameData.id} (Team Size: ${teamSizeForMessage}). Waiting for opponent to join.`;
    } else if (newGameData.state === 'waiting_for_switch') {
        if (newGameData.turn === playerId) {
            statusMessage = "Your Pokemon fainted! You need to switch to a new Pokemon.";
        } else {
            statusMessage = `Opponent's Pokemon fainted! Waiting for opponent (${newGameData.turn}) to switch.`;
        }
    } else if (newGameData.state === 'finished') {
      if (newGameData.winner === playerId) {
        statusMessage = "Congratulations, you won!";
      } else {
        statusMessage = "You lost. Better luck next time!";
      }
    } else if (newGameData.state === 'opponent_disconnected') {
        statusMessage = "Opponent disconnected. Waiting for them to rejoin.";
    }
    setMessage(statusMessage);
    setIsLoading(false);
    setIsWsLoading(false);
  };

  useEffect(() => { /* ... existing useEffect for socket handlers ... */
    if (!socket) {
      if (isWsLoading) setIsWsLoading(false);
      return;
    }
    socket.onopen = () => {
      console.log(`[WebSocket] Connected for game ${gameId}, player ${playerId}`);
      setMessage("WebSocket connected. Waiting for initial game data...");
      setIsWsLoading(false);
    };
    socket.onmessage = (event) => {
      console.log('[WebSocket] Raw message:', event.data);
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Parsed message:', data);
        if (data.type === 'gameStateUpdate') {
          updateFullGameState(data.payload, "WebSocket Game Update");
        } else if (data.type === 'connection_ack') {
          console.log('[WebSocket] Connection acknowledged by server:', data.message);
        } else if (data.type === 'error') {
          console.error('[WebSocket] Error message from server:', data.message);
          setError(`Server error: ${data.message}`);
        } else {
          console.log('[WebSocket] Unhandled message type:', data.type);
        }
      } catch (e) {
        console.error('[WebSocket] Parse/handle error:', e, event.data);
        setError("Malformed data from server.");
      }
    };
    socket.onclose = (event) => {
      console.log(`[WebSocket] Disconnected. Code: ${event.code}, Reason: ${event.reason || 'N/A'}`);
      if (gameId && gameState !== 'initial' && gameState !== 'finished' && !event.wasClean) {
          setError("WebSocket connection lost. Game may be interrupted.");
      } else if (event.wasClean && (gameState !== 'initial' && gameState !== 'finished')) {
          // setMessage("WebSocket connection closed."); // Can be too noisy if setSocket(null) triggers it often
      }
      setIsWsLoading(false);
      setSocket(null);
    };
    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err.message || 'Unknown WS error');
      setError("WebSocket connection error. Try reconnecting or reset.");
      setIsWsLoading(false);
    };
  }, [socket, gameId, playerId, gameState]);

  const connectWebSocket = (currentGId, currentPId) => { /* ... existing connectWebSocket ... */
    if (!currentGId || !currentPId) {
      console.log('[WebSocket] Connect: gameId or playerId missing.'); return;
    }
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) && socket.url.includes(`gameId=${currentGId}&playerId=${currentPId}`)) {
      if(socket.readyState === WebSocket.OPEN) setIsWsLoading(false);
      return;
    }
    if (socket) socket.close(1000, "New connection requested");

    setIsWsLoading(true);
    setMessage(`Attempting to connect to game server (Game: ${currentGId})...`);
    setError('');
    const socketUrl = `${WS_BASE_URL}?gameId=${currentGId}&playerId=${currentPId}`;
    setSocket(new WebSocket(socketUrl));
  };

  useEffect(() => { /* ... existing main cleanup useEffect ... */
    const s = socket;
    return () => { if (s) s.close(1000, "Component unmounting"); };
  }, [socket]);

  const createNewGame = async () => { /* ... existing createNewGame ... */
    setIsLoading(true); setError(''); setMessage('Creating new game...');
    resetGame(false);

    try {
      const httpResponse = await axios.post(`${API_BASE_URL}/game`, {
        settings: { maxTeamSize: newGameMaxTeamSize }
      });
      const newGameId = httpResponse.data.gameId;
      const actualMaxTeamSize = httpResponse.data.settings?.maxTeamSize || ABSOLUTE_MAX_TEAM_SIZE;
      const newPlayerId = 'player1';

      setGameId(newGameId);
      setPlayerId(newPlayerId);
      setMessage(`Game ${newGameId} created (Team Size: ${actualMaxTeamSize}). Waiting for server connection...`);
      console.log("Game created via HTTP:", httpResponse.data);

      const joinResponse = await axios.post(`${API_BASE_URL}/game/${newGameId}/join`, { playerId: newPlayerId });
      console.log("Creator joined game via HTTP:", joinResponse.data);
      connectWebSocket(newGameId, newPlayerId);
    } catch (err) {
      console.error("Error creating/joining game:", err);
      setError(err.response?.data?.message || 'Failed to create or join game.');
      resetGame();
    }
  };

  const joinGame = async (gameIdToJoin, newPlayerId) => { /* ... existing joinGame ... */
    if (!gameIdToJoin) {
      setError("Please enter a Game ID."); setIsLoading(false); return;
    }
    setIsLoading(true); setError('');
    resetGame(false);

    setGameId(gameIdToJoin);
    setPlayerId(newPlayerId);

    setMessage(`Joining game ${gameIdToJoin} as ${newPlayerId}...`);
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${gameIdToJoin}/join`, { playerId: newPlayerId });
      console.log("Game joined via HTTP:", response.data);
      let joinMsg = `Successfully joined game ${gameIdToJoin}. Waiting for server connection...`;
      if(response.data.maxTeamSize) {
        joinMsg = `Joined game ${gameIdToJoin} (Team Size: ${response.data.maxTeamSize}). Connecting...`;
      }
      setMessage(joinMsg);
      connectWebSocket(gameIdToJoin, newPlayerId);
    } catch (err) {
      console.error(`Error joining game ${gameIdToJoin}:`, err);
      setError(err.response?.data?.message || `Failed to join game.`);
      resetGame();
    }
  };

  const fetchGameStateHTTP = async (currentGID) => { /* ... existing fetchGameStateHTTP ... */
    if (!currentGID || !playerId) {
      setError("Cannot refresh: Game ID or Player ID is missing."); setIsLoading(false); return;
    }
    setIsLoading(true); setError('');
    setMessage(`Attempting HTTP refresh for game ${currentGID}...`);
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${currentGID}`);
      updateFullGameState(response.data, "HTTP state refresh.");
      if (response.data.state !== 'initial' && response.data.state !== 'finished') {
        connectWebSocket(currentGID, playerId);
      }
    } catch (err) {
      console.error("Error fetching game state via HTTP:", err);
      setError(err.response?.data?.message || "Could not fetch game state via HTTP.");
      if (err.response?.status === 404) resetGame();
      else setIsLoading(false);
    }
  };

  const handleTeamSelected = async (selectedTeamNames) => { /* ... existing handleTeamSelected ... */
    if (!gameId || !playerId || !selectedTeamNames || selectedTeamNames.length === 0) {
      setError('Game/Player ID or team not set/empty.'); return;
    }
    setError('');
    setMessage(`Confirming your team: ${selectedTeamNames.join(', ')}...`);
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/select-pokemon`, {
        playerId: playerId,
        pokemonNames: selectedTeamNames
      });
      console.log(`Team selection (${selectedTeamNames.join(', ')}) sent. Waiting for WS update.`);
    } catch (err) {
      console.error("Error confirming team selection:", err);
      setError(err.response?.data?.message || 'Failed to confirm team selection.');
    }
  };

  const handleAttack = async () => { /* ... existing handleAttack ... */
    if (!gameId || !playerId || (gameData && gameData.turn !== playerId)) {
      setError('Not your turn or game not ready.'); return;
    }
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/attack`, { playerId: playerId });
      console.log('Attack action sent. Waiting for WS update.');
    } catch (err) {
      console.error("Error during attack:", err);
      setError(err.response?.data?.message || 'Failed to perform attack.');
    }
  };

  const handleSwitchPokemon = (newActivePokemonIndex) => { /* ... existing handleSwitchPokemon ... */
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`[WS Send] Switching to Pokemon at index: ${newActivePokemonIndex}`);
        socket.send(JSON.stringify({
            type: 'switchPokemon',
            payload: { newActivePokemonIndex }
        }));
        setMessage("Attempting to switch Pokemon...");
    } else {
        setError("WebSocket not connected. Cannot switch Pokemon.");
    }
  };

  const handleCopyGameId = () => {
    if (!gameId) {
        setError('No Game ID to copy.');
        return;
    }
    navigator.clipboard.writeText(gameId).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Game ID'), 2000); // Reset after 2s
    }).catch(err => {
        console.error('Failed to copy Game ID: ', err);
        setError('Failed to copy Game ID. Please copy manually.');
        setCopyButtonText('Copy Failed');
        setTimeout(() => setCopyButtonText('Copy Game ID'), 2000);
    });
  };

  const [joinGameIdInput, setJoinGameIdInput] = useState('');

  const resetGame = (fullResetSocket = true) => { /* ... existing resetGame ... */
    if (fullResetSocket && socket) socket.close(1000, "Game reset by user");
    if (fullResetSocket) setSocket(null);
    setGameState('initial');
    setGameId(null);
    setPlayerId(null);
    setGameData(null);
    setMessage('');
    setError('');
    setJoinGameIdInput('');
    setIsLoading(false);
    setIsWsLoading(false);
    setNewGameMaxTeamSize(ABSOLUTE_MAX_TEAM_SIZE);
    setNewGameBattleType('1v1');
    setCopyButtonText('Copy Game ID'); // Reset copy button text
  };

  const manualConnectButton = ( /* ... existing manualConnectButton ... */
    <button onClick={() => fetchGameStateHTTP(gameId)} disabled={isWsLoading || isLoading}>
      {isWsLoading ? 'Connecting...' : 'Reconnect WS / Refresh via HTTP'}
    </button>
  );

  const currentPlayer = gameData?.players?.find(p => p.id === playerId);
  let selectionPhaseGlobalMessage = null;
  if (gameState === 'selecting_pokemon' && gameData) { /* ... existing selectionPhaseGlobalMessage logic ... */
    const opponentPlayer = gameData?.players?.find(p => p.id !== playerId);
    const currentPlayerPartySelected = !!currentPlayer?.hasSelectedParty;
    const opponentPlayerPartySelected = !!opponentPlayer?.hasSelectedParty;
    const teamSizeMsg = `(max ${gameData.maxTeamSize || ABSOLUTE_MAX_TEAM_SIZE})`;

    if (currentPlayerPartySelected && !opponentPlayerPartySelected) {
      selectionPhaseGlobalMessage = `Your team ${teamSizeMsg} is confirmed! Waiting for opponent...`;
    } else if (currentPlayerPartySelected && opponentPlayerPartySelected) {
      selectionPhaseGlobalMessage = `Both players selected teams ${teamSizeMsg}! Preparing for battle...`;
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Battle Game</h1>
        {gameId && (
          <div className="game-info-header">
            <span>Game ID: {gameId}</span>
            <button onClick={handleCopyGameId} className="copy-game-id-button" disabled={copyButtonText !== 'Copy Game ID'}>
              {copyButtonText}
            </button>
            <span> | Player: {playerId} | Socket: {socket?.readyState ?? 'N/A'} {isWsLoading ? '(Connecting...)' : ''}</span>
          </div>
        )}
      </header>
      <main>
        {(isLoading || isWsLoading) && <p className="loading-message">{message || (isWsLoading ? 'Connecting to server...' : 'Loading game data...')}</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !isWsLoading && message && !error && <p className="message">{message}</p>}
        {selectionPhaseGlobalMessage && !error && <p className="selection-status-message">{selectionPhaseGlobalMessage}</p>}

        {gameState === 'initial' && !gameData && (
          <div className="initial-actions">
            <div className="game-settings-form">
              <h3>New Game Settings</h3>
              <div className="setting-item">
                <label htmlFor="teamSize">Number of Pokemon (1-{ABSOLUTE_MAX_TEAM_SIZE}): </label>
                <select
                  id="teamSize"
                  value={newGameMaxTeamSize}
                  onChange={(e) => setNewGameMaxTeamSize(parseInt(e.target.value, 10))}
                  disabled={isLoading || isWsLoading}
                >
                  {[...Array(ABSOLUTE_MAX_TEAM_SIZE).keys()].map(i => (
                    <option key={i+1} value={i+1}>{i+1}</option>
                  ))}
                </select>
              </div>
              <div className="setting-item">
                <label htmlFor="battleType">Battle Type: </label>
                <select
                  id="battleType"
                  value={newGameBattleType}
                  onChange={(e) => setNewGameBattleType(e.target.value)}
                  disabled={isLoading || isWsLoading}
                >
                  <option value="1v1">1v1</option>
                  <option value="2v2" disabled>2v2 (Coming soon!)</option>
                </select>
              </div>
            </div>
            <button onClick={createNewGame} disabled={isLoading || isWsLoading} style={{marginTop:'10px'}}>Create New Game</button>
            <hr style={{margin: '20px 0'}}/>
            <h4>Or Join Existing Game</h4>
            <div>
              <input type="text" placeholder="Enter Game ID to Join" value={joinGameIdInput} onChange={(e) => setJoinGameIdInput(e.target.value)} disabled={isLoading || isWsLoading}/>
              <button onClick={() => joinGame(joinGameIdInput, 'player2')} disabled={isLoading || isWsLoading || !joinGameIdInput}>Join Game</button>
            </div>
          </div>
        )}

        {gameState !== 'initial' && !gameData && (isLoading || isWsLoading) && (
            <p className="loading-message">{message || "Loading game details..."}</p>
        )}

        {(gameState === 'waiting_for_opponent' || gameState === 'opponent_disconnected') && gameData && (
          <div>
            {/* The message state now includes Game ID when waiting */}
            {(!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING)) && manualConnectButton}
          </div>
        )}

        {gameState === 'selecting_pokemon' && gameData && gameId && playerId && (
          <PokemonSelection
            onTeamConfirmed={handleTeamSelected}
            playerId={playerId}
            gameId={gameId}
            gameData={gameData}
            isLoading={isLoading || isWsLoading}
          />
        )}

        {gameData && gameState === 'waiting_for_switch' && gameData.turn === playerId && currentPlayer && (
            <PokemonSwitchUI
                playerParty={currentPlayer.party}
                activePokemonIndex={currentPlayer.activePokemonIndex}
                onPokemonSwitchSelected={handleSwitchPokemon}
            />
        )}

        {(gameState === 'battle' || gameState === 'finished') && gameData && playerId && (
          <BattleUI gameData={gameData} playerId={playerId} onAttack={handleAttack} isLoading={isLoading || isWsLoading} />
        )}

        {gameState !== 'initial' && (
            <button onClick={() => resetGame(true)} style={{marginTop: '20px', backgroundColor: '#7f8c8d'}}>
                Reset Game & Disconnect
            </button>
        )}
      </main>
    </div>
  );
}

export default App;
