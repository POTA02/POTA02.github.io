/**
 * Chess Voice Assistant
 * 
 * Advanced text-to-speech system with multiple personalities and dynamic commentary.
 * 
 * Features:
 * - 4 distinct voice personalities (Professional, Casual, Dramatic, Funny)
 * - Dynamic move commentary and game announcements
 * - Cheat activation announcements with personality-specific phrases
 * - Voice settings control (speed, pitch, volume)
 * - Selective announcement categories
 * - Browser TTS integration with fallback support
 */

export class ChessVoiceAssistant {
    constructor(config = {}) {
        this.enabled = config.enabled !== false;
        this.voice = null;
        this.rate = config.rate || 1.0;
        this.pitch = config.pitch || 1.0;
        this.volume = config.volume || 0.8;
        this.personality = config.personality || 'professional';
        
        // Announcement categories
        this.announcements = {
            moves: config.announcements?.moves !== false,
            cheats: config.announcements?.cheats !== false,
            ai: config.announcements?.ai !== false,
            gameEvents: config.announcements?.gameEvents !== false
        };
        
        this.initVoice();
        this.initPhrases();
        
        this.lastAnnouncement = '';
        this.lastAnnouncementTime = 0;
    }

    /**
     * Initialize voice synthesis
     */
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

    /**
     * Load and select the best available voice
     */
    loadVoices() {
        const voices = speechSynthesis.getVoices();
        
        // Prefer high-quality voices in order of preference
        const preferredVoices = [
            'Microsoft Zira Desktop', 'Microsoft David Desktop', // Windows
            'Google UK English Female', 'Google US English', // Chrome
            'Alex', 'Victoria', 'Samantha', 'Daniel', // macOS
            'English (United States)', 'English (United Kingdom)', // General
            'en-US', 'en-GB' // Fallback
        ];
        
        for (const preferred of preferredVoices) {
            const voice = voices.find(v => 
                v.name.includes(preferred) || v.lang.includes(preferred)
            );
            if (voice) {
                this.voice = voice;
                break;
            }
        }
        
        // Final fallback to first English voice or any voice
        if (!this.voice && voices.length > 0) {
            this.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
    }

    /**
     * Initialize personality-specific phrases
     */
    initPhrases() {
        this.phrases = {
            professional: {
                gameStart: [
                    "Welcome to Chess Universe. Game initiated.",
                    "Professional chess match beginning.",
                    "Chess analysis system online.",
                    "Tournament mode activated."
                ],
                move: [
                    "Move executed.",
                    "Piece relocated.",
                    "Strategic positioning.",
                    "Tactical advancement."
                ],
                capture: [
                    "Piece captured.",
                    "Material advantage gained.",
                    "Tactical exchange.",
                    "Opposition piece eliminated."
                ],
                check: [
                    "Check! The king is under attack.",
                    "Royal piece threatened.",
                    "Defensive action required.",
                    "King safety compromised."
                ],
                checkmate: [
                    "Checkmate! Game concluded.",
                    "Victory achieved through superior strategy.",
                    "The match is decided.",
                    "Decisive outcome reached."
                ],
                castling: [
                    "Castling maneuver completed.",
                    "King safety secured.",
                    "Defensive repositioning.",
                    "Royal castle executed."
                ],
                promotion: [
                    "Pawn promotion successful.",
                    "New queen on the battlefield.",
                    "Transformation complete.",
                    "Promotion achieved."
                ],
                aiMove: [
                    "AI analyzing position.",
                    "Computational move calculated.",
                    "Artificial intelligence responds.",
                    "Algorithm processing complete."
                ],
                cheat: [
                    "Cheat function activated.",
                    "Game modification engaged.",
                    "Reality altered.",
                    "System override initiated."
                ],
                godMode: [
                    "Divine intervention activated.",
                    "Ultimate power unleashed.",
                    "The gods have spoken.",
                    "Omnipotence achieved."
                ]
            },
            casual: {
                gameStart: [
                    "Alright, let's play some chess!",
                    "Time for a friendly game!",
                    "Ready to make some moves?",
                    "Let's see what you've got!"
                ],
                move: [
                    "Nice move!",
                    "There we go!",
                    "Smooth!",
                    "Looking good!"
                ],
                capture: [
                    "Got 'em!",
                    "Piece down!",
                    "That's gotta hurt!",
                    "Ouch, that stings!"
                ],
                check: [
                    "Uh oh, check!",
                    "King's in trouble!",
                    "Better watch out!",
                    "Heads up, check!"
                ],
                checkmate: [
                    "Game over! Checkmate!",
                    "That's it, you win!",
                    "What a finish!",
                    "Nice game, checkmate!"
                ],
                castling: [
                    "Castle time!",
                    "Playing it safe!",
                    "Smart defensive move!",
                    "King's hiding now!"
                ],
                promotion: [
                    "Queen me!",
                    "Promotion party!",
                    "That pawn's all grown up!",
                    "New queen in town!"
                ],
                aiMove: [
                    "AI's thinking...",
                    "Computer's turn!",
                    "Let's see what the bot does!",
                    "Robot brain working!"
                ],
                cheat: [
                    "Cheat mode on!",
                    "Breaking the rules!",
                    "Time to have some fun!",
                    "Anything goes now!"
                ],
                godMode: [
                    "Going full god mode!",
                    "All cheats activated!",
                    "Let's break reality!",
                    "Time to go crazy!"
                ]
            },
            dramatic: {
                gameStart: [
                    "The battlefield awaits! Let the epic chess battle begin!",
                    "Warriors prepare for mental combat!",
                    "The ancient game of kings commences!",
                    "Destiny calls! The war begins!"
                ],
                move: [
                    "A masterful stroke!",
                    "The plot thickens!",
                    "Destiny unfolds with each move!",
                    "The saga continues!"
                ],
                capture: [
                    "Blood spilled on the battlefield!",
                    "A warrior falls!",
                    "Conquest!",
                    "Victory through sacrifice!"
                ],
                check: [
                    "The king trembles in fear! Check!",
                    "Royal blood runs cold!",
                    "The throne is threatened!",
                    "Darkness closes in on the crown!"
                ],
                checkmate: [
                    "VICTORY! The kingdom falls! Checkmate!",
                    "The king is slain! Glory eternal!",
                    "Epic triumph achieved!",
                    "The realm has fallen!"
                ],
                castling: [
                    "The king seeks sanctuary!",
                    "Fortress walls protect the crown!",
                    "Strategic retreat!",
                    "The castle shields its lord!"
                ],
                promotion: [
                    "A commoner rises to royalty!",
                    "The transformation is complete!",
                    "A new queen is born!",
                    "Phoenix rises from the ashes!"
                ],
                aiMove: [
                    "The digital overlord contemplates...",
                    "Silicon minds calculate destruction!",
                    "The machine awakens!",
                    "Cybernetic consciousness stirs!"
                ],
                cheat: [
                    "Dark magic flows through the board!",
                    "Reality bends to your will!",
                    "The laws of chess crumble!",
                    "Ancient powers unleashed!"
                ],
                godMode: [
                    "UNLIMITED POWER! The cosmos itself bows before you!",
                    "You have become death, destroyer of boards!",
                    "Omnipotence achieved!",
                    "The universe trembles at your might!"
                ]
            },
            funny: {
                gameStart: [
                    "Time to move some wooden warriors around!",
                    "Chess time! Don't worry, no horses were harmed in the making of this game!",
                    "Let's see who's the chess champion... or at least who makes fewer blunders!",
                    "Welcome to the most serious game where you control tiny armies!"
                ],
                move: [
                    "Boop! Piece moved!",
                    "There goes another one!",
                    "Shuffle shuffle!",
                    "Piece says 'Wheee!' as it moves!"
                ],
                capture: [
                    "Nom nom nom!",
                    "Got hungry and ate a piece!",
                    "One less friend on the board!",
                    "That piece just got fired!"
                ],
                check: [
                    "Knock knock! It's check time!",
                    "Your king's having a bad day!",
                    "Somebody's in trouble!",
                    "King says 'Oh no, not again!'"
                ],
                checkmate: [
                    "That's a wrap folks! Checkmate!",
                    "The king has left the building!",
                    "Game over, man! Game over!",
                    "King.exe has stopped working!"
                ],
                castling: [
                    "King goes whoosh, rook goes swoosh!",
                    "Musical chairs, chess edition!",
                    "The old switcheroo!",
                    "King and rook doing the tango!"
                ],
                promotion: [
                    "Congratulations! Your pawn graduated from chess college!",
                    "From zero to hero!",
                    "That's what I call a glow-up!",
                    "Pawn says 'I'm a big kid now!'"
                ],
                aiMove: [
                    "The robot overlords are thinking... beep boop!",
                    "AI.exe is running...",
                    "Computer says... calculating...",
                    "Robot brain go brrr!"
                ],
                cheat: [
                    "Cheater cheater pumpkin eater!",
                    "Rules? Where we're going, we don't need rules!",
                    "Breaking bad... chess rules!",
                    "Cheat code: UP UP DOWN DOWN LEFT RIGHT..."
                ],
                godMode: [
                    "You are now the chosen one! Neo would be proud!",
                    "With great power comes great... um... chess moves?",
                    "You've unlocked the cheat code to the universe!",
                    "Reality.exe has encountered an error!"
                ]
            }
        };
    }

    /**
     * Speak text with current voice settings
     * @param {string} text - Text to speak
     * @param {string} priority - 'normal' or 'high'
     */
    speak(text, priority = 'normal') {
        if (!this.enabled || !text || !this.voice) return;
        
        // Prevent rapid repeated announcements
        const now = Date.now();
        if (text === this.lastAnnouncement && now - this.lastAnnouncementTime < 3000) {
            return;
        }
        
        // Cancel previous speech if high priority
        if (priority === 'high' && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        
        // Apply personality-based voice modifications
        this.applyPersonalityVoice(utterance);
        
        // Error handling
        utterance.onerror = (event) => {
            console.warn('Speech synthesis error:', event.error);
        };
        
        speechSynthesis.speak(utterance);
        
        this.lastAnnouncement = text;
        this.lastAnnouncementTime = now;
    }

    /**
     * Apply personality-specific voice modifications
     */
    applyPersonalityVoice(utterance) {
        switch (this.personality) {
            case 'dramatic':
                utterance.rate = Math.max(0.1, this.rate * 0.8);
                utterance.pitch = Math.min(2, this.pitch * 1.2);
                break;
            case 'casual':
                utterance.rate = Math.min(10, this.rate * 1.1);
                utterance.pitch = this.pitch;
                break;
            case 'funny':
                utterance.rate = Math.min(10, this.rate * 1.2);
                utterance.pitch = Math.min(2, this.pitch * 1.1);
                break;
            case 'professional':
            default:
                // Use base settings
                break;
        }
    }

    /**
     * Announce game start
     */
    announceGameStart() {
        if (!this.announcements.gameEvents) return;
        const phrase = this.getRandomPhrase('gameStart');
        this.speak(phrase, 'high');
    }

    /**
     * Announce move with context
     * @param {Object} moveData - Move information
     */
    announceMove(moveData = {}) {
        if (!this.announcements.moves) return;
        
        let phrase;
        
        if (moveData.captured) {
            phrase = this.getRandomPhrase('capture');
        } else if (moveData.castling) {
            phrase = this.getRandomPhrase('castling');
        } else if (moveData.promotion) {
            phrase = this.getRandomPhrase('promotion');
        } else if (moveData.aiMove) {
            phrase = this.getRandomPhrase('aiMove');
        } else {
            phrase = this.getRandomPhrase('move');
        }
        
        this.speak(phrase);
    }

    /**
     * Announce check
     */
    announceCheck() {
        if (!this.announcements.moves) return;
        const phrase = this.getRandomPhrase('check');
        this.speak(phrase, 'high');
    }

    /**
     * Announce checkmate
     * @param {string} winner - 'white' or 'black'
     */
    announceCheckmate(winner) {
        if (!this.announcements.gameEvents) return;
        const phrase = this.getRandomPhrase('checkmate');
        this.speak(phrase, 'high');
    }

    /**
     * Announce AI move
     */
    announceAIMove() {
        if (!this.announcements.ai) return;
        const phrase = this.getRandomPhrase('aiMove');
        this.speak(phrase);
    }

    /**
     * Announce cheat activation
     * @param {string} cheatName - Name of the activated cheat
     */
    announceCheat(cheatName) {
        if (!this.announcements.cheats) return;
        
        let customPhrase = this.getCheatSpecificPhrase(cheatName);
        
        if (!customPhrase) {
            customPhrase = this.getRandomPhrase('cheat');
        }
        
        this.speak(customPhrase, 'high');
    }

    /**
     * Get cheat-specific announcement phrases
     */
    getCheatSpecificPhrase(cheatName) {
        const cheatPhrases = {
            godMode: () => this.getRandomPhrase('godMode'),
            teleportPieces: () => {
                const phrases = {
                    professional: 'Teleportation matrix activated.',
                    casual: 'Beam me up, Scotty! Teleportation online!',
                    dramatic: 'Ancient portals tear through reality!',
                    funny: 'Piece goes WHOOSH! Magic is real!'
                };
                return phrases[this.personality];
            },
            quantumMoves: () => {
                const phrases = {
                    professional: 'Quantum superposition enabled.',
                    casual: 'Getting all quantum-y in here!',
                    dramatic: 'Quantum reality fractures! Multiple dimensions converge!',
                    funny: 'Schrödinger\'s chess piece is both moved and not moved!'
                };
                return phrases[this.personality];
            },
            aiSabotage: () => {
                const phrases = {
                    professional: 'Artificial intelligence compromised.',
                    casual: 'AI is having a bad day!',
                    dramatic: 'The digital mind fractures under pressure!',
                    funny: 'AI.exe has stopped working! Chaos mode engaged!'
                };
                return phrases[this.personality];
            },
            invincibleKing: () => {
                const phrases = {
                    professional: 'Royal immunity protocol activated.',
                    casual: 'King\'s got plot armor now!',
                    dramatic: 'The crown becomes eternal and untouchable!',
                    funny: 'King puts on his superhero cape!'
                };
                return phrases[this.personality];
            },
            pieceXray: () => {
                const phrases = {
                    professional: 'X-ray vision systems online.',
                    casual: 'Now you see through everything!',
                    dramatic: 'Your sight pierces the veil of reality!',
                    funny: 'Superman called, he wants his powers back!'
                };
                return phrases[this.personality];
            },
            timeFreeze: () => {
                const phrases = {
                    professional: 'Temporal matrix suspended.',
                    casual: 'Time\'s on your side now!',
                    dramatic: 'The sands of time cease their eternal flow!',
                    funny: 'Time machine goes BRRR... wait, it stopped!'
                };
                return phrases[this.personality];
            }
        };
        
        return cheatPhrases[cheatName] ? cheatPhrases[cheatName]() : null;
    }

    /**
     * Announce custom text
     * @param {string} text - Custom text to announce
     * @param {string} priority - Announcement priority
     */
    announceCustom(text, priority = 'normal') {
        this.speak(text, priority);
    }

    /**
     * Get random phrase from category
     * @param {string} category - Phrase category
     * @returns {string} Random phrase
     */
    getRandomPhrase(category) {
        const phrases = this.phrases[this.personality][category];
        if (!phrases || phrases.length === 0) {
            return this.phrases.professional[category][0] || '';
        }
        return phrases[Math.floor(Math.random() * phrases.length)];
    }

    /**
     * Set voice personality
     * @param {string} personality - 'professional', 'casual', 'dramatic', 'funny'
     */
    setPersonality(personality) {
        const validPersonalities = ['professional', 'casual', 'dramatic', 'funny'];
        if (validPersonalities.includes(personality)) {
            this.personality = personality;
        }
    }

    /**
     * Set voice enabled state
     * @param {boolean} enabled - Enable/disable voice
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled && speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    /**
     * Set voice settings
     * @param {Object} settings - Voice settings {rate, pitch, volume}
     */
    setVoiceSettings(settings) {
        if (settings.rate !== undefined) {
            this.rate = Math.max(0.1, Math.min(10, settings.rate));
        }
        if (settings.pitch !== undefined) {
            this.pitch = Math.max(0, Math.min(2, settings.pitch));
        }
        if (settings.volume !== undefined) {
            this.volume = Math.max(0, Math.min(1, settings.volume));
        }
    }

    /**
     * Set announcement categories
     * @param {Object} announcements - Category settings
     */
    setAnnouncements(announcements) {
        Object.assign(this.announcements, announcements);
    }

    /**
     * Test voice with sample phrase
     */
    testVoice() {
        const testPhrases = {
            professional: "Voice test initiated. All systems operational.",
            casual: "Hey there! Voice is working great!",
            dramatic: "Behold! The voice of destiny speaks!",
            funny: "Testing, testing... one, two, three... can you hear me now?"
        };
        
        const phrase = testPhrases[this.personality] || testPhrases.professional;
        this.speak(phrase, 'high');
    }

    /**
     * Get available voices
     * @returns {Array} Array of available voice objects
     */
    getAvailableVoices() {
        return speechSynthesis.getVoices();
    }

    /**
     * Set specific voice by name
     * @param {string} voiceName - Name of voice to use
     */
    setVoice(voiceName) {
        const voices = this.getAvailableVoices();
        const voice = voices.find(v => v.name === voiceName);
        if (voice) {
            this.voice = voice;
        }
    }

    /**
     * Get current voice status
     * @returns {Object} Voice status information
     */
    getStatus() {
        return {
            enabled: this.enabled,
            personality: this.personality,
            voice: this.voice ? this.voice.name : 'No voice selected',
            settings: {
                rate: this.rate,
                pitch: this.pitch,
                volume: this.volume
            },
            announcements: { ...this.announcements },
            isSupported: 'speechSynthesis' in window
        };
    }

    /**
     * Stop all current speech
     */
    stop() {
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    }

    /**
     * Pause current speech
     */
    pause() {
        if (speechSynthesis.speaking) {
            speechSynthesis.pause();
        }
    }

    /**
     * Resume paused speech
     */
    resume() {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
        }
    }
}

// Legacy compatibility
export default ChessVoiceAssistant;
