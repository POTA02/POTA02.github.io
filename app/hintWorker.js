// Hint calculation worker - prevents UI freezing
class StockfishLikeEngine {
    constructor() {
        this.pieceValues = { 
            pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 
        };
        
        // Piece-Square Tables (Stockfish-inspired)
        this.pawnTable = [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [ 50, 50, 50, 50, 50, 50, 50, 50],
            [ 10, 10, 20, 30, 30, 20, 10, 10],
            [  5,  5, 10, 25, 25, 10,  5,  5],
            [  0,  0,  0, 20, 20,  0,  0,  0],
            [  5, -5,-10,  0,  0,-10, -5,  5],
            [  5, 10, 10,-20,-20, 10, 10,  5],
            [  0,  0,  0,  0,  0,  0,  0,  0]
        ];
        
        this.knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
        
        this.bishopTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];
        
        this.rookTable = [
            [  0,  0,  0,  0,  0,  0,  0,  0],
            [  5, 10, 10, 10, 10, 10, 10,  5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [ -5,  0,  0,  0,  0,  0,  0, -5],
            [  0,  0,  0,  5,  5,  0,  0,  0]
        ];
        
        this.queenTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [ -5,  0,  5,  5,  5,  5,  0, -5],
            [  0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];
        
        this.kingMiddlegameTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [ 20, 20,  0,  0,  0,  0, 20, 20],
            [ 20, 30, 10,  0,  0, 10, 30, 20]
        ];
        
