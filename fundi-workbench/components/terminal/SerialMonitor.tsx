'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Trash2, ArrowDownToLine, Send } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SerialMonitorProps {
  serialOutput: string[]
  onClear: () => void
  isRunning: boolean
  /** Optional callback to send input to simulation serial RX */
  onSendInput?: (text: string) => void
}

export function SerialMonitor({ serialOutput, onClear, isRunning, onSendInput }: SerialMonitorProps) {
  const [autoScroll, setAutoScroll] = useState(true)
  const [baudRate, setBaudRate] = useState(9600)
  const [inputValue, setInputValue] = useState('')
  const [lineEnding, setLineEnding] = useState<'none' | 'nl' | 'cr' | 'both'>('nl')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleSendInput = useCallback(() => {
    if (!onSendInput || !inputValue) return

    // Add line ending based on setting
    let textToSend = inputValue
    switch (lineEnding) {
      case 'nl':
        textToSend += '\n'
        break
      case 'cr':
        textToSend += '\r'
        break
      case 'both':
        textToSend += '\r\n'
        break
    }

    // Send each character
    for (const char of textToSend) {
      onSendInput(char)
    }

    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue, lineEnding, onSendInput])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendInput()
    }
  }, [handleSendInput])

  return (
    <div className="flex h-full flex-col bg-ide-panel-bg">
      {/* Header toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-ide-border px-3 py-1.5">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                isRunning ? 'bg-ide-success animate-pulse' : 'bg-ide-text-subtle'
              )}
            />
            <span className="text-[10px] font-medium text-ide-text-muted">
              {isRunning ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Baud rate selector */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            className="h-6 rounded border border-ide-border bg-ide-panel-surface px-1.5 text-[10px] text-ide-text-muted outline-none hover:border-ide-border-focus focus:border-ide-accent"
          >
            <option value={9600}>9600 baud</option>
            <option value={19200}>19200 baud</option>
            <option value={38400}>38400 baud</option>
            <option value={57600}>57600 baud</option>
            <option value={115200}>115200 baud</option>
          </select>

          {/* Line ending selector */}
          <select
            value={lineEnding}
            onChange={(e) => setLineEnding(e.target.value as typeof lineEnding)}
            className="h-6 rounded border border-ide-border bg-ide-panel-surface px-1.5 text-[10px] text-ide-text-muted outline-none hover:border-ide-border-focus focus:border-ide-accent"
            title="Line ending"
          >
            <option value="none">No line ending</option>
            <option value="nl">Newline</option>
            <option value="cr">Carriage return</option>
            <option value="both">Both NL & CR</option>
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
                ? 'bg-ide-success/20 text-ide-success'
                : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
            )}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
          </button>

          {/* Clear output */}
          <button
            type="button"
            onClick={onClear}
            title="Clear output"
            className="flex h-6 w-6 items-center justify-center rounded text-ide-text-muted transition-colors hover:bg-ide-panel-hover hover:text-ide-text"
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
          <div className="flex h-full items-center justify-center text-ide-text-subtle">
            <div className="text-center">
              <p className="mb-1">Serial Monitor</p>
              <p className="text-ide-text-subtle/70">
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

      {/* Input area */}
      {onSendInput && (
        <div className="shrink-0 border-t border-ide-border px-3 py-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isRunning}
              placeholder={isRunning ? "Type here to send..." : "Start simulation to send"}
              className={cn(
                'h-7 flex-1 rounded border bg-ide-panel-surface px-2 font-mono text-xs',
                'text-ide-text placeholder:text-ide-text-subtle',
                'outline-none transition-colors',
                isRunning
                  ? 'border-ide-border hover:border-ide-border-focus focus:border-ide-accent'
                  : 'border-ide-border/50 cursor-not-allowed opacity-50'
              )}
            />
            <button
              type="button"
              onClick={handleSendInput}
              disabled={!isRunning || !inputValue}
              title="Send"
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded transition-colors',
                isRunning && inputValue
                  ? 'bg-ide-accent text-white hover:bg-ide-accent/80'
                  : 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'
              )}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
