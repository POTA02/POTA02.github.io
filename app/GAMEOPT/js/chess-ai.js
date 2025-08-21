// Chess AI - Intelligent computer opponent
class ChessAI {
    constructor() {
        this.pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };
        
        this.difficulty = 3; // 1-5 scale
        this.personality = 'balanced';
        this.thinkingTime = 1000; // milliseconds
        this.showThinking = false;
    }

    setDifficulty(level) {
        this.difficulty = Math.max(1, Math.min(5, level));
    }

    setPersonality(personality) {
        this.personality = personality;
    }

    setThinkingTime(time) {
        this.thinkingTime = time;
    }

    async chooseMove(game, color) {
        const startTime = Date.now();
        
        if (this.showThinking) {
            this.showThinkingProcess('Analyzing position...');
        }

        const moves = this.generateAllLegalMoves(game, color);
        if (moves.length === 0) return null;

        let bestMove;
        
        switch (this.difficulty) {
            case 1: // Beginner - mostly random with some basic rules
                bestMove = this.chooseBeginner(moves, game);
                break;
            case 2: // Novice - basic evaluation
                bestMove = this.chooseNovice(moves, game);
                break;
            case 3: // Intermediate - 3-ply search
                bestMove = this.chooseIntermediate(moves, game, color);
                break;
            case 4: // Advanced - 4-ply search with better evaluation
                bestMove = this.chooseAdvanced(moves, game, color);
                break;
            case 5: // Expert - 5-ply search with advanced features
                bestMove = this.chooseExpert(moves, game, color);
                break;
        }

        // Ensure minimum thinking time for realism
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, this.thinkingTime - elapsedTime);
        
        if (remainingTime > 0) {
            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        if (this.showThinking) {
            this.showThinkingProcess('Move selected!');
        }

        return bestMove;
    }

    chooseBeginner(moves, game) {
        // 70% random, 30% capture if available
        const captures = moves.filter(move => {
            const target = game.board[move.to.r][move.to.c];
            return target && target.color !== move.piece.color;
        });

        if (captures.length > 0 && Math.random() < 0.3) {
            return captures[Math.floor(Math.random() * captures.length)];
        }

        return moves[Math.floor(Math.random() * moves.length)];
    }

    chooseNovice(moves, game) {
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of moves) {
            let score = 0;
            
            // Capture bonus
            const target = game.board[move.to.r][move.to.c];
            if (target) {
                score += this.pieceValues[target.type];
            }

            // Center control
            const centerDistance = Math.abs(move.to.r - 3.5) + Math.abs(move.to.c - 3.5);
            score += (7 - centerDistance) * 10;

            // Random factor
            score += Math.random() * 50;

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (Math.abs(score - bestScore) < 10) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    chooseIntermediate(moves, game, color) {
        return this.minimax(game, color, 3, moves);
    }

    chooseAdvanced(moves, game, color) {
        return this.minimax(game, color, 4, moves);
    }

    chooseExpert(moves, game, color) {
        return this.alphabeta(game, color, 5, moves);
    }

    minimax(game, color, depth, moves) {
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of moves) {
            const undo = this.makeMove(game, move);
            const score = -this.minimaxRecursive(game, this.getOpponent(color), depth - 1);
            this.unmakeMove(game, move, undo);

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    minimaxRecursive(game, color, depth) {
        if (depth === 0) {
            return this.evaluatePosition(game, color);
        }

        const moves = this.generateAllLegalMoves(game, color);
        if (moves.length === 0) {
            if (game.isKingInCheck(color)) {
                return -99999 + (5 - depth); // Prefer faster checkmate
            }
            return 0; // Stalemate
        }

        let best = -Infinity;
        for (const move of moves) {
            const undo = this.makeMove(game, move);
            const score = -this.minimaxRecursive(game, this.getOpponent(color), depth - 1);
            this.unmakeMove(game, move, undo);
            
            if (score > best) {
                best = score;
            }
        }

        return best;
    }

    alphabeta(game, color, depth, moves) {
        let bestScore = -Infinity;
        let bestMoves = [];

        for (const move of moves) {
            const undo = this.makeMove(game, move);
            const score = -this.alphabetaRecursive(game, this.getOpponent(color), depth - 1, -Infinity, Infinity);
            this.unmakeMove(game, move, undo);

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }

        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    alphabetaRecursive(game, color, depth, alpha, beta) {
        if (depth === 0) {
            return this.evaluatePosition(game, color);
        }

        const moves = this.generateAllLegalMoves(game, color);
        if (moves.length === 0) {
            if (game.isKingInCheck(color)) {
                return -99999 + (5 - depth);
            }
            return 0;
        }

        for (const move of moves) {
            const undo = this.makeMove(game, move);
            const score = -this.alphabetaRecursive(game, this.getOpponent(color), depth - 1, -beta, -alpha);
            this.unmakeMove(game, move, undo);

            if (score >= beta) {
                return beta; // Beta cutoff
            }
            if (score > alpha) {
                alpha = score;
            }
        }

        return alpha;
    }

    evaluatePosition(game, color) {
        let score = 0;

        // Material count
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    score += piece.color === color ? value : -value;

                    // Positional bonuses based on personality
                    score += this.getPositionalBonus(piece, r, c, color);
                }
            }
        }

        // Mobility bonus
        const myMoves = this.generateAllLegalMoves(game, color).length;
        const opponentMoves = this.generateAllLegalMoves(game, this.getOpponent(color)).length;
        score += (myMoves - opponentMoves) * 10;

        // King safety
        if (game.isKingInCheck(color)) {
            score -= 50;
        }
        if (game.isKingInCheck(this.getOpponent(color))) {
            score += 50;
        }

        return score;
    }

    getPositionalBonus(piece, row, col, color) {
        let bonus = 0;
        const isMyPiece = piece.color === color;
        const multiplier = isMyPiece ? 1 : -1;

        switch (this.personality) {
            case 'aggressive':
                // Prefer pieces close to opponent king
                if (piece.type !== 'king') {
                    const opponentKingRow = piece.color === 'white' ? 0 : 7;
                    const distance = Math.abs(row - opponentKingRow) + Math.abs(col - 3.5);
                    bonus += (14 - distance) * 2 * multiplier;
                }
                break;

            case 'defensive':
                // Prefer pieces near own king
                if (piece.type !== 'king') {
                    const myKingRow = piece.color === 'white' ? 7 : 0;
                    const distance = Math.abs(row - myKingRow) + Math.abs(col - 3.5);
                    bonus += (7 - distance) * 1.5 * multiplier;
                }
                break;

            case 'positional':
                // Center control and piece development
                if (piece.type === 'pawn') {
                    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                    bonus += (7 - centerDistance) * 5 * multiplier;
                } else if (piece.type === 'knight' || piece.type === 'bishop') {
                    const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                    bonus += (7 - centerDistance) * 8 * multiplier;
                }
                break;

            case 'tactical':
                // Prefer active pieces and tactical opportunities
                bonus += Math.random() * 20 * multiplier; // Add some unpredictability
                break;

            default: // balanced
                // Slight center preference
                const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                bonus += (7 - centerDistance) * 3 * multiplier;
        }

        return bonus;
    }

    generateAllLegalMoves(game, color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = game.board[r][c];
                if (piece && piece.color === color) {
                    const legal = game.calculatePossibleMoves(r, c);
                    legal.forEach(([tr, tc]) => {
                        moves.push({
                            from: { r, c },
                            to: { r: tr, c: tc },
                            piece: { ...piece }
                        });
                    });
                }
            }
        }
        return moves;
    }

    makeMove(game, move) {
        const { from, to } = move;
        const piece = game.board[from.r][from.c];
        const captured = game.board[to.r][to.c] ? { ...game.board[to.r][to.c] } : null;
        
        game.board[to.r][to.c] = { ...piece };
        game.board[from.r][from.c] = null;
        
        return { captured, piece: { ...piece } };
    }

    unmakeMove(game, move, undo) {
        const { from, to } = move;
        game.board[from.r][from.c] = undo.piece;
        game.board[to.r][to.c] = undo.captured;
    }

    getOpponent(color) {
        return color === 'white' ? 'black' : 'white';
    }

    showThinkingProcess(message) {
        // This will be called by the UI to show AI thinking
        if (typeof window !== 'undefined' && window.gameUI) {
            window.gameUI.showAIThinking(message);
        }
    }

    getPersonalityDescription(personality) {
        const descriptions = {
            balanced: 'A well-rounded player that adapts to any situation',
            aggressive: 'Prefers attacking play and tactical complications',
            defensive: 'Focuses on solid positions and counterplay',
            positional: 'Masters long-term planning and strategic concepts',
            tactical: 'Excels at finding brilliant combinations and tricks'
        };
        return descriptions[personality] || descriptions.balanced;
    }

    getDifficultyDescription(level) {
        const descriptions = {
            1: 'Beginner - Makes basic moves with occasional mistakes',
            2: 'Novice - Understands basic principles',
            3: 'Intermediate - Solid tactical player',
            4: 'Advanced - Strong positional understanding',
            5: 'Expert - Near-master level play'
        };
        return descriptions[level] || descriptions[3];
    }
}