        this.kingEndgameTable = [
            [-50,-40,-30,-20,-20,-30,-40,-50],
            [-30,-20,-10,  0,  0,-10,-20,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-30,  0,  0,  0,  0,-30,-30],
            [-50,-30,-30,-30,-30,-30,-30,-50]
        ];
    }
    
    calculateBestMove(boardState, color, depth = 4) {
        const moves = this.generateAllLegalMoves(boardState, color);
        if (moves.length === 0) return null;
        
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Move ordering for better alpha-beta pruning
        const sortedMoves = this.orderMoves(boardState, moves);
        
        for (const move of sortedMoves) {
            const undo = this.makeMove(boardState, move);
            const score = -this.search(boardState, this.getOpponent(color), depth - 1, -Infinity, Infinity);
            this.unmakeMove(boardState, move, undo);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    // Advanced search with iterative deepening and time management
    search(board, color, depth, alpha, beta) {
        if (depth === 0) {
            return this.quiescenceSearch(board, color, 0, alpha, beta);
        }
        
        const moves = this.generateAllLegalMoves(board, color);
        if (moves.length === 0) {
            if (this.isKingInCheck(board, color)) {
                return -9999 + (4 - depth); // Mate distance
            }
            return 0; // Stalemate
        }
        
        const sortedMoves = this.orderMoves(board, moves);
        
        for (const move of sortedMoves) {
            const undo = this.makeMove(board, move);
            const score = -this.search(board, this.getOpponent(color), depth - 1, -beta, -alpha);
            this.unmakeMove(board, move, undo);
            
            if (score >= beta) {
                return beta; // Beta cutoff
            }
            alpha = Math.max(alpha, score);
        }
        
        return alpha;
    }
    
    // Quiescence search - only tactical moves to avoid horizon effect
    quiescenceSearch(board, color, depth, alpha, beta) {
        if (depth > 6) return this.evaluate(board, color); // Limit qs depth
        
        const standPat = this.evaluate(board, color);
        if (standPat >= beta) return beta;
        alpha = Math.max(alpha, standPat);
        
        const captures = this.generateCaptures(board, color);
        const sortedCaptures = this.orderMoves(board, captures);
        
        for (const move of sortedCaptures) {
            // Delta pruning - skip obviously bad captures
            const captureValue = this.pieceValues[board[move.to.r][move.to.c]?.type] || 0;
            if (standPat + captureValue + 200 < alpha) continue;
            
            const undo = this.makeMove(board, move);
            const score = -this.quiescenceSearch(board, this.getOpponent(color), depth + 1, -beta, -alpha);
            this.unmakeMove(board, move, undo);
            
            if (score >= beta) return beta;
            alpha = Math.max(alpha, score);
        }
        
        return alpha;
    }
    
    // Stockfish-style evaluation
    evaluate(board, color) {
        let score = 0;
        let whiteKingPos = null, blackKingPos = null;
        let totalMaterial = 0;
        
        // Material and position evaluation
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece) continue;
                
                const pieceValue = this.pieceValues[piece.type] || 0;
                const posValue = this.getPositionalValue(piece, r, c, totalMaterial > 2000);
                totalMaterial += pieceValue;
                
                if (piece.type === 'king') {
                    if (piece.color === 'white') whiteKingPos = {r, c};
                    else blackKingPos = {r, c};
                }
                
                if (piece.color === color) {
                    score += pieceValue + posValue;
                } else {
                    score -= pieceValue + posValue;
                }
            }
        }
        
        // Mobility evaluation
        const myMobility = this.generateAllLegalMoves(board, color).length;
        const oppMobility = this.generateAllLegalMoves(board, this.getOpponent(color)).length;
        score += (myMobility - oppMobility) * 10;
        
        // King safety
        if (whiteKingPos && blackKingPos) {
            const myKingPos = color === 'white' ? whiteKingPos : blackKingPos;
            const oppKingPos = color === 'white' ? blackKingPos : whiteKingPos;
            
            score += this.evaluateKingSafety(board, myKingPos, color);
            score -= this.evaluateKingSafety(board, oppKingPos, this.getOpponent(color));
        }
        
        // Pawn structure
        score += this.evaluatePawnStructure(board, color);
        
        return score;
    }
    
    getPositionalValue(piece, r, c, isEndgame) {
        const tables = {
            'pawn': this.pawnTable,
            'knight': this.knightTable,
            'bishop': this.bishopTable,
            'rook': this.rookTable,
            'queen': this.queenTable,
            'king': isEndgame ? this.kingEndgameTable : this.kingMiddlegameTable
        };
        
        const table = tables[piece.type];
        if (!table) return 0;
        
        // Flip table for black pieces
        const row = piece.color === 'white' ? r : 7 - r;
        return table[row][c];
    }
    
    evaluateKingSafety(board, kingPos, color) {
        let safety = 0;
        const opp = this.getOpponent(color);
        
        // Check for attacks around king
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = kingPos.r + dr;
                const c = kingPos.c + dc;
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    if (this.squareAttackedBy(board, r, c, opp)) {
                        safety -= 20;
                    }
                }
            }
        }
        
        return safety;
    }
    
    evaluatePawnStructure(board, color) {
        let score = 0;
        const pawns = [];
        
        // Collect pawn positions
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type === 'pawn' && piece.color === color) {
                    pawns.push({r, c});
                }
            }
        }
        
        // Evaluate pawn structure
        for (const pawn of pawns) {
            // Doubled pawns penalty
            const doubled = pawns.filter(p => p.c === pawn.c && p.r !== pawn.r).length;
            score -= doubled * 10;
            
            // Isolated pawns penalty
            const hasSupport = pawns.some(p => Math.abs(p.c - pawn.c) === 1);
            if (!hasSupport) score -= 20;
        }
        
        return score;
    }
    
    orderMoves(board, moves) {
        return moves.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            
            // Captures first
            const captureA = board[a.to.r][a.to.c];
            const captureB = board[b.to.r][b.to.c];
            
            if (captureA) scoreA += this.pieceValues[captureA.type] - this.pieceValues[a.piece.type];
            if (captureB) scoreB += this.pieceValues[captureB.type] - this.pieceValues[b.piece.type];
            
            return scoreB - scoreA;
        });
    }
    
    generateCaptures(board, color) {
        const moves = this.generateAllLegalMoves(board, color);
        return moves.filter(move => board[move.to.r][move.to.c]);
    }
    
    // Helper methods (complete implementations for the worker)
    generateAllLegalMoves(board, color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === color) {
                    const pieceMoves = this.calculatePossibleMoves(board, r, c);
                    pieceMoves.forEach(([tr, tc]) => {
                        // Check if move is legal (doesn't leave king in check)
                        const move = { from: {r, c}, to: {r: tr, c: tc}, piece: {...piece} };
                        if (this.isMoveLegal(board, move, color)) {
                            moves.push(move);
                        }
                    });
                }
            }
        }
        return moves;
    }
    
    calculatePossibleMoves(board, row, col) {
        const piece = board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const color = piece.color;
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        switch (piece.type) {
            case 'pawn':
                const direction = color === 'white' ? -1 : 1;
                const startRow = color === 'white' ? 6 : 1;
                
                // Forward move
                if (this.isSquareEmpty(board, row + direction, col)) {
                    moves.push([row + direction, col]);
                    
                    // Double move from start
                    if (row === startRow && this.isSquareEmpty(board, row + 2 * direction, col)) {
                        moves.push([row + 2 * direction, col]);
                    }
                }
                
                // Captures
                if (this.isOpponentPiece(board, row + direction, col - 1, opponentColor)) {
                    moves.push([row + direction, col - 1]);
                }
                if (this.isOpponentPiece(board, row + direction, col + 1, opponentColor)) {
                    moves.push([row + direction, col + 1]);
                }
                break;
                
            case 'rook':
                this.addSlidingMoves(board, row, col, [
                    [-1, 0], [1, 0], [0, -1], [0, 1]
                ], moves, opponentColor);
                break;
                
            case 'knight':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidSquare(newRow, newCol) && 
                        (this.isSquareEmpty(board, newRow, newCol) || 
                         this.isOpponentPiece(board, newRow, newCol, opponentColor))) {
                        moves.push([newRow, newCol]);
                    }
                });
                break;
                
            case 'bishop':
                this.addSlidingMoves(board, row, col, [
                    [-1, -1], [-1, 1], [1, -1], [1, 1]
                ], moves, opponentColor);
                break;
                
            case 'queen':
                this.addSlidingMoves(board, row, col, [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ], moves, opponentColor);
                break;
                
            case 'king':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                kingMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidSquare(newRow, newCol) && 
                        (this.isSquareEmpty(board, newRow, newCol) || 
                         this.isOpponentPiece(board, newRow, newCol, opponentColor))) {
                        moves.push([newRow, newCol]);
                    }
                });
                break;
        }
        
        return moves;
    }
    
    addSlidingMoves(board, row, col, directions, moves, opponentColor) {
        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidSquare(newRow, newCol)) {
                if (this.isSquareEmpty(board, newRow, newCol)) {
                    moves.push([newRow, newCol]);
                } else if (this.isOpponentPiece(board, newRow, newCol, opponentColor)) {
                    moves.push([newRow, newCol]);
                    break;
                } else {
                    break; // Own piece
                }
                newRow += dr;
                newCol += dc;
            }
        });
    }
    
    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    isSquareEmpty(board, row, col) {
        return this.isValidSquare(row, col) && !board[row][col];
    }
    
    isOpponentPiece(board, row, col, opponentColor) {
        return this.isValidSquare(row, col) && 
               board[row][col] && 
               board[row][col].color === opponentColor;
    }
    
    isMoveLegal(board, move, color) {
        // Make the move temporarily
        const captured = board[move.to.r][move.to.c];
        board[move.to.r][move.to.c] = board[move.from.r][move.from.c];
        board[move.from.r][move.from.c] = null;
        
        // Check if king is in check after the move
        const isLegal = !this.isKingInCheck(board, color);
        
        // Undo the move
        board[move.from.r][move.from.c] = board[move.to.r][move.to.c];
        board[move.to.r][move.to.c] = captured;
        
        return isLegal;
    }
    
    makeMove(board, move) {
        const captured = board[move.to.r][move.to.c];
        board[move.to.r][move.to.c] = board[move.from.r][move.from.c];
        board[move.from.r][move.from.c] = null;
        return { captured };
    }
    
    unmakeMove(board, move, undo) {
        board[move.from.r][move.from.c] = board[move.to.r][move.to.c];
        board[move.to.r][move.to.c] = undo.captured;
    }
    
    getOpponent(color) {
        return color === 'white' ? 'black' : 'white';
    }
    
    isKingInCheck(board, color) {
        // Find the king
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = { r, c };
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false; // No king found
        
        return this.squareAttackedBy(board, kingPos.r, kingPos.c, this.getOpponent(color));
    }
    
    squareAttackedBy(board, row, col, attackerColor) {
        // Check if any opponent piece can attack this square
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.color === attackerColor) {
                    const attacks = this.getAttackSquares(board, r, c);
                    if (attacks.some(([ar, ac]) => ar === row && ac === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    getAttackSquares(board, row, col) {
        const piece = board[row][col];
        if (!piece) return [];
        
        const attacks = [];
        
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                if (this.isValidSquare(row + direction, col - 1)) {
                    attacks.push([row + direction, col - 1]);
                }
                if (this.isValidSquare(row + direction, col + 1)) {
                    attacks.push([row + direction, col + 1]);
                }
                break;
                
            case 'rook':
                this.addSlidingAttacks(board, row, col, [
                    [-1, 0], [1, 0], [0, -1], [0, 1]
                ], attacks);
                break;
                
            case 'knight':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidSquare(newRow, newCol)) {
                        attacks.push([newRow, newCol]);
                    }
                });
                break;
                
            case 'bishop':
                this.addSlidingAttacks(board, row, col, [
                    [-1, -1], [-1, 1], [1, -1], [1, 1]
                ], attacks);
                break;
                
            case 'queen':
                this.addSlidingAttacks(board, row, col, [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ], attacks);
                break;
                
            case 'king':
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                kingMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (this.isValidSquare(newRow, newCol)) {
                        attacks.push([newRow, newCol]);
                    }
                });
                break;
        }
        
        return attacks;
    }
    
    addSlidingAttacks(board, row, col, directions, attacks) {
        directions.forEach(([dr, dc]) => {
            let newRow = row + dr;
            let newCol = col + dc;
            
            while (this.isValidSquare(newRow, newCol)) {
                attacks.push([newRow, newCol]);
                if (board[newRow][newCol]) {
                    break; // Stop at first piece
                }
                newRow += dr;
                newCol += dc;
            }
        });
    }
}

// Worker message handler
self.onmessage = function(e) {
    const { boardState, color, depth } = e.data;
    const engine = new StockfishLikeEngine();
    
    try {
        const bestMove = engine.calculateBestMove(boardState, color, depth);
        self.postMessage({ success: true, move: bestMove });
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};
