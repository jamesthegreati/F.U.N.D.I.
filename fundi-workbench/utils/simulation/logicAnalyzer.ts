'use client';

/**
 * Logic Analyzer for FUNDI Workbench
 * 
 * Captures and displays digital signal transitions for debugging.
 * Can monitor up to 8 channels simultaneously.
 */

export interface LogicSample {
    /** Timestamp in microseconds since capture start */
    timestamp: number;
    /** Channel states (bitmask - bit 0 = channel 0, etc.) */
    channels: number;
}

export interface ChannelConfig {
    /** Channel index (0-7) */
    index: number;
    /** Channel name/label */
    name: string;
    /** Arduino pin number this channel monitors */
    pin: number;
    /** Display color */
    color: string;
    /** Whether channel is enabled */
    enabled: boolean;
}

export interface LogicAnalyzerState {
    /** Is capture running? */
    capturing: boolean;
    /** Captured samples */
    samples: LogicSample[];
    /** Channel configurations */
    channels: ChannelConfig[];
    /** Capture start time */
    startTime: number;
    /** Maximum samples to keep */
    maxSamples: number;
    /** Sample rate (samples per second) */
    sampleRate: number;
}

export type LogicAnalyzerListener = (state: LogicAnalyzerState) => void;

// Default channel colors
const CHANNEL_COLORS = [
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#ec4899', // Pink
];

/**
 * Logic Analyzer class
 */
class LogicAnalyzer {
    private samples: LogicSample[] = [];
    private channels: ChannelConfig[] = [];
    private capturing: boolean = false;
    private startTime: number = 0;
    private lastChannelState: number = 0;
    private maxSamples: number = 10000;
    private sampleRate: number = 100000; // 100kHz default
    private listeners: Set<LogicAnalyzerListener> = new Set();
    private updateTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(numChannels: number = 8) {
        // Initialize default channels
        for (let i = 0; i < numChannels; i++) {
            this.channels.push({
                index: i,
                name: `CH${i}`,
                pin: i + 2, // Default to pins 2-9
                color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                enabled: i < 4, // Enable first 4 channels by default
            });
        }
    }

    /**
     * Configure a channel
     */
    configureChannel(index: number, config: Partial<ChannelConfig>): void {
        if (index >= 0 && index < this.channels.length) {
            this.channels[index] = { ...this.channels[index], ...config };
            this.notifyListeners();
        }
    }

    /**
     * Set channel pin mapping
     */
    setChannelPin(index: number, pin: number): void {
        this.configureChannel(index, { pin });
    }

    /**
     * Set channel name
     */
    setChannelName(index: number, name: string): void {
        this.configureChannel(index, { name });
    }

    /**
     * Enable/disable a channel
     */
    setChannelEnabled(index: number, enabled: boolean): void {
        this.configureChannel(index, { enabled });
    }

    /**
     * Start capturing
     */
    startCapture(): void {
        if (this.capturing) return;

        this.samples = [];
        this.startTime = performance.now();
        this.capturing = true;
        this.lastChannelState = 0;

        console.log('[LogicAnalyzer] Capture started');
        this.notifyListeners();
    }

    /**
     * Stop capturing
     */
    stopCapture(): void {
        if (!this.capturing) return;

        this.capturing = false;
        console.log(`[LogicAnalyzer] Capture stopped. ${this.samples.length} samples recorded.`);
        this.notifyListeners();
    }

    /**
     * Clear captured data
     */
    clearCapture(): void {
        this.samples = [];
        this.lastChannelState = 0;
        this.notifyListeners();
    }

    /**
     * Record a pin state change
     * Call this from the simulation when a monitored pin changes
     */
    recordPinChange(pin: number, high: boolean): void {
        if (!this.capturing) return;

        // Find which channel this pin is mapped to
        const channel = this.channels.find(ch => ch.enabled && ch.pin === pin);
        if (!channel) return;

        // Update channel state bitmask
        if (high) {
            this.lastChannelState |= (1 << channel.index);
        } else {
            this.lastChannelState &= ~(1 << channel.index);
        }

        // Record sample
        const timestamp = (performance.now() - this.startTime) * 1000; // Convert to microseconds
        this.samples.push({
            timestamp,
            channels: this.lastChannelState,
        });

        // Limit sample count
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }

