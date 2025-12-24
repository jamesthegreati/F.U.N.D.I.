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
 * Clean, minimal design with subtle status indication
 */
export default function StatusBadge({
  deviceName = 'Nano Banana Pro',
  isConnected = true,
  className,
}: StatusBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full',
        'bg-pro-surface border border-pro-border',
        'px-3 py-1.5 shadow-pro-sm',
        'transition-all duration-200',
        className,
      )}
    >
      {/* Device Icon */}
      <Cpu className="h-3.5 w-3.5 text-pro-text-muted" aria-hidden={true} />

      {/* Device Name */}
      <span className="text-xs font-medium text-pro-text">{deviceName}</span>

      {/* Divider */}
      <div className="h-3 w-px bg-pro-border" />

      {/* Connection Status */}
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-pro-success" aria-hidden={true} />
            <span className="text-xs font-medium text-pro-success">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-pro-text-subtle" aria-hidden={true} />
            <span className="text-xs font-medium text-pro-text-subtle">Disconnected</span>
          </>
        )}
      </div>

      {/* Active indicator dot when connected */}
      {isConnected && (
        <div className="relative ml-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-pro-success" />
          <div className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-pro-success animate-ping opacity-75" />
        </div>
      )}
    </div>
  );
}
