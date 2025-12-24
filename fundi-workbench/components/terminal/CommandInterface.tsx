'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, MicOff, Camera, GraduationCap, Wrench } from 'lucide-react'
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
  const teacherMode = useAppStore((s) => s.teacherMode)
  const setTeacherMode = useAppStore((s) => s.setTeacherMode)

  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: { results: { transcript: string }[][] }) => {
          const transcript = event.results[0][0].transcript
          setInput((prev) => prev + ' ' + transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
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

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const reader = new FileReader()
        reader.onload = async (event) => {
          const base64 = event.target?.result as string
          await submitCommand(input || 'Analyze this circuit image and recreate it virtually', base64)
          setInput('')
        }
        reader.readAsDataURL(file)
      } catch (err) {
        console.error('Error reading image:', err)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [input, submitCommand]
  )

  return (
    <div
      className="flex h-full flex-col bg-zinc-950 font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Mode toggle bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTeacherMode(false)}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
              !teacherMode
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Wrench className="h-3 w-3" />
            Builder
          </button>
          <button
            type="button"
            onClick={() => setTeacherMode(true)}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
              teacherMode
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <GraduationCap className="h-3 w-3" />
            Teacher
          </button>
        </div>
        <span className="text-[9px] text-zinc-600">
          {teacherMode ? 'AI explains concepts' : 'AI builds circuits'}
        </span>
      </div>

      {/* History area */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2"
      >
        {terminalHistory.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">
            <div className="text-center">
              <p className="mb-1">FUNDI AI Assistant</p>
              <p className="text-zinc-700">Type a prompt, use voice 🎤, or upload an image 📷</p>
              <p className="mt-2 text-zinc-700">Type /help for commands</p>
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

      {/* Input line with multimodal buttons */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-zinc-800 bg-zinc-900/50 px-3 py-2"
      >
        {/* Image upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAiLoading}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors',
            'hover:bg-zinc-800 hover:text-zinc-300',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          title="Upload circuit image"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>

        {/* Voice input button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={isAiLoading}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded transition-colors',
            isListening
              ? 'bg-red-500/20 text-red-400 animate-pulse'
              : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </button>

        <span className="text-emerald-500">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAiLoading}
          placeholder={
            isListening
              ? 'Listening...'
              : isAiLoading
                ? 'Generating...'
                : 'Enter prompt or /command...'
          }
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
