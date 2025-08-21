// Chess Sound Effects, AI Voice, and Performance Utils
class ChessSounds {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.initSounds();
    }

    initSounds() {
        // Create sound effects using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Pre-generate sound effects
        this.generateSounds();
    }

    generateSounds() {
        // Move sound - subtle click
        this.sounds.move = this.createTone(440, 0.08, 'sine');
        
        // Capture sound - satisfying thud
        this.sounds.capture = this.createChord([220, 330], 0.15);
        
        // Check sound - warning tone
        this.sounds.check = this.createTone(660, 0.2, 'triangle');
        
        // Checkmate sound - dramatic finish
        this.sounds.checkmate = this.createChord([200, 300, 400], 0.4);
        
        // Button click - soft click
        this.sounds.click = this.createTone(800, 0.03, 'sine');
        
        // Hint sound - gentle chime
        this.sounds.hint = this.createChord([523, 659], 0.1);
        
        // Castle sound - regal move
        this.sounds.castle = this.createChord([349, 440, 523], 0.2);
        
        // Promotion sound - achievement
        this.sounds.promotion = this.createChord([523, 659, 784], 0.25);
        
        // Error sound - gentle warning
        this.sounds.error = this.createTone(200, 0.1, 'triangle');
        
        // Teleport sound - magical chime
        this.sounds.teleport = this.createChord([440, 554, 659, 880], 0.15);
    }

    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.enabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createChord(frequencies, duration) {
        return () => {
            if (!this.enabled) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createTone(freq, duration)();
                }, index * 50);
            });
        };
    }

    play(soundName) {
        if (this.sounds[soundName] && this.enabled) {
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn('Failed to play sound:', error);
            }
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Performance monitoring and optimization
class ChessPerformance {
    constructor() {
        this.metrics = {
            renderTime: [],
            moveCalculationTime: [],
            aiThinkingTime: []
        };
        this.startTime = performance.now();
    }

    startMeasure(name) {
        this[`${name}Start`] = performance.now();
    }

    endMeasure(name) {
        const endTime = performance.now();
        const duration = endTime - this[`${name}Start`];
        
        if (!this.metrics[name]) {
            this.metrics[name] = [];
        }
        
        this.metrics[name].push(duration);
        
        // Keep only last 100 measurements
        if (this.metrics[name].length > 100) {
            this.metrics[name].shift();
        }
        
        return duration;
    }

    getAverageTime(name) {
        const times = this.metrics[name] || [];
        if (times.length === 0) return 0;
        
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    getPerformanceReport() {
        const report = {
            uptime: performance.now() - this.startTime,
            averages: {}
        };
        
        Object.keys(this.metrics).forEach(metric => {
            report.averages[metric] = this.getAverageTime(metric);
        });
        
        return report;
    }

    optimizeForDevice() {
        // Detect device capabilities and adjust settings
        const isLowEnd = this.detectLowEndDevice();
        
        if (isLowEnd) {
            return {
                animationSpeed: 'fast',
                particleEffects: false,
                complexShadows: false,
                backgroundAnimation: false
            };
        }
        
        return {
            animationSpeed: 'normal',
            particleEffects: true,
            complexShadows: true,
            backgroundAnimation: true
        };
    }

    detectLowEndDevice() {
        // Basic device capability detection
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return true;
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Check for known low-end GPUs
            if (renderer.includes('Mali') || renderer.includes('Adreno 3')) {
                return true;
            }
        }
        
        // Check memory
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            return true;
        }
        
        // Check connection
        if (navigator.connection && navigator.connection.effectiveType === 'slow-2g') {
            return true;
        }
        
        return false;
    }
}

