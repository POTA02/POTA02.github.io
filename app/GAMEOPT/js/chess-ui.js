// Chess UI - User interface and rendering
class ChessUI {
    constructor() {
        this.themes = {
            classic: { light: '#f0d9b5', dark: '#b58863' },
            ocean: { light: '#e6f3ff', dark: '#4a90e2' },
            forest: { light: '#90EE90', dark: '#228B22' },
            neon: { light: '#ff00ff', dark: '#00ffff' },
            royal: { light: '#ffd700', dark: '#8b4513' },
            midnight: { light: '#2c2c54', dark: '#0f0f23' },
            sunset: { light: '#ff7675', dark: '#e17055' },
            ice: { light: '#e8f4fd', dark: '#74b9ff' }
        };
        
        this.currentTheme = 'classic';
        this.showCoordinates = true;
        this.highlightMoves = true;
        this.smoothAnimations = true;
        this.pieceStyle = 'classic';
        this.cheatsEnabled = {
            seeAllMoves: false,
            bestMoveHint: false,
            unlimitedTakebacks: false,
            timeFreeze: false,
            opponentMoves: false,
            pieceXray: false,
            forceCheckmate: false,
            invincibleKing: false,
            teleportPieces: false,
            clonePieces: false,
            shuffleBoard: false,
            reverseTime: false,
            quantumMoves: false,
            aiSabotage: false,
            godMode: false
        };
    }

