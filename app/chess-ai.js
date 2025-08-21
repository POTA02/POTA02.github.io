// Chess Bots with different personalities and playing styles
class ChessBot {
    constructor(name, personality = 'balanced', depth = 3, rating = 2000) {
        this.name = name;
        this.personality = personality;
        this.depth = depth;
        this.currentDepth = depth; // Track current adjusted depth
        this.rating = rating;
        this.thinkingTime = 1000; // Base thinking time in ms
        this.positionsEvaluated = 0;
    }

    // Main move selection using minimax with alpha-beta pruning
    async chooseMove(engine, gameSpeed = 1) {
        this.positionsEvaluated = 0;
        const startTime = Date.now();
        
        // Add some realistic thinking time
        const thinkingDelay = this.calculateThinkingTime(engine);
        await new Promise(resolve => setTimeout(resolve, thinkingDelay));

        const moves = engine.getAllLegalMoves(engine.currentPlayer);
        if (moves.length === 0) return null;

        // Adjust intelligence based on game speed
        let adjustedDepth = this.depth;
        let useRandomness = false;
        
        if (gameSpeed === 2) {
            // 2x speed = reduced depth and add randomness
            adjustedDepth = Math.max(1, this.depth - 2);
            useRandomness = true;
            console.log(`${this.name} playing DUMBER at 2x speed (depth: ${adjustedDepth})`);
        } else if (gameSpeed === 0.5) {
            // 0.5x speed = increased depth
            adjustedDepth = this.depth + 2;
            console.log(`${this.name} playing SMARTER at 0.5x speed (depth: ${adjustedDepth})`);
        }
        
        // Update current depth for display
        this.currentDepth = adjustedDepth;

        // Use different strategies based on personality
        let bestMove;
        
        // If dumber mode, sometimes pick random moves
        if (useRandomness && Math.random() < 0.3) {
            console.log(`${this.name} making a random move (dumber mode)`);
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        switch (this.personality) {
            case 'aggressive':
                bestMove = this.chooseAggressiveMove(engine, moves, adjustedDepth);
                break;
            case 'defensive':
                bestMove = this.chooseDefensiveMove(engine, moves, adjustedDepth);
                break;
            case 'positional':
                bestMove = this.choosePositionalMove(engine, moves, adjustedDepth);
                break;
            case 'tactical':
                bestMove = this.chooseTacticalMove(engine, moves, adjustedDepth);
                break;
            default:
                bestMove = this.chooseBalancedMove(engine, moves, adjustedDepth);
        }

        const endTime = Date.now();
        console.log(`${this.name} evaluated ${this.positionsEvaluated} positions in ${endTime - startTime}ms`);

        return bestMove;
    }

    calculateThinkingTime(engine) {
        // Vary thinking time based on position complexity and personality
        const baseMoves = engine.getAllLegalMoves(engine.currentPlayer).length;
        const complexity = Math.min(baseMoves / 10, 2); // Scale 0-2
        
        const personalityMultiplier = {
            aggressive: 0.7,  // Quick decisions
            defensive: 1.3,   // More careful
            positional: 1.5,  // Deep thinking
            tactical: 1.2,    // Moderate thinking
            balanced: 1.0     // Standard
        };

        const multiplier = personalityMultiplier[this.personality] || 1.0;
        return Math.floor(this.thinkingTime * multiplier * (0.5 + complexity));
    }

    chooseBalancedMove(engine, moves, depth = this.depth) {
        return this.minimax(engine, depth, -Infinity, Infinity, true).move;
    }

    chooseAggressiveMove(engine, moves, depth = this.depth) {
        // Prioritize captures and attacks
        const captures = moves.filter(move => move.capture);
        const checks = moves.filter(move => {
            const testEngine = engine.clone();
            testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            return testEngine.isInCheck(testEngine.currentPlayer);
        });

        if (captures.length > 0 && Math.random() < 0.7) {
            return this.selectBestFromMoves(engine, captures, depth);
        }
        if (checks.length > 0 && Math.random() < 0.5) {
            return this.selectBestFromMoves(engine, checks, depth);
        }

        return this.minimax(engine, Math.max(2, depth - 1), -Infinity, Infinity, true).move;
    }

    chooseDefensiveMove(engine, moves, depth = this.depth) {
        // Prioritize safety and piece development
        const safeMoves = moves.filter(move => {
            const testEngine = engine.clone();
            testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            return !this.isPieceUnderAttack(testEngine, move.to.row, move.to.col, engine.currentPlayer);
        });

        if (safeMoves.length > 0) {
            return this.selectBestFromMoves(engine, safeMoves, depth);
        }

        return this.minimax(engine, depth, -Infinity, Infinity, true).move;
    }

    choosePositionalMove(engine, moves, depth = this.depth) {
        // Focus on positional improvements
        const positionScores = moves.map(move => {
            const testEngine = engine.clone();
            testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            return {
                move,
                score: this.evaluatePositionalFactors(testEngine)
            };
        });

        positionScores.sort((a, b) => b.score - a.score);
        return positionScores[0].move;
    }

    chooseTacticalMove(engine, moves, depth = this.depth) {
        // Look for tactical combinations
        const tacticalMoves = this.findTacticalMoves(engine, moves);
        if (tacticalMoves.length > 0) {
            return this.selectBestFromMoves(engine, tacticalMoves, depth);
        }

        return this.minimax(engine, depth, -Infinity, Infinity, true).move;
    }

    // Minimax algorithm with alpha-beta pruning
    minimax(engine, depth, alpha, beta, maximizingPlayer) {
        this.positionsEvaluated++;

        if (depth === 0 || engine.gameOver) {
            return {
                score: this.evaluatePosition(engine),
                move: null
            };
        }

        const moves = engine.getAllLegalMoves(engine.currentPlayer);
        let bestMove = null;

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            
            for (const move of moves) {
                const testEngine = engine.clone();
                testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const result = this.minimax(testEngine, depth - 1, alpha, beta, false);
                
                if (result.score > maxEval) {
                    maxEval = result.score;
                    bestMove = move;
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            
            for (const move of moves) {
                const testEngine = engine.clone();
                testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                
                const result = this.minimax(testEngine, depth - 1, alpha, beta, true);
                
                if (result.score < minEval) {
                    minEval = result.score;
                    bestMove = move;
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            
            return { score: minEval, move: bestMove };
        }
    }

    evaluatePosition(engine) {
        if (engine.gameOver) {
            if (engine.winner === 'white') return 10000;
            if (engine.winner === 'black') return -10000;
            return 0; // Stalemate
        }

        let score = 0;
        
        // Material evaluation
        score += this.evaluateMaterial(engine);
        
        // Positional evaluation
        score += this.evaluatePositionalFactors(engine);
        
        // King safety
        score += this.evaluateKingSafety(engine);
        
        // Mobility
        score += this.evaluateMobility(engine);

        // Add personality-based adjustments
        score += this.applyPersonalityBonus(engine, score);

        return score;
    }

    evaluateMaterial(engine) {
        const pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 0
        };

        let material = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    material += piece.color === 'white' ? value : -value;
                }
            }
        }

        return material;
    }

