/**
 * Core Chess Engine
 * 
 * Complete chess engine with all standard rules implemented.
 * 
 * Features:
 * - Complete chess rule implementation
 * - Move validation and generation
 * - Check/checkmate detection
 * - Castling, en passant, promotion
 * - Move history and undo functionality
 * - Board flipping support
 * - Game state management
 */

export class ChessEngineCore {
    constructor(config = {}) {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.turn = 'white';
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.check = false;
        this.gameOver = false;
        this.lastMove = null;
        this.promotingPawn = null;
        this.gameStartTime = null;
        this.gameTime = 0;
        this.moveCount = 0;
        this.checksGiven = 0;
        this.castlesPerformed = 0;
        this.enPassantCount = 0;
        this.flipped = false;
        
        // Configuration options
        this.config = {
            allowUndo: true,
            maxMoveHistory: 100,
            enableAnalytics: true,
            ...config
        };
        
        this.setupBoard();
    }

    /**
     * Initialize the chess board with starting positions
     */
    setupBoard() {
        // Clear board
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Setup pawns
        for (let col = 0; col < 8; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
            this.board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Setup major pieces
        const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            this.board[0][col] = { type: pieces[col], color: 'black', hasMoved: false };
            this.board[7][col] = { type: pieces[col], color: 'white', hasMoved: false };
        }
        
        this.gameStartTime = Date.now();
        this.resetGameState();
    }

    /**
     * Reset game state variables
     */
    resetGameState() {
        this.turn = 'white';
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.check = false;
        this.gameOver = false;
        this.lastMove = null;
        this.promotingPawn = null;
        this.gameTime = 0;
        this.moveCount = 0;
        this.checksGiven = 0;
        this.castlesPerformed = 0;
        this.enPassantCount = 0;
    }