    renderBoard(game) {
        const boardElement = document.getElementById('chess-board');
        if (!boardElement) return;

        boardElement.innerHTML = '';
        boardElement.className = 'chess-board relative mx-auto mb-6';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const displayRow = game.flipped ? 7 - row : row;
                const displayCol = game.flipped ? 7 - col : col;
                
                const square = document.createElement('div');
                square.className = `square ${(displayRow + displayCol) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Position the square correctly for flipping
                square.style.position = 'absolute';
                square.style.left = `${displayCol * 12.5}%`;
                square.style.top = `${displayRow * 12.5}%`;
                square.style.width = '12.5%';
                square.style.height = '12.5%';
                
                square.style.backgroundColor = (displayRow + displayCol) % 2 === 0 ? 
                    this.themes[this.currentTheme].light : 
                    this.themes[this.currentTheme].dark;

                // Add coordinates if enabled
                if (this.showCoordinates) {
                    if (col === 0) {
                        const rank = document.createElement('div');
                        rank.className = 'notation rank';
                        rank.textContent = game.flipped ? row + 1 : 8 - row;
                        square.appendChild(rank);
                    }
                    if (row === 7) {
                        const file = document.createElement('div');
                        file.className = 'notation file';
                        file.textContent = String.fromCharCode(97 + (game.flipped ? 7 - col : col));
                        square.appendChild(file);
                    }
                }

                // Add piece if present
                const piece = game.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.dataset.piece = piece.type;
                    pieceElement.dataset.color = piece.color;
                    
                    const svg = this.getPieceSVG(piece.type, piece.color);
                    pieceElement.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
                    
                    square.appendChild(pieceElement);
                }

                boardElement.appendChild(square);
            }
        }

        // Update promotion modal pieces
        this.updatePromotionPieces(game.turn);

        // Apply cheat overlays if enabled
        this.applyCheatOverlays(game);
    }

    getPieceSVG(type, color) {
        // Apply style-based color modifications
        let pieceColor, strokeColor, strokeWidth;
        
        switch (this.pieceStyle) {
            case 'modern':
                pieceColor = color === 'white' ? '#f8f9fa' : '#343a40';
                strokeColor = color === 'white' ? '#495057' : '#e9ecef';
                strokeWidth = '2';
                break;
            case 'medieval':
                pieceColor = color === 'white' ? '#ffeaa7' : '#2d3436';
                strokeColor = color === 'white' ? '#636e72' : '#ddd';
                strokeWidth = '1.8';
                break;
            case 'futuristic':
                pieceColor = color === 'white' ? '#00cec9' : '#6c5ce7';
                strokeColor = color === 'white' ? '#0984e3' : '#fd79a8';
                strokeWidth = '2.5';
                break;
            default: // classic
                pieceColor = color === 'white' ? '#fff' : '#000';
                strokeColor = color === 'white' ? '#000' : '#fff';
                strokeWidth = '1.5';
        }

        // Add style-specific filters and effects
        const styleFilters = this.getStyleFilters();

        switch (type) {
            case 'pawn':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
                    stroke="${strokeColor}" fill="${pieceColor}" stroke-width="${strokeWidth}" stroke-linecap="round" filter="${this.getStyleFilter()}"/></svg>`;
            
            case 'rook':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <g fill="${pieceColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${this.getStyleFilter()}">
                        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
                        <path d="M34 14l-3 3H14l-3-3"/>
                        <path d="M31 17v12.5H14V17"/>
                        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5z"/>
                        <path d="M11 14h23"/>
                    </g></svg>`;
            
            case 'knight':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <g fill="${pieceColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${this.getStyleFilter()}">
                        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
                        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-1 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
                        <circle cx="9.5" cy="25.5" r=".5" fill="${strokeColor}"/>
                        <circle cx="14.933" cy="15.75" r="1" fill="${strokeColor}"/>
                    </g></svg>`;
            
            case 'bishop':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <g fill="${pieceColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${this.getStyleFilter()}">
                        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
                        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                        <circle cx="22.5" cy="8.5" r="2.5" stroke="${strokeColor}"/>
                    </g></svg>`;
            
            case 'queen':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <g fill="${pieceColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${this.getStyleFilter()}">
                        <path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"/>
                        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1 2.5-1 2.5-1.5 1.5 0 2.5 0 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>
                        <path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 1.5c2-1 15-1 17 0" fill="none"/>
                    </g></svg>`;
            
            case 'king':
                return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
                    ${styleFilters}
                    <g fill="${pieceColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="${this.getStyleFilter()}">
                        <path d="M22.5 11.63V6M20 8h5M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
                        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/>
                    </g></svg>`;
        }
        return '';
    }

    selectSquare(game, row, col) {
        this.clearSelection();
        game.selectedSquare = [row, col];
        
        const square = this.getSquareElement(row, col);
        if (square) {
            square.classList.add('highlight');
        }
        
        game.possibleMoves = game.calculatePossibleMoves(row, col);
        if (this.highlightMoves) {
            this.showPossibleMoves(game.possibleMoves);
        }
    }

    clearSelection(game) {
        if (game && game.selectedSquare) {
            const [row, col] = game.selectedSquare;
            const square = this.getSquareElement(row, col);
            if (square) {
                square.classList.remove('highlight');
            }
        }
        
        this.hidePossibleMoves();
        this.clearHints();
    }

    showPossibleMoves(moves) {
        moves.forEach(([row, col]) => {
            const square = this.getSquareElement(row, col);
            if (square) {
                const marker = document.createElement('div');
                marker.className = 'possible-move';
                square.appendChild(marker);
            }
        });
    }

    hidePossibleMoves() {
        document.querySelectorAll('.possible-move').forEach(marker => marker.remove());
    }

    getSquareElement(row, col) {
        return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
    }

    updateGameInfo(game) {
        const elements = {
            'current-turn': game.turn === 'white' ? 'White' : 'Black',
            'move-count': game.moveCount,
            'pieces-captured': game.capturedPieces.white.length + game.capturedPieces.black.length,
            'checks-given': game.checksGiven,
            'castles-performed': game.castlesPerformed,
            'en-passant': game.enPassantCount
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });

        // Update turn indicator
        const turnIndicator = document.getElementById('turn-indicator');
        if (turnIndicator) {
            turnIndicator.style.backgroundColor = game.turn === 'white' ? 'white' : 'black';
        }

        // Update game time
        game.updateGameTime();
        const gameTimeElement = document.getElementById('game-time');
        if (gameTimeElement) {
            const minutes = Math.floor(game.gameTime / 60);
            const seconds = game.gameTime % 60;
            gameTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Update captured pieces display
        this.updateCapturedPiecesDisplay(game);
    }

    updateCapturedPiecesDisplay(game) {
        const container = document.getElementById('captured-pieces');
        if (!container) return;

        container.innerHTML = '';
        
        ['white', 'black'].forEach(color => {
            game.capturedPieces[color].forEach(piece => {
                const pieceElement = document.createElement('div');
                pieceElement.className = 'piece w-6 h-6';
                const svg = this.getPieceSVG(piece.type, piece.color === 'white' ? 'black' : 'white');
                pieceElement.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
                container.appendChild(pieceElement);
            });
        });
    }

    updatePromotionPieces(color) {
        document.querySelectorAll('.promotion-option .piece').forEach((element, index) => {
            const types = ['queen', 'rook', 'bishop', 'knight'];
            const svg = this.getPieceSVG(types[index], color);
            element.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
        });
    }

    showPromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hidePromotionModal() {
        const modal = document.getElementById('promotion-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            
            // Update CSS variables
            document.documentElement.style.setProperty('--light-square', this.themes[themeName].light);
            document.documentElement.style.setProperty('--dark-square', this.themes[themeName].dark);
            
            // Update theme preview active state
            document.querySelectorAll('.theme-preview').forEach(preview => {
                preview.classList.remove('active');
            });
            
            const activePreview = document.querySelector(`[data-theme="${themeName}"]`);
            if (activePreview) {
                activePreview.classList.add('active');
            }
        }
    }

    showHint(moves, type = 'primary') {
        this.clearHints();
        
        moves.forEach((move, index) => {
            const fromSquare = this.getSquareElement(move.from.r, move.from.c);
            const toSquare = this.getSquareElement(move.to.r, move.to.c);
            
            if (fromSquare && toSquare) {
                const hintClass = index === 0 ? 'hint-primary' : 'hint-secondary';
                fromSquare.classList.add(hintClass);
                toSquare.classList.add(hintClass);
            }
        });
    }

    clearHints() {
        document.querySelectorAll('.hint-primary, .hint-secondary').forEach(square => {
            square.classList.remove('hint-primary', 'hint-secondary');
        });
        
        document.querySelectorAll('.prediction-arrow').forEach(arrow => {
            arrow.remove();
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg font-bold text-white transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            info: 'bg-blue-600',
            success: 'bg-green-600',
            warning: 'bg-yellow-600',
            error: 'bg-red-600'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    showAIThinking(message) {
        // Show AI thinking process
        const indicator = document.getElementById('game-status-indicator');
        const text = document.getElementById('game-status-text');
        
        if (indicator && text) {
            indicator.className = 'status-indicator status-warning';
            text.textContent = `AI: ${message}`;
        }
    }

    applyCheatOverlays(game) {
        if (this.cheatsEnabled.seeAllMoves) {
            this.showAllPossibleMoves(game);
        }
        
        if (this.cheatsEnabled.pieceXray) {
            this.enableXRayVision();
        }
        
        if (this.cheatsEnabled.godMode) {
            this.applyGodModeEffects();
        }
        
        if (this.cheatsEnabled.teleportPieces) {
            this.enableTeleportMode();
        }
        
        if (this.cheatsEnabled.quantumMoves) {
            this.enableQuantumEffects();
        }
    }

    showAllPossibleMoves(game) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (piece && piece.color === game.turn) {
                    const moves = game.calculatePossibleMoves(r, c);
                    moves.forEach(([tr, tc]) => {
                        const square = this.getSquareElement(tr, tc);
                        if (square) {
                            square.style.boxShadow = 'inset 0 0 10px rgba(34, 197, 94, 0.5)';
                        }
                    });
                }
            }
        }
    }

    enableXRayVision() {
        document.querySelectorAll('.piece').forEach(piece => {
            piece.style.opacity = '0.7';
        });
    }

    applyGodModeEffects() {
        document.querySelectorAll('.square').forEach(square => {
            square.style.boxShadow = 'inset 0 0 15px rgba(255, 215, 0, 0.8)';
        });
    }

    enableTeleportMode() {
        document.querySelectorAll('.piece').forEach(piece => {
            piece.style.cursor = 'grab';
            piece.style.filter = 'drop-shadow(0 0 10px rgba(138, 43, 226, 0.8))';
        });
    }

    enableQuantumEffects() {
        document.querySelectorAll('.piece').forEach(piece => {
            piece.style.animation = 'quantum-glow 2s infinite alternate';
            piece.style.transform = 'scale(1.05)';
            piece.style.position = 'relative';
            piece.style.zIndex = '10';
        });
    }

    disableAllCheats() {
        Object.keys(this.cheatsEnabled).forEach(cheat => {
            this.cheatsEnabled[cheat] = false;
        });
        
        // Reset visual effects
        document.querySelectorAll('.square').forEach(square => {
            square.style.boxShadow = '';
        });
        
        document.querySelectorAll('.piece').forEach(piece => {
            piece.style.opacity = '';
            piece.style.cursor = '';
            piece.style.filter = '';
            piece.style.animation = '';
            piece.style.transform = '';
            piece.style.position = '';
            piece.style.zIndex = '';
        });
    }

    createStarField() {
        const constellation = document.getElementById('constellation');
        if (!constellation) return;

        constellation.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.width = star.style.height = (Math.random() * 3 + 1) + 'px';
            star.style.animationDelay = Math.random() * 3 + 's';
            constellation.appendChild(star);
        }
    }

    applyOptimizations(optimizations) {
        // Apply performance optimizations based on device capabilities
        this.optimizations = optimizations;
        
        if (!optimizations.complexShadows) {
            // Disable complex shadows for low-end devices
            const style = document.createElement('style');
            style.textContent = `
                .glass-panel { box-shadow: none !important; }
                .piece { filter: none !important; }
            `;
            document.head.appendChild(style);
        }
        
        if (!optimizations.backgroundAnimation) {
            // Disable background animations
            const style = document.createElement('style');
            style.textContent = `
                body { animation: none !important; }
                .star { animation: none !important; }
            `;
            document.head.appendChild(style);
        }
        
        if (optimizations.animationSpeed === 'fast') {
            // Speed up animations
            const style = document.createElement('style');
            style.textContent = `
                * { 
                    animation-duration: 0.1s !important; 
                    transition-duration: 0.1s !important; 
                }
            `;
            document.head.appendChild(style);
        }
    }

    getStyleFilters() {
        switch (this.pieceStyle) {
            case 'modern':
                return `<defs>
                    <filter id="modern-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
                    </filter>
                </defs>`;
            case 'medieval':
                return `<defs>
                    <filter id="medieval-texture" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="1" dy="3" stdDeviation="2" flood-color="#8b4513" flood-opacity="0.4"/>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
                    </filter>
                </defs>`;
            case 'futuristic':
                return `<defs>
                    <filter id="futuristic-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>`;
            default:
                return '';
        }
    }

    getStyleFilter() {
        switch (this.pieceStyle) {
            case 'modern':
                return 'url(#modern-shadow)';
            case 'medieval':
                return 'url(#medieval-texture)';
            case 'futuristic':
                return 'url(#futuristic-glow)';
            default:
                return '';
        }
    }
}
