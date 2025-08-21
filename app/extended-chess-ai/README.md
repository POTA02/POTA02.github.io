# Extended Chess AI for 12x12 Board

This AI system is specifically designed for chess games played on an extended 12x12 board where the traditional 8x8 game is centered within the larger board (rows 2-9, columns 2-9).

## Features

- **Minimax Algorithm** with alpha-beta pruning
- **Position Evaluation** using piece-square tables optimized for the 12x12 board
- **Advanced Evaluation** including mobility, king safety, and pawn structure
- **Configurable Difficulty** levels (1-5)
- **Move Analysis** and position evaluation tools
- **Integration Helper** for easy implementation

## Files

- `ExtendedChessAI.js` - Main AI engine
- `integration.js` - Integration helper for easy use
- `config.js` - Configuration settings
- `README.md` - This documentation

## Usage

### Basic Integration

1. Include the AI files in your HTML:
```html
<script src="extended-chess-ai/config.js"></script>
<script src="extended-chess-ai/ExtendedChessAI.js"></script>
<script src="extended-chess-ai/integration.js"></script>
```

2. Initialize the AI:
```javascript
const aiIntegration = new ExtendedChessAIIntegration();
```

3. Make AI moves:
```javascript
// Make an AI move for black at difficulty level 3
const move = await aiIntegration.makeAIMove(game, 'black', 3);
if (move) {
    // Apply the move to your game
    game.movePiece(move.from.r, move.from.c, move.to.r, move.to.c);
}
```

### Advanced Features

#### Get Position Analysis
```javascript
const analysis = aiIntegration.analyzePosition(game);
console.log('Position evaluation:', analysis.evaluation);
console.log('Game phase:', analysis.gamePhase);
```

#### Get Hints for Player
```javascript
const hint = aiIntegration.getHint(game, 'white');
console.log('Suggested move:', aiIntegration.moveToString(hint));
```

#### Get Top Moves
```javascript
const topMoves = aiIntegration.getTopMoves(game, 'white', 3);
topMoves.forEach((moveData, index) => {
    console.log(`${index + 1}. ${aiIntegration.moveToString(moveData.move)} (${moveData.score})`);
});
```

## Configuration

Adjust AI behavior in `config.js`:

- `DEFAULT_DEPTH`: Default search depth (4)
- `MAX_DEPTH`: Maximum search depth (6)
- `PIECE_VALUES`: Values for different pieces
- `DEBUG_MODE`: Enable debug logging

## Board Coordinate System

The AI works with the 12x12 coordinate system:
- Board size: 12x12 (rows 0-11, columns 0-11)
- Playable area: rows 2-9, columns 2-9 (traditional 8x8 chess area)
- White pieces start at rows 8-9
- Black pieces start at rows 2-3

## Difficulty Levels

1. **Easy** (Depth 3): Quick moves, basic evaluation
2. **Normal** (Depth 4): Standard play
3. **Medium** (Depth 5): Stronger tactical play
4. **Hard** (Depth 6): Deep calculation
5. **Expert** (Depth 6+): Maximum strength with enhanced evaluation

## Integration with Existing Game

Replace your existing AI calls with:

```javascript
// Old AI call
const move = AI.chooseMove(game, 'black');

// New AI call
const move = await aiIntegration.makeAIMove(game, 'black', difficulty);
```

The new AI automatically handles:
- 12x12 board coordinates
- Legal move generation for the extended board
- Position evaluation optimized for the centered 8x8 play area
- Proper handling of piece placement and movement

## Performance

- **Search Depth 4**: ~1-2 seconds per move
- **Search Depth 5**: ~3-5 seconds per move
- **Search Depth 6**: ~5-10 seconds per move

Times may vary based on position complexity and hardware.

## Troubleshooting

1. **AI not working**: Ensure all files are loaded in correct order
2. **Slow performance**: Reduce difficulty level or check `DEFAULT_DEPTH` setting
3. **Invalid moves**: Verify game object has proper `calculatePossibleMoves()` method
4. **Console errors**: Enable `DEBUG_MODE` in config for detailed logging

## Example Implementation

See the integration example in your main game file:

```javascript
// Initialize AI
const extendedAI = new ExtendedChessAIIntegration();

// In your game logic
async function makeComputerMove() {
    if (game.turn === game.computerSide) {
        const move = await extendedAI.makeAIMove(game, game.turn, 3);
        if (move) {
            game.movePiece(move.from.r, move.from.c, move.to.r, move.to.c);
        }
    }
}
```

This AI system provides significantly better performance and accuracy for the 12x12 extended chess board compared to generic chess AIs.
