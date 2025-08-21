/**
 * Chess Engine System
 * 
 * Advanced chess engine with 5 difficulty levels and multiple playing styles.
 * 
 * Features:
 * - 5 difficulty levels (Beginner to Grandmaster)
 * - Multiple personalities (Aggressive, Defensive, Positional, Tactical, Balanced)
 * - Minimax algorithm with alpha-beta pruning
 * - Position evaluation with multiple factors
 * - Opening book integration ready
 * - Move time controls
 */

export class ChessEngineSystem {
    constructor(config = {}) {
        this.difficulty = config.difficulty || 3; // 1-5 scale
        this.personality = config.personality || 'balanced';
        this.maxDepth = this.getDifficultyDepth();
        this.moveTime = config.moveTime || 1000; // milliseconds
        this.sabotaged = false;
        this.sabotageMoves = 0;
        
        // Piece values for evaluation
        this.pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };
        
        // Position tables for piece-square evaluation
        this.initPositionTables();
        
        // Personality modifiers
        this.personalityWeights = this.getPersonalityWeights();
    }

    /**
     * Get search depth based on difficulty level
     */
    getDifficultyDepth() {
        const depths = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
        return depths[this.difficulty] || 3;
    }

    /**
     * Get personality-based evaluation weights
     */
    getPersonalityWeights() {
        const weights = {
            balanced: { attack: 1.0, defense: 1.0, development: 1.0, center: 1.0 },
            aggressive: { attack: 1.5, defense: 0.7, development: 1.2, center: 1.1 },
            defensive: { attack: 0.8, defense: 1.4, development: 0.9, center: 1.0 },
            positional: { attack: 0.9, defense: 1.1, development: 1.3, center: 1.4 },
            tactical: { attack: 1.3, defense: 0.9, development: 1.0, center: 1.2 }
        };
        return weights[this.personality] || weights.balanced;
    }

    /**
     * Initialize piece-square tables for positional evaluation
     */
    initPositionTables() {
        // Pawn position table (white perspective)
        this.pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        // Knight position table
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

        // Bishop position table
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

        // Rook position table
        this.rookTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ];

        // Queen position table
        this.queenTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];

        // King position table (middle game)
        this.kingTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20]
        ];
    }

    /**
     * Choose the best move for the current position
     * @param {ChessEngine} engine - Chess engine instance
     * @param {string} color - 'white' or 'black'
     * @returns {Object} Best move object {from: {r, c}, to: {r, c}, score: number}
     */
    async chooseMove(engine, color) {
        if (this.sabotaged && this.sabotageMoves > 0) {
            this.sabotageMoves--;
            return this.getRandomMove(engine, color);
        }

        const startTime = Date.now();
        
        try {
            // Get all possible moves
            const allMoves = this.getAllPossibleMoves(engine, color);
            if (allMoves.length === 0) return null;

            // Apply difficulty-based decision making
            let bestMove;
            
            switch (this.difficulty) {
                case 1: // Beginner - mostly random with some basic evaluation
                    bestMove = Math.random() < 0.3 ? 
                        this.getBestMoveMinMax(engine, color, 1) : 
                        this.getRandomMove(engine, color);
                    break;
                    
                case 2: // Easy - basic evaluation with occasional mistakes
                    bestMove = Math.random() < 0.7 ? 
                        this.getBestMoveMinMax(engine, color, 2) : 
                        this.getRandomMove(engine, color);
                    break;
                    
                case 3: // Medium - good evaluation with rare mistakes
                    bestMove = Math.random() < 0.9 ? 
                        this.getBestMoveMinMax(engine, color, 3) : 
                        this.getSuboptimalMove(engine, color);
                    break;
                    
                case 4: // Hard - strong evaluation
                    bestMove = this.getBestMoveMinMax(engine, color, 4);
                    break;
                    
                case 5: // Expert - maximum evaluation with time management
                    const timeLimit = Math.min(this.moveTime, 5000);
                    bestMove = await this.getBestMoveWithTime(engine, color, timeLimit);
                    break;
                    
                default:
                    bestMove = this.getBestMoveMinMax(engine, color, 3);
            }

            const moveTime = Date.now() - startTime;
            console.log(`AI move calculated in ${moveTime}ms at difficulty ${this.difficulty}`);
            
            return bestMove;
            
        } catch (error) {
            console.error('AI move calculation error:', error);
            return this.getRandomMove(engine, color);
        }
    }

    /**
     * Get best move using minimax algorithm with alpha-beta pruning
     */
    getBestMoveMinMax(engine, color, depth) {
        const isMaximizing = color === 'white';
        let bestMove = null;
        let bestScore = isMaximizing ? -Infinity : Infinity;

        const allMoves = this.getAllPossibleMoves(engine, color);
        
        // Shuffle moves for variety at same evaluation
        this.shuffleArray(allMoves);

        for (const move of allMoves) {
            // Make move
            const moveResult = this.makeMove(engine, move);
            if (!moveResult.success) continue;

            // Evaluate position
            const score = this.minimax(engine, depth - 1, !isMaximizing, -Infinity, Infinity);
            
            // Undo move
            this.undoMove(engine, moveResult);

            // Update best move
            if (isMaximizing ? score > bestScore : score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || allMoves[0];
    }

    /**
     * Minimax algorithm with alpha-beta pruning
     */
    minimax(engine, depth, isMaximizing, alpha, beta) {
        // Base case
        if (depth === 0 || engine.gameOver) {
            return this.evaluatePosition(engine, isMaximizing ? 'white' : 'black');
        }

        const color = isMaximizing ? 'white' : 'black';
        const allMoves = this.getAllPossibleMoves(engine, color);

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of allMoves) {
                const moveResult = this.makeMove(engine, move);
                if (!moveResult.success) continue;

                const evaluation = this.minimax(engine, depth - 1, false, alpha, beta);
                this.undoMove(engine, moveResult);

                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of allMoves) {
                const moveResult = this.makeMove(engine, move);
                if (!moveResult.success) continue;

                const evaluation = this.minimax(engine, depth - 1, true, alpha, beta);
                this.undoMove(engine, moveResult);

                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minEval;
        }
    }

    /**
     * Get best move with time limit using iterative deepening
     */
    async getBestMoveWithTime(engine, color, timeLimit) {
        const startTime = Date.now();
        let bestMove = null;
        let currentDepth = 1;

        while (Date.now() - startTime < timeLimit && currentDepth <= 6) {
            try {
                const move = this.getBestMoveMinMax(engine, color, currentDepth);
                if (move) bestMove = move;
                currentDepth++;
            } catch (error) {
                break;
            }
        }

        return bestMove || this.getRandomMove(engine, color);
    }

    /**
     * Evaluate the current position
     */
    evaluatePosition(engine, forColor) {
        let score = 0;

        // Material evaluation
        score += this.evaluateMaterial(engine, forColor);
        
        // Positional evaluation
        score += this.evaluatePosition_internal(engine, forColor);
        
        // King safety
        score += this.evaluateKingSafety(engine, forColor);
        
        // Pawn structure
        score += this.evaluatePawnStructure(engine, forColor);
        
        // Piece mobility
        score += this.evaluateMobility(engine, forColor);

        // Apply personality weights
        score *= this.getPersonalityMultiplier(engine, forColor);

        return score;
    }

    /**
     * Evaluate material balance
     */
    evaluateMaterial(engine, forColor) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    score += piece.color === forColor ? value : -value;
                }
            }
        }
        
        return score;
    }

    /**
     * Evaluate piece positions using piece-square tables
     */
    evaluatePosition_internal(engine, forColor) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece) {
                    const pieceScore = this.getPieceSquareValue(piece, row, col);
                    score += piece.color === forColor ? pieceScore : -pieceScore;
                }
            }
        }
        
        return score * this.personalityWeights.development;
    }

    /**
     * Get piece-square table value for a piece
     */
    getPieceSquareValue(piece, row, col) {
        // Flip row for black pieces
        const r = piece.color === 'white' ? row : 7 - row;
        
        switch (piece.type) {
            case 'pawn': return this.pawnTable[r][col];
            case 'knight': return this.knightTable[r][col];
            case 'bishop': return this.bishopTable[r][col];
            case 'rook': return this.rookTable[r][col];
            case 'queen': return this.queenTable[r][col];
            case 'king': return this.kingTable[r][col];
            default: return 0;
        }
    }

    /**
     * Evaluate king safety
     */
    evaluateKingSafety(engine, forColor) {
        const king = this.findKing(engine, forColor);
        const opponentKing = this.findKing(engine, forColor === 'white' ? 'black' : 'white');
        
        if (!king || !opponentKing) return 0;
        
        let safety = 0;
        
        // Penalize exposed king
        if (engine.isKingInCheck(forColor)) {
            safety -= 50 * this.personalityWeights.defense;
        }
        
        // Reward castling
        if (king.piece.hasMoved === false) {
            safety += 20;
        }
        
        return safety;
    }

    /**
     * Evaluate pawn structure
     */
    evaluatePawnStructure(engine, forColor) {
        let score = 0;
        const pawns = this.findPieces(engine, 'pawn', forColor);
        
        // Doubled pawns penalty
        const files = {};
        pawns.forEach(pawn => {
            files[pawn.col] = (files[pawn.col] || 0) + 1;
        });
        
        Object.values(files).forEach(count => {
            if (count > 1) score -= (count - 1) * 10;
        });
        
        // Isolated pawns penalty
        pawns.forEach(pawn => {
            const hasSupport = pawns.some(p => 
                Math.abs(p.col - pawn.col) === 1
            );
            if (!hasSupport) score -= 15;
        });
        
        return score;
    }

    /**
     * Evaluate piece mobility
     */
    evaluateMobility(engine, forColor) {
        const originalTurn = engine.turn;
        engine.turn = forColor;
        
        let mobility = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.color === forColor) {
                    const moves = engine.calculatePossibleMoves(row, col);
                    mobility += moves.length;
                }
            }
        }
        
        engine.turn = originalTurn;
        return mobility * 2;
    }

    /**
     * Get personality-based evaluation multiplier
     */
    getPersonalityMultiplier(engine, forColor) {
        let multiplier = 1.0;
        
        // Aggressive personalities prefer attacking positions
        if (this.personality === 'aggressive') {
            const opponentKing = this.findKing(engine, forColor === 'white' ? 'black' : 'white');
            if (opponentKing && engine.isKingInCheck(opponentKing.piece.color)) {
                multiplier *= 1.2;
            }
        }
        
        return multiplier;
    }

    /**
     * Get all possible moves for a color
     */
    getAllPossibleMoves(engine, color) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.color === color) {
                    const possibleMoves = engine.calculatePossibleMoves(row, col);
                    possibleMoves.forEach(([toRow, toCol]) => {
                        moves.push({
                            from: { r: row, c: col },
                            to: { r: toRow, c: toCol }
                        });
                    });
                }
            }
        }
        
        return moves;
    }

    /**
     * Get a random move (used for easy difficulty and sabotage)
     */
    getRandomMove(engine, color) {
        const allMoves = this.getAllPossibleMoves(engine, color);
        return allMoves.length > 0 ? 
            allMoves[Math.floor(Math.random() * allMoves.length)] : null;
    }

    /**
     * Get a suboptimal move (used for medium difficulty mistakes)
     */
    getSuboptimalMove(engine, color) {
        const allMoves = this.getAllPossibleMoves(engine, color);
        if (allMoves.length <= 3) return this.getRandomMove(engine, color);
        
        // Remove the best few moves and pick randomly
        const worstMoves = allMoves.slice(3);
        return worstMoves[Math.floor(Math.random() * worstMoves.length)];
    }

    /**
     * Make a move temporarily for evaluation
     */
    makeMove(engine, move) {
        const { from, to } = move;
        const piece = engine.board[from.r][from.c];
        const captured = engine.board[to.r][to.c];
        
        if (!piece) return { success: false };
        
        // Store original state
        const originalState = {
            piece: { ...piece },
            captured: captured ? { ...captured } : null,
            turn: engine.turn,
            lastMove: engine.lastMove,
            check: engine.check
        };
        
        // Make move
        engine.board[to.r][to.c] = piece;
        engine.board[from.r][from.c] = null;
        piece.hasMoved = true;
        
        // Update turn
        engine.turn = engine.turn === 'white' ? 'black' : 'white';
        engine.check = engine.isKingInCheck(engine.turn);
        
        return { success: true, originalState, move };
    }

    /**
     * Undo a temporary move
     */
    undoMove(engine, moveResult) {
        const { originalState, move } = moveResult;
        const { from, to } = move;
        
        // Restore pieces
        engine.board[from.r][from.c] = originalState.piece;
        engine.board[to.r][to.c] = originalState.captured;
        
        // Restore piece state
        if (originalState.piece) {
            engine.board[from.r][from.c].hasMoved = originalState.piece.hasMoved;
        }
        
        // Restore engine state
        engine.turn = originalState.turn;
        engine.lastMove = originalState.lastMove;
        engine.check = originalState.check;
    }

    /**
     * Find king of specified color
     */
    findKing(engine, color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col, piece };
                }
            }
        }
        return null;
    }

    /**
     * Find all pieces of specified type and color
     */
    findPieces(engine, type, color) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.type === type && piece.color === color) {
                    pieces.push({ row, col, piece });
                }
            }
        }
        return pieces;
    }

    /**
     * Shuffle array in place
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Set AI difficulty (1-5)
     */
    setDifficulty(level) {
        this.difficulty = Math.max(1, Math.min(5, level));
        this.maxDepth = this.getDifficultyDepth();
    }

    /**
     * Set AI personality
     */
    setPersonality(personality) {
        const validPersonalities = ['balanced', 'aggressive', 'defensive', 'positional', 'tactical'];
        if (validPersonalities.includes(personality)) {
            this.personality = personality;
            this.personalityWeights = this.getPersonalityWeights();
        }
    }

    /**
     * Sabotage AI (makes random moves for specified turns)
     */
    sabotage(turns = 3) {
        this.sabotaged = true;
        this.sabotageMoves = turns;
    }

    /**
     * Get AI status information
     */
    getStatus() {
        return {
            difficulty: this.difficulty,
            personality: this.personality,
            maxDepth: this.maxDepth,
            sabotaged: this.sabotaged,
            sabotageMoves: this.sabotageMoves
        };
    }
}

// Legacy compatibility
export default ChessAISystem;
