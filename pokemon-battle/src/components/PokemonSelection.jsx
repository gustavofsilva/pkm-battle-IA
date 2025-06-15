import React, { useState, useEffect } from 'react';
import './PokemonSelection.css'; // Import the new CSS

// This POKEMON_DATA_FRONTEND will be an exact copy of POKEMON_DATA from the backend
const POKEMON_DATA_FRONTEND = {
  "venusaur": {
    "id": 3, "name": "venusaur",
    "stats": { "hp": 80, "attack": 82, "defense": 83, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
    "moves": [
      { "name": "Razor Leaf", "power": 55, "type": "Grass" }, { "name": "Sludge Bomb", "power": 90, "type": "Poison" },
      { "name": "Solar Beam", "power": 120, "type": "Grass" }, { "name": "Tackle", "power": 40, "type": "Normal" }
    ]
  },
  "charizard": {
    "id": 6, "name": "charizard",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    "moves": [
      { "name": "Flamethrower", "power": 90, "type": "Fire" }, { "name": "Air Slash", "power": 75, "type": "Flying" },
      { "name": "Dragon Claw", "power": 80, "type": "Dragon" }, { "name": "Scratch", "power": 40, "type": "Normal" }
    ]
  },
  "blastoise": {
    "id": 9, "name": "blastoise",
    "stats": { "hp": 79, "attack": 83, "defense": 100, "specialAttack": 85, "specialDefense": 105, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
    "moves": [
      { "name": "Hydro Pump", "power": 110, "type": "Water" }, { "name": "Ice Beam", "power": 90, "type": "Ice" },
      { "name": "Skull Bash", "power": 100, "type": "Normal" }, { "name": "Water Gun", "power": 40, "type": "Water" }
    ]
  },
  "butterfree": {
    "id": 12, "name": "butterfree",
    "stats": { "hp": 60, "attack": 45, "defense": 50, "specialAttack": 90, "specialDefense": 80, "speed": 70 },
    "types": ["bug", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "beedrill": {
    "id": 15, "name": "beedrill",
    "stats": { "hp": 65, "attack": 90, "defense": 40, "specialAttack": 45, "specialDefense": 80, "speed": 75 },
    "types": ["bug", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "pidgeot": {
    "id": 18, "name": "pidgeot",
    "stats": { "hp": 83, "attack": 80, "defense": 75, "specialAttack": 70, "specialDefense": 70, "speed": 101 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png",
    "moves": [ // Pidgeot might have Wing Attack instead of Strength in some lists, ensuring consistency
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Wing Attack", "power": 60, "type": "Flying" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "raticate": {
    "id": 20, "name": "raticate",
    "stats": { "hp": 55, "attack": 81, "defense": 60, "specialAttack": 50, "specialDefense": 70, "speed": 97 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "fearow": {
    "id": 22, "name": "fearow",
    "stats": { "hp": 65, "attack": 90, "defense": 65, "specialAttack": 61, "specialDefense": 61, "speed": 100 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "arbok": {
    "id": 24, "name": "arbok",
    "stats": { "hp": 60, "attack": 95, "defense": 69, "specialAttack": 65, "specialDefense": 79, "speed": 80 },
    "types": ["poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "raichu": {
    "id": 26, "name": "raichu",
    "stats": { "hp": 60, "attack": 90, "defense": 55, "specialAttack": 90, "specialDefense": 80, "speed": 110 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "sandslash": {
    "id": 28, "name": "sandslash",
    "stats": { "hp": 75, "attack": 100, "defense": 110, "specialAttack": 45, "specialDefense": 55, "speed": 65 },
    "types": ["ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "nidoqueen": {
    "id": 31, "name": "nidoqueen",
    "stats": { "hp": 90, "attack": 92, "defense": 87, "specialAttack": 75, "specialDefense": 85, "speed": 76 },
    "types": ["poison", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "nidoking": {
    "id": 34, "name": "nidoking",
    "stats": { "hp": 81, "attack": 102, "defense": 77, "specialAttack": 85, "specialDefense": 75, "speed": 85 },
    "types": ["poison", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "clefable": {
    "id": 36, "name": "clefable",
    "stats": { "hp": 95, "attack": 70, "defense": 73, "specialAttack": 95, "specialDefense": 90, "speed": 60 },
    "types": ["fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "ninetales": {
    "id": 38, "name": "ninetales",
    "stats": { "hp": 73, "attack": 76, "defense": 75, "specialAttack": 81, "specialDefense": 100, "speed": 100 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "wigglytuff": {
    "id": 40, "name": "wigglytuff",
    "stats": { "hp": 140, "attack": 70, "defense": 45, "specialAttack": 85, "specialDefense": 50, "speed": 45 },
    "types": ["normal", "fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "golbat": {
    "id": 42, "name": "golbat",
    "stats": { "hp": 75, "attack": 80, "defense": 70, "specialAttack": 65, "specialDefense": 75, "speed": 90 },
    "types": ["poison", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/42.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "vileplume": {
    "id": 45, "name": "vileplume",
    "stats": { "hp": 75, "attack": 80, "defense": 85, "specialAttack": 110, "specialDefense": 90, "speed": 50 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/45.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "parasect": {
    "id": 47, "name": "parasect",
    "stats": { "hp": 60, "attack": 95, "defense": 80, "specialAttack": 60, "specialDefense": 80, "speed": 30 },
    "types": ["bug", "grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/47.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "venomoth": {
    "id": 49, "name": "venomoth",
    "stats": { "hp": 70, "attack": 65, "defense": 60, "specialAttack": 90, "specialDefense": 75, "speed": 90 },
    "types": ["bug", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/49.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "dugtrio": {
    "id": 51, "name": "dugtrio",
    "stats": { "hp": 35, "attack": 100, "defense": 50, "specialAttack": 50, "specialDefense": 70, "speed": 120 },
    "types": ["ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/51.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "persian": {
    "id": 53, "name": "persian",
    "stats": { "hp": 65, "attack": 70, "defense": 60, "specialAttack": 65, "specialDefense": 65, "speed": 115 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "golduck": {
    "id": 55, "name": "golduck",
    "stats": { "hp": 80, "attack": 82, "defense": 78, "specialAttack": 95, "specialDefense": 80, "speed": 85 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "primeape": {
    "id": 57, "name": "primeape",
    "stats": { "hp": 65, "attack": 105, "defense": 60, "specialAttack": 60, "specialDefense": 70, "speed": 95 },
    "types": ["fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/57.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "arcanine": {
    "id": 59, "name": "arcanine",
    "stats": { "hp": 90, "attack": 110, "defense": 80, "specialAttack": 100, "specialDefense": 80, "speed": 95 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "poliwrath": {
    "id": 62, "name": "poliwrath",
    "stats": { "hp": 90, "attack": 95, "defense": 95, "specialAttack": 70, "specialDefense": 90, "speed": 70 },
    "types": ["water", "fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "alakazam": {
    "id": 65, "name": "alakazam",
    "stats": { "hp": 55, "attack": 50, "defense": 45, "specialAttack": 135, "specialDefense": 95, "speed": 120 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "machamp": {
    "id": 68, "name": "machamp",
    "stats": { "hp": 90, "attack": 130, "defense": 80, "specialAttack": 65, "specialDefense": 85, "speed": 55 },
    "types": ["fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "victreebel": {
    "id": 71, "name": "victreebel",
    "stats": { "hp": 80, "attack": 105, "defense": 65, "specialAttack": 100, "specialDefense": 70, "speed": 70 },
    "types": ["grass", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/71.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "tentacruel": {
    "id": 73, "name": "tentacruel",
    "stats": { "hp": 80, "attack": 70, "defense": 65, "specialAttack": 80, "specialDefense": 120, "speed": 100 },
    "types": ["water", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/73.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "golem": {
    "id": 76, "name": "golem",
    "stats": { "hp": 80, "attack": 120, "defense": 130, "specialAttack": 55, "specialDefense": 65, "speed": 45 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "rapidash": {
    "id": 78, "name": "rapidash",
    "stats": { "hp": 65, "attack": 100, "defense": 70, "specialAttack": 80, "specialDefense": 80, "speed": 105 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "slowbro": {
    "id": 80, "name": "slowbro",
    "stats": { "hp": 95, "attack": 75, "defense": 110, "specialAttack": 100, "specialDefense": 80, "speed": 30 },
    "types": ["water", "psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/80.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "magneton": {
    "id": 82, "name": "magneton",
    "stats": { "hp": 50, "attack": 60, "defense": 95, "specialAttack": 120, "specialDefense": 70, "speed": 70 },
    "types": ["electric", "steel"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "farfetch'd": {
    "id": 83, "name": "farfetch'd",
    "stats": { "hp": 52, "attack": 90, "defense": 55, "specialAttack": 58, "specialDefense": 62, "speed": 60 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "dodrio": {
    "id": 85, "name": "dodrio",
    "stats": { "hp": 60, "attack": 110, "defense": 70, "specialAttack": 60, "specialDefense": 60, "speed": 110 },
    "types": ["normal", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/85.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "dewgong": {
    "id": 87, "name": "dewgong",
    "stats": { "hp": 90, "attack": 70, "defense": 80, "specialAttack": 70, "specialDefense": 95, "speed": 70 },
    "types": ["water", "ice"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "muk": {
    "id": 89, "name": "muk",
    "stats": { "hp": 105, "attack": 105, "defense": 75, "specialAttack": 65, "specialDefense": 100, "speed": 50 },
    "types": ["poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/89.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "cloyster": {
    "id": 91, "name": "cloyster",
    "stats": { "hp": 50, "attack": 95, "defense": 180, "specialAttack": 85, "specialDefense": 45, "speed": 70 },
    "types": ["water", "ice"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/91.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "gengar": {
    "id": 94, "name": "gengar",
    "stats": { "hp": 60, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 75, "speed": 110 },
    "types": ["ghost", "poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "onix": {
    "id": 95, "name": "onix",
    "stats": { "hp": 35, "attack": 45, "defense": 160, "specialAttack": 30, "specialDefense": 45, "speed": 70 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "hypno": {
    "id": 97, "name": "hypno",
    "stats": { "hp": 85, "attack": 73, "defense": 70, "specialAttack": 73, "specialDefense": 115, "speed": 67 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/97.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "kingler": {
    "id": 99, "name": "kingler",
    "stats": { "hp": 55, "attack": 130, "defense": 115, "specialAttack": 50, "specialDefense": 50, "speed": 75 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/99.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "electrode": {
    "id": 101, "name": "electrode",
    "stats": { "hp": 60, "attack": 50, "defense": 70, "specialAttack": 80, "specialDefense": 80, "speed": 150 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "exeggutor": {
    "id": 103, "name": "exeggutor",
    "stats": { "hp": 95, "attack": 95, "defense": 85, "specialAttack": 125, "specialDefense": 75, "speed": 55 },
    "types": ["grass", "psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "marowak": {
    "id": 105, "name": "marowak",
    "stats": { "hp": 60, "attack": 80, "defense": 110, "specialAttack": 50, "specialDefense": 80, "speed": 45 },
    "types": ["ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/105.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "hitmonlee": {
    "id": 106, "name": "hitmonlee",
    "stats": { "hp": 50, "attack": 120, "defense": 53, "specialAttack": 35, "specialDefense": 110, "speed": 87 },
    "types": ["fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "hitmonchan": {
    "id": 107, "name": "hitmonchan",
    "stats": { "hp": 50, "attack": 105, "defense": 79, "specialAttack": 35, "specialDefense": 110, "speed": 76 },
    "types": ["fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/107.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "lickitung": {
    "id": 108, "name": "lickitung",
    "stats": { "hp": 90, "attack": 55, "defense": 75, "specialAttack": 60, "specialDefense": 75, "speed": 30 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/108.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "weezing": {
    "id": 110, "name": "weezing",
    "stats": { "hp": 65, "attack": 90, "defense": 120, "specialAttack": 85, "specialDefense": 70, "speed": 60 },
    "types": ["poison"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/110.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "rhydon": {
    "id": 112, "name": "rhydon",
    "stats": { "hp": 105, "attack": 130, "defense": 120, "specialAttack": 45, "specialDefense": 45, "speed": 40 },
    "types": ["rock", "ground"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/112.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "chansey": {
    "id": 113, "name": "chansey",
    "stats": { "hp": 250, "attack": 5, "defense": 5, "specialAttack": 35, "specialDefense": 105, "speed": 50 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "tangela": {
    "id": 114, "name": "tangela",
    "stats": { "hp": 65, "attack": 55, "defense": 115, "specialAttack": 100, "specialDefense": 40, "speed": 60 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "kangaskhan": {
    "id": 115, "name": "kangaskhan",
    "stats": { "hp": 105, "attack": 95, "defense": 80, "specialAttack": 40, "specialDefense": 80, "speed": 90 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "seadra": {
    "id": 117, "name": "seadra",
    "stats": { "hp": 55, "attack": 65, "defense": 95, "specialAttack": 95, "specialDefense": 45, "speed": 85 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/117.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "seaking": {
    "id": 119, "name": "seaking",
    "stats": { "hp": 80, "attack": 92, "defense": 65, "specialAttack": 65, "specialDefense": 80, "speed": 68 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/119.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "starmie": {
    "id": 121, "name": "starmie",
    "stats": { "hp": 60, "attack": 75, "defense": 85, "specialAttack": 100, "specialDefense": 85, "speed": 115 },
    "types": ["water", "psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "mr. mime": {
    "id": 122, "name": "mr. mime",
    "stats": { "hp": 40, "attack": 45, "defense": 65, "specialAttack": 100, "specialDefense": 120, "speed": 90 },
    "types": ["psychic", "fairy"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "scyther": {
    "id": 123, "name": "scyther",
    "stats": { "hp": 70, "attack": 110, "defense": 80, "specialAttack": 55, "specialDefense": 80, "speed": 105 },
    "types": ["bug", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "jynx": {
    "id": 124, "name": "jynx",
    "stats": { "hp": 65, "attack": 50, "defense": 35, "specialAttack": 115, "specialDefense": 95, "speed": 95 },
    "types": ["ice", "psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "electabuzz": {
    "id": 125, "name": "electabuzz",
    "stats": { "hp": 65, "attack": 83, "defense": 57, "specialAttack": 95, "specialDefense": 85, "speed": 105 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "magmar": {
    "id": 126, "name": "magmar",
    "stats": { "hp": 65, "attack": 95, "defense": 57, "specialAttack": 100, "specialDefense": 85, "speed": 93 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "pinsir": {
    "id": 127, "name": "pinsir",
    "stats": { "hp": 65, "attack": 125, "defense": 100, "specialAttack": 55, "specialDefense": 70, "speed": 85 },
    "types": ["bug"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "tauros": {
    "id": 128, "name": "tauros",
    "stats": { "hp": 75, "attack": 100, "defense": 95, "specialAttack": 40, "specialDefense": 70, "speed": 110 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "gyarados": {
    "id": 130, "name": "gyarados",
    "stats": { "hp": 95, "attack": 125, "defense": 79, "specialAttack": 60, "specialDefense": 100, "speed": 81 },
    "types": ["water", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "lapras": {
    "id": 131, "name": "lapras",
    "stats": { "hp": 130, "attack": 85, "defense": 80, "specialAttack": 85, "specialDefense": 95, "speed": 60 },
    "types": ["water", "ice"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "ditto": {
    "id": 132, "name": "ditto",
    "stats": { "hp": 48, "attack": 48, "defense": 48, "specialAttack": 48, "specialDefense": 48, "speed": 48 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "vaporeon": {
    "id": 134, "name": "vaporeon",
    "stats": { "hp": 130, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 65 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "jolteon": {
    "id": 135, "name": "jolteon",
    "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 110, "specialDefense": 95, "speed": 130 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "flareon": {
    "id": 136, "name": "flareon",
    "stats": { "hp": 65, "attack": 130, "defense": 60, "specialAttack": 95, "specialDefense": 110, "speed": 65 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "omastar": {
    "id": 139, "name": "omastar",
    "stats": { "hp": 70, "attack": 60, "defense": 125, "specialAttack": 115, "specialDefense": 70, "speed": 55 },
    "types": ["rock", "water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/139.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "kabutops": {
    "id": 141, "name": "kabutops",
    "stats": { "hp": 60, "attack": 115, "defense": 105, "specialAttack": 65, "specialDefense": 70, "speed": 80 },
    "types": ["rock", "water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/141.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "aerodactyl": {
    "id": 142, "name": "aerodactyl",
    "stats": { "hp": 80, "attack": 105, "defense": 65, "specialAttack": 60, "specialDefense": 75, "speed": 130 },
    "types": ["rock", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "snorlax": {
    "id": 143, "name": "snorlax",
    "stats": { "hp": 160, "attack": 110, "defense": 65, "specialAttack": 65, "specialDefense": 110, "speed": 30 },
    "types": ["normal"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "articuno": {
    "id": 144, "name": "articuno",
    "stats": { "hp": 90, "attack": 85, "defense": 100, "specialAttack": 95, "specialDefense": 125, "speed": 85 },
    "types": ["ice", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "zapdos": {
    "id": 145, "name": "zapdos",
    "stats": { "hp": 90, "attack": 90, "defense": 85, "specialAttack": 125, "specialDefense": 90, "speed": 100 },
    "types": ["electric", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "moltres": {
    "id": 146, "name": "moltres",
    "stats": { "hp": 90, "attack": 100, "defense": 90, "specialAttack": 125, "specialDefense": 85, "speed": 90 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "dragonite": {
    "id": 149, "name": "dragonite",
    "stats": { "hp": 91, "attack": 134, "defense": 95, "specialAttack": 100, "specialDefense": 100, "speed": 80 },
    "types": ["dragon", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "mewtwo": {
    "id": 150, "name": "mewtwo",
    "stats": { "hp": 106, "attack": 110, "defense": 90, "specialAttack": 154, "specialDefense": 90, "speed": 130 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "mew": {
    "id": 151, "name": "mew",
    "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "meganium": {
    "id": 154, "name": "meganium",
    "stats": { "hp": 80, "attack": 82, "defense": 100, "specialAttack": 83, "specialDefense": 100, "speed": 80 },
    "types": ["grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/154.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "typhlosion": {
    "id": 157, "name": "typhlosion",
    "stats": { "hp": 78, "attack": 84, "defense": 78, "specialAttack": 109, "specialDefense": 85, "speed": 100 },
    "types": ["fire"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "feraligatr": {
    "id": 160, "name": "feraligatr",
    "stats": { "hp": 85, "attack": 105, "defense": 100, "specialAttack": 79, "specialDefense": 83, "speed": 78 },
    "types": ["water"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/160.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "ampharos": {
    "id": 181, "name": "ampharos",
    "stats": { "hp": 90, "attack": 75, "defense": 85, "specialAttack": 115, "specialDefense": 90, "speed": 55 },
    "types": ["electric"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/181.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "espeon": {
    "id": 196, "name": "espeon",
    "stats": { "hp": 65, "attack": 65, "defense": 60, "specialAttack": 130, "specialDefense": 95, "speed": 110 },
    "types": ["psychic"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/196.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "umbreon": {
    "id": 197, "name": "umbreon",
    "stats": { "hp": 95, "attack": 65, "defense": 110, "specialAttack": 60, "specialDefense": 130, "speed": 65 },
    "types": ["dark"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
   "scizor": {
    "id": 212, "name": "scizor",
    "stats": { "hp": 70, "attack": 130, "defense": 100, "specialAttack": 55, "specialDefense": 80, "speed": 65 },
    "types": ["bug", "steel"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/212.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "heracross": {
    "id": 214, "name": "heracross",
    "stats": { "hp": 80, "attack": 125, "defense": 75, "specialAttack": 40, "specialDefense": 95, "speed": 85 },
    "types": ["bug", "fighting"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/214.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "tyranitar": {
    "id": 248, "name": "tyranitar",
    "stats": { "hp": 100, "attack": 134, "defense": 110, "specialAttack": 95, "specialDefense": 100, "speed": 61 },
    "types": ["rock", "dark"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/248.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "lugia": {
    "id": 249, "name": "lugia",
    "stats": { "hp": 106, "attack": 90, "defense": 130, "specialAttack": 90, "specialDefense": 154, "speed": 110 },
    "types": ["psychic", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "ho-oh": {
    "id": 250, "name": "ho-oh",
    "stats": { "hp": 106, "attack": 130, "defense": 90, "specialAttack": 110, "specialDefense": 154, "speed": 90 },
    "types": ["fire", "flying"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  },
  "celebi": {
    "id": 251, "name": "celebi",
    "stats": { "hp": 100, "attack": 100, "defense": 100, "specialAttack": 100, "specialDefense": 100, "speed": 100 },
    "types": ["psychic", "grass"], "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/251.png",
    "moves": [
      { "name": "Tackle", "power": 40, "type": "Normal" }, { "name": "Quick Attack", "power": 40, "type": "Normal" },
      { "name": "Strength", "power": 80, "type": "Normal" }, { "name": "Hyper Beam", "power": 150, "type": "Normal" }
    ]
  }
};
// The AVAILABLE_POKEMON list will be automatically rebuilt from this.

const AVAILABLE_POKEMON = Object.values(POKEMON_DATA_FRONTEND).sort((a, b) => a.id - b.id);

const DEFAULT_MAX_TEAM_SIZE = 6;

function PokemonSelection({ onTeamConfirmed, playerId, gameData, isLoading: propIsLoading }) {
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredPokemonSprite, setHoveredPokemonSprite] = useState('');

  const gameMaxTeamSize = gameData?.maxTeamSize || DEFAULT_MAX_TEAM_SIZE;
  const currentPlayerInGame = gameData?.players?.find(p => p.id === playerId);
  const hasPlayerConfirmedPartyBackend = !!currentPlayerInGame?.hasSelectedParty && (currentPlayerInGame?.party?.length > 0 || gameMaxTeamSize === 0) ;

  useEffect(() => {
    if (hasPlayerConfirmedPartyBackend && currentPlayerInGame.party) {
        const confirmedPartyDetails = currentPlayerInGame.party.map(p_backend => {
            // Use the name from backend's details, ensure it's lowercase for lookup in POKEMON_DATA_FRONTEND
            const backendNameLower = p_backend.details.name.toLowerCase();
            // Attempt to find in POKEMON_DATA_FRONTEND, but prioritize backend details if available (especially moves)
            const frontendData = POKEMON_DATA_FRONTEND[backendNameLower];
            if (frontendData) { // If it exists in our frontend list, merge carefully or prioritize backend's structure
                 return { ...frontendData, ...p_backend.details }; // Prioritize backend details for HP, status, but ensure full frontend data like moves is there if backend is minimal
            }
            return p_backend.details; // Fallback to pure backend details if not in frontend list (should not happen with current setup)
        });
        setSelectedTeam(confirmedPartyDetails);
    } else if (!hasPlayerConfirmedPartyBackend) {
        setSelectedTeam([]);
    }
  }, [hasPlayerConfirmedPartyBackend, currentPlayerInGame]);


  const handleSelectPokemon = (pokemon) => {
    if (hasPlayerConfirmedPartyBackend) return;
    setError('');
    const isAlreadySelected = selectedTeam.find(p => p.id === pokemon.id);
    if (isAlreadySelected) {
      setSelectedTeam(selectedTeam.filter(p => p.id !== pokemon.id));
    } else {
      if (selectedTeam.length < gameMaxTeamSize) {
        setSelectedTeam([...selectedTeam, pokemon]);
      } else {
        setError(`You can only select up to ${gameMaxTeamSize} Pokemon.`);
      }
    }
  };

  const handleConfirmTeam = async () => {
    if (selectedTeam.length === 0 && gameMaxTeamSize > 0) {
      setError(`Please select at least 1 Pokemon for your team (up to ${gameMaxTeamSize}).`);
      return;
    }
    if (selectedTeam.length > gameMaxTeamSize) {
        setError(`Your team cannot exceed ${gameMaxTeamSize} Pokemon.`);
        return;
    }
    if (hasPlayerConfirmedPartyBackend) {
        setError("You have already confirmed your team.");
        return;
    }
    const teamToConfirmNames = selectedTeam.map(p => p.name); // Backend expects lowercase names
    setIsSubmitting(true);
    setError('');
    try {
      await onTeamConfirmed(teamToConfirmNames);
    } catch (err) {
      setError(err.message || 'Failed to confirm team selection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePokemonCardHover = (spriteUrl) => {
    setHoveredPokemonSprite(spriteUrl);
  };

  const isLoading = propIsLoading || isSubmitting;

  const filteredPokemonList = AVAILABLE_POKEMON.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!gameData) {
    return <div className="pokemon-selection-overlay"><div className="pokemon-selection-container"><p>Loading game data...</p></div></div>;
  }

  return (
    <div className="pokemon-selection-overlay">
      <div className="pokemon-selection-container">
        <h2>
          {hasPlayerConfirmedPartyBackend ? 'Your Team is Selected!' : `Select Your Team (1-${gameMaxTeamSize} Pokemon)`}
        </h2>
        {error && <p className="pokemon-selection-error">{error}</p>}

        {hasPlayerConfirmedPartyBackend && currentPlayerInGame?.party ? (
            <div className="confirmed-party-display">
                <h3>Your Confirmed Team:</h3>
                <ul className="confirmed-party-list">
                {currentPlayerInGame.party.map((p, index) => (
                    <li key={p.details.id || index} className="confirmed-party-item">
                    <img src={p.details.sprite} alt={p.details.name} />
                    <p>{p.details.name.charAt(0).toUpperCase() + p.details.name.slice(1)}</p> {/* Capitalize for display */}
                    </li>
                ))}
                </ul>
            </div>
        ) : (
          <div className="selection-main-area">
            <div className="available-pokemon-panel">
              {hoveredPokemonSprite && (
                <div
                  className="pokemon-hover-background-preview"
                  style={{ backgroundImage: `url(${hoveredPokemonSprite})` }}
                />
              )}
              <h3>Available Pokemon</h3>
              <input
                type="text"
                placeholder="Search Pokemon..."
                className="pokemon-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={hasPlayerConfirmedPartyBackend}
              />
              <div className="available-pokemon-list">
                {filteredPokemonList.map(pokemon => {
                  const isSelected = selectedTeam.find(p => p.id === pokemon.id);
                  const isMaxReached = selectedTeam.length >= gameMaxTeamSize;
                  // Disable click if backend confirmed, or if max reached and this one isn't selected
                  const isDisabled = hasPlayerConfirmedPartyBackend || (isMaxReached && !isSelected);

                  let cardClass = "pokemon-card-select";
                  if (isSelected) cardClass += " selected";
                  if (isDisabled && !isSelected && !hasPlayerConfirmedPartyBackend) cardClass += " disabled"; // Dim if max reached and not selectable
                  else if (isDisabled && !isSelected && hasPlayerConfirmedPartyBackend) cardClass += " disabled";


                  return (
                    <div
                      key={pokemon.id}
                      className={cardClass}
                      onClick={() => !isDisabled && handleSelectPokemon(pokemon)}
                      onMouseEnter={() => handlePokemonCardHover(pokemon.sprite)}
                      onMouseLeave={() => handlePokemonCardHover('')}
                      title={pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} // Tooltip with name
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} />
                      <p className="name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p> {/* Capitalize for display */}
                      <p className="type">{pokemon.types.join(' / ')}</p>
                    </div>
                  );
                })}
                 {filteredPokemonList.length === 0 && searchTerm && (
                    <p className="no-results-message">No Pokemon found matching "{searchTerm}".</p>
                )}
              </div>
            </div>

            <div className="selected-team-panel">
              <h3>Your Team ({selectedTeam.length}/{gameMaxTeamSize})</h3>
              <div className="selected-team-slots">
                {[...Array(gameMaxTeamSize)].map((_, i) => {
                  const pokemon = selectedTeam[i];
                  return (
                    <div key={i} className={`team-slot ${pokemon ? 'filled' : ''}`}>
                      {pokemon ? (
                        <>
                          <img src={pokemon.sprite} alt={pokemon.name} />
                          <p className="name">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p> {/* Capitalize */}
                        </>
                      ) : (
                        <p className="empty-text">Slot {i+1}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!hasPlayerConfirmedPartyBackend && (
          <div className="confirm-selection-button-container">
            <button
              onClick={handleConfirmTeam}
              disabled={isLoading || selectedTeam.length === 0 || selectedTeam.length > gameMaxTeamSize || hasPlayerConfirmedPartyBackend}
              className="confirm-selection-button"
            >
              {isLoading ? 'Confirming Team...' : `Confirm Team (${selectedTeam.length}/${gameMaxTeamSize})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonSelection;
