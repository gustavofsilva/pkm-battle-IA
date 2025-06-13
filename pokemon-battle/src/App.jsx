import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PokemonSelection from './components/PokemonSelection';
import BattleUI from './components/BattleUI'; // Import BattleUI

// Configuration for the backend API URL
const API_BASE_URL = 'http://localhost:3000';

function App() {
  const [gameState, setGameState] = useState('initial'); // initial, creating_game, waiting_for_opponent, selecting_pokemon, battle, finished
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameData, setGameData] = useState(null); // To store the full game state from backend

  // Function to create a new game
  const createNewGame = async () => {
    setIsLoading(true);
    setError('');
    setMessage('Creating game...');
    try {
      const response = await axios.post(`${API_BASE_URL}/game`);
      const newGameId = response.data.gameId;
      setGameId(newGameId);
      const newPlayerId = 'player1'; // Creator is player1
      setPlayerId(newPlayerId);
      // setMessage(`Game created: ${newGameId}. Joining as ${newPlayerId}...`);
      console.log("Game created:", response.data);
      await joinGame(newGameId, newPlayerId, true); // Auto-join creator
    } catch (err) {
      console.error("Error creating game:", err);
      setError(err.response?.data?.message || 'Failed to create game. Is the backend server running?');
      setMessage('');
      setGameState('initial');
    } finally {
      // setIsLoading(false); // setIsLoading is handled by joinGame or fetchGameState
    }
  };

  // Function to join an existing game
  const joinGame = async (gameIdToJoin, newPlayerId, isCreator = false) => {
    if (!gameIdToJoin) {
      setError("Please enter a Game ID to join.");
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage(`Joining game ${gameIdToJoin} as ${newPlayerId}...`);
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${gameIdToJoin}/join`, { playerId: newPlayerId });
      setGameId(gameIdToJoin); // Set gameId from the input/creation
      setPlayerId(newPlayerId); // Set player ID
      // Message will be updated by fetchGameState
      console.log("Game joined response:", response.data);
      await fetchGameState(gameIdToJoin, response.data.message); // Fetch state to confirm and get game data
    } catch (err) {
      console.error(`Error joining game ${gameIdToJoin}:`, err);
      setError(err.response?.data?.message || `Failed to join game. Ensure Game ID is correct and backend is running.`);
      if (isCreator) {
        setGameState('initial');
        setGameId(null);
        setPlayerId(null);
      }
      setMessage('');
      setIsLoading(false);
    }
  };

  // Function to fetch the current game state
  const fetchGameState = async (currentGamId, initialMessage = '') => {
    if (!currentGamId) {
        setError("No game ID to fetch state for.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(''); // Clear previous errors
    // setMessage(prev => initialMessage || prev || "Fetching game state...");
    let currentMsg = initialMessage || "Fetching game state...";

    try {
      const response = await axios.get(`${API_BASE_URL}/game/${currentGamId}`);
      const fetchedGameData = response.data;
      setGameData(fetchedGameData);
      setGameState(fetchedGameData.state);
      setGameId(currentGamId); // Ensure gameId is set from fetched data if not already

      currentMsg += ` Current state: ${fetchedGameData.state}.`;
      if (fetchedGameData.state === 'battle') {
        currentMsg += ` It's ${fetchedGameData.turn}'s turn.`;
      } else if (fetchedGameData.state === 'selecting_pokemon') {
         currentMsg += ` Waiting for players to select Pokemon.`;
      } else if (fetchedGameData.state === 'waiting_for_opponent') {
        currentMsg += ` Game ID: ${currentGamId}. Waiting for opponent...`;
      } else if (fetchedGameData.state === 'finished') {
        currentMsg += ` Winner: ${fetchedGameData.winner}!`;
      }
      setMessage(currentMsg);
      console.log("Game state fetched:", fetchedGameData);
    } catch (err) {
      console.error("Error fetching game state:", err);
      setError(err.response?.data?.message || "Could not fetch game state.");
      // Don't reset gameId/playerId here unless game not found
      if (err.response?.status === 404) {
        setMessage('');
        setGameId(null); // Reset gameId if not found
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for when Pokemon selection is confirmed
  const handlePokemonSelected = async (selectedPokemon) => {
    if (!gameId || !playerId || !selectedPokemon) {
      setError('Game ID, Player ID, or Pokemon not set. Cannot confirm selection.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage(`Confirming selection of ${selectedPokemon.name}...`);
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${gameId}/select-pokemon`, {
        playerId: playerId,
        pokemonName: selectedPokemon.name
      });
      // setMessage(response.data.message); // Message will be updated by fetchGameState
      console.log("Pokemon selection response:", response.data);
      await fetchGameState(gameId, response.data.message); // Refresh game state
    } catch (err) {
      console.error("Error confirming Pokemon selection:", err);
      setError(err.response?.data?.message || 'Failed to confirm Pokemon selection.');
      setMessage('');
      setIsLoading(false);
    }
  };

  // Handler for attack button
  const handleAttack = async () => {
    if (!gameId || !playerId) {
      setError('Game ID or Player ID not set. Cannot attack.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('Attacking...');
    try {
      const response = await axios.post(`${API_BASE_URL}/game/${gameId}/attack`, {
        playerId: playerId,
        // attackName: "basic_attack" // Optional: can be expanded later
      });
      // setMessage(response.data.message); // Message will be updated by fetchGameState
      console.log("Attack response:", response.data);
      await fetchGameState(gameId, response.data.message); // Refresh game state
    } catch (err) {
      console.error("Error during attack:", err);
      setError(err.response?.data?.message || 'Failed to perform attack.');
      // setMessage(''); // Keep last successful message or error message
      setIsLoading(false); // Explicitly set loading to false on error
      // It's possible fetchGameState above might not be called if error is here.
      // So, ensure UI can recover or show the error.
      // We might want to call fetchGameState even in catch if game still exists
      if (gameId) {
          await fetchGameState(gameId, err.response?.data?.message || 'Failed to perform attack.');
      }
    }
  };

  const [joinGameIdInput, setJoinGameIdInput] = useState('');

  const resetGame = () => {
    setGameState('initial');
    setGameId(null);
    setPlayerId(null);
    setGameData(null);
    setMessage('');
    setError('');
    setJoinGameIdInput('');
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Battle Game</h1>
        {gameId && <p className="game-info-header">Game ID: {gameId} | Your Player ID: {playerId}</p>}
      </header>
      <main>
        {isLoading && <p className="loading-message">Loading...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {message && !error && <p className="message">{message}</p>} {/* Show message if no error or if error is shown separately */}


        {gameState === 'initial' && (
          <div className="initial-actions">
            <button onClick={createNewGame} disabled={isLoading}>Create New Game</button>
            <hr style={{margin: '20px 0'}}/>
            <div>
              <input
                type="text"
                placeholder="Enter Game ID to Join"
                value={joinGameIdInput}
                onChange={(e) => setJoinGameIdInput(e.target.value)}
                disabled={isLoading}
              />
              <button onClick={() => joinGame(joinGameIdInput, 'player2')} disabled={isLoading || !joinGameIdInput}>Join Game</button>
            </div>
          </div>
        )}

        {(gameState === 'waiting_for_opponent' && gameData) && (
          <div>
            <p>Share Game ID: <strong>{gameData.id}</strong> with your opponent.</p>
            <p>Waiting for opponent to join...</p>
            <button onClick={() => fetchGameState(gameData.id)} disabled={isLoading}>Refresh Status</button>
          </div>
        )}

        {gameState === 'selecting_pokemon' && gameId && playerId && (
          <PokemonSelection
            onSelectionConfirmed={handlePokemonSelected}
            playerId={playerId}
            gameId={gameId}
            // isLoading={isLoading} // Pass loading if PokemonSelection needs it
          />
        )}

        {gameState === 'waiting_for_other_player_selection' && gameData && (
            <div>
                <p>Waiting for the other player to select their Pokemon...</p>
                {gameData?.players?.find(p=>p.id === playerId)?.pokemon &&
                  <p>Your Pokemon: {gameData.players.find(p=>p.id === playerId).pokemon.name}</p>
                }
                <button onClick={() => fetchGameState(gameId)} disabled={isLoading}>Refresh Status</button>
            </div>
        )}

        {(gameState === 'battle' || gameState === 'finished') && gameData && playerId && (
          <BattleUI
            gameData={gameData}
            playerId={playerId}
            onAttack={handleAttack}
            isLoading={isLoading}
          />
        )}

        {/* Universal refresh button if gameId exists and not initial state */}
        {gameState !== 'initial' && gameId && (
             <button onClick={() => fetchGameState(gameId)} disabled={isLoading} style={{marginTop: '20px'}}>
                Refresh Game State
            </button>
        )}

        {/* Button to go back to home/reset */}
        {gameState !== 'initial' && (
            <button onClick={resetGame} style={{marginTop: '10px', backgroundColor: '#7f8c8d'}}>
                Reset and Go Home
            </button>
        )}

      </main>
    </div>
  );
}

export default App;
