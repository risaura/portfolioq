// Audio Manager - Enhanced Jazz Music System
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.bgMusicNodes = [];
        this.isPlaying = false;
        this.volume = 0.5;
        this.isMuted = false;
        this.currentSection = 0;
        this.jazzTimer = null;
        
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

        if (musicToggle) {
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
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                if (this.masterGain) {
                    this.masterGain.gain.value = this.volume;
                }
            });
        }

        // Start music on first user interaction
        document.addEventListener('click', () => {
            if (!this.isPlaying && this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }

    playJazzMusic() {
        if (!this.audioContext || this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentSection = 0;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.playJazzComposition();
    }

    playJazzComposition() {
        if (!this.isPlaying) return;

        const tempo = 110; // Slower, more relaxed jazz tempo
        const beatDuration = 60 / tempo;
        
        // Different jazz sections for variety
        const sections = {
            intro: {
                chords: [
                    // Gmaj7 - Em7 - Am7 - D7
                    [[392, 493.88, 587.33, 739.99], 4],
                    [[329.63, 493.88, 587.33, 659.25], 4],
                    [[440, 523.25, 659.25, 783.99], 4],
                    [[293.66, 440, 587.33, 659.25], 4]
                ],
                melody: [0, 4, 7, 11, 7, 4, 2, 0],
                tempo: 110
            },
            verse: {
                chords: [
                    // Cmaj7 - A7 - Dm7 - G7
                    [[261.63, 329.63, 493.88, 587.33], 2],
                    [[220, 329.63, 415.30, 523.25], 2],
                    [[293.66, 440, 523.25, 659.25], 2],
                    [[196, 293.66, 440, 493.88], 2],
                    // Em7 - A7 - Dm7 - G7
                    [[164.81, 246.94, 329.63, 392], 2],
                    [[220, 329.63, 415.30, 523.25], 2],
                    [[293.66, 440, 523.25, 659.25], 2],
                    [[196, 293.66, 440, 493.88], 2]
                ],
                melody: [7, 11, 14, 11, 9, 7, 4, 7, 9, 11, 7, 4, 2, 0],
                tempo: 115
            },
            bridge: {
                chords: [
                    // Fmaj7 - Bm7b5 - E7 - Am7
                    [[349.23, 440, 523.25, 659.25], 3],
                    [[246.94, 349.23, 415.30, 493.88], 3],
                    [[164.81, 246.94, 329.63, 415.30], 3],
                    [[220, 329.63, 440, 523.25], 3]
                ],
                melody: [14, 11, 9, 7, 11, 14, 16, 14, 11, 9, 7],
                tempo: 100
            },
            outro: {
                chords: [
                    // Cmaj7 - Am7 - Dm7 - G7 - Cmaj9
                    [[261.63, 329.63, 493.88, 587.33], 2],
                    [[220, 329.63, 440, 523.25], 2],
                    [[293.66, 440, 523.25, 659.25], 2],
                    [[196, 293.66, 440, 493.88], 2],
                    [[261.63, 329.63, 392, 493.88, 587.33], 4]
                ],
                melody: [7, 4, 2, 0, -2, 0, 2, 4],
                tempo: 95
            }
        };

        const sectionOrder = ['intro', 'verse', 'bridge', 'verse', 'outro'];
        const currentSectionName = sectionOrder[this.currentSection % sectionOrder.length];
        const section = sections[currentSectionName];
        
        const now = this.audioContext.currentTime;
        let time = now + 0.1;
        
        // Play section
        section.chords.forEach(([chord, duration], index) => {
            // Walking bass
            this.playWalkingBass(chord[0], time, beatDuration * duration);
            
            // Piano chords with voicing variations
            this.playJazzPiano(chord, time, beatDuration * duration, index % 2 === 0);
            
            // Melody line (improvised feel)
            if (index < section.melody.length) {
                this.playJazzMelody(chord[0], section.melody[index], time, beatDuration * duration);
            }
            
            // Jazz drums with swing
            this.playSwingDrums(time, beatDuration * duration);
            
            time += beatDuration * duration;
        });
        
        // Move to next section
        this.currentSection++;
        
        const sectionDuration = (time - now) * 1000;
        this.jazzTimer = setTimeout(() => {
            this.playJazzComposition();
        }, sectionDuration);
    }

    playWalkingBass(rootFreq, startTime, duration) {
        const steps = 4; // 4 quarter notes
        const stepDuration = duration / steps;
        
        // Walking bass pattern (root, 3rd, 5th, 7th)
        const intervals = [0, 4, 7, 11];
        
        for (let i = 0; i < steps; i++) {
            const time = startTime + stepDuration * i;
            const freq = rootFreq * Math.pow(2, intervals[i] / 12) / 2;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + stepDuration * 0.95);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + stepDuration);
            
            this.bgMusicNodes.push(osc);
        }
    }

    playJazzPiano(chord, startTime, duration, staccato) {
        const playDuration = staccato ? duration * 0.6 : duration * 0.95;
        
        chord.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            // Vary oscillator types for richer sound
            const types = ['triangle', 'sine', 'sine', 'triangle'];
            osc.type = types[index % types.length];
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Slight random detuning for realism
            osc.detune.setValueAtTime((Math.random() - 0.5) * 15, startTime);
            
            const volume = 0.09 / (index * 0.5 + 1);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
            
            if (staccato) {
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + playDuration);
            } else {
                gain.gain.setValueAtTime(volume * 0.8, startTime + duration * 0.6);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + playDuration);
            }
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(startTime);
            osc.stop(startTime + playDuration);
            
            this.bgMusicNodes.push(osc);
        });
    }

    playJazzMelody(rootFreq, semitones, startTime, duration) {
        const freq = rootFreq * Math.pow(2, (semitones + 24) / 12); // Two octaves up
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Vibrato for expressiveness
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.setValueAtTime(6, startTime); // 6Hz vibrato
        vibratoGain.gain.setValueAtTime(12, startTime);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.04, startTime + duration * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.9);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        vibrato.start(startTime);
        osc.start(startTime);
        vibrato.stop(startTime + duration * 0.9);
        osc.stop(startTime + duration);
        
        this.bgMusicNodes.push(osc);
        this.bgMusicNodes.push(vibrato);
    }

    playSwingDrums(startTime, duration) {
        const beats = 4;
        const beatLength = duration / beats;
        
        for (let i = 0; i < beats; i++) {
            const time = startTime + beatLength * i;
            
            // Ride cymbal with swing feel
            this.playDrumSound(time, 12000, 0.035, 0.15, 'highpass');
            // Swing eighth note (2:1 ratio)
            if (i % 2 === 0) {
                this.playDrumSound(time + beatLength * 0.67, 12000, 0.025, 0.1, 'highpass');
            }
            
            // Snare on beats 2 and 4 (backbeat)
            if (i === 1 || i === 3) {
                this.playDrumSound(time, 180, 0.18, 0.08);
                this.playDrumSound(time, 8000, 0.12, 0.05, 'highpass'); // Snare buzz
            }
            
            // Kick drum pattern
            if (i === 0 || i === 2 || (i === 3 && Math.random() > 0.6)) {
                this.playDrumSound(time, 55, 0.15, 0.06);
            }
            
            // Ghost notes on snare
            if (Math.random() > 0.7) {
                this.playDrumSound(time + beatLength * 0.33, 200, 0.04, 0.04);
            }
        }
    }

    playDrumSound(time, freq, volume, decay, filterType = null) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const noise = this.audioContext.createBufferSource();
        
        // White noise for realistic drums
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.01, time + decay);
        
        let destination = gain;
        
        // Optional high-pass filter for cymbals
        if (filterType === 'highpass') {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(8000, time);
            osc.connect(filter);
            noise.connect(filter);
            filter.connect(gain);
        } else {
            osc.connect(gain);
            noise.connect(gain);
        }
        
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + decay);
        gain.connect(this.masterGain);
        
        osc.start(time);
        osc.stop(time + decay);
        noise.start(time);
        noise.stop(time + decay);
        
        this.bgMusicNodes.push(osc);
        this.bgMusicNodes.push(noise);
    }

    stopMusic() {
        this.isPlaying = false;
        
        if (this.jazzTimer) {
            clearTimeout(this.jazzTimer);
            this.jazzTimer = null;
        }
        
        this.bgMusicNodes.forEach(node => {
            try {
                node.stop();
                node.disconnect();
            } catch (e) {}
        });
        this.bgMusicNodes = [];
    }

    createSoundEffects() {
        this.sounds = {
            click: () => this.playTone(800, 0.1, 0.15),
            score: () => {
                this.playTone(523.25, 0.05, 0.1);
                setTimeout(() => this.playTone(659.25, 0.05, 0.1), 50);
                setTimeout(() => this.playTone(783.99, 0.1, 0.15), 100);
            },
            gameOver: () => {
                this.playTone(392, 0.2, 0.2);
                setTimeout(() => this.playTone(329.63, 0.3, 0.3), 200);
            },
            achievement: () => {
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    setTimeout(() => this.playTone(freq, 0.1, 0.15), i * 100);
                });
            }
        };
    }

    playTone(frequency, duration, volume = 0.1) {
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.frequency.value = frequency;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + duration);
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}

// Initialize audio manager
window.audioManager = new AudioManager();
