import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PokemonSelection from './components/PokemonSelection';
import BattleUI from './components/BattleUI';

const API_BASE_URL = 'http://localhost:3000';
const WS_BASE_URL = 'ws://localhost:3000';

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

  const updateFullGameState = (newGameData, sourceMessage = "") => {
    console.log(`[StateUpdate] Source: ${sourceMessage}`, newGameData);
    setGameData(newGameData);
    setGameState(newGameData.state);

    let statusMessage = "";
    if (sourceMessage === "WebSocket Game Update") {
        statusMessage = `Game state: ${newGameData.state}.`; // Base message from WS
    } else {
        statusMessage = sourceMessage || `Game state: ${newGameData.state}.`;
    }

    // More specific messages based on state
    const currentPlayer = newGameData.players?.find(p => p.id === playerId);
    const opponentPlayer = newGameData.players?.find(p => p.id !== playerId);
    const currentPlayerSelected = !!currentPlayer?.pokemon;
    const opponentPlayerSelected = !!opponentPlayer?.pokemon;

    if (newGameData.state === 'battle') {
      statusMessage = `Battle ongoing! Turn: ${newGameData.turn}.`;
    } else if (newGameData.state === 'selecting_pokemon') {
      if (currentPlayerSelected && !opponentPlayerSelected) {
        statusMessage = "Selection Confirmed! Waiting for opponent to select their Pokemon...";
      } else if (!currentPlayerSelected) {
        statusMessage = "Select your Pokemon.";
      } else { // Both selected, should transition to battle soon
        statusMessage = "Both players selected! Starting battle...";
      }
       if (newGameData.players.length < 2 && !currentPlayerSelected) statusMessage = "Waiting for opponent to join...";
    } else if (newGameData.state === 'waiting_for_other_player_selection') {
        // This state might be redundant if selecting_pokemon handles it well with player checks
        statusMessage = "Waiting for opponent to select Pokemon.";
    } else if (newGameData.state === 'waiting_for_opponent') {
        statusMessage = `Game ID: ${newGameData.id}. Waiting for opponent to join.`;
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

  useEffect(() => {
    if (!socket) {
      if (isWsLoading) setIsWsLoading(false);
      return;
    }

    socket.onopen = () => {
      console.log(`[WebSocket] Connected for game ${gameId}, player ${playerId}`);
      setMessage(prev => `WebSocket connected. Waiting for initial game data...`);
      setIsWsLoading(false); // No longer "loading" the connection itself
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
          // setMessage(prev => `Server: ${data.message}. ${prev}`); // Can be noisy
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
          setMessage("WebSocket connection closed.");
      }
      setIsWsLoading(false);
      setSocket(null);
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err.message || 'Unknown WS error');
      setError("WebSocket connection error. Try reconnecting or reset.");
      setIsWsLoading(false);
    };
  }, [socket, gameId, playerId, gameState]); // Added gameState to dependencies

  const connectWebSocket = (currentGId, currentPId) => {
    if (!currentGId || !currentPId) {
      console.log('[WebSocket] Connect: gameId or playerId missing.'); return;
    }
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) && socket.url.includes(`gameId=${currentGId}&playerId=${currentPId}`)) {
      console.log('[WebSocket] Already connected/connecting with same parameters.');
      if(socket.readyState === WebSocket.OPEN) setIsWsLoading(false); // Ensure loading is false if already open
      return;
    }
    if (socket) socket.close(1000, "New connection requested");

    setIsWsLoading(true);
    setMessage(`Attempting to connect to game server (Game: ${currentGId})...`);
    setError('');
    const socketUrl = `${WS_BASE_URL}?gameId=${currentGId}&playerId=${currentPId}`;
    setSocket(new WebSocket(socketUrl));
  };

  useEffect(() => {
    const s = socket;
    return () => { if (s) s.close(1000, "Component unmounting"); };
  }, [socket]);


  const createNewGame = async () => {
    setIsLoading(true); setError(''); setMessage('Creating new game...');
    resetGame(false);

    try {
      const httpResponse = await axios.post(`${API_BASE_URL}/game`);
      const newGameId = httpResponse.data.gameId;
      const newPlayerId = 'player1';

      setGameId(newGameId);
      setPlayerId(newPlayerId);
      console.log("Game created via HTTP:", newGameId, "Player ID:", newPlayerId);

      const joinResponse = await axios.post(`${API_BASE_URL}/game/${newGameId}/join`, { playerId: newPlayerId });
      console.log("Creator joined game via HTTP:", joinResponse.data);
      setMessage(`Game ${newGameId} created. Waiting for server connection...`);
      connectWebSocket(newGameId, newPlayerId);
    } catch (err) {
      console.error("Error creating/joining game:", err);
      setError(err.response?.data?.message || 'Failed to create or join game.');
      resetGame();
    }
  };

  const joinGame = async (gameIdToJoin, newPlayerId) => {
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
      setMessage(`Successfully joined game ${gameIdToJoin}. Waiting for server connection...`);
      connectWebSocket(gameIdToJoin, newPlayerId);
    } catch (err) {
      console.error(`Error joining game ${gameIdToJoin}:`, err);
      setError(err.response?.data?.message || `Failed to join game.`);
      resetGame();
    }
  };

  const fetchGameStateHTTP = async (currentGID) => { // Primarily for manual reconnect/refresh
    if (!currentGID || !playerId) { // Added playerId check
      setError("Cannot refresh: Game ID or Player ID is missing."); setIsLoading(false); return;
    }
    setIsLoading(true); setError('');
    setMessage(`Attempting HTTP refresh for game ${currentGID}...`);
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${currentGID}`);
      updateFullGameState(response.data, "HTTP state refresh.");
      if (response.data.state !== 'initial' && response.data.state !== 'finished') {
        connectWebSocket(currentGID, playerId); // Ensure WS is connected
      }
    } catch (err) {
      console.error("Error fetching game state via HTTP:", err);
      setError(err.response?.data?.message || "Could not fetch game state via HTTP.");
      if (err.response?.status === 404) resetGame();
      else setIsLoading(false);
    }
  };

  const handlePokemonSelected = async (selectedPokemon) => {
    if (!gameId || !playerId || !selectedPokemon) {
      setError('Game/Player ID or Pokemon not set.'); return;
    }
    setError('');
    setMessage(`Sending selection: ${selectedPokemon.name}...`); // Optimistic message
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/select-pokemon`,
        { playerId: playerId, pokemonName: selectedPokemon.name }
      );
      console.log(`Selection of ${selectedPokemon.name} sent. Waiting for WS update.`);
      // Message will be updated by WS gameStateUpdate
    } catch (err) {
      console.error("Error confirming Pokemon selection:", err);
      setError(err.response?.data?.message || 'Failed to confirm selection.');
    }
  };

  const handleAttack = async () => {
    if (!gameId || !playerId || (gameData && gameData.turn !== playerId)) {
      setError('Not your turn or game not ready.'); return;
    }
    setError('');
    // setMessage("Sending attack..."); // Optional optimistic
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/attack`, { playerId: playerId });
      console.log('Attack action sent. Waiting for WS update.');
    } catch (err) {
      console.error("Error during attack:", err);
      setError(err.response?.data?.message || 'Failed to perform attack.');
    }
  };

  const [joinGameIdInput, setJoinGameIdInput] = useState('');

  const resetGame = (fullResetSocket = true) => {
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
  };

  const manualConnectButton = (
    <button onClick={() => fetchGameStateHTTP(gameId)} disabled={isWsLoading || isLoading}>
      {isWsLoading ? 'Connecting...' : 'Reconnect WS / Refresh via HTTP'}
    </button>
  );

  // Determine selection status for UI messages
  const currentPlayer = gameData?.players?.find(p => p.id === playerId);
  const opponentPlayer = gameData?.players?.find(p => p.id !== playerId);
  const currentPlayerSelected = !!currentPlayer?.pokemon;
  const opponentPlayerSelected = !!opponentPlayer?.pokemon;

  let selectionPhaseMessage = null;
  if (gameState === 'selecting_pokemon' && gameData) {
    if (currentPlayerSelected && !opponentPlayerSelected) {
      selectionPhaseMessage = "Your selection is confirmed! Waiting for opponent...";
    } else if (currentPlayerSelected && opponentPlayerSelected) {
      selectionPhaseMessage = "Both players have selected! Starting battle...";
    }
    // If !currentPlayerSelected, the PokemonSelection component shows "Select Your Pokemon"
  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Battle Game</h1>
        {gameId && <p className="game-info-header">Game: {gameId} | Player: {playerId} | Socket: {socket?.readyState ?? 'N/A'} {isWsLoading ? '(Connecting...)' : ''}</p>}
      </header>
      <main>
        {/* Combined Loading/Status Area */}
        {(isLoading || isWsLoading) && <p className="loading-message">{message || (isWsLoading ? 'Connecting to server...' : 'Loading game data...')}</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !isWsLoading && message && !error && <p className="message">{message}</p>}
        {selectionPhaseMessage && !error && <p className="selection-status-message">{selectionPhaseMessage}</p>}


        {gameState === 'initial' && !gameData && (
          <div className="initial-actions">
            <button onClick={createNewGame} disabled={isLoading || isWsLoading}>Create New Game</button>
            <hr style={{margin: '20px 0'}}/>
            <div>
              <input type="text" placeholder="Enter Game ID to Join" value={joinGameIdInput} onChange={(e) => setJoinGameIdInput(e.target.value)} disabled={isLoading || isWsLoading}/>
              <button onClick={() => joinGame(joinGameIdInput, 'player2')} disabled={isLoading || isWsLoading || !joinGameIdInput}>Join Game</button>
            </div>
          </div>
        )}

        {gameState !== 'initial' && !gameData && (isLoading || isWsLoading) && (
            <p className="loading-message">{message || "Loading game details..."}</p>
        )}

        {/* Waiting for opponent to join (before selection starts) or if opponent disconnected */}
        {(gameState === 'waiting_for_opponent' || gameState === 'opponent_disconnected') && gameData && (
          <div>
            {/* Main message will cover this from updateFullGameState */}
            {(!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING)) && manualConnectButton}
          </div>
        )}

        {gameState === 'selecting_pokemon' && gameData && gameId && playerId && (
          <PokemonSelection
            onSelectionConfirmed={handlePokemonSelected}
            playerId={playerId}
            gameId={gameId}
            gameData={gameData} // Pass gameData down
            isLoading={isLoading}
          />
        )}

        {/* This state might be covered by selecting_pokemon + player checks */}
        {/* {gameState === 'waiting_for_other_player_selection' && gameData && ( ... )} */}


        {(gameState === 'battle' || gameState === 'finished') && gameData && playerId && (
          <BattleUI gameData={gameData} playerId={playerId} onAttack={handleAttack} isLoading={isLoading} />
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
