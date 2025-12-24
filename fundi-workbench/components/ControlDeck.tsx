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
      className="absolute left-1/2 top-8 z-40 -translate-x-1/2"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="glass-panel-heavy rounded-2xl px-6 py-4 shadow-[0_0_40px_rgba(0,0,0,0.4)] border-alchemist">
        <div className="flex items-center gap-6">
          {/* Compilation Status */}
          <div className="flex items-center gap-3 border-r border-brass/20 pr-6">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brass-dim/60">System</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brass">Status</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-void/60 px-3 py-2 border border-brass/10">
              {isCompiling ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-electric" aria-hidden={true} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-electric animate-pulse">Compiling</span>
                </div>
              ) : compilationError ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-error shadow-[0_0_8px_rgba(207,53,46,0.6)]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-error">Error</span>
                </div>
              ) : hasProgram ? (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-electric shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-electric">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brass-dim/30" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brass-dim/40">Idle</span>
                </div>
              )}
            </div>
          </div>

          {/* Control Buttons - Mechanical Alchemist Keys */}
          <div className="flex items-center gap-4">
            {/* Run/Compile Button */}
            <button
              type="button"
              onClick={onRun}
              disabled={isCompiling}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl border-2 px-6 py-3',
                'font-heading text-xs font-bold uppercase tracking-[0.2em]',
                'transition-all duration-300 overflow-hidden',
                isCompiling
                  ? 'border-brass-dim/20 bg-panel/40 text-brass-dim/40 cursor-not-allowed'
                  : 'border-brass/40 bg-void hover:border-brass hover:text-brass text-brass-dim',
                'shadow-[0_4px_0_0_rgba(212,175,55,0.2)] active:translate-y-[2px] active:shadow-none'
              )}
              title="Compile and run"
            >
              <div className="absolute inset-0 bg-brass/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play className={cn(
                "h-4 w-4 transition-transform duration-300",
                !isCompiling && "group-hover:scale-110 group-hover:text-brass"
              )} aria-hidden={true} fill="currentColor" />
              <span>Manifest</span>
            </button>

            {/* Simulation Controls */}
            <div className="flex items-center gap-2 rounded-xl bg-void/40 p-1 border border-brass/10">
              <button
                type="button"
                onClick={isRunning ? onPause : () => {}}
                disabled={!hasProgram}
                className={cn(
                  'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300',
                  !hasProgram
                    ? 'text-brass-dim/20 cursor-not-allowed'
                    : isRunning
                    ? 'bg-electric/10 text-electric shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-brass-dim hover:bg-brass/10 hover:text-brass'
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
                  'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300',
                  !hasProgram
                    ? 'text-brass-dim/20 cursor-not-allowed'
                    : 'text-brass-dim hover:bg-error/10 hover:text-error'
                )}
                title="Stop simulation"
              >
                <Square className="h-4 w-4" aria-hidden={true} fill="none" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
