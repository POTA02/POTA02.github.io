# Chess Universe Shared Library - Integration Guide

This guide shows you how to integrate Chess Universe components into your own projects. Whether you want a simple chess game or a full-featured chess application, we've got you covered!

## 📦 What's Included

The Chess Universe Shared Library provides three main components:

- **ChessEngineCore** - Complete chess logic and validation
- **ChessAISystem** - AI opponent with 5 difficulty levels  
- **ChessVoiceAssistant** - Voice commentary with 4 personalities

## 🚀 Quick Start

### 1. Simple Chess Game (Minimal Setup)

For a basic chess game with just the core engine:

```javascript
import { ChessEngineCore } from './components/chess-engine-core.js';

// Create chess engine
const engine = new ChessEngineCore();

// Make a move
const result = engine.movePiece(1, 4, 3, 4); // e2-e4
if (result !== 'invalid') {
    console.log('Move successful!');
}

// Check game state
console.log('Current turn:', engine.turn);
console.log('Game over:', engine.gameOver);
console.log('In check:', engine.check);
```

### 2. Chess Game with AI Opponent

Add an AI opponent to make it more challenging:

```javascript
import { ChessEngineCore } from './components/chess-engine-core.js';
import { ChessAISystem } from './components/chess-ai-system.js';

// Setup game with AI
const engine = new ChessEngineCore();
const ai = new ChessAISystem({
    difficulty: 3,        // 1-5 (easy to expert)
    personality: 'balanced'
});

// Player makes a move
engine.movePiece(1, 4, 3, 4);

// AI responds
const aiMove = await ai.chooseMove(engine, 'black');
if (aiMove) {
    engine.movePiece(aiMove.from.r, aiMove.from.c, aiMove.to.r, aiMove.to.c);
}
```

### 3. Full-Featured Chess Game

Include voice commentary for the complete experience:

```javascript
import { ChessEngineCore } from './components/chess-engine-core.js';
import { ChessAISystem } from './components/chess-ai-system.js';
import { ChessVoiceAssistant } from './components/chess-voice-assistant.js';

// Complete setup
const engine = new ChessEngineCore();
const ai = new ChessAISystem({ difficulty: 3 });
const voice = new ChessVoiceAssistant({ 
    personality: 'professional' 
});

// Game flow with voice
voice.announceGameStart();

// Make move with commentary
const result = engine.movePiece(1, 4, 3, 4);
voice.announceMove({ captured: result === 'capture' });

if (engine.check) {
    voice.announceCheck();
}
```

## 🎯 Component Details

### ChessEngineCore

The heart of the chess game - handles all game logic.

**Features:**
- Full chess rule implementation
- Move validation and execution
- Check/checkmate detection
- Castling and en passant
- Pawn promotion
- Move history and undo
- Board state management

**Key Methods:**
```javascript
// Setup and game control
engine.setupBoard()              // Initialize board
engine.newGame()                 // Start fresh game
engine.undoMove()               // Undo last move

// Move handling
engine.movePiece(fr, fc, tr, tc) // Make a move
engine.calculatePossibleMoves(r, c) // Get valid moves
engine.isValidMove(fr, fc, tr, tc)   // Check move validity

// Game state
engine.turn                      // Current player ('white'/'black')
engine.gameOver                  // Game finished
engine.check                     // King in check
engine.moveCount                 // Number of moves made
```

### ChessAISystem

Intelligent AI opponent with configurable difficulty and personality.

**Features:**
- 5 difficulty levels (1=easy, 5=expert)
- Multiple AI personalities
- Minimax algorithm with alpha-beta pruning
- Position evaluation
- Opening book knowledge
- Endgame patterns

**Configuration:**
```javascript
const ai = new ChessAISystem({
    difficulty: 3,              // 1-5
    personality: 'balanced',    // balanced, aggressive, defensive, positional, tactical
    moveTime: 2000,            // Max thinking time (ms)
    enableOpening: true,       // Use opening book
    enableEndgame: true        // Use endgame patterns
});

// AI methods
await ai.chooseMove(engine, color)  // Get AI move
ai.setDifficulty(level)            // Change difficulty
ai.setPersonality(type)            // Change personality
ai.sabotage(moves)                 // Weaken AI temporarily
```

### ChessVoiceAssistant

Text-to-speech commentary system with multiple personalities.

**Features:**
- 4 distinct personalities
- Comprehensive phrase libraries
- Selective announcements
- Voice parameter control
- Multi-language support (extensible)

**Personalities:**
- **Professional** - Clear, formal chess commentary
- **Casual** - Friendly, relaxed narration  
- **Dramatic** - Exciting, theatrical descriptions
- **Funny** - Humorous, entertaining remarks

