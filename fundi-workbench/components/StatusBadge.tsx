'use client';

import { Cpu, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  deviceName?: string;
  isConnected?: boolean;
  className?: string;
}

/**
 * StatusBadge - Pill component showing device connection status
 * Dark IDE theme compatible
 */
export default function StatusBadge({
  deviceName = 'Arduino Uno',
  isConnected = true,
  className,
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-lg',
        'bg-ide-panel-bg/80 border border-ide-border',
        'px-3 py-1.5 shadow-ide-sm backdrop-blur-sm',
        'interactive-elevate',
        className,
      )}
    >
      {/* Device Icon */}
      <Cpu className="icon-balanced h-3.5 w-3.5 text-ide-text-muted" aria-hidden={true} />

      {/* Device Name */}
      <span className="text-xs font-medium text-ide-text">{deviceName}</span>

      {/* Divider */}
      <div className="h-3 w-px bg-ide-border" />

      {/* Connection Status */}
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <Wifi className="icon-balanced h-3 w-3 text-ide-success" aria-hidden={true} />
            <span className="text-xs font-medium text-ide-success">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="icon-balanced h-3 w-3 text-ide-text-subtle" aria-hidden={true} />
            <span className="text-xs font-medium text-ide-text-subtle">Disconnected</span>
          </>
        )}
      </div>

      {/* Active indicator dot when connected */}
      {isConnected && (
        <div className="relative ml-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-ide-success" />
          <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-ide-success animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}
