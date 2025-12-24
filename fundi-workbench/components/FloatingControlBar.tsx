'use client';

import { Play, Square, Loader2, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FloatingControlBarProps {
  isCompiling: boolean;
  compilationError?: string | null;
  onRun: () => void;
  hasProgram: boolean;
  isRunning: boolean;
  onPause: () => void;
  onStop: () => void;
}

/**
 * FloatingControlBar - Pill-shaped floating control center
 * Refined minimalist design with subtle micro-interactions
 */
export default function FloatingControlBar({
  isCompiling,
  compilationError,
  onRun,
  hasProgram,
  isRunning,
  onStop,
}: FloatingControlBarProps) {
  return (
    <div
      className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="floating-bar flex items-center gap-1 p-1.5">
        {/* Compile/Run Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isCompiling}
          className={cn(
            'group relative flex items-center gap-2 rounded-full px-5 py-2.5',
            'text-sm font-medium transition-all duration-200',
            'btn-press',
            isCompiling
              ? 'bg-pro-bg-subtle text-pro-text-subtle cursor-not-allowed'
              : 'bg-pro-accent text-white hover:bg-pro-accent-hover shadow-sm',
          )}
          title="Compile and run"
        >
          {isCompiling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden={true} />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" aria-hidden={true} />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-pro-border" />

        {/* Simulation Controls */}
        <div className="flex items-center gap-1">
          {/* Play/Status indicator */}
          <button
            type="button"
            disabled={!hasProgram}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-full',
              'transition-all duration-200 btn-press',
              !hasProgram
                ? 'text-pro-text-subtle cursor-not-allowed'
                : isRunning
                  ? 'bg-pro-accent/10 text-pro-accent'
                  : 'text-pro-text-muted hover:bg-pro-bg-subtle hover:text-pro-text',
            )}
            title={!hasProgram ? 'Compile first' : isRunning ? 'Running' : 'Paused'}
          >
            {isRunning && (
              <span className="absolute inset-0 rounded-full animate-glow-ring" />
            )}
            <Play
              className={cn('h-4 w-4', isRunning && 'fill-current')}
              aria-hidden={true}
            />
          </button>

          {/* Stop button */}
          <button
            type="button"
            onClick={onStop}
            disabled={!hasProgram}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'transition-all duration-200 btn-press',
              !hasProgram
                ? 'text-pro-text-subtle cursor-not-allowed'
                : 'text-pro-text-muted hover:bg-pro-error/10 hover:text-pro-error',
            )}
            title="Stop simulation"
          >
            <Square className="h-4 w-4" aria-hidden={true} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-pro-border" />

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-full bg-pro-bg-subtle px-3 py-1.5">
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors duration-300',
              isCompiling
                ? 'bg-pro-accent animate-pulse-subtle'
                : compilationError
                  ? 'bg-pro-error'
                  : hasProgram
                    ? 'bg-pro-success'
                    : 'bg-pro-text-subtle',
            )}
          />
          <span className="text-xs font-medium text-pro-text-muted">
            {isCompiling
              ? 'Compiling'
              : compilationError
                ? 'Error'
                : hasProgram
                  ? isRunning
                    ? 'Running'
                    : 'Ready'
                  : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
}
