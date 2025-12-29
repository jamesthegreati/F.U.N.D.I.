'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play,
    Square,
    Trash2,
    Download,
    Settings,
    Activity,
    Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    getLogicAnalyzer,
    LogicAnalyzerState,
    LogicSample,
    ChannelConfig
} from '@/utils/simulation/logicAnalyzer';

interface LogicAnalyzerPanelProps {
    className?: string;
}

/**
 * Logic Analyzer Panel - displays digital waveforms and measurements
 */
export function LogicAnalyzerPanel({ className }: LogicAnalyzerPanelProps) {
    const [state, setState] = useState<LogicAnalyzerState | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [timeScale, setTimeScale] = useState(1000); // µs per division
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Subscribe to logic analyzer state
    useEffect(() => {
        const analyzer = getLogicAnalyzer();
        const unsubscribe = analyzer.subscribe(setState);
        return unsubscribe;
    }, []);

    // Render waveforms
    useEffect(() => {
        if (!state || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        // Clear canvas
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        const divisions = 10;
        for (let i = 0; i <= divisions; i++) {
            const x = (width / divisions) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Get enabled channels
        const enabledChannels = state.channels.filter(ch => ch.enabled);
        if (enabledChannels.length === 0) return;

        const channelHeight = height / enabledChannels.length;
        const samples = state.samples;

        if (samples.length === 0) return;

        // Calculate time range
        const endTime = samples[samples.length - 1]?.timestamp || 0;
        const startTime = Math.max(0, endTime - timeScale * divisions);

        // Draw each channel
        enabledChannels.forEach((channel, idx) => {
            const y0 = idx * channelHeight;
            const highY = y0 + 10;
            const lowY = y0 + channelHeight - 10;

            // Draw channel label
            ctx.fillStyle = channel.color;
            ctx.font = '12px monospace';
            ctx.fillText(channel.name, 5, y0 + 20);

            // Draw waveform
            ctx.strokeStyle = channel.color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            let lastX = 0;
            let lastY = lowY;
            const mask = 1 << channel.index;

            for (const sample of samples) {
                if (sample.timestamp < startTime) continue;

                const x = ((sample.timestamp - startTime) / (timeScale * divisions)) * width;
                const high = (sample.channels & mask) !== 0;
                const y = high ? highY : lowY;

                if (lastX === 0) {
                    ctx.moveTo(0, y);
                } else {
                    // Draw vertical transition
                    if (y !== lastY) {
                        ctx.lineTo(x, lastY);
                        ctx.lineTo(x, y);
                    }
                }
                ctx.lineTo(x, y);

                lastX = x;
                lastY = y;
            }

            // Extend to edge
            ctx.lineTo(width, lastY);
            ctx.stroke();

            // Draw separator line
            if (idx < enabledChannels.length - 1) {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, y0 + channelHeight);
                ctx.lineTo(width, y0 + channelHeight);
                ctx.stroke();
            }
        });

    }, [state, timeScale]);

    const handleStartCapture = useCallback(() => {
        getLogicAnalyzer().startCapture();
    }, []);

    const handleStopCapture = useCallback(() => {
        getLogicAnalyzer().stopCapture();
    }, []);

    const handleClear = useCallback(() => {
        getLogicAnalyzer().clearCapture();
    }, []);

    const handleExport = useCallback(() => {
        const csv = getLogicAnalyzer().exportCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'logic_capture.csv';
        link.click();
        URL.revokeObjectURL(url);
    }, []);

    const toggleChannel = useCallback((index: number) => {
        const analyzer = getLogicAnalyzer();
        const channel = state?.channels[index];
        if (channel) {
            analyzer.setChannelEnabled(index, !channel.enabled);
        }
    }, [state]);

    if (!state) return null;

    // Calculate measurements for enabled channels
    const measurements = state.channels
        .filter(ch => ch.enabled)
        .map(ch => ({
            ...ch,
            frequency: getLogicAnalyzer().measureFrequency(ch.index),
            dutyCycle: getLogicAnalyzer().measureDutyCycle(ch.index),
        }));

    return (
        <div className={cn('flex flex-col h-full bg-ide-panel', className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-ide-border px-3 py-2">
                <Activity className="h-4 w-4 text-ide-accent" />
                <span className="text-xs font-semibold text-ide-text">Logic Analyzer</span>

                <div className="flex-1" />

                {!state.capturing ? (
                    <button
                        onClick={handleStartCapture}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-ide-success/20 text-ide-success rounded hover:bg-ide-success/30 transition-colors"
                    >
                        <Play className="h-3 w-3" />
                        Capture
                    </button>
                ) : (
                    <button
                        onClick={handleStopCapture}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-ide-error/20 text-ide-error rounded hover:bg-ide-error/30 transition-colors"
                    >
                        <Square className="h-3 w-3" />
                        Stop
                    </button>
                )}

                <button
                    onClick={handleClear}
                    className="p-1.5 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded transition-colors"
                    title="Clear"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>

                <button
                    onClick={handleExport}
                    className="p-1.5 text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover rounded transition-colors"
                    title="Export CSV"
                >
                    <Download className="h-3.5 w-3.5" />
                </button>

                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                        'p-1.5 rounded transition-colors',
                        showSettings
                            ? 'text-ide-accent bg-ide-accent/20'
                            : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'
                    )}
                    title="Settings"
                >
                    <Settings className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Settings panel */}
            {showSettings && (
                <div className="border-b border-ide-border p-3 bg-ide-panel-hover">
                    <div className="flex flex-wrap gap-4">
                        {/* Time scale */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-ide-text-muted">Time/div:</span>
                            <select
                                value={timeScale}
                                onChange={(e) => setTimeScale(Number(e.target.value))}
                                className="text-xs bg-ide-bg border border-ide-border rounded px-2 py-1 text-ide-text"
                            >
                                <option value={100}>100µs</option>
                                <option value={500}>500µs</option>
                                <option value={1000}>1ms</option>
                                <option value={5000}>5ms</option>
                                <option value={10000}>10ms</option>
                                <option value={50000}>50ms</option>
                            </select>
                        </div>

                        {/* Channel toggles */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-ide-text-muted">Channels:</span>
                            {state.channels.map((ch) => (
                                <button
                                    key={ch.index}
                                    onClick={() => toggleChannel(ch.index)}
                                    className={cn(
                                        'px-2 py-0.5 text-xs rounded border transition-colors',
                                        ch.enabled
                                            ? 'border-current bg-current/20'
                                            : 'border-ide-border text-ide-text-muted'
                                    )}
                                    style={{ color: ch.enabled ? ch.color : undefined }}
                                >
                                    {ch.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Waveform display */}
            <div ref={containerRef} className="flex-1 min-h-0">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                />
            </div>

            {/* Measurements bar */}
            {measurements.length > 0 && (
                <div className="border-t border-ide-border p-2 bg-ide-panel-hover">
                    <div className="flex flex-wrap gap-4">
                        {measurements.map((m) => (
                            <div key={m.index} className="flex items-center gap-2 text-xs">
                                <Zap className="h-3 w-3" style={{ color: m.color }} />
                                <span className="text-ide-text-muted">{m.name}:</span>
                                {m.frequency !== null && (
                                    <span className="text-ide-text">
                                        {m.frequency > 1000
                                            ? `${(m.frequency / 1000).toFixed(2)} kHz`
                                            : `${m.frequency.toFixed(2)} Hz`}
                                    </span>
                                )}
                                {m.dutyCycle !== null && (
                                    <span className="text-ide-text-muted">
                                        ({m.dutyCycle.toFixed(1)}%)
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sample count */}
            <div className="border-t border-ide-border px-3 py-1 text-xs text-ide-text-muted">
                {state.samples.length} samples {state.capturing && '• Recording...'}
            </div>
        </div>
    );
}

export default LogicAnalyzerPanel;
