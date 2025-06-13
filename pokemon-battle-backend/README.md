# Pokemon Battle Backend

This project provides the backend services for a Pokemon battle game. It is built with Node.js and Express.

## Running the Project

To run the backend server:

1.  **Navigate to the backend directory:**
    ```bash
    cd pokemon-battle-backend
    ```

2.  **Install dependencies:**
    If you haven't already, install the necessary Node.js packages. This project uses `express` and `body-parser`.
    ```bash
    npm install
    ```

3.  **Start the server:**
    You can start the server directly using Node:
    ```bash
    node index.js
    ```
    Alternatively, if a start script is configured in `package.json` (e.g., `"start": "node index.js"`), you can use:
    ```bash
    npm start
    ```

The server will typically start on port 3000 by default.

This backend serves as the API for the Pokemon battle game frontend, handling game logic, Pokemon data, and battle mechanics. Ensure this server is running for the frontend application to function correctly.
