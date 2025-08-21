/**
 * Configuration for Extended Chess AI
 */

const ExtendedChessConfig = {
  // Board dimensions
  BOARD_SIZE: 12,
  PLAYABLE_MIN: 2,
  PLAYABLE_MAX: 9,
  
  // AI settings
  DEFAULT_DEPTH: 4,
  MAX_DEPTH: 6,
  
  // Evaluation weights
  MOBILITY_WEIGHT: 10,
  KING_SAFETY_WEIGHT: 1,
  PAWN_STRUCTURE_WEIGHT: 1,
  
  // Position values
  PASSED_PAWN_BONUS: 50,
  ISOLATED_PAWN_PENALTY: -20,
  CHECK_PENALTY: -50,
  
  // Piece values (centipawns)
  PIECE_VALUES: {
    pawn: 100,
    knight: 320,
    bishop: 330,
    rook: 500,
    queen: 900,
    king: 20000
  },
  
  // Time limits (milliseconds)
  MOVE_TIME_LIMIT: 5000,
  QUICK_MOVE_TIME: 1000,
  
  // Debug settings
  DEBUG_MODE: false,
  LOG_MOVES: true,
  LOG_EVALUATIONS: false
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtendedChessConfig;
} else if (typeof window !== 'undefined') {
  window.ExtendedChessConfig = ExtendedChessConfig;
}
