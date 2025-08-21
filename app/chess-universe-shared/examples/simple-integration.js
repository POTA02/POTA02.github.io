/**
 * Basic Chess Integration Example
 * 
 * This example shows how to create a simple chess game using just
 * the core engine component.
 * 
 * Perfect for:
 * - Learning the basics
 * - Lightweight implementations
 * - Custom UI development
 * - Educational purposes
 */

import { ChessEngineCore } from '../components/chess-engine-core.js';

/**
 * Simple Chess Game using minimal components
 */
export class SimpleChessGame {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            showCoordinates: options.showCoordinates !== false,
            allowUndo: options.allowUndo !== false,
            highlightMoves: options.highlightMoves !== false,
            theme: options.theme || 'classic',
            ...options
        };
        
        // Initialize chess engine
        this.engine = new ChessEngineCore({
            allowUndo: this.options.allowUndo,
            maxMoveHistory: 50
        });
        
        // Game state
        this.selectedSquare = null;
        this.gameContainer = null;
        this.flipped = false;
        
        this.init();
    }

    /**
     * Initialize the simple chess game
     */
    init() {
        this.createGameInterface();
        this.setupEventListeners();
        this.renderBoard();
        this.updateGameInfo();
    }

    /**
     * Create the minimal game interface
     */
    createGameInterface() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id '${this.containerId}' not found`);
        }

        container.innerHTML = `
            <div class="simple-chess-game">
                <!-- Game Header -->
                <div class="game-header">
                    <h2>Simple Chess Game</h2>
                    <div class="game-status">
                        <span class="turn-indicator">Turn: <span id="current-turn">White</span></span>
                        <span class="game-state" id="game-state">Ready</span>
                    </div>
                </div>

                <!-- Chess Board -->
                <div class="board-container">
                    ${this.options.showCoordinates ? this.createCoordinates() : ''}
                    <div class="chess-board" id="chess-board"></div>
                </div>

                <!-- Simple Controls -->
                <div class="game-controls">
                    <button id="new-game">New Game</button>
                    ${this.options.allowUndo ? '<button id="undo-move">Undo</button>' : ''}
                    <button id="flip-board">Flip Board</button>
                </div>

                <!-- Move History -->
                <div class="move-history">
                    <h3>Move History</h3>
                    <div id="move-list"></div>
                </div>

                <!-- Promotion Modal -->
                <div id="promotion-modal" class="promotion-modal hidden">
                    <div class="promotion-content">
                        <h3>Choose Promotion Piece</h3>
                        <div class="promotion-pieces">
                            <button class="promo-piece" data-piece="queen">♕</button>
                            <button class="promo-piece" data-piece="rook">♖</button>
                            <button class="promo-piece" data-piece="bishop">♗</button>
                            <button class="promo-piece" data-piece="knight">♘</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.gameContainer = container.querySelector('.simple-chess-game');
        this.addSimpleStyles();
    }

    /**
     * Create coordinate labels for the board
     */
    createCoordinates() {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        return `
            <div class="board-coordinates">
                <div class="files">
                    ${files.split('').map(file => `<span class="file-label">${file}</span>`).join('')}
                </div>
                <div class="ranks">
                    ${ranks.split('').map(rank => `<span class="rank-label">${rank}</span>`).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Add minimal CSS styles
     */
    addSimpleStyles() {
        if (document.getElementById('simple-chess-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'simple-chess-styles';
        styles.textContent = `
            .simple-chess-game {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                font-family: Arial, sans-serif;
            }

            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            }

            .game-header h2 {
                margin: 0;
                color: #495057;
            }

            .game-status {
                display: flex;
                gap: 20px;
                font-weight: bold;
            }

            .turn-indicator {
                color: #007bff;
            }

            .game-state {
                color: #28a745;
            }

            .game-state.check {
                color: #dc3545;
            }

            .board-container {
                position: relative;
                width: fit-content;
                margin: 0 auto 20px;
            }

            .board-coordinates {
                position: absolute;
                top: -20px;
                left: -20px;
                right: -20px;
                bottom: -20px;
                pointer-events: none;
            }

            .files {
                position: absolute;
                bottom: -20px;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-evenly;
            }

            .ranks {
                position: absolute;
                left: -20px;
                top: 0;
                bottom: 0;
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                align-items: center;
            }

            .file-label, .rank-label {
                font-size: 12px;
                font-weight: bold;
                color: #6c757d;
            }

            .chess-board {
                display: grid;
                grid-template-columns: repeat(8, 60px);
                grid-template-rows: repeat(8, 60px);
                border: 2px solid #495057;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .square {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 36px;
                transition: all 0.2s ease;
                user-select: none;
            }

            .square.light {
                background-color: #f0d9b5;
            }

            .square.dark {
                background-color: #b58863;
            }

            .square:hover {
                opacity: 0.8;
            }

            .square.selected {
                background-color: #ffff99 !important;
                box-shadow: inset 0 0 10px rgba(255, 255, 0, 0.7);
            }

            .square.possible-move {
                background-color: #90EE90 !important;
                box-shadow: inset 0 0 5px rgba(0, 128, 0, 0.5);
            }

            .square.last-move {
                background-color: #add8e6 !important;
            }

            .game-controls {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
            }

            .game-controls button {
                padding: 10px 20px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s;
            }

            .game-controls button:hover {
                background: #0056b3;
            }

            .game-controls button:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }

            .move-history {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
                max-height: 200px;
                overflow-y: auto;
            }

            .move-history h3 {
                margin: 0 0 10px 0;
                color: #495057;
            }

            #move-list {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 5px;
                font-family: monospace;
                font-size: 14px;
            }

            .move-entry {
                padding: 2px 5px;
                background: white;
                border-radius: 3px;
                border: 1px solid #e9ecef;
            }

            .move-entry.white {
                background: #ffffff;
            }

            .move-entry.black {
                background: #f1f3f4;
            }

            .promotion-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .promotion-modal.hidden {
                display: none;
            }

            .promotion-content {
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .promotion-pieces {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .promo-piece {
                width: 60px;
                height: 60px;
                border: 2px solid #007bff;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }

            .promo-piece:hover {
                background: #007bff;
                color: white;
            }

            /* Mobile responsiveness */
            @media (max-width: 600px) {
                .simple-chess-game {
                    padding: 10px;
                }
                
                .chess-board {
                    grid-template-columns: repeat(8, 45px);
                    grid-template-rows: repeat(8, 45px);
                }
                
                .square {
                    font-size: 28px;
                }
                
                .game-header {
                    flex-direction: column;
                    gap: 10px;
                    text-align: center;
                }
                
                .game-status {
                    justify-content: center;
                }
                
                .game-controls {
                    flex-wrap: wrap;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Game controls
        document.getElementById('new-game')?.addEventListener('click', () => this.newGame());
        document.getElementById('undo-move')?.addEventListener('click', () => this.undoMove());
        document.getElementById('flip-board')?.addEventListener('click', () => this.flipBoard());

        // Promotion pieces
        document.querySelectorAll('.promo-piece').forEach(piece => {
            piece.addEventListener('click', (e) => {
                this.completePromotion(e.target.dataset.piece);
            });
        });
    }

    /**
     * Render the chess board
     */
    renderBoard() {
        const boardElement = document.getElementById('chess-board');
        if (!boardElement) return;

        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const displayRow = this.flipped ? 7 - row : row;
                const displayCol = this.flipped ? 7 - col : col;
                
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                // Add piece if present
                const piece = this.engine.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece.type, piece.color);
                }

                // Add click listener
                square.addEventListener('click', () => this.handleSquareClick(row, col));

                boardElement.appendChild(square);
            }
        }

        this.updateGameInfo();
        this.updateMoveHistory();
    }

    /**
     * Handle square click
     */
    handleSquareClick(row, col) {
        if (this.engine.gameOver) return;

        const piece = this.engine.board[row][col];

        // If no square is selected
        if (!this.selectedSquare) {
            if (piece && piece.color === this.engine.turn) {
                this.selectSquare(row, col);
            }
            return;
        }

        const [selectedRow, selectedCol] = this.selectedSquare;

        // If clicking the same square, deselect
        if (selectedRow === row && selectedCol === col) {
            this.clearSelection();
            return;
        }

        // If clicking another piece of the same color, select it
        if (piece && piece.color === this.engine.turn) {
            this.selectSquare(row, col);
            return;
        }

        // Try to make a move
        this.makeMove(selectedRow, selectedCol, row, col);
    }

    /**
     * Select a square and show possible moves
     */
    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = [row, col];
        
        const square = this.getSquareElement(row, col);
        if (square) {
            square.classList.add('selected');
        }

        // Show possible moves if option is enabled
        if (this.options.highlightMoves) {
            const possibleMoves = this.engine.calculatePossibleMoves(row, col);
            possibleMoves.forEach(([r, c]) => {
                const moveSquare = this.getSquareElement(r, c);
                if (moveSquare) {
                    moveSquare.classList.add('possible-move');
                }
            });
        }
    }

    /**
     * Clear all square selections and highlights
     */
    clearSelection() {
        document.querySelectorAll('.square.selected, .square.possible-move').forEach(square => {
            square.classList.remove('selected', 'possible-move');
        });
        this.selectedSquare = null;
    }

    /**
     * Make a move
     */
    makeMove(fromRow, fromCol, toRow, toCol) {
        const result = this.engine.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (result === 'invalid') return;

        this.clearSelection();

        // Handle promotion
        if (result === 'promotion') {
            this.showPromotionModal();
            return;
        }

        this.renderBoard();
        this.checkGameEnd();
    }

    /**
     * Check for game end conditions
     */
    checkGameEnd() {
        if (this.engine.gameOver) {
            const winner = this.engine.turn === 'white' ? 'Black' : 'White';
            setTimeout(() => {
                alert(`Game Over!\n${winner} wins by checkmate!`);
            }, 500);
        } else if (this.engine.check) {
            document.getElementById('game-state').textContent = 'Check!';
            document.getElementById('game-state').className = 'game-state check';
        }
    }

    /**
     * Get piece symbol for display
     */
    getPieceSymbol(type, color) {
        const symbols = {
            white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
            black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
        };
        return symbols[color][type] || '';
    }

    /**
     * Get square element by position
     */
    getSquareElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    /**
     * Update game information display
     */
    updateGameInfo() {
        const turnElement = document.getElementById('current-turn');
        const stateElement = document.getElementById('game-state');

        if (turnElement) {
            turnElement.textContent = this.engine.turn.charAt(0).toUpperCase() + this.engine.turn.slice(1);
        }

        if (stateElement) {
            if (this.engine.gameOver) {
                stateElement.textContent = 'Game Over';
                stateElement.className = 'game-state';
            } else if (this.engine.check) {
                stateElement.textContent = 'Check!';
                stateElement.className = 'game-state check';
            } else {
                stateElement.textContent = 'In Progress';
                stateElement.className = 'game-state';
            }
        }

        // Update undo button state
        const undoButton = document.getElementById('undo-move');
        if (undoButton) {
            undoButton.disabled = this.engine.moveHistory.length === 0;
        }
    }

    /**
     * Update move history display
     */
    updateMoveHistory() {
        const moveList = document.getElementById('move-list');
        if (!moveList) return;

        moveList.innerHTML = '';

        const moves = this.engine.moveHistory;
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i];
            const moveDiv = document.createElement('div');
            moveDiv.className = `move-entry ${move.piece.color}`;
            
            const moveNumber = Math.floor(i / 2) + 1;
            const isWhiteMove = i % 2 === 0;
            
            if (isWhiteMove) {
                moveDiv.textContent = `${moveNumber}. ${this.formatMove(move)}`;
            } else {
                moveDiv.textContent = `${moveNumber}... ${this.formatMove(move)}`;
            }
            
            moveList.appendChild(moveDiv);
        }

        // Scroll to bottom
        moveList.scrollTop = moveList.scrollHeight;
    }

    /**
     * Format a move for display
     */
    formatMove(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        const fromSquare = files[move.from.c] + ranks[move.from.r];
        const toSquare = files[move.to.c] + ranks[move.to.r];
        
        return `${fromSquare}-${toSquare}`;
    }

    /**
     * Start new game
     */
    newGame() {
        this.engine.setupBoard();
        this.clearSelection();
        this.renderBoard();
    }

    /**
     * Undo last move
     */
    undoMove() {
        if (this.engine.undoMove()) {
            this.clearSelection();
            this.renderBoard();
        }
    }

    /**
     * Flip board orientation
     */
    flipBoard() {
        this.flipped = !this.flipped;
        this.renderBoard();
    }

    /**
     * Show promotion modal
     */
    showPromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Complete pawn promotion
     */
    completePromotion(pieceType) {
        this.engine.completePromotion(pieceType);
        
        const modal = document.getElementById('promotion-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        this.renderBoard();
        this.checkGameEnd();
    }

    /**
     * Get current game state
     */
    getGameState() {
        return {
            board: this.engine.board,
            turn: this.engine.turn,
            moveCount: this.engine.moveCount,
            gameOver: this.engine.gameOver,
            check: this.engine.check,
            moveHistory: this.engine.moveHistory,
            settings: this.options
        };
    }

    /**
     * Destroy the game instance
     */
    destroy() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        
        const styles = document.getElementById('simple-chess-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Export for use as module
export default SimpleChessGame;

// Also make available globally for easy integration
if (typeof window !== 'undefined') {
    window.SimpleChessGame = SimpleChessGame;
}
