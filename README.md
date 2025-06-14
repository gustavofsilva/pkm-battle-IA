# Jogo de Batalha Pokémon Gerado por IA

## Visão Geral
Este projeto é um jogo de batalha Pokémon online para dois jogadores. Os jogadores podem se conectar, selecionar uma equipe de Pokémon e participar de batalhas baseadas em turnos até que todos os Pokémon de um jogador sejam derrotados.

O jogo apresenta uma interface frontend para interação do usuário e um servidor backend para gerenciar a lógica e o estado do jogo.

## Arquitetura
O projeto é dividido em duas partes principais:

*   **Frontend (`pokemon-battle/`)**: Uma aplicação React construída com Vite. Ele lida com a interface do usuário, permitindo aos jogadores criar/entrar em jogos, selecionar Pokémon e visualizar a batalha.
*   **Backend (`pokemon-battle-backend/`)**: Uma aplicação Node.js usando o framework Express.js. Ele gerencia as sessões de jogo, ações dos jogadores (como seleção de Pokémon e ataques), lógica de batalha e estado do jogo.

## Tecnologias Utilizadas
*   **Frontend**:
    *   React
    *   Vite
    *   JavaScript
    *   HTML/CSS
    *   Axios (para requisições HTTP)
*   **Backend**:
    *   Node.js
    *   Express.js
    *   JavaScript
    *   Cors (para Compartilhamento de Recursos de Origem Cruzada - Cross-Origin Resource Sharing)
    *   ws (para WebSockets)

## Executando o Projeto
Para executar o jogo, você precisa iniciar tanto o servidor backend quanto a aplicação frontend.

1.  **Configuração do Backend:**
    *   Navegue até o diretório `pokemon-battle-backend`.
    *   Para instruções detalhadas, consulte o arquivo `pokemon-battle-backend/README.md`. (Normalmente envolve `npm install` e depois `npm start` ou `node index.js`).

2.  **Configuração do Frontend:**
    *   Navegue até o diretório `pokemon-battle`.
    *   Para instruções detalhadas, consulte o arquivo `pokemon-battle/README.md`. (Normalmente envolve `npm install` e depois `npm run dev`).

Assim que ambos estiverem em execução, você geralmente pode acessar o jogo em seu navegador através da URL fornecida pelo servidor de desenvolvimento frontend (frequentemente `http://localhost:5173` ou similar).

## Autoria
**Todo o código neste repositório foi escrito por Jules, uma IA do Google.**

## Status Atual
O jogo está atualmente em um estado de Produto Mínimo Viável (MVP). As funcionalidades básicas incluem:
*   Criação e entrada em jogos.
*   Seleção de Pokémon (uma equipe de até 6 Pokémon por jogador, com tamanho da equipe definido na criação do jogo).
*   Mecânica de ataque baseada em turnos com seleção de movimentos.
*   Condições de vitória/derrota.
*   Comunicação em tempo real usando WebSockets para atualizações de estado do jogo.
*   Lógica de troca de Pokémon quando um Pokémon desmaia.
*   Efeitos básicos de status (veneno, queimadura, paralisia) e checagem de precisão dos movimentos.

Desenvolvimentos futuros podem incluir funcionalidades como mecânicas de batalha mais complexas (mais efeitos de movimentos, itens, habilidades Pokémon), contas de usuário, etc.

---
## English Version Below / Versão em Inglês Abaixo
---

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
    *   ws (for WebSockets)

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
*   Pokemon selection (a team of up to 6 Pokemon per player, with team size defined at game creation).
*   Turn-based attack mechanics with move selection.
*   Win/loss conditions.
*   Real-time communication using WebSockets for game state updates.
*   Pokemon switching logic when a Pokemon faints.
*   Basic status effects (poison, burn, paralysis) and move accuracy checks.

Further development could include features like more complex battle mechanics (more move effects, items, Pokemon abilities), user accounts, etc.
