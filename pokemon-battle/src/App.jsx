import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PokemonSelection from './components/PokemonSelection';
import BattleUI from './components/BattleUI';
import PokemonSwitchUI from './components/PokemonSwitchUI'; // Import the new component

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
    const currentPlayer = newGameData.players?.find(p => p.id === playerId);
    const opponentPlayer = newGameData.players?.find(p => p.id !== playerId); // Added for clarity
    const currentPlayerPartySelected = !!currentPlayer?.hasSelectedParty;
    const opponentPlayerPartySelected = !!opponentPlayer?.hasSelectedParty; // Added for clarity


    if (sourceMessage === "WebSocket Game Update") {
        statusMessage = `Game state: ${newGameData.state}.`;
    } else {
        statusMessage = sourceMessage || `Game state: ${newGameData.state}.`;
    }

    if (newGameData.state === 'battle') {
      statusMessage = `Battle ongoing! Turn: ${newGameData.turn === playerId ? 'Your' : "Opponent's"} turn.`;
    } else if (newGameData.state === 'selecting_pokemon') {
      if (currentPlayerPartySelected && !opponentPlayerPartySelected) {
        statusMessage = "Your team is confirmed! Waiting for opponent to select their team...";
      } else if (!currentPlayerPartySelected) {
        statusMessage = "Select your team of Pokemon.";
      } else {
        statusMessage = "Both players have selected teams! Starting battle soon...";
      }
       if (newGameData.players.length < 2 && !currentPlayerPartySelected) statusMessage = "Waiting for opponent to join...";
    } else if (newGameData.state === 'waiting_for_opponent') {
        statusMessage = `Game ID: ${newGameData.id}. Waiting for opponent to join.`;
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

  useEffect(() => {
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
  }, [socket, gameId, playerId, gameState]);

  const connectWebSocket = (currentGId, currentPId) => {
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

  const fetchGameStateHTTP = async (currentGID) => {
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

  const handleTeamSelected = async (selectedTeamNames) => {
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

  const handleAttack = async () => {
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

  const handleSwitchPokemon = (newActivePokemonIndex) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log(`[WS Send] Switching to Pokemon at index: ${newActivePokemonIndex}`);
        socket.send(JSON.stringify({
            type: 'switchPokemon',
            payload: { newActivePokemonIndex }
        }));
        setMessage("Attempting to switch Pokemon...");
        // Optional: Add a short isLoading for this action if desired
    } else {
        setError("WebSocket not connected. Cannot switch Pokemon.");
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

  const currentPlayer = gameData?.players?.find(p => p.id === playerId);
  const opponentPlayer = gameData?.players?.find(p => p.id !== playerId);
  const currentPlayerPartySelected = !!currentPlayer?.hasSelectedParty;

  let selectionPhaseGlobalMessage = null;
  if (gameState === 'selecting_pokemon' && gameData) {
    const opponentPlayerPartySelected = !!opponentPlayer?.hasSelectedParty;
    if (currentPlayerPartySelected && !opponentPlayerPartySelected) {
      selectionPhaseGlobalMessage = "Your team is confirmed! Waiting for opponent to select their team...";
    } else if (currentPlayerPartySelected && opponentPlayerPartySelected) {
      selectionPhaseGlobalMessage = "Both players have selected teams! Preparing for battle...";
    }
  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Battle Game</h1>
        {gameId && <p className="game-info-header">Game: {gameId} | Player: {playerId} | Socket: {socket?.readyState ?? 'N/A'} {isWsLoading ? '(Connecting...)' : ''}</p>}
      </header>
      <main>
        {(isLoading || isWsLoading) && <p className="loading-message">{message || (isWsLoading ? 'Connecting to server...' : 'Loading game data...')}</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !isWsLoading && message && !error && <p className="message">{message}</p>}
        {selectionPhaseGlobalMessage && !error && <p className="selection-status-message">{selectionPhaseGlobalMessage}</p>}


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

        {(gameState === 'waiting_for_opponent' || gameState === 'opponent_disconnected') && gameData && (
          <div>
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

        {/* Render PokemonSwitchUI when needed */}
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