    /**
     * Calculate all possible moves for a piece at given position
     * @param {number} row - Row position (0-7)
     * @param {number} col - Column position (0-7)
     * @returns {Array} Array of possible moves [[row, col], ...]
     */
    calculatePossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.turn) return [];
        
        const moves = [];
        const color = piece.color;
        const opponentColor = color === 'white' ? 'black' : 'white';

        const isInBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
        
        const addDirectionalMoves = (dr, dc) => {
            let r = row + dr, c = col + dc;
            while (isInBounds(r, c)) {
                if (!this.board[r][c]) {
                    moves.push([r, c]);
                } else {
                    if (this.board[r][c].color === opponentColor) {
                        moves.push([r, c]);
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        };

        switch (piece.type) {
            case 'pawn':
                this.calculatePawnMoves(row, col, moves, color, opponentColor, isInBounds);
                break;
            case 'rook':
                addDirectionalMoves(-1, 0); // Up
                addDirectionalMoves(1, 0);  // Down
                addDirectionalMoves(0, -1); // Left
                addDirectionalMoves(0, 1);  // Right
                break;
            case 'bishop':
                addDirectionalMoves(-1, -1); // Up-Left
                addDirectionalMoves(-1, 1);  // Up-Right
                addDirectionalMoves(1, -1);  // Down-Left
                addDirectionalMoves(1, 1);   // Down-Right
                break;
            case 'queen':
                // Combination of rook and bishop
                for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]) {
                    addDirectionalMoves(dr, dc);
                }
                break;
            case 'knight':
                this.calculateKnightMoves(row, col, moves, opponentColor, isInBounds);
                break;
            case 'king':
                this.calculateKingMoves(row, col, moves, color, opponentColor, isInBounds);
                break;
        }

        // Filter out moves that would put own king in check
        return moves.filter(([r, c]) => !this.wouldBeInCheck(row, col, r, c, color));
    }

    /**
     * Calculate pawn-specific moves including en passant
     */
    calculatePawnMoves(row, col, moves, color, opponentColor, isInBounds) {
        const dir = color === 'white' ? -1 : 1;
        const piece = this.board[row][col];
        
        // Move forward
        if (isInBounds(row + dir, col) && !this.board[row + dir][col]) {
            moves.push([row + dir, col]);
            // Double move from starting position
            if (!piece.hasMoved && isInBounds(row + 2 * dir, col) && !this.board[row + 2 * dir][col]) {
                moves.push([row + 2 * dir, col]);
            }
        }
        
        // Capture diagonally
        for (const dc of [-1, 1]) {
            const r = row + dir, c = col + dc;
            if (isInBounds(r, c)) {
                if (this.board[r][c] && this.board[r][c].color === opponentColor) {
                    moves.push([r, c]);
                }
                // En passant
                if (!this.board[r][c] && this.lastMove &&
                    this.lastMove.piece.type === 'pawn' && this.lastMove.piece.color === opponentColor &&
                    Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
                    this.lastMove.to.row === row && this.lastMove.to.col === c) {
                    moves.push([r, c]);
                }
            }
        }
    }

    /**
     * Calculate knight moves (L-shaped)
     */
    calculateKnightMoves(row, col, moves, opponentColor, isInBounds) {
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dr, dc] of knightMoves) {
            const r = row + dr, c = col + dc;
            if (isInBounds(r, c)) {
                if (!this.board[r][c] || this.board[r][c].color === opponentColor) {
                    moves.push([r, c]);
                }
            }
        }
    }

    /**
     * Calculate king moves including castling
     */
    calculateKingMoves(row, col, moves, color, opponentColor, isInBounds) {
        // Regular king moves
        for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
            const r = row + dr, c = col + dc;
            if (isInBounds(r, c)) {
                if (!this.board[r][c] || this.board[r][c].color === opponentColor) {
                    moves.push([r, c]);
                }
            }
        }
        
        // Castling
        this.calculateCastlingMoves(row, col, moves, color);
    }

    /**
     * Calculate castling possibilities
     */
    calculateCastlingMoves(row, col, moves, color) {
        const piece = this.board[row][col];
        if (piece.hasMoved || this.isKingInCheck(color)) return;
        
        const backRank = color === 'white' ? 7 : 0;
        if (row !== backRank) return;
        
        // Kingside castling
        const kingsideRook = this.board[backRank][7];
        if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
            if (!this.board[backRank][5] && !this.board[backRank][6]) {
                // Check if path is safe
                if (!this.isSquareAttacked(backRank, 5, color) && !this.isSquareAttacked(backRank, 6, color)) {
                    moves.push([backRank, 6]);
                }
            }
        }
        
        // Queenside castling
        const queensideRook = this.board[backRank][0];
        if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
            if (!this.board[backRank][1] && !this.board[backRank][2] && !this.board[backRank][3]) {
                // Check if path is safe
                if (!this.isSquareAttacked(backRank, 2, color) && !this.isSquareAttacked(backRank, 3, color)) {
                    moves.push([backRank, 2]);
                }
            }
        }
    }

    /**
     * Execute a move from one position to another
     * @param {number} fromRow - Starting row
     * @param {number} fromCol - Starting column  
     * @param {number} toRow - Destination row
     * @param {number} toCol - Destination column
     * @returns {string} Move result ('valid', 'promotion', 'castle', 'invalid')
     */
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.turn) return 'invalid';

        const possibleMoves = this.calculatePossibleMoves(fromRow, fromCol);
        const validMove = possibleMoves.find(([r, c]) => r === toRow && c === toCol);
        
        if (!validMove) return 'invalid';

        // Store move for history
        const moveData = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: this.board[toRow][toCol] ? { ...this.board[toRow][toCol] } : null,
            boardState: this.board.map(row => row.map(cell => cell ? { ...cell } : null))
        };

        // Handle special moves
        let result = 'valid';
        
        // Check for castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            result = this.executeCastling(fromRow, fromCol, toRow, toCol);
        }
        // Check for en passant
        else if (piece.type === 'pawn' && !this.board[toRow][toCol] && fromCol !== toCol) {
            this.executeEnPassant(fromRow, fromCol, toRow, toCol);
        }
        // Regular move
        else {
            if (this.board[toRow][toCol]) {
                this.capturedPieces[this.board[toRow][toCol].color].push(this.board[toRow][toCol]);
            }
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;
        }

        // Mark piece as moved
        this.board[toRow][toCol].hasMoved = true;

        // Check for pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.promotingPawn = { row: toRow, col: toCol };
            result = 'promotion';
        }

        // Update game state
        this.lastMove = moveData;
        this.moveHistory.push(moveData);
        if (this.config.maxMoveHistory && this.moveHistory.length > this.config.maxMoveHistory) {
            this.moveHistory.shift();
        }
        
        this.moveCount++;
        
        // Switch turns
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        // Update check status
        this.check = this.isKingInCheck(this.turn);
        if (this.check) this.checksGiven++;
        
        // Check for game over
        this.gameOver = this.isCheckmate() || this.isStalemate();

        return result;
    }

    /**
     * Execute castling move
     */
    executeCastling(fromRow, fromCol, toRow, toCol) {
        const isKingside = toCol > fromCol;
        const rookFromCol = isKingside ? 7 : 0;
        const rookToCol = isKingside ? 5 : 3;
        
        // Move king
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // Move rook
        this.board[toRow][rookToCol] = this.board[fromRow][rookFromCol];
        this.board[fromRow][rookFromCol] = null;
        
        this.castlesPerformed++;
        return 'castle';
    }

    /**
     * Execute en passant capture
     */
    executeEnPassant(fromRow, fromCol, toRow, toCol) {
        // Move pawn
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // Remove captured pawn
        const capturedPawn = this.board[fromRow][toCol];
        this.capturedPieces[capturedPawn.color].push(capturedPawn);
        this.board[fromRow][toCol] = null;
        
        this.enPassantCount++;
    }

    /**
     * Check if a move would put own king in check
     */
    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const originalPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        const inCheck = this.isKingInCheck(color);
        
        // Restore board
        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = originalPiece;
        
        return inCheck;
    }

    /**
     * Check if king is in check
     * @param {string} color - 'white' or 'black'
     * @returns {boolean}
     */
    isKingInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        
        return this.isSquareAttacked(kingPos.row, kingPos.col, color);
    }

    /**
     * Find king position for given color
     */
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Check if a square is attacked by opponent
     */
    isSquareAttacked(row, col, defendingColor) {
        const attackingColor = defendingColor === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackingColor) {
                    if (this.canAttackSquare(r, c, row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Check if piece can attack given square
     */
    canAttackSquare(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const dx = toCol - fromCol;
        const dy = toRow - fromRow;
        
        switch (piece.type) {
            case 'pawn':
                const dir = piece.color === 'white' ? -1 : 1;
                return dy === dir && Math.abs(dx) === 1;
            case 'rook':
                return (dx === 0 || dy === 0) && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return Math.abs(dx) === Math.abs(dy) && this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) && 
                       this.isPathClear(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || 
                       (Math.abs(dx) === 1 && Math.abs(dy) === 2);
            case 'king':
                return Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0);
        }
        return false;
    }

    /**
     * Check if path between squares is clear
     */
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const dx = Math.sign(toCol - fromCol);
        const dy = Math.sign(toRow - fromRow);
        
        let r = fromRow + dy;
        let c = fromCol + dx;
        
        while (r !== toRow || c !== toCol) {
            if (this.board[r][c]) return false;
            r += dy;
            c += dx;
        }
        
        return true;
    }

    /**
     * Check for checkmate
     */
    isCheckmate() {
        if (!this.check) return false;
        return this.hasNoLegalMoves();
    }

    /**
     * Check for stalemate
     */
    isStalemate() {
        if (this.check) return false;
        return this.hasNoLegalMoves();
    }

    /**
     * Check if current player has any legal moves
     */
    hasNoLegalMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.turn) {
                    if (this.calculatePossibleMoves(row, col).length > 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Complete pawn promotion
     * @param {string} pieceType - 'queen', 'rook', 'bishop', 'knight'
     */
    completePromotion(pieceType = 'queen') {
        if (!this.promotingPawn) return;
        
        const { row, col } = this.promotingPawn;
        const color = this.board[row][col].color;
        
        this.board[row][col] = {
            type: pieceType,
            color: color,
            hasMoved: true
        };
        
        this.promotingPawn = null;
    }

    /**
     * Undo last move
     */
    undoMove() {
        if (!this.config.allowUndo || this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore board state
        this.board = lastMove.boardState.map(row => 
            row.map(cell => cell ? { ...cell } : null)
        );
        
        // Restore captured pieces
        if (lastMove.captured) {
            const capturedArray = this.capturedPieces[lastMove.captured.color];
            const index = capturedArray.findIndex(p => 
                p.type === lastMove.captured.type && p.color === lastMove.captured.color
            );
            if (index !== -1) {
                capturedArray.splice(index, 1);
            }
        }
        
        // Switch back turn
        this.turn = this.turn === 'white' ? 'black' : 'white';
        
        // Update game state
        this.check = this.isKingInCheck(this.turn);
        this.gameOver = false;
        this.moveCount--;
        
        // Update last move
        this.lastMove = this.moveHistory.length > 0 ? 
            this.moveHistory[this.moveHistory.length - 1] : null;
        
        return true;
    }

    /**
     * Flip board orientation
     */
    flipBoard() {
        this.flipped = !this.flipped;
    }

    /**
     * Get current game statistics
     */
    getGameStats() {
        return {
            moveCount: this.moveCount,
            gameTime: Date.now() - this.gameStartTime,
            checksGiven: this.checksGiven,
            castlesPerformed: this.castlesPerformed,
            enPassantCount: this.enPassantCount,
            capturedPieces: { ...this.capturedPieces },
            gameOver: this.gameOver,
            winner: this.gameOver ? (this.turn === 'white' ? 'black' : 'white') : null
        };
    }

    /**
     * Export current game state
     */
    exportState() {
        return {
            board: this.board.map(row => row.map(cell => cell ? { ...cell } : null)),
            turn: this.turn,
            moveHistory: [...this.moveHistory],
            capturedPieces: { ...this.capturedPieces },
            gameStats: this.getGameStats(),
            lastMove: this.lastMove ? { ...this.lastMove } : null
        };
    }

    /**
     * Import game state
     */
    importState(state) {
        this.board = state.board.map(row => row.map(cell => cell ? { ...cell } : null));
        this.turn = state.turn;
        this.moveHistory = [...state.moveHistory];
        this.capturedPieces = { ...state.capturedPieces };
        this.lastMove = state.lastMove ? { ...state.lastMove } : null;
        this.check = this.isKingInCheck(this.turn);
        this.gameOver = this.isCheckmate() || this.isStalemate();
    }
}

// Legacy compatibility - also export as default
export default ChessEngineCore;