**Usage:**
```javascript
const voice = new ChessVoiceAssistant({
    personality: 'professional',
    announcements: {
        moves: true,
        cheats: true,
        ai: true,
        gameEvents: true
    }
});

// Voice methods
voice.announceMove(moveData)       // Describe move
voice.announceCheck()              // Announce check
voice.announceCheckmate(winner)    // Game over
voice.announceCheat(cheatType)     // Cheat activation
voice.setPersonality(type)         // Change personality
voice.setVoiceSettings(params)     // Adjust voice
```

## 🎨 Complete Integration Examples

### Basic HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Chess Game</title>
</head>
<body>
    <div id="chess-game"></div>
    
    <script type="module">
        import { ChessEngineCore } from './chess-universe-shared/components/chess-engine-core.js';
        
        const engine = new ChessEngineCore();
        // Your game logic here...
    </script>
</body>
</html>
```

### React Integration

```jsx
import React, { useState, useEffect } from 'react';
import { ChessEngineCore, ChessAISystem, ChessVoiceAssistant } from './chess-universe-shared/components';

function ChessGame() {
    const [engine] = useState(() => new ChessEngineCore());
    const [ai] = useState(() => new ChessAISystem({ difficulty: 3 }));
    const [voice] = useState(() => new ChessVoiceAssistant({ personality: 'casual' }));
    
    const [gameState, setGameState] = useState(engine.exportState());
    
    useEffect(() => {
        voice.announceGameStart();
    }, []);
    
    const handleMove = async (fromRow, fromCol, toRow, toCol) => {
        const result = engine.movePiece(fromRow, fromCol, toRow, toCol);
        if (result !== 'invalid') {
            voice.announceMove({ captured: result === 'capture' });
            setGameState(engine.exportState());
            
            // AI response
            if (!engine.gameOver && engine.turn === 'black') {
                const aiMove = await ai.chooseMove(engine, 'black');
                if (aiMove) {
                    engine.movePiece(aiMove.from.r, aiMove.from.c, aiMove.to.r, aiMove.to.c);
                    voice.announceMove({ aiMove: true });
                    setGameState(engine.exportState());
                }
            }
        }
    };
    
    return (
        <div className="chess-game">
            {/* Your chess board JSX */}
        </div>
    );
}
```

### Vue.js Integration

```vue
<template>
    <div class="chess-game">
        <!-- Your chess board template -->
        <div class="board" @click="handleSquareClick">
            <!-- Board squares -->
        </div>
    </div>
</template>

<script>
import { ChessEngineCore, ChessAISystem, ChessVoiceAssistant } from './chess-universe-shared/components';

export default {
    name: 'ChessGame',
    data() {
        return {
            engine: new ChessEngineCore(),
            ai: new ChessAISystem({ difficulty: 3 }),
            voice: new ChessVoiceAssistant({ personality: 'dramatic' }),
            gameState: null
        };
    },
    mounted() {
        this.gameState = this.engine.exportState();
        this.voice.announceGameStart();
    },
    methods: {
        async makeMove(fromRow, fromCol, toRow, toCol) {
            const result = this.engine.movePiece(fromRow, fromCol, toRow, toCol);
            if (result !== 'invalid') {
                this.voice.announceMove({ captured: result === 'capture' });
                this.gameState = this.engine.exportState();
                
                // AI turn
                if (!this.engine.gameOver && this.engine.turn === 'black') {
                    const aiMove = await this.ai.chooseMove(this.engine, 'black');
                    if (aiMove) {
                        this.engine.movePiece(aiMove.from.r, aiMove.from.c, aiMove.to.r, aiMove.to.c);
                        this.voice.announceMove({ aiMove: true });
                        this.gameState = this.engine.exportState();
                    }
                }
            }
        }
    }
};
</script>
```

## ⚙️ Configuration Options

### Engine Configuration

```javascript
const engine = new ChessEngineCore({
    allowUndo: true,           // Enable move undo
    maxMoveHistory: 100,       // Max moves to remember
    enableAnalytics: true,     // Track game statistics
    validateMoves: true,       // Validate all moves
    enableCastling: true,      // Allow castling
    enableEnPassant: true,     // Allow en passant
    enablePromotion: true      // Allow pawn promotion
});
```

### AI Configuration

```javascript
const ai = new ChessAISystem({
    difficulty: 3,             // 1-5 skill level
    personality: 'balanced',   // AI behavior type
    moveTime: 2000,           // Max thinking time (ms)
    enableOpening: true,       // Use opening book
    enableEndgame: true,       // Use endgame patterns
    randomness: 0.1,          // Add some unpredictability
    contempt: 0               // Avoid draws (-1 to 1)
});
```

### Voice Configuration

```javascript
const voice = new ChessVoiceAssistant({
    personality: 'professional',
    language: 'en-US',         // Voice language
    rate: 1.0,                // Speech rate (0.5-2.0)
    pitch: 1.0,               // Voice pitch (0.5-2.0)
    volume: 0.8,              // Volume (0.0-1.0)
    announcements: {
        moves: true,           // Announce all moves
        cheats: true,          // Announce cheat usage
        ai: true,              // Announce AI moves
        gameEvents: true       // Game start/end events
    }
});
```

## 🔧 Advanced Features

### Custom Cheat System

```javascript
// Enable specific cheats
const cheats = {
    seeAllMoves: false,
    unlimitedUndo: false,
    godMode: false
};