        this.scheduleUpdate();
    }

    /**
     * Record all channel states at once
     * Call this for periodic sampling
     */
    recordSample(channelStates: boolean[]): void {
        if (!this.capturing) return;

        let state = 0;
        for (let i = 0; i < Math.min(channelStates.length, this.channels.length); i++) {
            if (this.channels[i].enabled && channelStates[i]) {
                state |= (1 << i);
            }
        }

        // Only record if state changed
        if (state !== this.lastChannelState) {
            this.lastChannelState = state;
            const timestamp = (performance.now() - this.startTime) * 1000;
            this.samples.push({ timestamp, channels: state });

            if (this.samples.length > this.maxSamples) {
                this.samples.shift();
            }

            this.scheduleUpdate();
        }
    }

    /**
     * Get current state
     */
    getState(): LogicAnalyzerState {
        return {
            capturing: this.capturing,
            samples: [...this.samples],
            channels: this.channels.map(ch => ({ ...ch })),
            startTime: this.startTime,
            maxSamples: this.maxSamples,
            sampleRate: this.sampleRate,
        };
    }

    /**
     * Get samples in a time range
     */
    getSamplesInRange(startUs: number, endUs: number): LogicSample[] {
        return this.samples.filter(s => s.timestamp >= startUs && s.timestamp <= endUs);
    }

    /**
     * Calculate frequency of a channel (Hz)
     */
    measureFrequency(channelIndex: number): number | null {
        if (this.samples.length < 2) return null;

        const mask = 1 << channelIndex;
        const edges: number[] = [];
        let lastState = false;

        for (const sample of this.samples) {
            const high = (sample.channels & mask) !== 0;
            if (high && !lastState) {
                edges.push(sample.timestamp);
            }
            lastState = high;
        }

        if (edges.length < 2) return null;

        // Calculate average period
        let totalPeriod = 0;
        for (let i = 1; i < edges.length; i++) {
            totalPeriod += edges[i] - edges[i - 1];
        }
        const avgPeriodUs = totalPeriod / (edges.length - 1);

        return avgPeriodUs > 0 ? 1000000 / avgPeriodUs : null;
    }

    /**
     * Calculate duty cycle of a channel (0-100%)
     */
    measureDutyCycle(channelIndex: number): number | null {
        if (this.samples.length < 2) return null;

        const mask = 1 << channelIndex;
        let highTime = 0;
        let totalTime = 0;

        for (let i = 1; i < this.samples.length; i++) {
            const duration = this.samples[i].timestamp - this.samples[i - 1].timestamp;
            const wasHigh = (this.samples[i - 1].channels & mask) !== 0;

            if (wasHigh) {
                highTime += duration;
            }
            totalTime += duration;
        }

        return totalTime > 0 ? (highTime / totalTime) * 100 : null;
    }

    /**
     * Export samples as CSV
     */
    exportCSV(): string {
        const enabledChannels = this.channels.filter(ch => ch.enabled);
        const header = ['Timestamp (µs)', ...enabledChannels.map(ch => ch.name)].join(',');

        const rows = this.samples.map(sample => {
            const values = [sample.timestamp.toFixed(2)];
            for (const ch of enabledChannels) {
                values.push((sample.channels & (1 << ch.index)) !== 0 ? '1' : '0');
            }
            return values.join(',');
        });

        return [header, ...rows].join('\n');
    }

    /**
     * Subscribe to state changes
     */
    subscribe(listener: LogicAnalyzerListener): () => void {
        this.listeners.add(listener);
        listener(this.getState());
        return () => this.listeners.delete(listener);
    }

    /**
     * Set max samples
     */
    setMaxSamples(max: number): void {
        this.maxSamples = Math.max(100, Math.min(100000, max));
    }

    private scheduleUpdate(): void {
        // Debounce to ~30fps for UI updates
        if (this.updateTimer) return;
        this.updateTimer = setTimeout(() => {
            this.notifyListeners();
            this.updateTimer = null;
        }, 33);
    }

    private notifyListeners(): void {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state);
        }
    }
}

// Singleton instance
let logicAnalyzerInstance: LogicAnalyzer | null = null;

/**
 * Get the logic analyzer singleton
 */
export function getLogicAnalyzer(): LogicAnalyzer {
    if (!logicAnalyzerInstance) {
        logicAnalyzerInstance = new LogicAnalyzer();
    }
    return logicAnalyzerInstance;
}

export type { LogicAnalyzer };
