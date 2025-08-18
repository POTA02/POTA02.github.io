// Advanced Hint Worker - Enhanced chess engine for multiple move analysis
class AdvancedHintEngine {
    constructor() {
        this.pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
        
        // Enhanced piece-square tables for better positional evaluation
        this.pieceSquareTables = {
            'pawn': [
                [0,  0,  0,  0,  0,  0,  0,  0],
                [50, 50, 50, 50, 50, 50, 50, 50],
                [10, 10, 20, 30, 30, 20, 10, 10],
                [5,  5, 10, 25, 25, 10,  5,  5],
                [0,  0,  0, 20, 20,  0,  0,  0],
                [5, -5,-10,  0,  0,-10, -5,  5],
                [5, 10, 10,-20,-20, 10, 10,  5],
                [0,  0,  0,  0,  0,  0,  0,  0]
            ],
            'knight': [
                [-50,-40,-30,-30,-30,-30,-40,-50],
                [-40,-20,  0,  0,  0,  0,-20,-40],
                [-30,  0, 10, 15, 15, 10,  0,-30],
                [-30,  5, 15, 20, 20, 15,  5,-30],
                [-30,  0, 15, 20, 20, 15,  0,-30],
                [-30,  5, 10, 15, 15, 10,  5,-30],
                [-40,-20,  0,  5,  5,  0,-20,-40],
                [-50,-40,-30,-30,-30,-30,-40,-50]
            ],
            'bishop': [
                [-20,-10,-10,-10,-10,-10,-10,-20],
                [-10,  0,  0,  0,  0,  0,  0,-10],
                [-10,  0,  5, 10, 10,  5,  0,-10],
                [-10,  5,  5, 10, 10,  5,  5,-10],
                [-10,  0, 10, 10, 10, 10,  0,-10],
                [-10, 10, 10, 10, 10, 10, 10,-10],
                [-10,  5,  0,  0,  0,  0,  5,-10],
                [-20,-10,-10,-10,-10,-10,-10,-20]
            ]
        };
        
        this.transpositionTable = new Map();
        this.maxDepth = 4; // Increased depth for better analysis
    }
    
