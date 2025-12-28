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
    <div className="flex h-full flex-col overflow-hidden bg-ide-panel-bg">
      {/* Tab header */}
      <div className="flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface">
        <button
          type="button"
          onClick={() => setActiveTab('serial')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors',
            activeTab === 'serial'
              ? 'border-b-2 border-ide-success text-ide-success'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Serial</span>
          {isSimulationRunning && (
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-ide-success" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors',
            activeTab === 'assistant'
              ? 'border-b-2 border-ide-accent text-ide-accent'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>AI Assistant ✨</span>
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
