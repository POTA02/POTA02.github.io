// Chess Game Controller - Main game logic coordinator
class ChessGame {
    constructor() {
        try {
            this.engine = new ChessEngine();
            this.ai = new ChessAI();
            this.ui = new ChessUI();
            this.sounds = new ChessSounds();
            this.voice = new ChessAIVoice();
            this.performance = new ChessPerformance();
            this.analytics = new ChessAnalytics();
            
            this.vsComputer = false;
            this.computerSide = 'black';
            this.gameMode = 'Human vs Human';
            this.hintsEnabled = true;
            this.gameTimer = null;
            this.soundEnabled = true;
            this.voiceEnabled = true;
            this.animationSpeed = 'normal';
            
            // Apply performance optimizations
            const optimizations = this.performance.optimizeForDevice();
            this.ui.applyOptimizations(optimizations);
            
            this.voiceAnnouncements = {
                moves: true,
                cheats: true,
                ai: true,
                gameEvents: true
            };
            
            this.init();
        } catch (error) {
            console.error('Failed to initialize Chess Game:', error);
            this.showCriticalError('Failed to initialize game. Please refresh the page.');
        }
    }

    // Helper method to check if voice announcements are enabled for a specific type
    shouldAnnounce(type) {
        return this.voiceEnabled && this.voiceAnnouncements && this.voiceAnnouncements[type];
    }

