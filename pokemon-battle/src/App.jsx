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
    setGameData(newGameData);
    setGameState(newGameData.state);

    let statusMessage = sourceMessage || `Game state: ${newGameData.state}.`;
    if (newGameData.state === 'battle') {
      statusMessage = `Battle ongoing! Turn: ${newGameData.turn}.`;
    } else if (newGameData.state === 'selecting_pokemon') {
      statusMessage = "Select your Pokemon.";
    } else if (newGameData.state === 'waiting_for_other_player_selection') {
        statusMessage = "Waiting for opponent to select Pokemon.";
    } else if (newGameData.state === 'waiting_for_opponent') {
        statusMessage = `Game ID: ${newGameData.id}. Waiting for opponent to join and connect.`;
    } else if (newGameData.state === 'finished') {
      statusMessage = `Game Over! Winner: ${newGameData.winner}!`;
      if (newGameData.winner === playerId) {
        statusMessage = "Congratulations, you won!";
      } else {
        statusMessage = "You lost. Better luck next time!";
      }
    } else if (newGameData.state === 'opponent_disconnected') {
        statusMessage = "Opponent disconnected. Waiting for them to rejoin or game may be reset.";
    }

    setMessage(statusMessage);
    setIsLoading(false);
    setIsWsLoading(false);
    console.log(`[StateUpdate] Source: ${sourceMessage || 'WS'}`, newGameData);
  };

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log(`[WebSocket] Connected: game ${gameId}, player ${playerId}`);
      setMessage(prev => `WebSocket connected. ${prev}`);
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
          setMessage(prev => `Server: ${data.message}. ${prev}`);
        } else if (data.type === 'error') {
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
      // Only set message if game was active, not on initial cleanup/reset
      if (gameId && gameState !== 'initial' && gameState !== 'finished') {
          setMessage(prev => "WebSocket disconnected. Game may be interrupted.");
          // Consider if game state should change to 'opponent_disconnected' or similar
          // This might be better handled by a specific server message if one player disconnects mid-game
      }
      setIsWsLoading(false);
      // setSocket(null); // Let main cleanup or connectWebSocket handle this
    };

    socket.onerror = (err) => {
      console.error('[WebSocket] Error:', err.message || 'Unknown WS error');
      setError("WebSocket connection error. See console.");
      setIsWsLoading(false);
    };
  }, [socket, gameId, playerId]); // Dependencies for context within handlers

  const connectWebSocket = (currentGId, currentPId) => {
    if (!currentGId || !currentPId) {
      console.log('[WebSocket] Connect: gameId or playerId missing.'); return;
    }
    if (socket && socket.readyState === WebSocket.OPEN && socket.url.includes(`gameId=${currentGId}&playerId=${currentPId}`)) {
      console.log('[WebSocket] Already connected with same parameters.'); return;
    }
    if (socket) socket.close();

    setIsWsLoading(true);
    setMessage(prev => `Connecting to game server... ${prev}`);
    const socketUrl = `${WS_BASE_URL}?gameId=${currentGId}&playerId=${currentPId}`;
    console.log(`[WebSocket] Attempting to connect to ${socketUrl}`);
    setSocket(new WebSocket(socketUrl));
  };

  useEffect(() => { // Main cleanup effect
    return () => { if (socket) socket.close(); };
  }, [socket]);


  const createNewGame = async () => {
    setIsLoading(true); setError(''); setMessage('Creating new game...');
    resetGame(false); // Soft reset, keep socket for now, joinGame will handle it

    try {
      const response = await axios.post(`${API_BASE_URL}/game`);
      const newGameId = response.data.gameId;
      const newPlayerId = 'player1';
      // Set Ids immediately for joinGame to use
      setGameId(newGameId);
      setPlayerId(newPlayerId);
      console.log("Game created:", newGameId, "Player ID:", newPlayerId);
      await joinGame(newGameId, newPlayerId, true);
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err.response?.data?.message || 'Failed to create game.');
      resetGame();
    }
  };

  const joinGame = async (gameIdToJoin, newPlayerId, isCreator = false) => {
    if (!gameIdToJoin) {
      setError("Please enter a Game ID."); setIsLoading(false); return;
    }
    setIsLoading(true); setError('');
    if (!isCreator) { // If not creator, this is a fresh join, reset prior game/socket
        resetGame(false); // Soft reset, keep socket for now
        setGameId(gameIdToJoin); // Set IDs for this new game attempt
        setPlayerId(newPlayerId);
    }
    setMessage(`Joining game ${gameIdToJoin} as ${newPlayerId}...`);
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${gameIdToJoin}/join`, { playerId: newPlayerId });
      // gameId and playerId are already set
      console.log("Game joined HTTP response:", response.data);
      await fetchGameState(gameIdToJoin, `Joined game ${gameIdToJoin}. ${response.data.message}`);
    } catch (err) {
      console.error(`Error joining game ${gameIdToJoin}:`, err);
      setError(err.response?.data?.message || `Failed to join game.`);
      resetGame();
    }
  };

  const fetchGameState = async (currentGID, initialMessage = '') => {
    if (!currentGID) {
      setError("No game ID to fetch state for."); setIsLoading(false); return;
    }
    setIsLoading(true); // For HTTP fetch
    try {
      const response = await axios.get(`${API_BASE_URL}/game/${currentGID}`);
      const fetchedGameData = response.data;
      updateFullGameState(fetchedGameData, initialMessage || "Fetched game state via HTTP.");

      if (currentGID && playerId && (fetchedGameData.state !== 'initial' && fetchedGameData.state !== 'finished')) {
        connectWebSocket(currentGID, playerId);
      }
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError(err.response?.data?.message || "Could not fetch game state.");
      if (err.response?.status === 404) resetGame();
      else setIsLoading(false);
    }
  };

  const handlePokemonSelected = async (selectedPokemon) => {
    if (!gameId || !playerId || !selectedPokemon) {
      setError('Game/Player ID or Pokemon not set.'); return;
    }
    setIsLoading(true); setError(''); setMessage(`Sending selection: ${selectedPokemon.name}...`);
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/select-pokemon`,
        { playerId: playerId, pokemonName: selectedPokemon.name }
      );
      console.log(`Selection of ${selectedPokemon.name} sent. Waiting for WS update.`);
      // setIsLoading(false) will be called by updateFullGameState from WS broadcast
    } catch (err) {
      console.error("Error confirming Pokemon selection:", err);
      setError(err.response?.data?.message || 'Failed to confirm selection.');
      setIsLoading(false);
    }
  };

  const handleAttack = async () => {
    if (!gameId || !playerId || (gameData && gameData.turn !== playerId)) {
      setError('Not your turn or game not ready.'); return;
    }
    // No setIsLoading(true) here; rely on WS for feedback if possible to avoid UI flicker.
    // If WS is slow, this might feel unresponsive. Consider a very short isLoading timeout.
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/game/${gameId}/attack`, { playerId: playerId });
      console.log('Attack action sent. Waiting for WS update.');
    } catch (err) {
      console.error("Error during attack:", err);
      setError(err.response?.data?.message || 'Failed to perform attack.');
      // Fetch state to resync if HTTP attack call itself fails
      await fetchGameState(gameId, "Error during attack, attempting to resync state.");
    }
  };

  const [joinGameIdInput, setJoinGameIdInput] = useState('');

  const resetGame = (fullResetSocket = true) => {
    if (fullResetSocket && socket) {
      socket.close();
      setSocket(null);
    } else if (!fullResetSocket && socket && socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING) {
      // If not a full reset, but socket is in a bad state, nullify it to allow reconnect
      setSocket(null);
    }
    setGameState('initial');
    setGameId(null);
    setPlayerId(null);
    setGameData(null);
    setMessage(''); // Clear messages on reset
    setError('');   // Clear errors on reset
    setJoinGameIdInput('');
    setIsLoading(false);
    setIsWsLoading(false);
  };

  // Button to manually attempt WebSocket connection if it failed or to refresh state
  const manualConnectButton = (
    <button onClick={() => fetchGameState(gameId, "Attempting to connect WebSocket and refresh state...")} disabled={isWsLoading || isLoading}>
      {isWsLoading ? 'Connecting WS...' : 'Connect WS / Refresh State'}
    </button>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Battle Game</h1>
        {gameId && <p className="game-info-header">Game: {gameId} | Player: {playerId} | Socket: {socket ? socket.readyState : 'N/A'} {isWsLoading ? '(Connecting...)' : ''}</p>}
      </header>
      <main>
        {isLoading && <p className="loading-message">Loading Game Data...</p>}
        {isWsLoading && !isLoading && <p className="loading-message">Connecting to Game Server...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {message && <p className="message">{message}</p>}

        {gameState === 'initial' && (
          <div className="initial-actions">
            <button onClick={createNewGame} disabled={isLoading || isWsLoading}>Create New Game</button>
            <hr style={{margin: '20px 0'}}/>
            <div>
              <input type="text" placeholder="Enter Game ID to Join" value={joinGameIdInput} onChange={(e) => setJoinGameIdInput(e.target.value)} disabled={isLoading || isWsLoading}/>
              <button onClick={() => joinGame(joinGameIdInput, 'player2')} disabled={isLoading || isWsLoading || !joinGameIdInput}>Join Game</button>
            </div>
          </div>
        )}

        {(gameState === 'waiting_for_opponent' && gameData) && (
          <div>
            {/* Message state handles this now */}
            {(!socket || socket.readyState !== WebSocket.OPEN) && manualConnectButton}
          </div>
        )}

        {gameState === 'selecting_pokemon' && gameId && playerId && (
          <PokemonSelection onSelectionConfirmed={handlePokemonSelected} playerId={playerId} gameId={gameId} />
        )}

        {(gameState === 'waiting_for_other_player_selection' || gameState === 'opponent_disconnected') && gameData && (
            <div>
                 {/* Message state handles this now */}
                {gameData?.players?.find(p=>p.id === playerId)?.pokemon &&
                  <p>Your Pokemon: {gameData.players.find(p=>p.id === playerId).pokemon.name}</p>
                }
                 {gameState === 'opponent_disconnected' && (!socket || socket.readyState !== WebSocket.OPEN) && manualConnectButton}
            </div>
        )}

        {(gameState === 'battle' || gameState === 'finished') && gameData && playerId && (
          <BattleUI gameData={gameData} playerId={playerId} onAttack={handleAttack} isLoading={isLoading /* Pass isLoading for attack button feedback */} />
        )}

        {/* Removed general refresh button. Reset button is kept. */}
        {/* A manual WS reconnect button can be useful if connection drops often */}
        {gameState !== 'initial' && gameId && (!socket || (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING)) && gameState !== 'finished' && (
             <div style={{marginTop: '20px'}}>
                <p>WebSocket not connected.</p>
                {manualConnectButton}
            </div>
        )}

        {gameState !== 'initial' && (
            <button onClick={() => resetGame(true)} style={{marginTop: '10px', backgroundColor: '#7f8c8d'}}>
                Reset Game & Disconnect
            </button>
        )}
      </main>
    </div>
  );
}

export default App;
