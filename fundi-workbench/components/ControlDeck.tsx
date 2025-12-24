'use client';

import { Play, Square, Loader2, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ControlDeckProps {
  isCompiling: boolean;
  compilationError?: string | null;
  onRun: () => void;
  hasProgram: boolean;
  isRunning: boolean;
  onPause: () => void;
  onStop: () => void;
}

/**
 * ControlDeck - Floating Neon Foundry control panel
 * Industrial machined aesthetic with neon accents
 */
export default function ControlDeck({
  isCompiling,
  compilationError,
  onRun,
  hasProgram,
  isRunning,
  onPause,
  onStop,
}: ControlDeckProps) {
  return (
    <div
      className="absolute left-1/2 top-10 z-40 -translate-x-1/2 stagger-item"
      style={{ pointerEvents: 'auto', animationDelay: '0.2s' }}
    >
      <div className="foundry-panel rounded-xl px-8 py-5 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-foundry">
        <div className="flex items-center gap-8">
          {/* Compilation Status Display */}
          <div className="flex items-center gap-4 border-r-2 border-neon-cyan/20 pr-8">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neon-cyan/40">Core</span>
              <span className="font-heading text-xs font-black uppercase tracking-[0.2em] text-neon-cyan">Status</span>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-deep-void px-4 py-2.5 border-2 border-neon-cyan/15 shadow-inner">
              {isCompiling ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-neon-blue filter drop-shadow-[0_0_8px_currentColor]" aria-hidden={true} />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-neon-blue font-bold animate-pulse">Compiling</span>
                </div>
              ) : compilationError ? (
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-sm bg-danger shadow-[0_0_12px_currentColor] status-glow" style={{ color: 'var(--danger)' }} />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-danger font-bold">Error</span>
                </div>
              ) : hasProgram ? (
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-sm bg-neon-green shadow-[0_0_12px_currentColor] status-glow" style={{ color: 'var(--neon-green)' }} />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-neon-green font-bold">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-sm bg-neon-cyan/20" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan/30 font-bold">Idle</span>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons - Embossed Industrial Keys */}
          <div className="flex items-center gap-5">
            {/* Manifest/Compile Button */}
            <button
              type="button"
              onClick={onRun}
              disabled={isCompiling}
              className={cn(
                'foundry-button group relative flex items-center gap-4 rounded-lg px-8 py-3.5',
                'font-heading text-sm font-black uppercase tracking-[0.25em]',
                'transition-all duration-200',
                isCompiling
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:scale-[1.02]'
              )}
              title="Compile and run"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan/10 to-neon-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Zap className={cn(
                "relative h-5 w-5 transition-all duration-300",
                !isCompiling && "group-hover:text-neon-cyan group-hover:filter group-hover:drop-shadow-[0_0_8px_currentColor]"
              )} aria-hidden={true} fill={!isCompiling ? "currentColor" : "none"} />
              <span className="relative">Manifest</span>
            </button>

            {/* Simulation Controls - Side-by-side */}
            <div className="flex items-center gap-3 rounded-lg bg-deep-void p-1.5 border-2 border-neon-cyan/15">
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={isRunning ? onPause : () => {}}
                disabled={!hasProgram}
                className={cn(
                  'group relative flex h-11 w-11 items-center justify-center rounded-md transition-all duration-300',
                  'border-2',
                  !hasProgram
                    ? 'text-neon-cyan/20 border-transparent cursor-not-allowed'
                    : isRunning
                    ? 'bg-neon-green/15 text-neon-green border-neon-green/40 shadow-[0_0_20px_rgba(0,255,136,0.3)]'
                    : 'text-neon-cyan/50 border-neon-cyan/20 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/40 hover:shadow-glow-cyan'
                )}
                title={!hasProgram ? 'Compile first' : isRunning ? 'Running' : 'Start simulation'}
              >
                <Play 
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isRunning && "filter drop-shadow-[0_0_6px_currentColor]"
                  )} 
                  aria-hidden={true} 
                  fill={isRunning ? 'currentColor' : 'none'} 
                />
              </button>

              {/* Stop Button */}
              <button
                type="button"
                onClick={onStop}
                disabled={!hasProgram}
                className={cn(
                  'group relative flex h-11 w-11 items-center justify-center rounded-md transition-all duration-300',
                  'border-2',
                  !hasProgram
                    ? 'text-neon-cyan/20 border-transparent cursor-not-allowed'
                    : 'text-neon-cyan/50 border-neon-cyan/20 hover:bg-danger/15 hover:text-danger hover:border-danger/40 hover:shadow-[0_0_20px_rgba(255,0,85,0.3)]'
                )}
                title="Stop simulation"
              >
                <Square className="h-5 w-5" aria-hidden={true} fill="none" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
