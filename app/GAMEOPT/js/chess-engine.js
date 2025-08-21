// Chess Engine - Core game logic
class ChessEngine {
    constructor() {
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
        
        this.setupBoard();
    }

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
    }

    calculatePossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
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
                const dir = color === 'white' ? -1 : 1;
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
                break;
                
            case 'rook':
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'knight':
                [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
                    const r = row + dr, c = col + dc;
                    if (isInBounds(r, c) && (!this.board[r][c] || this.board[r][c].color === opponentColor)) {
                        moves.push([r, c]);
                    }
                });
                break;
                
            case 'bishop':
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'queen':
                [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'king':
                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if ((r !== row || c !== col) && isInBounds(r, c) && 
                            (!this.board[r][c] || this.board[r][c].color === opponentColor)) {
                            moves.push([r, c]);
                        }
                    }
                }
                
                // Castling
                if (!piece.hasMoved && !this.isKingInCheck(color)) {
                    // Kingside castling
                    const kingsideRook = this.board[row][7];
                    if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved &&
                        !this.board[row][5] && !this.board[row][6] &&
                        !this.isSquareAttacked(row, 5, opponentColor) && !this.isSquareAttacked(row, 6, opponentColor)) {
                        moves.push([row, 6]);
                    }
                    
                    // Queenside castling
                    const queensideRook = this.board[row][0];
                    if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved &&
                        !this.board[row][1] && !this.board[row][2] && !this.board[row][3] &&
                        !this.isSquareAttacked(row, 2, opponentColor) && !this.isSquareAttacked(row, 3, opponentColor)) {
                        moves.push([row, 2]);
                    }
                }
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(([tr, tc]) => {
            const original = this.board[tr][tc];
            this.board[tr][tc] = this.board[row][col];
            this.board[row][col] = null;
            const inCheck = this.isKingInCheck(color);
            this.board[row][col] = this.board[tr][tc];
            this.board[tr][tc] = original;
            return !inCheck;
        });
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.possibleMoves.some(([r, c]) => r === toRow && c === toCol);
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        const isPawnPromotion = piece.type === 'pawn' && 
            ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7));

        const move = {
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            captured: this.board[toRow][toCol] ? { ...this.board[toRow][toCol] } : 
                     (piece.type === 'pawn' && fromCol !== toCol && !this.board[toRow][toCol]) ? 
                     { ...this.board[fromRow][toCol] } : null,
            promotion: isPawnPromotion,
            castling: null,
            enPassant: false
        };

        // Handle captures
        if (this.board[toRow][toCol]) {
            const capturedPiece = this.board[toRow][toCol];
            this.capturedPieces[this.turn].push(capturedPiece);
        } else if (piece.type === 'pawn' && fromCol !== toCol && !this.board[toRow][toCol]) {
            // En passant
            const capturedPawnRow = fromRow;
            const capturedPawnCol = toCol;
            const capturedPiece = this.board[capturedPawnRow][capturedPawnCol];
            this.capturedPieces[this.turn].push(capturedPiece);
            this.board[capturedPawnRow][capturedPawnCol] = null;
            move.enPassant = true;
            this.enPassantCount++;
        }

        // Handle castling
        if (piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            const isKingside = toCol > fromCol;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;
            
            // Move the rook
            this.board[toRow][rookToCol] = this.board[toRow][rookFromCol];
            this.board[toRow][rookFromCol] = null;
            this.board[toRow][rookToCol].hasMoved = true;
            
            move.castling = { isKingside, rookFrom: rookFromCol, rookTo: rookToCol };
            this.castlesPerformed++;
        }

        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Mark as moved
        if (piece.type === 'pawn' || piece.type === 'rook' || piece.type === 'king') {
            piece.hasMoved = true;
        }

        this.lastMove = move;
        this.moveHistory.push(move);
        this.moveCount++;

        if (isPawnPromotion) {
            this.promotingPawn = { row: toRow, col: toCol };
            return 'promotion';
        } else {
            this.switchTurns();
            this.checkGameStatus();
            return 'normal';
        }
    }

    completePromotion(pieceType) {
        if (!this.promotingPawn) return;
        
        const { row, col } = this.promotingPawn;
        this.board[row][col].type = pieceType;
        this.promotingPawn = null;
        
        this.switchTurns();
        this.checkGameStatus();
    }

    switchTurns() {
        this.turn = this.turn === 'white' ? 'black' : 'white';
    }

    isKingInCheck(color) {
        let kingRow, kingCol;
        
        // Find the king
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingRow = r;
                    kingCol = c;
                    break;
                }
            }
            if (kingRow !== undefined) break;
        }

        return this.isSquareAttacked(kingRow, kingCol, color === 'white' ? 'black' : 'white');
    }

    isSquareAttacked(row, col, attackerColor) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackerColor) {
                    const moves = this.calculateRawMoves(r, c);
                    if (moves.some(([tr, tc]) => tr === row && tc === col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    calculateRawMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const color = piece.color;
        const opponentColor = color === 'white' ? 'black' : 'white';
        const isInBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
        const moves = [];
        
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
                const dir = color === 'white' ? -1 : 1;
                // Only capture moves for attack calculation
                for (const dc of [-1, 1]) {
                    const r = row + dir, c = col + dc;
                    if (isInBounds(r, c)) {
                        moves.push([r, c]);
                    }
                }
                break;
                
            case 'rook':
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'knight':
                [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
                    const r = row + dr, c = col + dc;
                    if (isInBounds(r, c)) {
                        moves.push([r, c]);
                    }
                });
                break;
                
            case 'bishop':
                [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'queen':
                [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(d => addDirectionalMoves(...d));
                break;
                
            case 'king':
                for (let r = row - 1; r <= row + 1; r++) {
                    for (let c = col - 1; c <= col + 1; c++) {
                        if ((r !== row || c !== col) && isInBounds(r, c)) {
                            moves.push([r, c]);
                        }
                    }
                }
                break;
        }
        
        return moves;
    }

    checkGameStatus() {
        const inCheck = this.isKingInCheck(this.turn);
        if (inCheck) {
            this.checksGiven++;
        }
        
        this.check = inCheck;

        // Check for legal moves
        let hasLegalMoves = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === this.turn) {
                    const moves = this.calculatePossibleMoves(r, c);
                    if (moves.length > 0) {
                        hasLegalMoves = true;
                        break;
                    }
                }
            }
            if (hasLegalMoves) break;
        }

        if (!hasLegalMoves) {
            this.gameOver = true;
            if (inCheck) {
                return `Checkmate - ${this.turn === 'white' ? 'Black' : 'White'} wins!`;
            } else {
                return 'Stalemate - Draw!';
            }
        } else if (inCheck) {
            return 'Check!';
        }
        
        return 'Playing';
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore the piece to its original position
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        
        // Handle captures
        if (lastMove.captured) {
            if (lastMove.enPassant) {
                // Restore en passant captured pawn
                this.board[lastMove.from.row][lastMove.to.col] = lastMove.captured;
            } else {
                this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
            }
            
            // Remove from captured pieces
            const capturedArray = this.capturedPieces[this.turn];
            const index = capturedArray.findIndex(p => 
                p.type === lastMove.captured.type && p.color === lastMove.captured.color
            );
            if (index !== -1) {
                capturedArray.splice(index, 1);
            }
        } else {
            this.board[lastMove.to.row][lastMove.to.col] = null;
        }
        
        // Handle castling
        if (lastMove.castling) {
            const { rookFrom, rookTo } = lastMove.castling;
            const row = lastMove.from.row;
            this.board[row][rookFrom] = this.board[row][rookTo];
            this.board[row][rookTo] = null;
            this.board[row][rookFrom].hasMoved = false;
        }
        
        // Update counters
        this.moveCount--;
        if (lastMove.enPassant) this.enPassantCount--;
        if (lastMove.castling) this.castlesPerformed--;
        
        this.switchTurns();
        this.gameOver = false;
        this.check = false;
        
        // Update last move
        this.lastMove = this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
        
        return true;
    }

    resetGame() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.setupBoard();
        this.turn = 'white';
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.check = false;
        this.gameOver = false;
        this.lastMove = null;
        this.promotingPawn = null;
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        this.moveCount = 0;
        this.checksGiven = 0;
        this.castlesPerformed = 0;
        this.enPassantCount = 0;
    }

    updateGameTime() {
        if (this.gameStartTime && !this.gameOver) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
    }

    flipBoard() {
        this.flipped = !this.flipped;
    }
}
