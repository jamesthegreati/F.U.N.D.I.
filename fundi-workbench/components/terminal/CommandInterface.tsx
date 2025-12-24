'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAppStore, type TerminalEntry } from '@/store/useAppStore'
import { cn } from '@/utils/cn'

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function TerminalLine({ entry }: { entry: TerminalEntry }) {
  const prefix = entry.type === 'cmd' ? '>' : entry.type === 'ai' ? '◆' : entry.type === 'error' ? '✗' : '·'
  const colorClass =
    entry.type === 'cmd'
      ? 'text-zinc-300'
      : entry.type === 'ai'
        ? 'text-amber-400'
        : entry.type === 'error'
          ? 'text-red-400'
          : 'text-zinc-500'

  // Simple markdown-like rendering for code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        const code = match?.[2] ?? part.slice(3, -3)
        return (
          <pre
            key={i}
            className="mt-2 mb-1 overflow-x-auto rounded bg-zinc-900/50 p-2 text-xs text-emerald-400"
          >
            <code>{code.trim()}</code>
          </pre>
        )
      }
      // Regular text - preserve newlines
      return (
        <span key={i} className="whitespace-pre-wrap">
          {part}
        </span>
      )
    })
  }

  return (
    <div className={cn('group flex gap-2 py-1 font-mono text-xs', colorClass)}>
      <span className="shrink-0 text-zinc-600">{formatTimestamp(entry.timestamp)}</span>
      <span className="shrink-0">{prefix}</span>
      <div className="min-w-0 flex-1">{renderContent(entry.content)}</div>
    </div>
  )
}

export function CommandInterface() {
  const terminalHistory = useAppStore((s) => s.terminalHistory)
  const isAiLoading = useAppStore((s) => s.isAiLoading)
  const submitCommand = useAppStore((s) => s.submitCommand)

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [terminalHistory])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isAiLoading) return
      void submitCommand(input)
      setInput('')
    },
    [input, isAiLoading, submitCommand]
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent default behavior for Enter to avoid form submission issues
    if (e.key === 'Enter' && !e.shiftKey) {
      // Handled by form submit
    }
  }, [])

  return (
    <div
      className="flex h-full flex-col bg-zinc-950 font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      {/* History area */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
      >
        {terminalHistory.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">
            <div className="text-center">
              <p className="mb-1">FUNDI AI Assistant</p>
              <p className="text-zinc-700">Type a prompt or /help for commands</p>
            </div>
          </div>
        )}
        {terminalHistory.map((entry) => (
          <TerminalLine key={entry.id} entry={entry} />
        ))}
        {isAiLoading && (
          <div className="flex items-center gap-2 py-1 text-xs text-amber-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Input line */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-zinc-800 bg-zinc-900/50 px-3 py-2"
      >
        <span className="text-emerald-500">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAiLoading}
          placeholder={isAiLoading ? 'Generating...' : 'Enter prompt or /command...'}
          className={cn(
            'flex-1 bg-transparent text-xs text-zinc-200 outline-none',
            'placeholder:text-zinc-600',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          autoComplete="off"
          spellCheck={false}
        />
        <span
          className={cn(
            'h-4 w-1.5 bg-emerald-500',
            !isAiLoading && 'animate-pulse'
          )}
        />
      </form>
    </div>
  )
}
