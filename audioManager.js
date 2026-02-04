// Audio Manager - Handles all sound and music
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgMusicNodes = [];
        this.isPlaying = false;
        this.volume = 0.5;
        this.isMuted = false;
        
        this.setupAudioContext();
        this.setupControls();
        this.createSoundEffects();
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    setupControls() {
        const musicToggle = document.getElementById('musicToggle');
        const volumeSlider = document.getElementById('volumeSlider');

        musicToggle.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stopMusic();
                musicToggle.textContent = '🎵 Music: OFF';
                musicToggle.classList.add('off');
            } else {
                this.playJazzMusic();
                musicToggle.textContent = '🎵 Music: ON';
                musicToggle.classList.remove('off');
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            this.volume = e.target.value / 100;
            if (this.masterGain) {
                this.masterGain.gain.value = this.volume;
            }
        });

        // Start music automatically (user must interact first)
        document.addEventListener('click', () => {
            if (!this.isPlaying && this.audioContext) {
                this.playJazzMusic();
            }
        }, { once: true });
    }

    playJazzMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Create a smooth jazz chord progression
        this.playJazzChords();
        this.playJazzBassline();
        this.playJazzMelody();
    }

    playJazzChords() {
        const chordProgression = [
            [261.63, 329.63, 392.00], // C Major 7
            [246.94, 311.13, 369.99], // B♭ Major 7
            [220.00, 277.18, 329.63], // A minor 7
            [196.00, 246.94, 293.66]  // G Major 7
        ];

        let chordIndex = 0;
        
        const playChord = () => {
            if (!this.isPlaying) return;

            const chord = chordProgression[chordIndex % chordProgression.length];
            const now = this.audioContext.currentTime;

            chord.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.03, now + 0.1);
                gain.gain.linearRampToValueAtTime(0, now + 1.8);
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.start(now);
                osc.stop(now + 2);
                
                this.bgMusicNodes.push(osc);
            });

            chordIndex++;
            setTimeout(playChord, 2000);
        };

        playChord();
    }

    playJazzBassline() {
        const bassNotes = [130.81, 123.47, 110.00, 98.00]; // C, B♭, A, G (octave lower)
        let noteIndex = 0;

        const playBass = () => {
            if (!this.isPlaying) return;

            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = bassNotes[noteIndex % bassNotes.length];
            
            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.9);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 1);
            
            this.bgMusicNodes.push(osc);
            
            noteIndex++;
            setTimeout(playBass, 1000);
        };

        playBass();
    }

    playJazzMelody() {
        const melodyNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
        
        const playNote = () => {
            if (!this.isPlaying) return;

            // Random jazzy melody
            if (Math.random() > 0.3) {
                const note = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
                const now = this.audioContext.currentTime;
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'triangle';
                osc.frequency.value = note;
                
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.02, now + 0.05);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.start(now);
                osc.stop(now + 0.5);
                
                this.bgMusicNodes.push(osc);
            }

            setTimeout(playNote, Math.random() * 800 + 400);
        };

        playNote();
    }

    stopMusic() {
        this.isPlaying = false;
        this.bgMusicNodes.forEach(node => {
            try {
                node.stop();
            } catch(e) {}
        });
        this.bgMusicNodes = [];
    }

    createSoundEffects() {
        // Store sound effect functions
        this.soundEffects = {
            click: () => this.playClick(),
            achievement: () => this.playAchievement(),
            gameOver: () => this.playGameOver(),
            score: () => this.playScore()
        };
    }

    playClick() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 800;
        
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playAchievement() {
        if (!this.audioContext) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        notes.forEach((freq, i) => {
            const now = this.audioContext.currentTime + (i * 0.1);
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.value = 0.15;
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 0.3);
        });
    }

    playGameOver() {
        if (!this.audioContext) return;
        
        const notes = [392, 369.99, 349.23, 329.63]; // Descending
        notes.forEach((freq, i) => {
            const now = this.audioContext.currentTime + (i * 0.15);
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = freq;
            
            gain.gain.value = 0.1;
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 0.4);
        });
    }

    playScore() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 1000;
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        
        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }

    play(soundName) {
        if (this.soundEffects[soundName]) {
            this.soundEffects[soundName]();
        }
    }
}

// Initialize audio manager
const audioManager = new AudioManager();