// Advanced game analytics
class ChessAnalytics {
    constructor() {
        this.gameStats = {
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
        
        this.currentGameStats = this.resetCurrentGameStats();
        this.loadStats();
    }

    resetCurrentGameStats() {
        return {
            startTime: Date.now(),
            moves: 0,
            captures: { white: 0, black: 0 },
            checks: 0,
            hintsUsed: 0,
            cheatsUsed: 0
        };
    }

    recordMove(moveData) {
        this.currentGameStats.moves++;
        this.gameStats.totalMoves++;
        
        if (moveData.captured) {
            this.currentGameStats.captures[moveData.color]++;
            this.gameStats.piecesCaptured[moveData.color]++;
        }
        
        if (moveData.check) {
            this.currentGameStats.checks++;
            this.gameStats.checksGiven++;
        }
    }

    recordGameEnd(result) {
        this.gameStats.gamesPlayed++;
        
        const gameLength = (Date.now() - this.currentGameStats.startTime) / 1000;
        this.gameStats.averageGameLength = 
            (this.gameStats.averageGameLength * (this.gameStats.gamesPlayed - 1) + gameLength) / 
            this.gameStats.gamesPlayed;
        
        if (result.includes('wins')) {
            const winner = result.includes('White') ? 'white' : 'black';
            this.gameStats.gamesWon[winner]++;
            this.gameStats.checkmates++;
        } else if (result.includes('Stalemate')) {
            this.gameStats.stalemates++;
        }
        
        this.saveStats();
        this.currentGameStats = this.resetCurrentGameStats();
    }

    recordHintUsed() {
        this.currentGameStats.hintsUsed++;
        this.gameStats.hintsUsed++;
        this.saveStats();
    }

    recordCheatUsed() {
        this.currentGameStats.cheatsUsed++;
        this.gameStats.cheatsUsed++;
        this.saveStats();
    }

    getWinRate(color) {
        const totalGames = this.gameStats.gamesPlayed;
        if (totalGames === 0) return 0;
        
        return (this.gameStats.gamesWon[color] / totalGames * 100).toFixed(1);
    }

    getDetailedStats() {
        return {
            ...this.gameStats,
            winRates: {
                white: this.getWinRate('white'),
                black: this.getWinRate('black')
            },
            averageMovesPerGame: this.gameStats.gamesPlayed > 0 ? 
                (this.gameStats.totalMoves / this.gameStats.gamesPlayed).toFixed(1) : 0
        };
    }

    saveStats() {
        try {
            localStorage.setItem('chessUniverseStats', JSON.stringify(this.gameStats));
        } catch (error) {
            console.warn('Failed to save stats:', error);
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('chessUniverseStats');
            if (saved) {
                this.gameStats = { ...this.gameStats, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load stats:', error);
        }
    }

    exportStats() {
        const stats = this.getDetailedStats();
        const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-universe-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// AI Voice System for Chess Commentary and Announcements
class ChessAIVoice {
    constructor() {
        this.enabled = true;
        this.voice = null;
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 0.8;
        this.personality = 'professional'; // professional, casual, dramatic, funny
        this.initVoice();
        
        // Commentary phrases for different personalities
        this.phrases = {
            professional: {
                gameStart: ["Welcome to Chess Universe. Game initiated.", "Professional chess match beginning."],
                move: ["Move executed.", "Piece relocated.", "Strategic positioning."],
                capture: ["Piece captured.", "Material advantage gained.", "Tactical exchange."],
                check: ["Check! The king is under attack.", "Royal piece threatened.", "Defensive action required."],
                checkmate: ["Checkmate! Game concluded.", "Victory achieved through superior strategy.", "The match is decided."],
                castling: ["Castling maneuver completed.", "King safety secured.", "Defensive repositioning."],
                promotion: ["Pawn promotion successful.", "New queen on the battlefield.", "Transformation complete."],
                aiMove: ["AI analyzing position.", "Computational move calculated.", "Artificial intelligence responds."],
                cheat: ["Cheat function activated.", "Game modification engaged.", "Reality altered."],
                godMode: ["Divine intervention activated.", "Ultimate power unleashed.", "The gods have spoken."]
            },
            casual: {
                gameStart: ["Alright, let's play some chess!", "Time for a friendly game!", "Ready to make some moves?"],
                move: ["Nice move!", "There we go!", "Smooth!"],
                capture: ["Got 'em!", "Piece down!", "That's gotta hurt!"],
                check: ["Uh oh, check!", "King's in trouble!", "Better watch out!"],
                checkmate: ["Game over! Checkmate!", "That's it, you win!", "What a finish!"],
                castling: ["Castle time!", "Playing it safe!", "Smart defensive move!"],
                promotion: ["Queen me!", "Promotion party!", "That pawn's all grown up!"],
                aiMove: ["AI's thinking...", "Computer's turn!", "Let's see what the bot does!"],
                cheat: ["Cheat mode on!", "Breaking the rules!", "Time to have some fun!"],
                godMode: ["Going full god mode!", "All cheats activated!", "Let's break reality!"]
            },
            dramatic: {
                gameStart: ["The battlefield awaits! Let the epic chess battle begin!", "Warriors prepare for mental combat!"],
                move: ["A masterful stroke!", "The plot thickens!", "Destiny unfolds with each move!"],
                capture: ["Blood spilled on the battlefield!", "A warrior falls!", "Conquest!"],
                check: ["The king trembles in fear! Check!", "Royal blood runs cold!", "The throne is threatened!"],
                checkmate: ["VICTORY! The kingdom falls! Checkmate!", "The king is slain! Glory eternal!", "Epic triumph achieved!"],
                castling: ["The king seeks sanctuary!", "Fortress walls protect the crown!", "Strategic retreat!"],
                promotion: ["A commoner rises to royalty!", "The transformation is complete!", "A new queen is born!"],
                aiMove: ["The digital overlord contemplates...", "Silicon minds calculate destruction!", "The machine awakens!"],
                cheat: ["Dark magic flows through the board!", "Reality bends to your will!", "The laws of chess crumble!"],
                godMode: ["UNLIMITED POWER! The cosmos itself bows before you!", "You have become death, destroyer of boards!", "Omnipotence achieved!"]
            },
            funny: {
                gameStart: ["Time to move some wooden warriors around!", "Chess time! Don't worry, no horses were harmed in the making of this game!"],
                move: ["Boop! Piece moved!", "There goes another one!", "Shuffle shuffle!"],
                capture: ["Nom nom nom!", "Got hungry and ate a piece!", "One less friend on the board!"],
                check: ["Knock knock! It's check time!", "Your king's having a bad day!", "Somebody's in trouble!"],
                checkmate: ["That's a wrap folks! Checkmate!", "The king has left the building!", "Game over, man! Game over!"],
                castling: ["King goes whoosh, rook goes swoosh!", "Musical chairs, chess edition!", "The old switcheroo!"],
                promotion: ["Congratulations! Your pawn graduated from chess college!", "From zero to hero!", "That's what I call a glow-up!"],
                aiMove: ["The robot overlords are thinking... beep boop!", "AI.exe is running...", "Computer says... calculating..."],
                cheat: ["Cheater cheater pumpkin eater!", "Rules? Where we're going, we don't need rules!", "Breaking bad... chess rules!"],
                godMode: ["You are now the chosen one! Neo would be proud!", "With great power comes great... um... chess moves?", "You've unlocked the cheat code to the universe!"]
            }
        };
        
        this.currentGame = null;
        this.lastAnnouncement = '';
    }

    initVoice() {
        if ('speechSynthesis' in window) {
            this.loadVoices();
            // Reload voices when they change (some browsers load them asynchronously)
            speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());
        } else {
            console.warn('Speech synthesis not supported in this browser');
            this.enabled = false;
        }
    }

    loadVoices() {
        const voices = speechSynthesis.getVoices();
        
        // Prefer high-quality voices
        const preferredVoices = [
            'Microsoft Zira Desktop', 'Microsoft David Desktop', // Windows
            'Google UK English Female', 'Google US English', // Chrome
            'Alex', 'Victoria', 'Samantha', // macOS
            'English (United States)', 'English (United Kingdom)' // General
        ];
        
        for (const preferred of preferredVoices) {
            const voice = voices.find(v => v.name.includes(preferred));
            if (voice) {
                this.voice = voice;
                break;
            }
        }
        
        // Fallback to first English voice
        if (!this.voice) {
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
    }

    speak(text, priority = 'normal') {
        if (!this.enabled || !text || text === this.lastAnnouncement) return;
        
        // Cancel previous speech if high priority
        if (priority === 'high' && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        
        // Add personality-based modifications
        if (this.personality === 'dramatic') {
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
        } else if (this.personality === 'casual') {
            utterance.rate = 1.1;
            utterance.pitch = 1.0;
        } else if (this.personality === 'funny') {
            utterance.rate = 1.2;
            utterance.pitch = 1.1;
        }
        
        speechSynthesis.speak(utterance);
        this.lastAnnouncement = text;
        
        // Clear last announcement after a delay to allow repeats
        setTimeout(() => {
            if (this.lastAnnouncement === text) {
                this.lastAnnouncement = '';
            }
        }, 3000);
    }

    announceGameStart() {
        const phrase = this.getRandomPhrase('gameStart');
        this.speak(phrase, 'high');
    }

    announceMove(moveData) {
        if (!moveData) return;
        
        let phrase;
        if (moveData.captured) {
            phrase = this.getRandomPhrase('capture');
        } else if (moveData.castling) {
            phrase = this.getRandomPhrase('castling');
        } else if (moveData.promotion) {
            phrase = this.getRandomPhrase('promotion');
        } else {
            phrase = this.getRandomPhrase('move');
        }
        
        this.speak(phrase);
    }

    announceCheck() {
        const phrase = this.getRandomPhrase('check');
        this.speak(phrase, 'high');
    }

    announceCheckmate(winner) {
        const phrase = this.getRandomPhrase('checkmate');
        this.speak(phrase, 'high');
    }

    announceAIMove() {
        const phrase = this.getRandomPhrase('aiMove');
        this.speak(phrase);
    }

    announceCheat(cheatName) {
        let customPhrase = '';
        
        switch (cheatName) {
            case 'godMode':
                customPhrase = this.getRandomPhrase('godMode');
                break;
            case 'teleportPieces':
                customPhrase = this.personality === 'funny' ? 
                    'Beam me up, Scotty! Teleportation online!' : 
                    'Teleportation matrix activated.';
                break;
            case 'quantumMoves':
                customPhrase = this.personality === 'dramatic' ?
                    'Quantum reality fractures! Multiple dimensions converge!' :
                    'Quantum superposition enabled.';
                break;
            case 'aiSabotage':
                customPhrase = this.personality === 'funny' ?
                    'AI.exe has stopped working! Chaos mode engaged!' :
                    'Artificial intelligence compromised.';
                break;
            default:
                customPhrase = this.getRandomPhrase('cheat');
        }
        
        this.speak(customPhrase, 'high');
    }

    announceCustom(text) {
        this.speak(text);
    }

    getRandomPhrase(category) {
        const phrases = this.phrases[this.personality][category];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    setPersonality(personality) {
        if (this.phrases[personality]) {
            this.personality = personality;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    setVoiceSettings(settings) {
        if (settings.rate !== undefined) this.rate = Math.max(0.1, Math.min(10, settings.rate));
        if (settings.pitch !== undefined) this.pitch = Math.max(0, Math.min(2, settings.pitch));
        if (settings.volume !== undefined) this.volume = Math.max(0, Math.min(1, settings.volume));
    }

    testVoice() {
        const testPhrases = [
            "Voice test initiated.",
            "This is your chess AI speaking.",
            "All systems operational.",
            "Ready for chess combat!"
        ];
        
        const phrase = testPhrases[Math.floor(Math.random() * testPhrases.length)];
        this.speak(phrase, 'high');
    }
}

// Export classes for use in other modules
if (typeof window !== 'undefined') {
    window.ChessSounds = ChessSounds;
    window.ChessPerformance = ChessPerformance;
    window.ChessAnalytics = ChessAnalytics;
    window.ChessAIVoice = ChessAIVoice;
}
