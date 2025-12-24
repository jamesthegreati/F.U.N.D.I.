'use client'

import { useState } from 'react'
import { Terminal, Bot } from 'lucide-react'
import { CommandInterface } from './CommandInterface'
import { SerialMonitor } from './SerialMonitor'
import { cn } from '@/utils/cn'

type TerminalTab = 'serial' | 'assistant'

interface TerminalPanelProps {
  serialOutput: string[]
  onClearSerial: () => void
  isSimulationRunning: boolean
}

export function TerminalPanel({
  serialOutput,
  onClearSerial,
  isSimulationRunning,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>('assistant')

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950">
      {/* Tab header */}
      <div className="flex h-8 shrink-0 items-center border-b border-zinc-800 bg-zinc-900/50">
        <button
          type="button"
          onClick={() => setActiveTab('serial')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-[11px] font-medium uppercase tracking-wider transition-colors',
            activeTab === 'serial'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <Terminal className="h-3 w-3" />
          <span>Serial</span>
          {isSimulationRunning && (
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-[11px] font-medium uppercase tracking-wider transition-colors',
            activeTab === 'assistant'
              ? 'border-b-2 border-amber-500 text-amber-400'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <Bot className="h-3 w-3" />
          <span>Assistant</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1">
        {activeTab === 'serial' ? (
          <SerialMonitor
            serialOutput={serialOutput}
            onClear={onClearSerial}
            isRunning={isSimulationRunning}
          />
        ) : (
          <CommandInterface />
        )}
      </div>
    </div>
  )
}
