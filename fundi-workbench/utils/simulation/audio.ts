'use client';

/**
 * Audio simulation utilities for FUNDI Workbench
 * Uses Web Audio API to generate tones for buzzer/speaker simulation
 */

class AudioSimulation {
    private audioContext: AudioContext | null = null;
    private oscillators: Map<string, OscillatorNode> = new Map();
    private gainNodes: Map<string, GainNode> = new Map();
    private masterGain: GainNode | null = null;
    private muted: boolean = false;
    private volume: number = 0.3; // Default volume (0-1)
    private unlockListenerInstalled: boolean = false;

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    initialize(): void {
        if (this.audioContext) return;

        try {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            console.log('[AudioSimulation] Initialized');

            // Browser autoplay policies often require a user gesture before audio can play.
            // Install a one-time global unlock that resumes audio on first interaction.
            this.installUnlockListener();
        } catch (e) {
            console.warn('[AudioSimulation] Web Audio API not supported:', e);
        }
    }

    private installUnlockListener(): void {
        if (this.unlockListenerInstalled) return;
        if (typeof window === 'undefined') return;
        this.unlockListenerInstalled = true;

        const unlock = () => {
            // Fire-and-forget; resume() handles errors/logging.
            void this.resume();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };

        window.addEventListener('pointerdown', unlock, { once: true, capture: true });
        window.addEventListener('keydown', unlock, { once: true, capture: true });
    }

    /**
     * Resume audio context if suspended (required by browser autoplay policies)
     */
    async resume(): Promise<void> {
        if (!this.audioContext) return;
        if (this.audioContext.state !== 'suspended') return;
        try {
            await this.audioContext.resume();
            console.log('[AudioSimulation] AudioContext resumed');
        } catch (e) {
            console.warn('[AudioSimulation] AudioContext resume blocked (needs user gesture):', e);
        }
    }

    /**
     * Play a tone at a specific frequency
     * @param id Unique identifier for this tone source
     * @param frequency Frequency in Hz (e.g., 440 for A4)
     * @param waveform Oscillator waveform type
     */
    playTone(
        id: string,
        frequency: number,
        waveform: OscillatorType = 'square'
    ): void {
        if (!this.audioContext || !this.masterGain || this.muted) return;

        // Stop existing tone with this ID
        this.stopTone(id);

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Soft start to avoid clicks
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 0.01);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            oscillator.start();

            this.oscillators.set(id, oscillator);
            this.gainNodes.set(id, gainNode);

            console.log(`[AudioSimulation] Playing tone: ${frequency}Hz on ${id}`);
        } catch (e) {
            console.warn('[AudioSimulation] Failed to play tone:', e);
        }
    }

    /**
     * Stop a specific tone
     * @param id Unique identifier for the tone to stop
     */
    stopTone(id: string): void {
        const oscillator = this.oscillators.get(id);
        const gainNode = this.gainNodes.get(id);

        if (oscillator && gainNode && this.audioContext) {
            try {
                // Soft stop to avoid clicks
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.01);
                setTimeout(() => {
                    try {
                        oscillator.stop();
                        oscillator.disconnect();
                        gainNode.disconnect();
                    } catch {
                        // Already stopped
                    }
                }, 20);
            } catch {
                // Already stopped
            }
        }

        this.oscillators.delete(id);
        this.gainNodes.delete(id);
    }

    /**
     * Stop all playing tones
     */
    stopAll(): void {
        for (const id of this.oscillators.keys()) {
            this.stopTone(id);
        }
    }

    /**
     * Set master volume
     * @param volume Volume level (0-1)
     */
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume;
    }

    /**
     * Mute/unmute all audio
     */
    setMuted(muted: boolean): void {
        this.muted = muted;
        if (muted) {
            this.stopAll();
        }
    }

    /**
     * Check if audio is muted
     */
    isMuted(): boolean {
        return this.muted;
    }

    /**
     * Play a beep (short tone)
     * @param frequency Frequency in Hz
     * @param duration Duration in milliseconds
     */
    beep(frequency: number = 1000, duration: number = 100): void {
        const id = `beep-${Date.now()}`;
        this.playTone(id, frequency);
        setTimeout(() => this.stopTone(id), duration);
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.stopAll();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
            this.masterGain = null;
        }
    }
}

// Singleton instance
let audioSimulationInstance: AudioSimulation | null = null;

/**
 * Get the audio simulation singleton (creates it if needed)
 */
export function getAudioSimulation(): AudioSimulation {
    if (!audioSimulationInstance) {
        audioSimulationInstance = new AudioSimulation();
    }
    return audioSimulationInstance;
}

/**
 * Helper to calculate frequency from PWM value
 * Maps PWM duty cycle to audible frequency range
 */
export function pwmToFrequency(pwm: number, minFreq: number = 100, maxFreq: number = 4000): number {
    // PWM 0-255 maps to frequency range
    const normalized = pwm / 255;
    return minFreq + normalized * (maxFreq - minFreq);
}

export type { AudioSimulation };