    init() {
        try {
            this.setupEventListeners();
            this.ui.renderBoard(this.engine);
            this.ui.updateGameInfo(this.engine);
            this.ui.createStarField();
            this.startGameTimer();
            this.showWelcomeMessage();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showCriticalError('Failed to start game. Please refresh the page.');
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.ui.showNotification('Welcome to Chess Universe! 🎉', 'success', 4000);
            if (this.shouldAnnounce('gameEvents')) {
                this.voice.announceGameStart();
            }
        }, 1000);
    }

    showCriticalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div class="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50">
                <div class="bg-white text-red-900 p-8 rounded-2xl max-w-md text-center">
                    <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <h2 class="text-xl font-bold mb-4">Critical Error</h2>
                    <p class="mb-4">${message}</p>
                    <button onclick="location.reload()" class="bg-red-600 text-white px-6 py-2 rounded-lg">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    setupEventListeners() {
        // Board click events
        const board = document.getElementById('chess-board');
        if (board) {
            board.addEventListener('click', (e) => this.handleBoardClick(e));
        }

        // Game control buttons
        this.addEventListenerSafe('new-game', 'click', () => this.newGame());
        this.addEventListenerSafe('undo-move', 'click', () => this.undoMove());
        this.addEventListenerSafe('hint-button', 'click', () => this.showHint());
        this.addEventListenerSafe('flip-board', 'click', () => this.flipBoard());

        // AI controls
        this.addEventListenerSafe('toggle-ai', 'click', () => this.toggleAI());
        this.addEventListenerSafe('ai-difficulty', 'input', (e) => this.setAIDifficulty(e.target.value));
        this.addEventListenerSafe('ai-speed', 'input', (e) => this.setAISpeed(e.target.value));
        this.addEventListenerSafe('ai-personality', 'change', (e) => this.setAIPersonality(e.target.value));

        // Theme controls
        this.addEventListenerSafe('toggle-themes', 'click', () => this.toggleThemePanel());
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.addEventListener('click', () => this.setTheme(preview.dataset.theme));
        });
        this.addEventListenerSafe('piece-style', 'change', (e) => this.setPieceStyle(e.target.value));
        this.addEventListenerSafe('show-coordinates', 'change', (e) => this.toggleCoordinates(e.target.checked));
        this.addEventListenerSafe('highlight-moves', 'change', (e) => this.toggleHighlightMoves(e.target.checked));
        this.addEventListenerSafe('smooth-animations', 'change', (e) => this.toggleSmoothAnimations(e.target.checked));

        // Sound controls
        this.addEventListenerSafe('sound-enabled', 'change', (e) => this.toggleSound(e.target.checked));

        // Voice controls
        this.addEventListenerSafe('voice-enabled', 'change', (e) => this.toggleVoice(e.target.checked));
        this.addEventListenerSafe('toggle-voice-settings', 'click', () => this.toggleVoiceSettings());
        this.addEventListenerSafe('test-voice', 'click', () => this.testVoice());
        this.addEventListenerSafe('voice-personality', 'change', (e) => this.setVoicePersonality(e.target.value));
        this.addEventListenerSafe('voice-speed', 'input', (e) => this.setVoiceSpeed(e.target.value));
        this.addEventListenerSafe('voice-pitch', 'input', (e) => this.setVoicePitch(e.target.value));
        this.addEventListenerSafe('voice-volume', 'input', (e) => this.setVoiceVolume(e.target.value));
        this.addEventListenerSafe('voice-moves', 'change', (e) => this.toggleVoiceAnnouncements('moves', e.target.checked));
        this.addEventListenerSafe('voice-cheats', 'change', (e) => this.toggleVoiceAnnouncements('cheats', e.target.checked));
        this.addEventListenerSafe('voice-ai', 'change', (e) => this.toggleVoiceAnnouncements('ai', e.target.checked));
        this.addEventListenerSafe('voice-game-events', 'change', (e) => this.toggleVoiceAnnouncements('gameEvents', e.target.checked));

        // Statistics controls
        this.addEventListenerSafe('toggle-stats-panel', 'click', () => this.toggleStatsPanel());
        this.addEventListenerSafe('export-stats', 'click', () => this.exportStats());
        this.addEventListenerSafe('reset-stats', 'click', () => this.resetStats());

        // Cheat controls
        this.addEventListenerSafe('see-all-moves', 'click', () => this.toggleCheat('seeAllMoves'));
        this.addEventListenerSafe('best-move-hint', 'click', () => this.showBestMove());
        this.addEventListenerSafe('takeback-unlimited', 'click', () => this.toggleCheat('unlimitedTakebacks'));
        this.addEventListenerSafe('time-freeze', 'click', () => this.toggleCheat('timeFreeze'));
        this.addEventListenerSafe('opponent-moves', 'click', () => this.toggleCheat('opponentMoves'));
        this.addEventListenerSafe('piece-xray', 'click', () => this.toggleCheat('pieceXray'));
        
        // Advanced cheats
        this.addEventListenerSafe('force-checkmate', 'click', () => this.forceCheckmate());
        this.addEventListenerSafe('invincible-king', 'click', () => this.toggleCheat('invincibleKing'));
        this.addEventListenerSafe('teleport-pieces', 'click', () => this.toggleCheat('teleportPieces'));
        this.addEventListenerSafe('clone-pieces', 'click', () => this.clonePieces());
        
        // Chaos cheats
        this.addEventListenerSafe('shuffle-board', 'click', () => this.shuffleBoard());
        this.addEventListenerSafe('reverse-time', 'click', () => this.reverseTime());
        this.addEventListenerSafe('quantum-moves', 'click', () => this.toggleCheat('quantumMoves'));
        this.addEventListenerSafe('ai-sabotage', 'click', () => this.aiSabotage());
        this.addEventListenerSafe('god-mode', 'click', () => this.toggleGodMode());

        // Promotion modal
        document.querySelectorAll('.promotion-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const pieceType = e.currentTarget.dataset.piece;
                this.completePromotion(pieceType);
            });
        });
    }

    addEventListenerSafe(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            console.log(`✅ Event listener added for ${elementId}`);
        } else {
            console.warn(`⚠️ Element not found: ${elementId}`);
        }
    }

    async handleBoardClick(e) {
        if (this.engine.gameOver) return;
        
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        // Prevent interaction if it's AI's turn
        if (this.vsComputer && this.engine.turn === this.computerSide) {
            return;
        }

        if (this.engine.selectedSquare === null) {
            // Select piece
            const piece = this.engine.board[row][col];
            if (piece && piece.color === this.engine.turn) {
                this.ui.selectSquare(this.engine, row, col);
                this.sounds.play('click');
            }
        } else {
            // Move piece or select different piece
            const [fromRow, fromCol] = this.engine.selectedSquare;
            
            // Check if teleport is active and allow any move to empty square
            const isTeleportMove = this.ui.cheatsEnabled.teleportPieces && 
                                   this.engine.board[row][col] === null;
            
            if (this.engine.isValidMove(fromRow, fromCol, row, col) || isTeleportMove) {
                this.performance.startMeasure('moveCalculation');
                
                const capturedPiece = this.engine.board[row][col];
                const movingPiece = this.engine.board[fromRow][fromCol];
                
                // Prevent king capture if invincible king is active
                if (this.ui.cheatsEnabled.invincibleKing && capturedPiece && capturedPiece.type === 'king') {
                    this.ui.showNotification('👑 Kings are invincible! Cannot capture!', 'warning');
                    this.ui.clearSelection(this.engine);
                    this.sounds.play('error');
                    return;
                }
                
                // Handle teleport move differently
                if (isTeleportMove && !this.engine.isValidMove(fromRow, fromCol, row, col)) {
                    // Direct teleport - bypass normal move validation
                    this.engine.board[row][col] = movingPiece;
                    this.engine.board[fromRow][fromCol] = null;
                    this.ui.clearSelection(this.engine);
                    this.sounds.play('teleport');
                    
                    // Record teleport analytics with null checking
                    if (movingPiece) {
                        const moveData = {
                            color: movingPiece.color,
                            captured: false,
                            check: this.engine.isKingInCheck(this.engine.turn === 'white' ? 'black' : 'white'),
                            teleport: true
                        };
                        this.analytics.recordMove(moveData);
                    }
                    
                    this.ui.renderBoard(this.engine);
                    this.ui.updateGameInfo(this.engine);
                    return;
                }
                
                const result = this.engine.movePiece(fromRow, fromCol, row, col);
                this.ui.clearSelection(this.engine);
                
                this.performance.endMeasure('moveCalculation');
                
                // Record analytics with null checking
                let moveData = null;
                if (movingPiece) {
                    moveData = {
                        color: movingPiece.color,
                        captured: capturedPiece !== null,
                        check: this.engine.isKingInCheck(this.engine.turn === 'white' ? 'black' : 'white')
                    };
                    this.analytics.recordMove(moveData);
                }
                
                // Play appropriate sound and voice announcement
                if (result === 'promotion') {
                    this.sounds.play('promotion');
                    if (this.shouldAnnounce('moves')) this.voice.announceMove({ promotion: true });
                } else if (result === 'castle') {
                    this.sounds.play('castle');
                    if (this.shouldAnnounce('moves')) this.voice.announceMove({ castling: true });
                } else if (capturedPiece) {
                    this.sounds.play('capture');
                    if (this.shouldAnnounce('moves')) this.voice.announceMove({ captured: true });
                } else if (moveData && moveData.check) {
                    this.sounds.play('check');
                    if (this.shouldAnnounce('moves')) this.voice.announceCheck();
                } else {
                    this.sounds.play('move');
                    if (this.shouldAnnounce('moves')) this.voice.announceMove(moveData);
                }
                
                if (result === 'promotion') {
                    this.ui.showPromotionModal();
                } else {
                    this.ui.renderBoard(this.engine);
                    this.ui.updateGameInfo(this.engine);
                    this.checkGameStatus();
                    
                    if (this.vsComputer && !this.engine.gameOver) {
                        await this.makeAIMove();
                    }
                }
            } else {
                // Select different piece
                const piece = this.engine.board[row][col];
                if (piece && piece.color === this.engine.turn) {
                    this.ui.selectSquare(this.engine, row, col);
                    this.sounds.play('click');
                } else {
                    this.ui.clearSelection(this.engine);
                    this.engine.selectedSquare = null;
                    this.engine.possibleMoves = [];
                }
            }
        }
    }

    async makeAIMove() {
        if (!this.vsComputer || this.engine.gameOver || this.engine.turn !== this.computerSide) {
            return;
        }

        try {
            if (this.shouldAnnounce('ai')) {
                this.voice.announceAIMove();
            }
            
            const move = await this.ai.chooseMove(this.engine, this.engine.turn);
            
            if (move) {
                const result = this.engine.movePiece(move.from.r, move.from.c, move.to.r, move.to.c);
                
                if (result === 'promotion') {
                    // AI automatically promotes to queen
                    this.engine.completePromotion('queen');
                    if (this.shouldAnnounce('ai')) this.voice.announceMove({ promotion: true });
                } else if (result === 'castle') {
                    if (this.shouldAnnounce('ai')) this.voice.announceMove({ castling: true });
                } else {
                    if (this.shouldAnnounce('ai')) this.voice.announceMove({ aiMove: true });
                }
                
                this.ui.renderBoard(this.engine);
                this.ui.updateGameInfo(this.engine);
                this.checkGameStatus();
                
                // Show AI move briefly
                this.highlightLastMove(move);
            }
        } catch (error) {
            console.error('AI move error:', error);
            this.ui.showNotification('AI error occurred', 'error');
        }
        
        // Reset AI status
        const indicator = document.getElementById('game-status-indicator');
        const text = document.getElementById('game-status-text');
        if (indicator && text) {
            indicator.className = 'status-indicator status-active';
            text.textContent = 'Ready to Play';
        }
    }

    highlightLastMove(move) {
        const fromSquare = this.ui.getSquareElement(move.from.r, move.from.c);
        const toSquare = this.ui.getSquareElement(move.to.r, move.to.c);
        
        if (fromSquare && toSquare) {
            fromSquare.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
            toSquare.style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
            
            setTimeout(() => {
                this.ui.renderBoard(this.engine);
            }, 1000);
        }
    }

    completePromotion(pieceType) {
        this.engine.completePromotion(pieceType);
        this.ui.hidePromotionModal();
        this.ui.renderBoard(this.engine);
        this.ui.updateGameInfo(this.engine);
        this.checkGameStatus();
        
        if (this.vsComputer && !this.engine.gameOver) {
            this.makeAIMove();
        }
    }

    checkGameStatus() {
        let status = this.engine.checkGameStatus();
        
        // Override checkmate if invincible king is active
        if (this.ui.cheatsEnabled.invincibleKing && status.includes('Checkmate')) {
            // Reset game over state and continue playing
            this.engine.gameOver = false;
            this.engine.check = this.engine.isKingInCheck(this.engine.turn);
            status = this.engine.check ? 'Check!' : 'Playing';
            
            // Show invincible king message
            if (this.engine.check) {
                this.ui.showNotification('👑 King is invincible! Check ignored!', 'warning');
            }
        }
        
        const statusElement = document.getElementById('game-status-text');
        const indicator = document.getElementById('game-status-indicator');
        
        if (statusElement) {
            statusElement.textContent = status;
        }
        
        if (indicator) {
            if (this.engine.gameOver) {
                indicator.className = 'status-indicator status-error';
                
                // Record game end analytics
                this.analytics.recordGameEnd(status);
                
                // Play game end sound
                this.sounds.play('checkmate');
                
                // Show final notification
                setTimeout(() => {
                    this.ui.showNotification(status, 'info', 5000);
                }, 500);
                
                this.stopGameTimer();
                
            } else if (this.engine.check) {
                indicator.className = 'status-indicator status-warning';
            } else {
                indicator.className = 'status-indicator status-active';
            }
        }
    }

    newGame() {
        this.engine.resetGame();
        this.ui.clearSelection(this.engine);
        this.ui.clearHints();
        this.ui.renderBoard(this.engine);
        this.ui.updateGameInfo(this.engine);
        this.startGameTimer();
        
        if (this.vsComputer && this.computerSide === 'white') {
            this.makeAIMove();
        }
        
        this.ui.showNotification('New game started!', 'success');
    }

    undoMove() {
        if (this.ui.cheatsEnabled.unlimitedTakebacks || this.engine.moveHistory.length > 0) {
            const success = this.engine.undoMove();
            if (success) {
                this.ui.clearSelection(this.engine);
                this.ui.renderBoard(this.engine);
                this.ui.updateGameInfo(this.engine);
                this.ui.showNotification('Move undone', 'success');
                
                // If vs computer, undo AI move too
                if (this.vsComputer && this.engine.moveHistory.length > 0) {
                    setTimeout(() => {
                        this.engine.undoMove();
                        this.ui.renderBoard(this.engine);
                        this.ui.updateGameInfo(this.engine);
                    }, 300);
                }
            }
        } else {
            this.ui.showNotification('No moves to undo', 'warning');
        }
    }

    showHint() {
        if (!this.hintsEnabled) {
            this.ui.showNotification('Hints disabled', 'warning');
            return;
        }
        
        const moves = this.generateTopMoves(2);
        if (moves.length > 0) {
            this.ui.showHint(moves);
            this.ui.showNotification('Hint shown!', 'info');
            this.sounds.play('hint');
            this.analytics.recordHintUsed();
        } else {
            this.ui.showNotification('No hints available', 'warning');
        }
    }

    showBestMove() {
        if (!this.ui.cheatsEnabled.bestMoveHint) {
            this.ui.cheatsEnabled.bestMoveHint = true;
            this.ui.showNotification('Best move cheat enabled!', 'warning');
        }
        
        const moves = this.generateTopMoves(1);
        if (moves.length > 0) {
            this.ui.showHint(moves, 'primary');
            this.ui.showNotification('Best move revealed!', 'warning');
            this.sounds.play('hint');
            this.analytics.recordCheatUsed();
        }
    }

    generateTopMoves(count) {
        const allMoves = [];
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.engine.board[r][c];
                if (piece && piece.color === this.engine.turn) {
                    const moves = this.engine.calculatePossibleMoves(r, c);
                    moves.forEach(([tr, tc]) => {
                        allMoves.push({
                            from: { r, c },
                            to: { r: tr, c: tc },
                            piece
                        });
                    });
                }
            }
        }
        
        // Simple scoring for hints
        const scoredMoves = allMoves.map(move => {
            let score = Math.random() * 10; // Base randomness
            
            // Capture bonus
            const target = this.engine.board[move.to.r][move.to.c];
            if (target) {
                const values = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100 };
                score += values[target.type] * 10;
            }
            
            // Center control
            const centerDist = Math.abs(move.to.r - 3.5) + Math.abs(move.to.c - 3.5);
            score += (7 - centerDist) * 2;
            
            return { ...move, score };
        });
        
        scoredMoves.sort((a, b) => b.score - a.score);
        return scoredMoves.slice(0, count);
    }

    flipBoard() {
        this.engine.flipBoard();
        this.ui.renderBoard(this.engine);
        this.ui.showNotification('Board flipped!', 'info');
    }

    toggleAI() {
        this.vsComputer = !this.vsComputer;
        const button = document.getElementById('toggle-ai');
        const settings = document.getElementById('ai-settings');
        
        if (button) {
            button.textContent = this.vsComputer ? 'Disable AI' : 'Enable AI';
            button.className = this.vsComputer ? 'btn-danger text-sm px-3 py-1' : 'btn-primary text-sm px-3 py-1';
        }
        
        if (settings) {
            if (this.vsComputer) {
                settings.classList.remove('opacity-50', 'pointer-events-none');
            } else {
                settings.classList.add('opacity-50', 'pointer-events-none');
            }
        }
        
        this.gameMode = this.vsComputer ? 'Human vs AI' : 'Human vs Human';
        const gameModeElement = document.getElementById('game-mode');
        if (gameModeElement) {
            gameModeElement.textContent = this.gameMode;
        }
        
        if (this.vsComputer && this.engine.turn === this.computerSide) {
            this.makeAIMove();
        }
        
        this.ui.showNotification(`AI ${this.vsComputer ? 'enabled' : 'disabled'}`, 'info');
    }

    setAIDifficulty(level) {
        this.ai.setDifficulty(parseInt(level));
        const valueElement = document.getElementById('ai-difficulty-value');
        if (valueElement) {
            const levels = ['', 'Beginner', 'Novice', 'Medium', 'Advanced', 'Expert'];
            valueElement.textContent = levels[level] || 'Medium';
        }
    }

    setAISpeed(speed) {
        const speeds = [0, 2000, 1500, 1000, 500, 100];
        this.ai.setThinkingTime(speeds[speed] || 1000);
        
        const valueElement = document.getElementById('ai-speed-value');
        if (valueElement) {
            const speedNames = ['', 'Very Slow', 'Slow', 'Normal', 'Fast', 'Instant'];
            valueElement.textContent = speedNames[speed] || 'Normal';
        }
    }

    setAIPersonality(personality) {
        this.ai.setPersonality(personality);
        this.ui.showNotification(`AI personality: ${personality}`, 'info');
    }

    toggleThemePanel() {
        const panel = document.getElementById('theme-settings');
        const icon = document.getElementById('theme-toggle-icon');
        
        if (panel) {
            panel.classList.toggle('open');
            if (icon) {
                icon.className = panel.classList.contains('open') ? 
                    'fas fa-chevron-up' : 'fas fa-chevron-down';
            }
        }
    }

    setTheme(themeName) {
        this.ui.setTheme(themeName);
        this.ui.renderBoard(this.engine);
        this.ui.showNotification(`Theme changed to ${themeName}`, 'success');
    }

    setPieceStyle(style) {
        this.ui.pieceStyle = style;
        this.ui.renderBoard(this.engine);
        this.ui.showNotification(`Piece style: ${style}`, 'info');
    }

    toggleCoordinates(show) {
        this.ui.showCoordinates = show;
        this.ui.renderBoard(this.engine);
    }

    toggleHighlightMoves(highlight) {
        this.ui.highlightMoves = highlight;
        if (!highlight) {
            this.ui.hidePossibleMoves();
        }
    }

    toggleSmoothAnimations(smooth) {
        this.ui.smoothAnimations = smooth;
        document.body.style.transition = smooth ? 'all 0.3s ease' : 'none';
    }

    startGameTimer() {
        this.stopGameTimer();
        this.gameTimer = setInterval(() => {
            if (!this.engine.gameOver && !this.ui.cheatsEnabled.timeFreeze) {
                this.ui.updateGameInfo(this.engine);
            }
        }, 1000);
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    // Sound Controls
    toggleSound(enabled) {
        this.sounds.enabled = enabled;
        this.ui.showNotification(`Sound ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    // Voice Controls
    toggleVoice(enabled) {
        this.voiceEnabled = enabled;
        this.voice.setEnabled(enabled);
        this.ui.showNotification(`AI Voice ${enabled ? 'enabled' : 'disabled'}`, 'info');
        
        const statusElement = document.getElementById('voice-status');
        if (statusElement) {
            statusElement.textContent = enabled ? 'Ready' : 'Disabled';
            statusElement.className = enabled ? 'text-green-400' : 'text-gray-400';
        }
    }

    toggleVoiceSettings() {
        const panel = document.getElementById('voice-settings');
        const button = document.getElementById('toggle-voice-settings');
        const icon = document.getElementById('voice-toggle-icon');
        
        if (panel && button && icon) {
            panel.classList.toggle('open');
            icon.className = panel.classList.contains('open') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }

    testVoice() {
        if (this.voiceEnabled) {
            this.voice.testVoice();
            this.ui.showNotification('Voice test initiated', 'info');
        } else {
            this.ui.showNotification('Please enable AI voice first', 'warning');
        }
    }

    setVoicePersonality(personality) {
        this.voice.setPersonality(personality);
        const valueElement = document.getElementById('voice-personality-value');
        if (valueElement) {
            const personalities = {
                professional: 'Professional',
                casual: 'Casual',
                dramatic: 'Dramatic',
                funny: 'Funny'
            };
            valueElement.textContent = personalities[personality] || 'Professional';
        }
        this.ui.showNotification(`Voice personality: ${personality}`, 'info');
    }

    setVoiceSpeed(speed) {
        this.voice.setVoiceSettings({ rate: parseFloat(speed) });
        const valueElement = document.getElementById('voice-speed-value');
        if (valueElement) {
            const speedLabels = {
                0.5: 'Very Slow', 0.7: 'Slow', 1.0: 'Normal', 
                1.3: 'Fast', 1.6: 'Very Fast', 2.0: 'Ultra Fast'
            };
            const closestSpeed = Object.keys(speedLabels).reduce((prev, curr) => 
                Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
            );
            valueElement.textContent = speedLabels[closestSpeed] || 'Normal';
        }
    }

    setVoicePitch(pitch) {
        this.voice.setVoiceSettings({ pitch: parseFloat(pitch) });
        const valueElement = document.getElementById('voice-pitch-value');
        if (valueElement) {
            const pitchLabels = {
                0.5: 'Very Low', 0.7: 'Low', 1.0: 'Normal', 
                1.3: 'High', 1.6: 'Very High', 2.0: 'Ultra High'
            };
            const closestPitch = Object.keys(pitchLabels).reduce((prev, curr) => 
                Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev
            );
            valueElement.textContent = pitchLabels[closestPitch] || 'Normal';
        }
    }

    setVoiceVolume(volume) {
        this.voice.setVoiceSettings({ volume: parseFloat(volume) });
        const valueElement = document.getElementById('voice-volume-value');
        if (valueElement) {
            valueElement.textContent = `${Math.round(volume * 100)}%`;
        }
    }

    toggleVoiceAnnouncements(type, enabled) {
        // Store voice announcement preferences
        if (!this.voiceAnnouncements) {
            this.voiceAnnouncements = {
                moves: true,
                cheats: true,
                ai: true,
                gameEvents: true
            };
        }
        
        this.voiceAnnouncements[type] = enabled;
        this.ui.showNotification(`Voice ${type} announcements ${enabled ? 'enabled' : 'disabled'}`, 'info');
    }

    // Statistics Controls
    toggleStatsPanel() {
        const panel = document.getElementById('stats-panel');
        const button = document.getElementById('toggle-stats-panel');
        if (panel && button) {
            panel.classList.toggle('open');
            const icon = button.querySelector('i');
            icon.className = panel.classList.contains('open') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
            
            if (panel.classList.contains('open')) {
                this.updateStatsDisplay();
            }
        }
    }

    updateStatsDisplay() {
        const stats = this.analytics.getDetailedStats();
        
        const elements = {
            'games-played': stats.gamesPlayed,
            'win-rate': `${((stats.gamesWon.white + stats.gamesWon.black) / Math.max(1, stats.gamesPlayed) * 100).toFixed(1)}%`,
            'total-moves': stats.totalMoves,
            'cheats-used': stats.cheatsUsed
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    exportStats() {
        this.analytics.exportStats();
        this.ui.showNotification('Statistics exported!', 'success');
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.analytics.gameStats = {
                gamesPlayed: 0,
                gamesWon: { white: 0, black: 0 },
                totalMoves: 0,
                averageGameLength: 0,
                piecesCaptured: { white: 0, black: 0 },
                checksGiven: 0,
                checkmates: 0,
                stalemates: 0,
                hintsUsed: 0,
                cheatsUsed: 0
            };
            this.analytics.saveStats();
            this.updateStatsDisplay();
            this.ui.showNotification('Statistics reset!', 'success');
        }
    }

    // Advanced Cheat Implementations
    forceCheckmate() {
        console.log('🎮 Force Checkmate cheat activated!');
        if (confirm('Force an immediate checkmate? This will end the current game.')) {
            this.engine.gameOver = true;
            this.engine.winner = this.engine.turn === 'white' ? 'Black' : 'White';
            this.ui.showNotification(`💀 CHECKMATE FORCED! ${this.engine.winner} wins!`, 'error', 3000);
            this.sounds.play('checkmate');
            this.analytics.recordCheatUsed();
            this.checkGameStatus();
        }
    }

    clonePieces() {
        console.log('🎮 Clone Pieces cheat activated!');
        
        // Ask player which color to clone
        const cloneColor = confirm('Clone your own pieces (OK) or opponent\'s pieces (Cancel)?') 
            ? (this.vsComputer ? (this.computerSide === 'white' ? 'black' : 'white') : 'white')
            : (this.vsComputer ? this.computerSide : 'black');
        
        const pieces = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.engine.board[r][c];
                if (piece && piece.color === cloneColor) {
                    pieces.push({ piece, r, c });
                }
            }
        }
        
        if (pieces.length > 0) {
            const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
            
            // Find empty square
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (!this.engine.board[r][c]) {
                        this.engine.board[r][c] = { ...randomPiece.piece };
                        this.ui.renderBoard(this.engine);
                        this.ui.showNotification(`🧬 Cloned ${cloneColor} ${randomPiece.piece.type}!`, 'warning');
                        this.sounds.play('promotion');
                        this.analytics.recordCheatUsed();
                        return;
                    }
                }
            }
        }
        this.ui.showNotification('No space to clone pieces!', 'error');
    }

    shuffleBoard() {
        console.log('🎮 Shuffle Board cheat activated!');
        if (confirm('Shuffle all pieces randomly? This will scramble the board!')) {
            const pieces = [];
            
            // Collect all pieces
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (this.engine.board[r][c]) {
                        pieces.push(this.engine.board[r][c]);
                        this.engine.board[r][c] = null;
                    }
                }
            }
            
            // Shuffle pieces
            for (let i = pieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
            }
            
            // Place shuffled pieces
            let pieceIndex = 0;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    if (pieceIndex < pieces.length) {
                        this.engine.board[r][c] = pieces[pieceIndex++];
                    }
                }
            }
            
            this.ui.renderBoard(this.engine);
            this.ui.showNotification('🌪️ BOARD SHUFFLED! Chaos unleashed!', 'warning', 3000);
            this.sounds.play('error');
            this.analytics.recordCheatUsed();
        }
    }

    reverseTime() {
        let undoCount = 0;
        const maxUndos = Math.min(5, this.engine.moveHistory.length);
        
        if (maxUndos === 0) {
            this.ui.showNotification('No moves to reverse!', 'error');
            return;
        }
        
        const reverseInterval = setInterval(() => {
            if (undoCount < maxUndos && this.engine.moveHistory.length > 0) {
                this.engine.undoMove();
                undoCount++;
                this.ui.renderBoard(this.engine);
                this.ui.updateGameInfo(this.engine);
            } else {
                clearInterval(reverseInterval);
                this.ui.showNotification(`⏰ Reversed ${undoCount} moves!`, 'info');
                this.sounds.play('hint');
                this.analytics.recordCheatUsed();
            }
        }, 200);
    }

    aiSabotage() {
        if (this.vsComputer) {
            // Make AI make random moves for next 3 turns
            this.ai.sabotaged = 3;
            this.ui.showNotification('🦠 AI SABOTAGED! AI will make random moves!', 'warning', 3000);
            this.sounds.play('error');
            this.analytics.recordCheatUsed();
        } else {
            this.ui.showNotification('No AI to sabotage!', 'error');
        }
    }

    toggleGodMode() {
        this.ui.cheatsEnabled.godMode = !this.ui.cheatsEnabled.godMode;
        
        if (this.ui.cheatsEnabled.godMode) {
            // Enable all cheats
            Object.keys(this.ui.cheatsEnabled).forEach(cheat => {
                this.ui.cheatsEnabled[cheat] = true;
            });
            
            this.ui.showNotification('⚡ GOD MODE ACTIVATED! ⚡', 'error', 4000);
            this.sounds.play('checkmate');
            if (this.shouldAnnounce('cheats')) {
                this.voice.announceCheat('godMode');
            }
            
            // Add visual effects
            document.body.style.animation = 'rainbow 2s linear infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            
        } else {
            // Disable all cheats
            Object.keys(this.ui.cheatsEnabled).forEach(cheat => {
                this.ui.cheatsEnabled[cheat] = false;
            });
            
            this.ui.showNotification('God mode deactivated', 'info');
        }
        
        this.analytics.recordCheatUsed();
    }

    toggleCheat(cheatName) {
        console.log(`🎮 Toggling cheat: ${cheatName}`);
        this.ui.cheatsEnabled[cheatName] = !this.ui.cheatsEnabled[cheatName];
        const enabled = this.ui.cheatsEnabled[cheatName];
        
        const cheatNames = {
            seeAllMoves: 'See All Moves',
            bestMoveHint: 'Best Move Hint',
            unlimitedTakebacks: 'Unlimited Takebacks',
            timeFreeze: 'Time Freeze',
            opponentMoves: 'Opponent Moves',
            pieceXray: 'X-Ray Vision',
            forceCheckmate: 'Force Checkmate',
            invincibleKing: 'Invincible King',
            teleportPieces: 'Teleport Pieces',
            clonePieces: 'Clone Pieces',
            shuffleBoard: 'Shuffle Board',
            reverseTime: 'Reverse Time',
            quantumMoves: 'Quantum Moves',
            aiSabotage: 'AI Sabotage',
            godMode: 'God Mode'
        };
        
        const message = `${cheatNames[cheatName]} ${enabled ? 'enabled' : 'disabled'}!`;
        this.ui.showNotification(message, enabled ? 'warning' : 'info');
        this.sounds.play('click');
        
        // Voice announcement for cheat activation
        if (this.shouldAnnounce('cheats') && enabled) {
            this.voice.announceCheat(cheatName);
        }
        
        this.analytics.recordCheatUsed();
        
        if (enabled) {
            // Apply cheat-specific effects
            switch (cheatName) {
                case 'seeAllMoves':
                    this.ui.renderBoard(this.engine);
                    break;
                case 'timeFreeze':
                    if (this.gameTimer) {
                        clearInterval(this.gameTimer);
                    }
                    break;
                case 'invincibleKing':
                    this.ui.showNotification('👑 Your king is now invincible!', 'warning');
                    break;
                case 'pieceXray':
                    this.ui.showNotification('👁️ X-Ray vision activated!', 'warning');
                    this.ui.renderBoard(this.engine);
                    break;
                case 'teleportPieces':
                    this.ui.showNotification('✨ Click any piece to teleport it!', 'warning');
                    break;
                case 'quantumMoves':
                    this.ui.showNotification('⚛️ Quantum superposition enabled!', 'warning');
                    this.ui.renderBoard(this.engine);
                    break;
                case 'godMode':
                    this.ui.showNotification('⚡ GOD MODE: All cheats active!', 'warning');
                    break;
            }
        } else {
            // Handle cheat deactivation
            switch (cheatName) {
                case 'quantumMoves':
                    // Remove quantum effects
                    document.querySelectorAll('.piece').forEach(piece => {
                        piece.style.animation = '';
                        piece.style.transform = '';
                        piece.style.position = '';
                        piece.style.zIndex = '';
                    });
                    this.ui.showNotification('⚛️ Quantum effects disabled', 'info');
                    break;
                case 'pieceXray':
                    // Remove X-ray effects  
                    document.querySelectorAll('.piece').forEach(piece => {
                        piece.style.opacity = '';
                    });
                    this.ui.renderBoard(this.engine);
                    break;
                case 'timeFreeze':
                    // Resume timer
                    this.startGameTimer();
                    break;
            }
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
    
    // Add some global helper functions
    window.gameUI = window.chessGame.ui;
    
    // Test function for cheats
    window.testCheat = (cheatName) => {
        console.log(`Testing cheat: ${cheatName}`);
        if (window.chessGame.ui.cheatsEnabled.hasOwnProperty(cheatName)) {
            window.chessGame.toggleCheat(cheatName);
        } else {
            console.error(`Cheat ${cheatName} not found in cheatsEnabled object`);
        }
    };
    
    console.log('Chess Universe - Ultimate Customization Portal loaded!');
    console.log('Features: Advanced AI, Multiple Themes, Cheats, Full Customization');
    console.log('Available cheats:', Object.keys(window.chessGame.ui.cheatsEnabled));
});
