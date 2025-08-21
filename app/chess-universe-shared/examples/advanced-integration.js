/**
 * Chess Universe Shared Library - Advanced Integration Example
 * 
 * This example demonstrates how to create a full-featured chess game
 * using all the shared components from the Chess Universe library.
 * 
 * Features demonstrated:
 * - Complete chess engine integration
 * - AI opponent with multiple difficulty levels
 * - Voice assistant with personality system
 * - Cheat system integration
 * - Theme and customization support
 * 
 * @version 2.0.0
 * @author Chess Universe Team
 */

import { ChessEngineCore } from '../components/chess-engine-core.js';
import { ChessAISystem } from '../components/chess-ai-system.js';
import { ChessVoiceAssistant } from '../components/chess-voice-assistant.js';

/**
 * Advanced Chess Game using Chess Universe Shared Library
 */
export class AdvancedChessGame {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            enableAI: options.enableAI !== false,
            enableVoice: options.enableVoice !== false,
            enableCheats: options.enableCheats !== false,
            aiDifficulty: options.aiDifficulty || 3,
            voicePersonality: options.voicePersonality || 'professional',
            theme: options.theme || 'classic',
            ...options
        };
        
        // Initialize core components
        this.engine = new ChessEngineCore({
            allowUndo: true,
            maxMoveHistory: 100,
            enableAnalytics: true
        });
        
        if (this.options.enableAI) {
            this.ai = new ChessAISystem({
                difficulty: this.options.aiDifficulty,
                personality: 'balanced',
                moveTime: 2000
            });
        }
        
        if (this.options.enableVoice) {
            this.voice = new ChessVoiceAssistant({
                personality: this.options.voicePersonality,
                announcements: {
                    moves: true,
                    cheats: true,
                    ai: true,
                    gameEvents: true
                }
            });
        }
        
        // Game state
        this.vsComputer = false;
        this.computerSide = 'black';
        this.selectedSquare = null;
        this.gameContainer = null;
        
        this.init();
    }

    /**
     * Initialize the chess game
     */
    async init() {
        await this.createGameInterface();
        this.setupEventListeners();
        this.renderBoard();
        this.updateGameInfo();
        
        if (this.voice) {
            this.voice.announceGameStart();
        }
    }

    /**
     * Create the game interface
     */
    async createGameInterface() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container with id '${this.containerId}' not found`);
        }

        container.innerHTML = `
            <div class="chess-universe-game">
                <!-- Game Header -->
                <div class="game-header">
                    <h2>Chess Universe - Advanced Game</h2>
                    <div class="game-status">
                        <span class="turn-indicator">Turn: <span id="current-turn">White</span></span>
                        <span class="game-state" id="game-state">Ready to Play</span>
                    </div>
                </div>

                <!-- Main Game Area -->
                <div class="game-layout">
                    <div class="board-section">
                        <div class="chess-board" id="chess-board"></div>
                        
                        <div class="game-controls">
                            <button id="new-game">New Game</button>
                            <button id="undo-move">Undo Move</button>
                            <button id="toggle-ai">Toggle AI</button>
                            <button id="flip-board">Flip Board</button>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="game-sidebar">
                        <!-- AI Settings -->
                        ${this.options.enableAI ? this.createAISettingsPanel() : ''}
                        
                        <!-- Voice Settings -->
                        ${this.options.enableVoice ? this.createVoiceSettingsPanel() : ''}
                        
                        <!-- Cheat System -->
                        ${this.options.enableCheats ? this.createCheatPanel() : ''}
                        
                        <!-- Game Statistics -->
                        ${this.createStatsPanel()}
                    </div>
                </div>

                <!-- Promotion Modal -->
                <div id="promotion-modal" class="promotion-modal hidden">
                    <div class="promotion-content">
                        <h3>Promote Your Pawn</h3>
                        <div class="promotion-options">
                            <button class="promotion-option" data-piece="queen">♕ Queen</button>
                            <button class="promotion-option" data-piece="rook">♖ Rook</button>
                            <button class="promotion-option" data-piece="bishop">♗ Bishop</button>
                            <button class="promotion-option" data-piece="knight">♘ Knight</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.gameContainer = container.querySelector('.chess-universe-game');
        this.addGameStyles();
    }

    /**
     * Create AI settings panel
     */
    createAISettingsPanel() {
        return `
            <div class="settings-panel">
                <h3>AI Settings</h3>
                <div class="setting">
                    <label>Difficulty: <span id="ai-difficulty-value">${this.options.aiDifficulty}</span></label>
                    <input type="range" id="ai-difficulty" min="1" max="5" value="${this.options.aiDifficulty}">
                </div>
                <div class="setting">
                    <label for="ai-personality">Personality:</label>
                    <select id="ai-personality">
                        <option value="balanced">Balanced</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="defensive">Defensive</option>
                        <option value="positional">Positional</option>
                        <option value="tactical">Tactical</option>
                    </select>
                </div>
                <button id="ai-sabotage">Sabotage AI (3 moves)</button>
            </div>
        `;
    }

    /**
     * Create voice settings panel
     */
    createVoiceSettingsPanel() {
        return `
            <div class="settings-panel">
                <h3>Voice Assistant</h3>
                <div class="setting">
                    <label>
                        <input type="checkbox" id="voice-enabled" checked> Enable Voice
                    </label>
                </div>
                <div class="setting">
                    <label for="voice-personality">Personality:</label>
                    <select id="voice-personality">
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="dramatic">Dramatic</option>
                        <option value="funny">Funny</option>
                    </select>
                </div>
                <div class="setting">
                    <label>Speed: <span id="voice-speed-value">Normal</span></label>
                    <input type="range" id="voice-speed" min="0.5" max="2" step="0.1" value="1">
                </div>
                <div class="setting">
                    <label>Volume: <span id="voice-volume-value">80%</span></label>
                    <input type="range" id="voice-volume" min="0" max="1" step="0.1" value="0.8">
                </div>
                <button id="test-voice">Test Voice</button>
            </div>
        `;
    }

    /**
     * Create cheat panel
     */
    createCheatPanel() {
        return `
            <div class="settings-panel">
                <h3>Cheat System</h3>
                <div class="cheat-buttons">
                    <button class="cheat-btn" id="see-all-moves">See All Moves</button>
                    <button class="cheat-btn" id="best-move-hint">Best Move Hint</button>
                    <button class="cheat-btn" id="unlimited-undo">Unlimited Undo</button>
                    <button class="cheat-btn" id="teleport-pieces">Teleport Pieces</button>
                    <button class="cheat-btn" id="quantum-moves">Quantum Moves</button>
                    <button class="cheat-btn" id="god-mode">GOD MODE</button>
                </div>
            </div>
        `;
    }

    /**
     * Create statistics panel
     */
    createStatsPanel() {
        return `
            <div class="settings-panel">
                <h3>Game Statistics</h3>
                <div class="stats">
                    <div class="stat">Moves: <span id="move-count">0</span></div>
                    <div class="stat">Game Time: <span id="game-time">00:00</span></div>
                    <div class="stat">Checks: <span id="check-count">0</span></div>
                    <div class="stat">Captures: <span id="capture-count">0</span></div>
                </div>
            </div>
        `;
    }

    /**
     * Add CSS styles for the game
     */
    addGameStyles() {
        if (document.getElementById('chess-universe-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'chess-universe-styles';
        styles.textContent = `
            .chess-universe-game {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
            }

            .game-layout {
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 20px;
            }

            .chess-board {
                width: 500px;
                height: 500px;
                display: grid;
                grid-template-columns: repeat(8, 1fr);
                border: 2px solid #333;
                margin: 0 auto;
            }

            .square {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 40px;
                transition: all 0.2s ease;
            }

            .square.light {
                background-color: #f0d9b5;
            }

            .square.dark {
                background-color: #b58863;
            }

            .square.highlighted {
                background-color: #ffff00 !important;
                box-shadow: inset 0 0 20px rgba(255, 255, 0, 0.5);
            }

            .square.possible-move {
                background-color: #90EE90 !important;
            }

            .square:hover {
                opacity: 0.8;
            }

            .game-controls {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
            }

            .game-controls button {
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }

            .game-controls button:hover {
                background: #45a049;
            }

            .game-sidebar {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .settings-panel {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 10px;
                border: 1px solid #ddd;
            }

            .settings-panel h3 {
                margin: 0 0 15px 0;
                color: #333;
                border-bottom: 2px solid #4CAF50;
                padding-bottom: 5px;
            }

            .setting {
                margin-bottom: 10px;
            }

            .setting label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            .setting input, .setting select {
                width: 100%;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
            }

            .cheat-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 5px;
            }

            .cheat-btn {
                padding: 8px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 12px;
            }

            .cheat-btn:hover {
                background: #ff5252;
            }

            .cheat-btn.active {
                background: #4CAF50;
            }

            .stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }

            .stat {
                background: white;
                padding: 10px;
                border-radius: 5px;
                text-align: center;
                border: 1px solid #ddd;
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
            }

            .promotion-options {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-top: 15px;
            }

            .promotion-option {
                padding: 15px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            }

            .promotion-option:hover {
                background: #45a049;
            }

            @media (max-width: 768px) {
                .game-layout {
                    grid-template-columns: 1fr;
                }
                
                .chess-board {
                    width: 100%;
                    max-width: 400px;
                }
                
                .cheat-buttons {
                    grid-template-columns: 1fr;
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
        document.getElementById('toggle-ai')?.addEventListener('click', () => this.toggleAI());
        document.getElementById('flip-board')?.addEventListener('click', () => this.flipBoard());

        // AI settings
        if (this.ai) {
            document.getElementById('ai-difficulty')?.addEventListener('input', (e) => {
                this.ai.setDifficulty(parseInt(e.target.value));
                document.getElementById('ai-difficulty-value').textContent = e.target.value;
            });

            document.getElementById('ai-personality')?.addEventListener('change', (e) => {
                this.ai.setPersonality(e.target.value);
            });

            document.getElementById('ai-sabotage')?.addEventListener('click', () => {
                this.ai.sabotage(3);
                if (this.voice) this.voice.announceCheat('aiSabotage');
            });
        }

        // Voice settings
        if (this.voice) {
            document.getElementById('voice-enabled')?.addEventListener('change', (e) => {
                this.voice.setEnabled(e.target.checked);
            });

            document.getElementById('voice-personality')?.addEventListener('change', (e) => {
                this.voice.setPersonality(e.target.value);
            });

            document.getElementById('voice-speed')?.addEventListener('input', (e) => {
                this.voice.setVoiceSettings({ rate: parseFloat(e.target.value) });
                const speedLabels = { 0.5: 'Slow', 1: 'Normal', 1.5: 'Fast', 2: 'Very Fast' };
                const closest = Object.keys(speedLabels).reduce((prev, curr) => 
                    Math.abs(curr - e.target.value) < Math.abs(prev - e.target.value) ? curr : prev
                );
                document.getElementById('voice-speed-value').textContent = speedLabels[closest];
            });

            document.getElementById('voice-volume')?.addEventListener('input', (e) => {
                this.voice.setVoiceSettings({ volume: parseFloat(e.target.value) });
                document.getElementById('voice-volume-value').textContent = `${Math.round(e.target.value * 100)}%`;
            });

            document.getElementById('test-voice')?.addEventListener('click', () => {
                this.voice.testVoice();
            });
        }

        // Cheat buttons
        if (this.options.enableCheats) {
            document.querySelectorAll('.cheat-btn').forEach(btn => {
                btn.addEventListener('click', () => this.activateCheat(btn.id));
            });
        }

        // Promotion modal
        document.querySelectorAll('.promotion-option').forEach(option => {
            option.addEventListener('click', (e) => {
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
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
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
     * Select a square
     */
    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = [row, col];
        
        const square = this.getSquareElement(row, col);
        if (square) {
            square.classList.add('highlighted');
        }

        // Show possible moves
        const possibleMoves = this.engine.calculatePossibleMoves(row, col);
        possibleMoves.forEach(([r, c]) => {
            const moveSquare = this.getSquareElement(r, c);
            if (moveSquare) {
                moveSquare.classList.add('possible-move');
            }
        });
    }

    /**
     * Clear square selection
     */
    clearSelection() {
        document.querySelectorAll('.square.highlighted, .square.possible-move').forEach(square => {
            square.classList.remove('highlighted', 'possible-move');
        });
        this.selectedSquare = null;
    }

    /**
     * Make a move
     */
    async makeMove(fromRow, fromCol, toRow, toCol) {
        const result = this.engine.movePiece(fromRow, fromCol, toRow, toCol);
        
        if (result === 'invalid') return;

        this.clearSelection();

        // Handle promotion
        if (result === 'promotion') {
            this.showPromotionModal();
            return;
        }

        // Voice announcements
        if (this.voice) {
            const moveData = {
                captured: result === 'capture',
                castling: result === 'castle',
                promotion: result === 'promotion'
            };
            this.voice.announceMove(moveData);

            if (this.engine.check) {
                this.voice.announceCheck();
            }
        }

        this.renderBoard();
        this.checkGameEnd();

        // AI move
        if (this.vsComputer && !this.engine.gameOver && this.engine.turn === this.computerSide) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    /**
     * Make AI move
     */
    async makeAIMove() {
        if (!this.ai || this.engine.gameOver) return;

        try {
            const move = await this.ai.chooseMove(this.engine, this.computerSide);
            if (move) {
                const result = this.engine.movePiece(move.from.r, move.from.c, move.to.r, move.to.c);
                
                if (result === 'promotion') {
                    this.engine.completePromotion('queen');
                }

                if (this.voice) {
                    this.voice.announceMove({ aiMove: true });
                    if (this.engine.check) {
                        this.voice.announceCheck();
                    }
                }

                this.renderBoard();
                this.checkGameEnd();
            }
        } catch (error) {
            console.error('AI move error:', error);
        }
    }

    /**
     * Check for game end conditions
     */
    checkGameEnd() {
        if (this.engine.gameOver) {
            const winner = this.engine.turn === 'white' ? 'Black' : 'White';
            
            if (this.voice) {
                this.voice.announceCheckmate(winner);
            }

            setTimeout(() => {
                alert(`Game Over! ${winner} wins!`);
            }, 1000);
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
        const moveCountElement = document.getElementById('move-count');

        if (turnElement) {
            turnElement.textContent = this.engine.turn.charAt(0).toUpperCase() + this.engine.turn.slice(1);
        }

        if (stateElement) {
            if (this.engine.gameOver) {
                stateElement.textContent = 'Game Over';
            } else if (this.engine.check) {
                stateElement.textContent = 'Check!';
            } else {
                stateElement.textContent = 'In Progress';
            }
        }

        if (moveCountElement) {
            moveCountElement.textContent = this.engine.moveCount;
        }
    }

    /**
     * Start new game
     */
    newGame() {
        this.engine.setupBoard();
        this.clearSelection();
        this.renderBoard();
        
        if (this.voice) {
            this.voice.announceGameStart();
        }
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
     * Toggle AI opponent
     */
    toggleAI() {
        this.vsComputer = !this.vsComputer;
        const button = document.getElementById('toggle-ai');
        if (button) {
            button.textContent = this.vsComputer ? 'Disable AI' : 'Enable AI';
        }
    }

    /**
     * Flip board
     */
    flipBoard() {
        this.engine.flipBoard();
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

        if (this.voice) {
            this.voice.announceMove({ promotion: true });
        }

        this.renderBoard();
        this.checkGameEnd();
    }

    /**
     * Activate cheat (simplified implementation)
     */
    activateCheat(cheatId) {
        const button = document.getElementById(cheatId);
        button.classList.toggle('active');

        if (this.voice) {
            this.voice.announceCheat(cheatId);
        }

        // Implement specific cheat logic here
        switch (cheatId) {
            case 'see-all-moves':
                // Highlight all possible moves
                this.showAllPossibleMoves();
                break;
            case 'god-mode':
                // Activate all cheats
                document.querySelectorAll('.cheat-btn').forEach(btn => {
                    btn.classList.add('active');
                });
                break;
        }
    }

    /**
     * Show all possible moves for current player
     */
    showAllPossibleMoves() {
        this.clearSelection();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.engine.board[row][col];
                if (piece && piece.color === this.engine.turn) {
                    const moves = this.engine.calculatePossibleMoves(row, col);
                    moves.forEach(([r, c]) => {
                        const square = this.getSquareElement(r, c);
                        if (square) {
                            square.classList.add('possible-move');
                        }
                    });
                }
            }
        }
    }

    /**
     * Get current game state
     */
    getGameState() {
        return {
            engineState: this.engine.exportState(),
            aiStatus: this.ai ? this.ai.getStatus() : null,
            voiceStatus: this.voice ? this.voice.getStatus() : null,
            gameSettings: {
                vsComputer: this.vsComputer,
                computerSide: this.computerSide,
                theme: this.options.theme
            }
        };
    }

    /**
     * Destroy the game instance
     */
    destroy() {
        if (this.voice) {
            this.voice.stop();
        }
        
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        
        const styles = document.getElementById('chess-universe-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Export for use as module
export default AdvancedChessGame;

// Also make available globally for easy integration
if (typeof window !== 'undefined') {
    window.ChessUniverseAdvanced = AdvancedChessGame;
}
