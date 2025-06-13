# AI-Generated Pokemon Battle Game

## Overview
This project is a two-player online Pokemon battle game. Players can connect, select a team of Pokemon, and engage in turn-based battles until one player's Pokemon are all defeated.

The game features a frontend interface for user interaction and a backend server to manage game logic and state.

## Architecture
The project is divided into two main parts:

*   **Frontend (`pokemon-battle/`)**: A React application built with Vite. It handles the user interface, allowing players to create/join games, select Pokemon, and view the battle.
*   **Backend (`pokemon-battle-backend/`)**: A Node.js application using the Express.js framework. It manages game sessions, player actions (like Pokemon selection and attacks), battle logic, and game state.

## Technologies Used
*   **Frontend**:
    *   React
    *   Vite
    *   JavaScript
    *   HTML/CSS
    *   Axios (for HTTP requests)
*   **Backend**:
    *   Node.js
    *   Express.js
    *   JavaScript
    *   Cors (for Cross-Origin Resource Sharing)

## Running the Project
To run the game, you need to start both the backend server and the frontend application.

1.  **Backend Setup:**
    *   Navigate to the `pokemon-battle-backend` directory.
    *   For detailed instructions, please see the `pokemon-battle-backend/README.md` file. (Typically involves `npm install` and then `npm start` or `node index.js`).

2.  **Frontend Setup:**
    *   Navigate to the `pokemon-battle` directory.
    *   For detailed instructions, please see the `pokemon-battle/README.md` file. (Typically involves `npm install` and then `npm run dev`).

Once both are running, you can usually access the game in your browser via the URL provided by the frontend development server (often `http://localhost:5173` or similar).

## Authorship
**All code in this repository was written by Jules, a Google AI.**

## Current Status
The game is currently in a Minimum Viable Product (MVP) state. Basic features include:
*   Game creation and joining.
*   Pokemon selection (one Pokemon per player for now).
*   Turn-based attack mechanics.
*   Win/loss conditions.

Further development could include features like multi-Pokemon teams, more complex battle mechanics, user accounts, etc.