// Cheat activation
function activateCheat(cheatType) {
    switch (cheatType) {
        case 'seeAllMoves':
            // Show all possible moves
            highlightAllMoves();
            break;
        case 'godMode':
            // Enable all advantages
            cheats.unlimitedUndo = true;
            cheats.seeAllMoves = true;
            break;
    }
    
    voice.announceCheat(cheatType);
}
```

### Game State Management

```javascript
// Export complete game state
const gameState = {
    engine: engine.exportState(),
    ai: ai.getStatus(),
    voice: voice.getStatus(),
    settings: gameSettings
};

// Save to localStorage
localStorage.setItem('chessGame', JSON.stringify(gameState));

// Load game state
const savedState = JSON.parse(localStorage.getItem('chessGame'));
engine.importState(savedState.engine);
```

### Event System

```javascript
// Listen for game events
engine.on('move', (moveData) => {
    console.log('Move made:', moveData);
    voice.announceMove(moveData);
});

engine.on('check', () => {
    voice.announceCheck();
});

engine.on('gameOver', (winner) => {
    voice.announceCheckmate(winner);
});
```

## 📱 Mobile Optimization

### Responsive Design

```css
/* Mobile-friendly chess board */
@media (max-width: 768px) {
    .chess-board {
        grid-template-columns: repeat(8, 1fr);
        max-width: 100vw;
        padding: 10px;
    }
    
    .square {
        aspect-ratio: 1;
        font-size: clamp(20px, 8vw, 40px);
    }
}
```

### Touch Handling

```javascript
// Handle touch events for mobile
function handleTouchMove(e) {
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element?.classList.contains('square')) {
        const row = parseInt(element.dataset.row);
        const col = parseInt(element.dataset.col);
        handleSquareClick(row, col);
    }
}

// Add touch listeners
boardElement.addEventListener('touchstart', handleTouchMove);
boardElement.addEventListener('touchmove', handleTouchMove);
```

## 🎯 Best Practices

### Performance Tips

1. **Debounce Voice Announcements**
```javascript
let voiceTimeout;
function announceMove(moveData) {
    clearTimeout(voiceTimeout);
    voiceTimeout = setTimeout(() => {
        voice.announceMove(moveData);
    }, 100);
}
```

2. **Lazy Load AI**
```javascript
let ai = null;
async function getAI() {
    if (!ai) {
        const { ChessAISystem } = await import('./components/chess-ai-system.js');
        ai = new ChessAISystem({ difficulty: 3 });
    }
    return ai;
}
```

3. **Optimize Rendering**
```javascript
// Only update changed squares
function updateBoard(previousBoard, currentBoard) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (previousBoard[r][c] !== currentBoard[r][c]) {
                updateSquare(r, c, currentBoard[r][c]);
            }
        }
    }
}
```

### Error Handling

```javascript
try {
    const result = engine.movePiece(fromRow, fromCol, toRow, toCol);
    if (result === 'invalid') {
        showErrorMessage('Invalid move!');
    }
} catch (error) {
    console.error('Move error:', error);
    showErrorMessage('An error occurred while making the move.');
}
```

### Accessibility

```javascript
// Add ARIA labels for screen readers
function makeSquareAccessible(square, row, col, piece) {
    const file = 'abcdefgh'[col];
    const rank = 8 - row;
    
    square.setAttribute('aria-label', 
        piece ? `${piece.color} ${piece.type} on ${file}${rank}` 
              : `Empty square ${file}${rank}`
    );
    
    square.setAttribute('role', 'button');
    square.setAttribute('tabindex', '0');
}
```

## 🚀 Live Examples

Check out these working examples:

- **[Simple Demo](./examples/simple-demo.html)** - Minimal chess game
- **[Advanced Demo](./examples/advanced-demo.html)** - Full-featured game
- **[Integration Examples](./examples/)** - Various frameworks

## 📞 Support & Contributing

- **Documentation**: [README.md](../README.md)
- **Issues**: Report bugs and request features
- **Contributing**: Pull requests welcome!
- **License**: MIT - free for all projects

---

Happy coding with Chess Universe! ♔♕♖♗♘♙
