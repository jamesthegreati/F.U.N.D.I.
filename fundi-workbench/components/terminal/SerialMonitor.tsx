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
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Header toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
              )}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {isRunning ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Baud rate selector (visual only for now) */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="h-6 rounded border border-zinc-700 bg-zinc-800 px-1.5 text-[10px] text-zinc-400 outline-none hover:border-zinc-600 focus:border-zinc-500"
          >
            <option value={9600}>9600 baud</option>
            <option value={19200}>19200 baud</option>
            <option value={38400}>38400 baud</option>
            <option value={57600}>57600 baud</option>
            <option value={115200}>115200 baud</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          {/* Scroll to bottom / Auto-scroll toggle */}
          <button
            type="button"
            onClick={scrollToBottom}
            title={autoScroll ? 'Auto-scroll ON' : 'Scroll to bottom'}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition-colors',
              autoScroll
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            )}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </button>

          {/* Clear output */}
          <button
            type="button"
            onClick={onClear}
            title="Clear output"
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs"
      >
        {serialOutput.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <div className="text-center">
              <p className="mb-1">Serial Monitor</p>
              <p className="text-zinc-700">
                {isRunning
                  ? 'Waiting for serial output...'
                  : 'Run simulation to see output'}
              </p>
            </div>
          </div>
        ) : (
          serialOutput.map((line, index) => (
            <div key={index} className="leading-relaxed text-emerald-400">
              {line || '\u00A0'}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
