---
layout: project
title: "Raichu"
description: "Pokemon-themed chess strategy game with AI opponent. Features Pichu, Pikachu, and Raichu pieces with unique movement patterns. Powered by minimax algorithm with alpha-beta pruning"
date: 2024-07-01
status: active
featured: false
categories: ["Game AI", "Python", "Web Game"]
technologies: ["Python", "Game AI", "Minimax", "Web Game"]
github_url: "https://github.com/sanketmuchhala/Raichu"
demo_url: "https://raichu-web-game.vercel.app/"
---

## Overview

Raichu is a strategic board game inspired by Pokemon, featuring an AI opponent powered by the minimax algorithm with alpha-beta pruning. Play on an 8x8 board with Pokemon-inspired pieces that have unique movement and capture patterns.

## Game Pieces

### Pichu (w/b)
- Basic piece that moves diagonally forward, similar to a chess pawn
- Evolves into Pikachu when reaching the opposite end
- Captures by jumping diagonally over adjacent opponent pieces

### Pikachu (W/B)
- Intermediate piece that can move 1-2 squares in any direction
- More versatile than Pichu with horizontal, vertical, and diagonal movement
- Can jump over opponent pieces to capture them

### Raichu (@/$)
- Advanced piece that can move any distance in any direction
- Most powerful piece, similar to a chess queen
- Can jump over multiple opponent pieces in a single move

## Game Features

### Intelligent AI Opponent
- **Minimax Algorithm**: Evaluates game tree to find optimal moves
- **Alpha-Beta Pruning**: Optimizes search by eliminating unnecessary branches
- **Difficulty Levels**: Adjustable search depth for different challenge levels
- **Strategic Play**: AI considers piece values, board control, and positioning

### Web Interface
- **Interactive Board**: Click-and-drag piece movement
- **Move Validation**: Visual feedback for legal moves
- **Game State**: Track captures, turns, and game status
- **Responsive Design**: Works on desktop and mobile devices

## Technical Implementation

### Game Engine
- Python backend with complete game logic
- Move validation and generation
- Win condition checking
- State management and history

### AI System
- Minimax with alpha-beta pruning for efficient search
- Evaluation function considering:
  - Material advantage (piece count and value)
  - Board control and positioning
  - Piece mobility
  - Strategic patterns

### Web Deployment
- Deployed on Vercel for instant access
- WebAssembly integration for performance
- Real-time game updates

## Play Now

Try the game at [raichu-web-game.vercel.app](https://raichu-web-game.vercel.app/) and test your strategy against the AI!

## Learning Outcomes

- Minimax algorithm implementation and optimization
- Alpha-beta pruning for game tree search
- Game state representation and evaluation
- Web deployment of Python applications