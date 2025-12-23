'use client';

import { Play, Square, Loader2 } from 'lucide-react';
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
 * ControlDeck - Floating mechanical control panel for the Workbench
 * Styled like Victorian typewriter keys with brass accents
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
      className="absolute left-1/2 top-4 z-40 -translate-x-1/2"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="glass-panel rounded-xl px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Compilation Status */}
          <div className="flex items-center gap-2 border-r border-brass/30 pr-3">
            <span className="font-mono text-xs font-medium text-brass-dim">STATUS:</span>
            {isCompiling ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-electric" aria-hidden={true} />
                <span className="font-mono text-xs text-electric">Compiling...</span>
              </div>
            ) : compilationError ? (
              <span className="font-mono text-xs text-error">Error</span>
            ) : hasProgram ? (
              <span className="font-mono text-xs text-electric">Ready</span>
            ) : (
              <span className="font-mono text-xs text-parchment/60">Idle</span>
            )}
          </div>

          {/* Control Buttons - Mechanical Typewriter Keys */}
          <div className="flex items-center gap-2">
            {/* Run/Compile Button */}
            <button
              type="button"
              onClick={onRun}
              disabled={isCompiling}
              className={cn(
                'group relative flex items-center gap-2 rounded-md border-2 px-4 py-2',
                'font-heading text-sm font-bold uppercase tracking-wider',
                'transition-all duration-150',
                isCompiling
                  ? 'border-brass-dim/30 bg-panel/40 text-brass-dim/50 cursor-not-allowed'
                  : 'border-brass/60 bg-panel hover:bg-brass/10 text-brass hover:text-electric hover:border-electric',
                'shadow-lg hover:shadow-electric/20',
                'active:translate-y-0.5 active:shadow-md'
              )}
              title="Compile and run"
            >
              <Play className="h-4 w-4" aria-hidden={true} fill="currentColor" />
              <span>Compile</span>
            </button>

            {/* Simulation Controls */}
            <button
              type="button"
              onClick={isRunning ? onPause : () => {}}
              disabled={!hasProgram}
              className={cn(
                'group relative flex items-center justify-center rounded-md border-2 p-2',
                'transition-all duration-150',
                !hasProgram
                  ? 'border-brass-dim/30 bg-panel/40 text-brass-dim/50 cursor-not-allowed'
                  : isRunning
                  ? 'border-electric/60 bg-panel hover:bg-electric/10 text-electric hover:border-electric'
                  : 'border-brass/60 bg-panel hover:bg-brass/10 text-brass hover:text-electric hover:border-electric',
                'shadow-lg hover:shadow-electric/20',
                'active:translate-y-0.5 active:shadow-md'
              )}
              title={!hasProgram ? 'Compile first' : isRunning ? 'Running' : 'Start simulation'}
            >
              <Play className="h-4 w-4" aria-hidden={true} fill={isRunning ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              onClick={onStop}
              disabled={!hasProgram}
              className={cn(
                'group relative flex items-center justify-center rounded-md border-2 p-2',
                'transition-all duration-150',
                !hasProgram
                  ? 'border-brass-dim/30 bg-panel/40 text-brass-dim/50 cursor-not-allowed'
                  : 'border-brass/60 bg-panel hover:bg-brass/10 text-brass hover:text-error hover:border-error',
                'shadow-lg hover:shadow-error/20',
                'active:translate-y-0.5 active:shadow-md'
              )}
              title={!hasProgram ? 'Compile first' : 'Stop simulation'}
            >
              <Square className="h-4 w-4" aria-hidden={true} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
