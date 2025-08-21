// Custom Chess Engine for Bot vs Bot gameplay
class ChessEngine {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.gameOver = false;
        this.winner = null;
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
            board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Set up other pieces
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRank[col], color: 'black', hasMoved: false };
            board[7][col] = { type: backRank[col], color: 'white', hasMoved: false };
        }
        
        return board;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) return [];

        let moves = [];
        const { type, color } = piece;

        switch (type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, color);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, color);
                break;
            case 'king':
                moves = this.getKingMoves(row, col, color);
                break;
        }

        // Filter moves that would put own king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Double move from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Capture moves
        for (const colOffset of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + colOffset;
            
            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
                
                // En passant
                if (this.enPassantTarget && this.enPassantTarget.row === newRow && this.enPassantTarget.col === newCol) {
                    moves.push({ row: newRow, col: newCol, enPassant: true });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [rowDir, colDir] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + rowDir * i;
                const newCol = col + colDir * i;

                if (!this.isValidPosition(newRow, newCol)) break;

                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [rowOffset, colOffset] of knightMoves) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [rowDir, colDir] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + rowDir * i;
                const newCol = col + colDir * i;

                if (!this.isValidPosition(newRow, newCol)) break;

                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }

        return moves;
    }

    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [rowOffset, colOffset] of directions) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;

            if (this.isValidPosition(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        // Castling
        if (!this.board[row][col].hasMoved && !this.isInCheck(color)) {
            // Kingside castling
            if (this.castlingRights[color].kingside &&
                !this.board[row][col + 1] && !this.board[row][col + 2] &&
                this.board[row][7] && this.board[row][7].type === 'rook' && !this.board[row][7].hasMoved) {
                moves.push({ row, col: col + 2, castling: 'kingside' });
            }
            
            // Queenside castling
            if (this.castlingRights[color].queenside &&
                !this.board[row][col - 1] && !this.board[row][col - 2] && !this.board[row][col - 3] &&
                this.board[row][0] && this.board[row][0].type === 'rook' && !this.board[row][0].hasMoved) {
                moves.push({ row, col: col - 2, castling: 'queenside' });
            }
        }

        return moves;
    }

    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    const moves = this.getPossibleMovesIgnoreCheck(row, col);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

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

    getPossibleMovesIgnoreCheck(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const { type, color } = piece;
        let moves = [];

        switch (type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col, color);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col, color);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col, color);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col, color);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col, color);
                break;
            case 'king':
                // For check detection, don't include castling moves
                const directions = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                
                for (const [rowOffset, colOffset] of directions) {
                    const newRow = row + rowOffset;
                    const newCol = col + colOffset;

                    if (this.isValidPosition(newRow, newCol)) {
                        const target = this.board[newRow][newCol];
                        if (!target || target.color !== color) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
        }

        return moves;
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make temporary move
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;

        const inCheck = this.isInCheck(color);

        // Restore board
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;

        return inCheck;
    }

    getAllLegalMoves(color) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const pieceMoves = this.getPossibleMoves(row, col);
                    for (const move of pieceMoves) {
                        moves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col },
                            piece: piece.type,
                            capture: this.board[move.row][move.col] !== null,
                            castling: move.castling,
                            enPassant: move.enPassant
                        });
                    }
                }
            }
        }
        
        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;

        const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
        const move = possibleMoves.find(m => m.row === toRow && m.col === toCol);
        
        if (!move) return false;

        // Handle special moves
        const capturedPiece = this.board[toRow][toCol];
        
        // En passant capture
        if (move.enPassant) {
            const direction = piece.color === 'white' ? 1 : -1;
            this.board[toRow + direction][toCol] = null;
        }

        // Castling
        if (move.castling) {
            if (move.castling === 'kingside') {
                this.board[fromRow][5] = this.board[fromRow][7];
                this.board[fromRow][7] = null;
                this.board[fromRow][5].hasMoved = true;
            } else {
                this.board[fromRow][3] = this.board[fromRow][0];
                this.board[fromRow][0] = null;
                this.board[fromRow][3].hasMoved = true;
            }
        }

        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
        }

        // Update castling rights
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }
        if (piece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        // Record move
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            captured: capturedPiece,
            castling: move.castling,
            enPassant: move.enPassant
        });

        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check for game end
        this.checkGameEnd();

        return true;
    }

    checkGameEnd() {
        const moves = this.getAllLegalMoves(this.currentPlayer);
        
        if (moves.length === 0) {
            if (this.isInCheck(this.currentPlayer)) {
                // Checkmate
                this.gameOver = true;
                this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
            } else {
                // Stalemate
                this.gameOver = true;
                this.winner = null;
            }
        }
    }

    getGameStatus() {
        if (this.gameOver) {
            if (this.winner) {
                return `Checkmate! ${this.winner.charAt(0).toUpperCase() + this.winner.slice(1)} wins!`;
            } else {
                return 'Stalemate! Game is a draw.';
            }
        }
        
        if (this.isInCheck(this.currentPlayer)) {
            return `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} is in check!`;
        }
        
        return `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)} to move`;
    }

    // Simple evaluation function for AI
    evaluatePosition() {
        const pieceValues = {
            pawn: 1,
            knight: 3,
            bishop: 3,
            rook: 5,
            queen: 9,
            king: 0
        };

        let evaluation = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    const positionBonus = this.getPositionBonus(piece.type, row, col, piece.color);
                    
                    if (piece.color === 'white') {
                        evaluation += value + positionBonus;
                    } else {
                        evaluation -= value + positionBonus;
                    }
                }
            }
        }

        return evaluation;
    }

    getPositionBonus(pieceType, row, col, color) {
        // Simple position bonuses
        const centerBonus = 0.1;
        const distance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
        
        switch (pieceType) {
            case 'pawn':
                return color === 'white' ? (6 - row) * 0.1 : (row - 1) * 0.1;
            case 'knight':
            case 'bishop':
                return (7 - distance) * centerBonus;
            default:
                return 0;
        }
    }

    // Create a copy of the current position
    clone() {
        const newEngine = new ChessEngine();
        newEngine.board = this.board.map(row => row.map(piece => 
            piece ? { ...piece } : null
        ));
        newEngine.currentPlayer = this.currentPlayer;
        newEngine.gameOver = this.gameOver;
        newEngine.winner = this.winner;
        newEngine.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
        newEngine.castlingRights = {
            white: { ...this.castlingRights.white },
            black: { ...this.castlingRights.black }
        };
        return newEngine;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessEngine;
}