    evaluatePositionalFactors(engine) {
        let positional = 0;

        // Piece-square tables (simplified)
        const pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.type === 'pawn') {
                    const tableRow = piece.color === 'white' ? 7 - row : row;
                    const bonus = pawnTable[tableRow][col];
                    positional += piece.color === 'white' ? bonus : -bonus;
                }
            }
        }

        // Center control bonus
        const centerSquares = [[3,3], [3,4], [4,3], [4,4]];
        for (const [row, col] of centerSquares) {
            const piece = engine.board[row][col];
            if (piece) {
                positional += piece.color === 'white' ? 20 : -20;
            }
        }

        return positional / 10; // Scale down
    }

    evaluateKingSafety(engine) {
        let safety = 0;
        
        const whiteKing = engine.findKing('white');
        const blackKing = engine.findKing('black');
        
        if (whiteKing && engine.isInCheck('white')) safety -= 50;
        if (blackKing && engine.isInCheck('black')) safety += 50;

        return safety;
    }

    evaluateMobility(engine) {
        const whiteMoves = engine.getAllLegalMoves('white').length;
        const blackMoves = engine.getAllLegalMoves('black').length;
        
        return (whiteMoves - blackMoves) * 2;
    }

    applyPersonalityBonus(engine, baseScore) {
        switch (this.personality) {
            case 'aggressive':
                // Bonus for attacking moves
                return this.countAttackingMoves(engine, 'white') - this.countAttackingMoves(engine, 'black');
            case 'defensive':
                // Penalty for exposed pieces
                return -(this.countExposedPieces(engine, 'white') - this.countExposedPieces(engine, 'black')) * 5;
            case 'positional':
                // Bonus for good pawn structure
                return this.evaluatePawnStructure(engine);
            default:
                return 0;
        }
    }

    countAttackingMoves(engine, color) {
        const moves = engine.getAllLegalMoves(color);
        return moves.filter(move => move.capture).length;
    }

    countExposedPieces(engine, color) {
        let exposed = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = engine.board[row][col];
                if (piece && piece.color === color) {
                    if (this.isPieceUnderAttack(engine, row, col, color)) {
                        exposed++;
                    }
                }
            }
        }
        return exposed;
    }

    evaluatePawnStructure(engine) {
        // Simple pawn structure evaluation
        let structure = 0;
        
        for (let col = 0; col < 8; col++) {
            let whitePawns = 0;
            let blackPawns = 0;
            
            for (let row = 0; row < 8; row++) {
                const piece = engine.board[row][col];
                if (piece && piece.type === 'pawn') {
                    if (piece.color === 'white') whitePawns++;
                    else blackPawns++;
                }
            }
            
            // Penalty for doubled pawns
            if (whitePawns > 1) structure -= (whitePawns - 1) * 10;
            if (blackPawns > 1) structure += (blackPawns - 1) * 10;
        }
        
        return structure;
    }

    isPieceUnderAttack(engine, row, col, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = engine.board[r][c];
                if (piece && piece.color === opponentColor) {
                    const moves = engine.getPossibleMovesIgnoreCheck(r, c);
                    if (moves.some(move => move.row === row && move.col === col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    selectBestFromMoves(engine, moves, depth = 2) {
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0];

        const evaluatedMoves = moves.map(move => {
            const testEngine = engine.clone();
            testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // Use minimax for better evaluation with specified depth
            const result = this.minimax(testEngine, Math.min(depth, 3), -Infinity, Infinity, false);
            return {
                move,
                score: result.score
            };
        });

        evaluatedMoves.sort((a, b) => 
            engine.currentPlayer === 'white' ? b.score - a.score : a.score - b.score
        );

        return evaluatedMoves[0].move;
    }

    findTacticalMoves(engine, moves) {
        // Look for captures, checks, and threats
        return moves.filter(move => {
            if (move.capture) return true;
            
            const testEngine = engine.clone();
            testEngine.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            
            // Check if this move gives check
            const opponentColor = engine.currentPlayer === 'white' ? 'black' : 'white';
            return testEngine.isInCheck(opponentColor);
        });
    }

    getSearchDepth() {
        return this.currentDepth;
    }

    getEvaluationCount() {
        return this.positionsEvaluated;
    }
}

// Predefined bot configurations
const BOT_PROFILES = {
    alphaChess: new ChessBot('AlphaChess Pro', 'balanced', 4, 2847),
    deepMind: new ChessBot('DeepMind Chess', 'positional', 4, 2832),
    tactical: new ChessBot('Tactical Engine', 'tactical', 5, 2950),
    aggressive: new ChessBot('AggroBot', 'aggressive', 3, 2600),
    defensive: new ChessBot('DefenseBot', 'defensive', 3, 2650),
    random: new ChessBot('RandomBot', 'balanced', 1, 1500)
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChessBot, BOT_PROFILES };
}