    // Generate all possible moves for a given color
    generateAllMoves(board, color) {
        const moves = [];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === color) {
                    const pieceMoves = this.generatePieceMoves(board, r, c, piece);
                    moves.push(...pieceMoves);
                }
            }
        }
        
        return moves;
    }
    
    // Generate moves for a specific piece
    generatePieceMoves(board, row, col, piece) {
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves.push(...this.generatePawnMoves(board, row, col, piece.color));
                break;
            case 'rook':
                moves.push(...this.generateRookMoves(board, row, col, piece.color));
                break;
            case 'knight':
                moves.push(...this.generateKnightMoves(board, row, col, piece.color));
                break;
            case 'bishop':
                moves.push(...this.generateBishopMoves(board, row, col, piece.color));
                break;
            case 'queen':
                moves.push(...this.generateQueenMoves(board, row, col, piece.color));
                break;
            case 'king':
                moves.push(...this.generateKingMoves(board, row, col, piece.color));
                break;
        }
        
        return moves;
    }
    
    // Helper method to check if a position is valid
    isValidPosition(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }
    
    // Generate pawn moves
    generatePawnMoves(board, row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        const newRow = row + direction;
        if (this.isValidPosition(newRow, col) && !board[newRow][col]) {
            moves.push({ from: { r: row, c: col }, to: { r: newRow, c: col }, piece: board[row][col] });
            
            // Double move from starting position
            if (row === startRow && !board[newRow + direction][col]) {
                moves.push({ from: { r: row, c: col }, to: { r: newRow + direction, c: col }, piece: board[row][col] });
            }
        }
        
        // Capture moves
        for (const captureCol of [col - 1, col + 1]) {
            if (this.isValidPosition(newRow, captureCol) && board[newRow][captureCol] && board[newRow][captureCol].color !== color) {
                moves.push({ from: { r: row, c: col }, to: { r: newRow, c: captureCol }, piece: board[row][col] });
            }
        }
        
        return moves;
    }
    
    // Generate rook moves
    generateRookMoves(board, row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                } else {
                    if (target.color !== color) {
                        moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }
    
    // Generate knight moves
    generateKnightMoves(board, row, col, color) {
        const moves = [];
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        for (const [dr, dc] of knightMoves) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                }
            }
        }
        
        return moves;
    }
    
    // Generate bishop moves
    generateBishopMoves(board, row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + dr * i;
                const newCol = col + dc * i;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                } else {
                    if (target.color !== color) {
                        moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }
    
    // Generate queen moves (combination of rook and bishop)
    generateQueenMoves(board, row, col, color) {
        return [
            ...this.generateRookMoves(board, row, col, color),
            ...this.generateBishopMoves(board, row, col, color)
        ];
    }
    
    // Generate king moves
    generateKingMoves(board, row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (this.isValidPosition(newRow, newCol)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ from: { r: row, c: col }, to: { r: newRow, c: newCol }, piece: board[row][col] });
                }
            }
        }
        
        return moves;
    }
    
    // Enhanced board evaluation
    evaluateBoard(board, color) {
        let score = 0;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    let pieceValue = this.pieceValues[piece.type];
                    
                    // Add positional bonus
                    if (this.pieceSquareTables[piece.type]) {
                        const tableRow = piece.color === 'white' ? r : 7 - r;
                        pieceValue += this.pieceSquareTables[piece.type][tableRow][c];
                    }
                    
                    // Mobility bonus
                    const moves = this.generatePieceMoves(board, r, c, piece);
                    pieceValue += moves.length * 10;
                    
                    if (piece.color === color) {
                        score += pieceValue;
                    } else {
                        score -= pieceValue;
                    }
                }
            }
        }
        
        return score;
    }
    
    // Make a move on the board
    makeMove(board, move) {
        const newBoard = board.map(row => [...row]);
        newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
        newBoard[move.from.r][move.from.c] = null;
        return newBoard;
    }
    
    // Minimax with alpha-beta pruning and transposition table
    minimax(board, depth, alpha, beta, maximizingPlayer, color) {
        const boardKey = JSON.stringify(board) + depth + maximizingPlayer;
        
        if (this.transpositionTable.has(boardKey)) {
            return this.transpositionTable.get(boardKey);
        }
        
        if (depth === 0) {
            const score = this.evaluateBoard(board, color);
            this.transpositionTable.set(boardKey, { score, move: null });
            return { score, move: null };
        }
        
        const currentColor = maximizingPlayer ? color : (color === 'white' ? 'black' : 'white');
        const moves = this.generateAllMoves(board, currentColor);
        
        if (moves.length === 0) {
            const score = maximizingPlayer ? -Infinity : Infinity;
            this.transpositionTable.set(boardKey, { score, move: null });
            return { score, move: null };
        }
        
        let bestMove = null;
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, false, color);
                
                if (evaluation.score > maxEval) {
                    maxEval = evaluation.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, evaluation.score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            const result = { score: maxEval, move: bestMove };
            this.transpositionTable.set(boardKey, result);
            return result;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const newBoard = this.makeMove(board, move);
                const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, true, color);
                
                if (evaluation.score < minEval) {
                    minEval = evaluation.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            const result = { score: minEval, move: bestMove };
            this.transpositionTable.set(boardKey, result);
            return result;
        }
    }
    
    // Get top N moves for advanced hints
    getTopMoves(board, color, count = 2) {
        const moves = this.generateAllMoves(board, color);
        const evaluatedMoves = [];
        
        // Evaluate each move with shallow search
        for (const move of moves) {
            const newBoard = this.makeMove(board, move);
            const evaluation = this.minimax(newBoard, 2, -Infinity, Infinity, false, color);
            evaluatedMoves.push({ ...move, score: evaluation.score });
        }
        
        // Sort by score and return top moves
        evaluatedMoves.sort((a, b) => b.score - a.score);
        return evaluatedMoves.slice(0, count);
    }
    
    // Predict opponent's best response
    getBestResponse(board, color, playerMove) {
        const newBoard = this.makeMove(board, playerMove);
        const opponentColor = color === 'white' ? 'black' : 'white';
        const evaluation = this.minimax(newBoard, this.maxDepth - 1, -Infinity, Infinity, true, opponentColor);
        return evaluation.move;
    }
}

// Create engine instance
const engine = new AdvancedHintEngine();

// Listen for messages from main thread
self.onmessage = function(e) {
    const { type, board, color, data } = e.data;
    
    try {
        switch (type) {
            case 'getTopMoves':
                const topMoves = engine.getTopMoves(board, color, data.count || 2);
                self.postMessage({ type: 'topMoves', moves: topMoves });
                break;
                
            case 'getBestResponse':
                const response = engine.getBestResponse(board, color, data.playerMove);
                self.postMessage({ type: 'bestResponse', move: response });
                break;
                
            case 'evaluatePosition':
                const score = engine.evaluateBoard(board, color);
                self.postMessage({ type: 'evaluation', score });
                break;
                
            default:
                self.postMessage({ type: 'error', message: 'Unknown command type' });
        }
    } catch (error) {
        self.postMessage({ type: 'error', message: error.message });
    }
};

console.log('Advanced Hint Worker initialized');
