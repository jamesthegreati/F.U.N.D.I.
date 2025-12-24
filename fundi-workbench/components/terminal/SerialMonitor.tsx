'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Trash2, ArrowDownToLine } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SerialMonitorProps {
  serialOutput: string[]
  onClear: () => void
  isRunning: boolean
}

export function SerialMonitor({ serialOutput, onClear, isRunning }: SerialMonitorProps) {
  const [autoScroll, setAutoScroll] = useState(true)
  const [baudRate, setBaudRate] = useState(9600)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new output arrives (if enabled)
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [serialOutput, autoScroll])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    // Disable auto-scroll if user scrolls up
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 20
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false)
    }
  }, [autoScroll])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      setAutoScroll(true)
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-ide-panel-bg transition-colors">
      {/* Header toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-ide-border px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                isRunning ? 'bg-ide-success animate-pulse' : 'bg-ide-text-subtle'
              )}
            />
            <span className="text-xs font-medium text-ide-text-muted">
              {isRunning ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Baud rate selector */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="h-7 rounded-lg border border-ide-border bg-ide-panel-surface px-2 text-xs text-ide-text-muted outline-none hover:border-ide-border-focus focus:border-ide-accent transition-colors"
          >
            <option value={9600}>9600 baud</option>
            <option value={19200}>19200 baud</option>
            <option value={38400}>38400 baud</option>
            <option value={57600}>57600 baud</option>
            <option value={115200}>115200 baud</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Scroll to bottom / Auto-scroll toggle */}
          <button
            type="button"
            onClick={scrollToBottom}
            title={autoScroll ? 'Auto-scroll ON' : 'Scroll to bottom'}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200',
              autoScroll
                ? 'bg-ide-success/15 text-ide-success'
                : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
            )}
          >
            <ArrowDownToLine className="h-4 w-4" />
          </button>

          {/* Clear output */}
          <button
            type="button"
            onClick={onClear}
            title="Clear output"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ide-text-muted transition-all duration-200 hover:bg-ide-panel-hover hover:text-ide-text"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-sm"
      >
        {serialOutput.length === 0 ? (
          <div className="flex h-full items-center justify-center text-ide-text-subtle">
            <div className="text-center">
              <p className="mb-1 text-sm">Serial Monitor</p>
              <p className="text-xs text-ide-text-subtle/70">
                {isRunning
                  ? 'Waiting for serial output...'
                  : 'Run simulation to see output'}
              </p>
            </div>
          </div>
        ) : (
          serialOutput.map((line, index) => (
            <div key={index} className="leading-relaxed text-ide-success">
              {line || '\u00A0'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
