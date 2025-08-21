/**
 * Extended Chess AI for 12x12 Board
 * Specifically designed for chess games with 2-square border extension
 * Playable area: rows 2-9, cols 2-9 (8x8 center)
 */

class ExtendedChessAI {
  constructor() {
    this.pieceValues = {
      pawn: 100,
      lightpawn: 150, // Slightly more valuable than regular pawn due to diagonal movement
      darkpawn: 150,  // Slightly more valuable than regular pawn due to diagonal movement
      knight: 320,
      bishop: 330,
      rook: 500,
      queen: 900,
      king: 20000
    };
    
    // Position evaluation tables for the 12x12 board (focused on center 8x8)
    this.pieceSquareTables = {
      pawn: this.createPawnTable(),
      lightpawn: this.createLightpawnTable(),
      darkpawn: this.createDarkpawnTable(),
      knight: this.createKnightTable(),
      bishop: this.createBishopTable(),
      rook: this.createRookTable(),
      queen: this.createQueenTable(),
      king: this.createKingTable()
    };
  }

  // Create position tables for piece evaluation
  createPawnTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    // Only set values for the playable area (rows 2-9, cols 2-9)
    const pawnValues = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [50, 50, 50, 50, 50, 50, 50, 50],
      [10, 10, 20, 30, 30, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [5, 10, 10, -20, -20, 10, 10, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = pawnValues[r][c];
      }
    }
    return table;
  }

  createKnightTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    const knightValues = [
      [-50, -40, -30, -30, -30, -30, -40, -50],
      [-40, -20, 0, 0, 0, 0, -20, -40],
      [-30, 0, 10, 15, 15, 10, 0, -30],
      [-30, 5, 15, 20, 20, 15, 5, -30],
      [-30, 0, 15, 20, 20, 15, 0, -30],
      [-30, 5, 10, 15, 15, 10, 5, -30],
      [-40, -20, 0, 5, 5, 0, -20, -40],
      [-50, -40, -30, -30, -30, -30, -40, -50]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = knightValues[r][c];
      }
    }
    return table;
  }

  createBishopTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    const bishopValues = [
      [-20, -10, -10, -10, -10, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 10, 10, 5, 0, -10],
      [-10, 5, 5, 10, 10, 5, 5, -10],
      [-10, 0, 10, 10, 10, 10, 0, -10],
      [-10, 10, 10, 10, 10, 10, 10, -10],
      [-10, 5, 0, 0, 0, 0, 5, -10],
      [-20, -10, -10, -10, -10, -10, -10, -20]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = bishopValues[r][c];
      }
    }
    return table;
  }

  createRookTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    const rookValues = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [5, 10, 10, 10, 10, 10, 10, 5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [-5, 0, 0, 0, 0, 0, 0, -5],
      [0, 0, 0, 5, 5, 0, 0, 0]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = rookValues[r][c];
      }
    }
    return table;
  }

  createQueenTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    const queenValues = [
      [-20, -10, -10, -5, -5, -10, -10, -20],
      [-10, 0, 0, 0, 0, 0, 0, -10],
      [-10, 0, 5, 5, 5, 5, 0, -10],
      [-5, 0, 5, 5, 5, 5, 0, -5],
      [0, 0, 5, 5, 5, 5, 0, -5],
      [-10, 5, 5, 5, 5, 5, 0, -10],
      [-10, 0, 5, 0, 0, 0, 0, -10],
      [-20, -10, -10, -5, -5, -10, -10, -20]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = queenValues[r][c];
      }
    }
    return table;
  }

  createKingTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    const kingValues = [
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-30, -40, -40, -50, -50, -40, -40, -30],
      [-20, -30, -30, -40, -40, -30, -30, -20],
      [-10, -20, -20, -20, -20, -20, -20, -10],
      [20, 20, 0, 0, 0, 0, 20, 20],
      [20, 30, 10, 0, 0, 0, 10, 30, 20]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = kingValues[r][c];
      }
    }
    return table;
  }

  createLightpawnTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    // Lightpawn values - favor diagonal advancement
    const lightpawnValues = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [60, 60, 60, 60, 60, 60, 60, 60],
      [20, 20, 30, 40, 40, 30, 20, 20],
      [10, 10, 20, 35, 35, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = lightpawnValues[r][c];
      }
    }
    return table;
  }

  createDarkpawnTable() {
    const table = Array(12).fill().map(() => Array(12).fill(0));
    // Darkpawn values - favor diagonal advancement
    const darkpawnValues = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [60, 60, 60, 60, 60, 60, 60, 60],
      [20, 20, 30, 40, 40, 30, 20, 20],
      [10, 10, 20, 35, 35, 20, 10, 10],
      [5, 5, 10, 25, 25, 10, 5, 5],
      [0, 0, 0, 20, 20, 0, 0, 0],
      [5, -5, -10, 0, 0, -10, -5, 5],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        table[r + 2][c + 2] = darkpawnValues[r][c];
      }
    }
    return table;
  }

  /**
   * Choose the best move for the given game state
   * @param {Object} game - The game object with 12x12 board
   * @param {string} color - 'white' or 'black'
   * @param {number} depth - Search depth (default 3, max 4)
   * @returns {Object|null} Best move object or null if no moves
   */
  chooseMove(game, color, depth = 3) {
    console.log(`ExtendedChessAI: Choosing move for ${color} at depth ${depth}`);
    
    const startTime = Date.now();
    const moves = this.generateAllLegalMoves(game, color);
    if (moves.length === 0) {
      console.log('ExtendedChessAI: No legal moves available');
      return null;
    }

    // Limit moves to prevent excessive calculation
    const maxMovesToEvaluate = Math.min(moves.length, 20);
    
    // Order moves for better alpha-beta pruning
    const orderedMoves = this.orderMoves(game, moves).slice(0, maxMovesToEvaluate);
    console.log(`ExtendedChessAI: Evaluating top ${orderedMoves.length} moves`);

    let bestScore = -Infinity;
    let bestMoves = [];
    let movesEvaluated = 0;

    for (const move of orderedMoves) {
      // Check time limit
      if (Date.now() - startTime > 2000) {
        console.log('ExtendedChessAI: Time limit reached, returning current best move');
        break;
      }

      const undo = this.makeMove(game, move);
      // Get score from white's perspective
      let score = this.minimax(game, this.getOpponent(color), depth - 1, -Infinity, Infinity, color === 'white');
      
      // If we're playing as black, flip the score to get it from black's perspective
      if (color === 'black') {
        score = -score;
      }
      
      this.unmakeMove(game, move, undo);

      movesEvaluated++;
      if (movesEvaluated % 3 === 0) {
        console.log(`ExtendedChessAI: Evaluated ${movesEvaluated}/${orderedMoves.length} moves`);
      }

      // Always want the highest score (from current player's perspective)
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    const chosenMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    console.log(`ExtendedChessAI: Chosen move ${this.moveToString(chosenMove)} with score ${bestScore}`);
    return chosenMove;
  }

  /**
   * Order moves for better alpha-beta pruning
   * Captures and high-value moves first
   */
  orderMoves(game, moves) {
    return moves.sort((a, b) => {
      const scoreA = this.getMoveScore(game, a);
      const scoreB = this.getMoveScore(game, b);
      return scoreB - scoreA; // Higher scores first
    });
  }

  /**
   * Get a quick score for move ordering
   */
  getMoveScore(game, move) {
    let score = 0;
    
    // Prioritize captures
    const capturedPiece = game.board[move.to.r][move.to.c];
    if (capturedPiece) {
      score += this.pieceValues[capturedPiece.type];
      // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
      score -= this.pieceValues[move.piece.type] / 10;
    }
    
    // Prioritize center moves
    const centerDistance = Math.abs(move.to.r - 6) + Math.abs(move.to.c - 6);
    score += (12 - centerDistance) * 2;
    
    return score;
  }

  /**
   * Minimax algorithm with alpha-beta pruning
   * Always evaluates from white's perspective, then adjusts based on player
   */
  minimax(game, color, depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      // Always evaluate from white's perspective
      const whiteScore = this.evaluatePosition(game, 'white');
      return isMaximizing ? whiteScore : -whiteScore;
    }

    const moves = this.generateAllLegalMoves(game, color);
    if (moves.length === 0) {
      // Check for checkmate or stalemate
      if (game.isKingInCheck(color)) {
        return isMaximizing ? -99999 + (4 - depth) : 99999 - (4 - depth);
      }
      return 0; // Stalemate
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(game, moves);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of orderedMoves) {
        const undo = this.makeMove(game, move);
        const evaluation = this.minimax(game, this.getOpponent(color), depth - 1, alpha, beta, false);
        this.unmakeMove(game, move, undo);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of orderedMoves) {
        const undo = this.makeMove(game, move);
        const evaluation = this.minimax(game, this.getOpponent(color), depth - 1, alpha, beta, true);
        this.unmakeMove(game, move, undo);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  /**
   * Evaluate the current position
   */
  evaluatePosition(game, perspective = 'white') {
    let score = 0;

    // Material and positional evaluation
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const piece = game.board[r][c];
        if (piece) {
          const pieceValue = this.pieceValues[piece.type] || 0;
          const positionValue = this.pieceSquareTables[piece.type][r][c] || 0;
          const totalValue = pieceValue + positionValue;

          if (piece.color === 'white') {
            score += totalValue;
          } else {
            score -= totalValue;
          }
        }
      }
    }

    // Additional evaluation factors
    score += this.evaluateMobility(game, 'white') - this.evaluateMobility(game, 'black');
    score += this.evaluateKingSafety(game, 'white') - this.evaluateKingSafety(game, 'black');
    score += this.evaluatePawnStructure(game, 'white') - this.evaluatePawnStructure(game, 'black');

    // Return score from the perspective of the specified color
    return perspective === 'white' ? score : -score;
  }

  /**
   * Evaluate piece mobility (number of legal moves)
   */
  evaluateMobility(game, color) {
    const moves = this.generateAllLegalMoves(game, color);
    return moves.length * 10; // Each move worth 10 points
  }

  /**
   * Evaluate king safety
   */
  evaluateKingSafety(game, color) {
    let safety = 0;
    const king = this.findKing(game, color);
    if (!king) return -1000;

    // Penalty for being in check
    if (game.isKingInCheck(color)) {
      safety -= 50;
    }

    // Bonus for king being in corner areas during endgame
    const totalPieces = this.countPieces(game);
    if (totalPieces <= 10) { // Endgame
      const distanceFromCenter = Math.abs(king.r - 6) + Math.abs(king.c - 6);
      safety -= distanceFromCenter * 5;
    }

    return safety;
  }

  /**
   * Evaluate pawn structure
   */
  evaluatePawnStructure(game, color) {
    let score = 0;
    const pawns = this.findPieces(game, 'pawn', color);

    // Bonus for passed pawns
    for (const pawn of pawns) {
      if (this.isPassedPawn(game, pawn, color)) {
        score += 50;
      }
    }

    // Penalty for isolated pawns
    for (const pawn of pawns) {
      if (this.isIsolatedPawn(game, pawn, color)) {
        score -= 20;
      }
    }

    return score;
  }

  /**
   * Generate all legal moves for a color
   */
  generateAllLegalMoves(game, color) {
    const moves = [];
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const piece = game.board[r][c];
        if (piece && piece.color === color) {
          const pieceMoves = game.calculatePossibleMoves(r, c);
          for (const [toR, toC] of pieceMoves) {
            moves.push({
              from: { r, c },
              to: { r: toR, c: toC },
              piece: { ...piece }
            });
          }
        }
      }
    }
    return moves;
  }

  /**
   * Make a move temporarily for evaluation
   */
  makeMove(game, move) {
    const { from, to } = move;
    const capturedPiece = game.board[to.r][to.c] ? { ...game.board[to.r][to.c] } : null;
    const movingPiece = { ...game.board[from.r][from.c] };

    game.board[to.r][to.c] = movingPiece;
    game.board[from.r][from.c] = null;

    return { capturedPiece, movingPiece, from, to };
  }

  /**
   * Unmake a move
   */
  unmakeMove(game, move, undo) {
    const { from, to } = move;
    game.board[from.r][from.c] = undo.movingPiece;
    game.board[to.r][to.c] = undo.capturedPiece;
  }

  /**
   * Helper functions
   */
  getOpponent(color) {
    return color === 'white' ? 'black' : 'white';
  }

  findKing(game, color) {
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const piece = game.board[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { r, c };
        }
      }
    }
    return null;
  }

  findPieces(game, type, color) {
    const pieces = [];
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        const piece = game.board[r][c];
        if (piece && piece.type === type && piece.color === color) {
          pieces.push({ r, c });
        }
      }
    }
    return pieces;
  }

  countPieces(game) {
    let count = 0;
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 12; c++) {
        if (game.board[r][c]) count++;
      }
    }
    return count;
  }

  isPassedPawn(game, pawn, color) {
    const direction = color === 'white' ? -1 : 1;
    const { r, c } = pawn;

    // Check if any enemy pawns block this pawn's path
    for (let checkR = r + direction; checkR >= 2 && checkR <= 9; checkR += direction) {
      for (let checkC = Math.max(2, c - 1); checkC <= Math.min(9, c + 1); checkC++) {
        const piece = game.board[checkR][checkC];
        if (piece && piece.type === 'pawn' && piece.color !== color) {
          return false;
        }
      }
    }
    return true;
  }

  isIsolatedPawn(game, pawn, color) {
    const { r, c } = pawn;

    // Check adjacent files for friendly pawns
    for (const fileOffset of [-1, 1]) {
      const checkC = c + fileOffset;
      if (checkC >= 2 && checkC <= 9) {
        for (let checkR = 2; checkR <= 9; checkR++) {
          const piece = game.board[checkR][checkC];
          if (piece && piece.type === 'pawn' && piece.color === color) {
            return false;
          }
        }
      }
    }
    return true;
  }

  moveToString(move) {
    const fromFile = String.fromCharCode(97 + (move.from.c - 2));
    const fromRank = 8 - (move.from.r - 2);
    const toFile = String.fromCharCode(97 + (move.to.c - 2));
    const toRank = 8 - (move.to.r - 2);
    return `${fromFile}${fromRank}${toFile}${toRank}`;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtendedChessAI;
} else if (typeof window !== 'undefined') {
  window.ExtendedChessAI = ExtendedChessAI;
}
