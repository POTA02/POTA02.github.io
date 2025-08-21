/**
 * Integration helper for Extended Chess AI
 * Provides easy interface between the 12x12 chess game and the AI
 */

class ExtendedChessAIIntegration {
  constructor() {
    this.ai = new ExtendedChessAI();
    this.isThinking = false;
    this.moveHistory = [];
  }

  /**
   * Make an AI move for the current game state
   * @param {Object} game - The game object
   * @param {string} color - 'white' or 'black'
   * @param {number} difficulty - 1 (easy) to 5 (hard)
   * @returns {Promise<Object|null>} The chosen move or null
   */
  async makeAIMove(game, color, difficulty = 3) {
    if (this.isThinking) {
      console.log('AI is already thinking...');
      return null;
    }

    this.isThinking = true;
    console.log(`AI making move for ${color} at difficulty ${difficulty}`);

    try {
      // Adjust depth based on difficulty - much lower for 12x12 board
      let depth;
      switch (difficulty) {
        case 1: depth = 1; break;
        case 2: depth = 2; break;
        case 3: depth = 2; break;
        case 4: depth = 3; break;
        case 5: depth = 3; break;
        default: depth = 2;
      }
      
      console.log(`Using search depth: ${depth}`);
      
      // Add some thinking time for realism (much shorter)
      const thinkingTime = Math.min(difficulty * 100 + Math.random() * 200, 500);
      await this.sleep(thinkingTime);

      // Try AI move calculation with timeout
      let move = null;
      let timeoutReached = false;
      
      const timeoutId = setTimeout(() => {
        timeoutReached = true;
        console.warn('AI move calculation timed out after 2 seconds, using quick fallback');
      }, 2000); // 2 second timeout (reduced from 3)

      try {
        // Calculate move (this should be fast now with reduced depth)
        const calculationStart = Date.now();
        move = this.ai.chooseMove(game, color, depth);
        const calculationTime = Date.now() - calculationStart;
        
        clearTimeout(timeoutId);
        
        if (timeoutReached) {
          console.log(`Main AI completed in ${calculationTime}ms but timeout already fired, using fallback`);
          move = this.getQuickMove(game, color);
        } else {
          console.log(`AI calculation completed in ${calculationTime}ms`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('AI calculation error:', error);
        move = this.getQuickMove(game, color);
      }
      
      if (move) {
        // Record the move
        this.moveHistory.push({
          move: move,
          color: color,
          timestamp: Date.now(),
          difficulty: difficulty
        });
        
        console.log(`AI chose move: ${this.ai.moveToString(move)}`);
      }

      return move;
    } finally {
      this.isThinking = false;
    }
  }

  /**
   * Get a hint for the human player
   * @param {Object} game - The game object
   * @param {string} color - 'white' or 'black'
   * @returns {Object|null} Suggested move
   */
  getHint(game, color) {
    console.log(`Getting hint for ${color}`);
    return this.ai.chooseMove(game, color, 3);
  }

  /**
   * Evaluate the current position
   * @param {Object} game - The game object
   * @param {string} perspective - 'white' or 'black'
   * @returns {number} Position evaluation
   */
  evaluatePosition(game, perspective = 'white') {
    return this.ai.evaluatePosition(game, perspective);
  }

  /**
   * Get the best moves for analysis
   * @param {Object} game - The game object
   * @param {string} color - 'white' or 'black'
   * @param {number} count - Number of top moves to return
   * @returns {Array} Array of moves with scores
   */
  getTopMoves(game, color, count = 3) {
    const moves = this.ai.generateAllLegalMoves(game, color);
    const evaluatedMoves = [];

    for (const move of moves) {
      const undo = this.ai.makeMove(game, move);
      const score = this.ai.evaluatePosition(game, color);
      this.ai.unmakeMove(game, move, undo);
      
      evaluatedMoves.push({ move, score });
    }

    // Sort by score (best first)
    evaluatedMoves.sort((a, b) => {
      return color === 'white' ? b.score - a.score : a.score - b.score;
    });

    return evaluatedMoves.slice(0, count);
  }

  /**
   * Check if the AI is currently thinking
   * @returns {boolean}
   */
  isAIThinking() {
    return this.isThinking;
  }

  /**
   * Get move history
   * @returns {Array}
   */
  getMoveHistory() {
    return [...this.moveHistory];
  }

  /**
   * Clear move history
   */
  clearHistory() {
    this.moveHistory = [];
  }

  /**
   * Get AI statistics
   * @returns {Object}
   */
  getStatistics() {
    const totalMoves = this.moveHistory.length;
    const avgThinkingTime = totalMoves > 0 
      ? this.moveHistory.reduce((sum, entry) => sum + (entry.thinkingTime || 0), 0) / totalMoves 
      : 0;

    return {
      totalMoves,
      avgThinkingTime,
      moveHistory: this.getMoveHistory()
    };
  }

  /**
   * Convert move to human-readable format
   * @param {Object} move - Move object
   * @returns {string}
   */
  moveToString(move) {
    return this.ai.moveToString(move);
  }

  /**
   * Sleep utility for adding delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate that a move is legal
   * @param {Object} game - The game object
   * @param {Object} move - Move to validate
   * @returns {boolean}
   */
  isLegalMove(game, move) {
    const legalMoves = this.ai.generateAllLegalMoves(game, move.piece.color);
    return legalMoves.some(legalMove => 
      legalMove.from.r === move.from.r &&
      legalMove.from.c === move.from.c &&
      legalMove.to.r === move.to.r &&
      legalMove.to.c === move.to.c
    );
  }

  /**
   * Get a quick move when the main AI times out
   * @param {Object} game - The game object
   * @param {string} color - 'white' or 'black'
   * @returns {Object|null} Quick move or null
   */
  getQuickMove(game, color) {
    const moves = this.ai.generateAllLegalMoves(game, color);
    if (moves.length === 0) return null;

    // Prefer captures
    const captures = moves.filter(move => game.board[move.to.r][move.to.c] !== null);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Otherwise, random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Get position analysis
   * @param {Object} game - The game object
   * @returns {Object} Analysis object
   */
  analyzePosition(game) {
    const whiteEval = this.ai.evaluatePosition(game, 'white');
    const blackEval = this.ai.evaluatePosition(game, 'black');
    
    const whiteMoves = this.ai.generateAllLegalMoves(game, 'white');
    const blackMoves = this.ai.generateAllLegalMoves(game, 'black');

    return {
      evaluation: {
        white: whiteEval,
        black: blackEval,
        advantage: whiteEval > 0 ? 'white' : 'black',
        advantageValue: Math.abs(whiteEval)
      },
      mobility: {
        white: whiteMoves.length,
        black: blackMoves.length
      },
      pieceCount: this.ai.countPieces(game),
      gamePhase: this.getGamePhase(game)
    };
  }

  /**
   * Determine game phase
   * @param {Object} game - The game object
   * @returns {string}
   */
  getGamePhase(game) {
    const pieceCount = this.ai.countPieces(game);
    if (pieceCount >= 28) return 'opening';
    if (pieceCount >= 12) return 'middlegame';
    return 'endgame';
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtendedChessAIIntegration;
} else if (typeof window !== 'undefined') {
  window.ExtendedChessAIIntegration = ExtendedChessAIIntegration;
}
