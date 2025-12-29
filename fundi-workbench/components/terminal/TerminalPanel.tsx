'use client'

import { useState } from 'react'
import { Terminal, Bot, Activity, Wifi } from 'lucide-react'
import { CommandInterface } from './CommandInterface'
import { SerialMonitor } from './SerialMonitor'
import { LogicAnalyzerPanel } from '@/components/LogicAnalyzerPanel'
import { NetworkPanel } from '@/components/NetworkPanel'
import { cn } from '@/utils/cn'

type TerminalTab = 'serial' | 'assistant' | 'logic' | 'network'

interface TerminalPanelProps {
  serialOutput: string[]
  onClearSerial: () => void
  isSimulationRunning: boolean
  /** Optional callback to send input to simulation serial RX */
  onSendSerialInput?: (text: string) => void
  /** Current board type (for network panel) */
  boardType?: string
}

export function TerminalPanel({
  serialOutput,
  onClearSerial,
  isSimulationRunning,
  onSendSerialInput,
  boardType,
}: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<TerminalTab>('assistant')

  const isESP32 = boardType?.toLowerCase().includes('esp32')

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ide-panel-bg">
      {/* Tab header */}
      <div className="flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('serial')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap',
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
            'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'assistant'
              ? 'border-b-2 border-ide-accent text-ide-accent'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>AI Assistant ✨</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logic')}
          className={cn(
            'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'logic'
              ? 'border-b-2 border-yellow-500 text-yellow-500'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Logic Analyzer</span>
        </button>
        {isESP32 && (
          <button
            type="button"
            onClick={() => setActiveTab('network')}
            className={cn(
              'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors whitespace-nowrap',
              activeTab === 'network'
                ? 'border-b-2 border-cyan-500 text-cyan-500'
                : 'text-ide-text-muted hover:text-ide-text'
            )}
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>Network</span>
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1">
        {activeTab === 'serial' && (
          <SerialMonitor
            serialOutput={serialOutput}
            onClear={onClearSerial}
            isRunning={isSimulationRunning}
            onSendInput={onSendSerialInput}
          />
        )}
        {activeTab === 'assistant' && (
          <CommandInterface />
        )}
        {activeTab === 'logic' && (
          <LogicAnalyzerPanel />
        )}
        {activeTab === 'network' && (
          <NetworkPanel boardType={boardType} />
        )}
      </div>
    </div>
  )
}
