'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Mic, MicOff, GraduationCap, Wrench, Send, ImagePlus } from 'lucide-react'
import { useAppStore, type TerminalEntry } from '@/store/useAppStore'
import { cn } from '@/utils/cn'

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function ChatMessage({ entry }: { entry: TerminalEntry }) {
  const isUser = entry.type === 'cmd'
  const isAi = entry.type === 'ai'
  const isError = entry.type === 'error'

  // Simple markdown-like rendering for code blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        const lang = match?.[1] || ''
        const code = match?.[2] ?? part.slice(3, -3)
        return (
          <div key={i} className="my-2 rounded-lg overflow-hidden border border-ide-border">
            {lang && (
              <div className="px-3 py-1 bg-ide-panel-bg text-[10px] font-medium text-ide-text-muted border-b border-ide-border">
                {lang}
              </div>
            )}
            <pre className="p-3 overflow-x-auto bg-ide-panel-bg/50 text-xs text-ide-success">
              <code>{code.trim()}</code>
            </pre>
          </div>
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
    <div className={cn(
      'mb-3 animate-fade-in',
      isUser && 'flex justify-end'
    )}>
      <div className={cn(
        'max-w-[85%] rounded-lg px-3 py-2',
        isUser 
          ? 'bg-ide-accent/20 text-ide-text border border-ide-accent/30' 
          : isError
            ? 'bg-ide-error/10 text-ide-error border border-ide-error/30'
            : isAi
              ? 'bg-ide-panel-surface text-ide-text border border-ide-border'
              : 'bg-ide-panel-hover/50 text-ide-text-muted'
      )}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            'text-[10px] font-medium',
            isUser ? 'text-ide-accent' : isAi ? 'text-ide-accent' : isError ? 'text-ide-error' : 'text-ide-text-subtle'
          )}>
            {isUser ? 'You' : isAi ? 'FUNDI AI' : isError ? 'Error' : 'System'}
          </span>
          <span className="text-[9px] text-ide-text-subtle">{formatTimestamp(entry.timestamp)}</span>
        </div>
        {/* Content */}
        <div className="text-sm leading-relaxed">{renderContent(entry.content)}</div>
      </div>
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
  const inputRef = useRef<HTMLTextAreaElement>(null)
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
          setInput((prev) => prev ? prev + ' ' + transcript : transcript)
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isAiLoading) return
      void submitCommand(input)
      setInput('')
    }
  }, [input, isAiLoading, submitCommand])

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
      className="flex h-full flex-col bg-ide-panel-bg"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Mode toggle bar - Segmented Control */}
      <div className="flex items-center justify-between border-b border-ide-border bg-ide-panel-surface px-3 py-2">
        <div className="flex items-center rounded-lg bg-ide-panel-bg p-0.5">
          <button
            type="button"
            onClick={() => setTeacherMode(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              !teacherMode
                ? 'bg-ide-success/20 text-ide-success shadow-sm'
                : 'text-ide-text-muted hover:text-ide-text'
            )}
          >
            <Wrench className="h-3.5 w-3.5" />
            Builder
          </button>
          <button
            type="button"
            onClick={() => setTeacherMode(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              teacherMode
                ? 'bg-ide-accent/20 text-ide-accent shadow-sm'
                : 'text-ide-text-muted hover:text-ide-text'
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Teacher
          </button>
        </div>
        <span className="text-[10px] text-ide-text-subtle">
          {teacherMode ? 'Explains concepts' : 'Builds circuits'}
        </span>
      </div>

      {/* Chat history area */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
      >
        {terminalHistory.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ide-accent/10">
                <Wrench className="h-6 w-6 text-ide-accent" />
              </div>
              <h3 className="text-sm font-medium text-ide-text mb-1">FUNDI AI Assistant</h3>
              <p className="text-xs text-ide-text-muted mb-3">
                Describe the circuit you want to build, upload an image, or use voice input.
              </p>
              <p className="text-[10px] text-ide-text-subtle">
                Type /help for commands
              </p>
            </div>
          </div>
        )}
        {terminalHistory.map((entry) => (
          <ChatMessage key={entry.id} entry={entry} />
        ))}
        {isAiLoading && (
          <div className="flex items-center gap-2 py-2 text-sm text-ide-accent animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Input area - GitHub-style Comment Box */}
      <div className="shrink-0 border-t border-ide-border bg-ide-panel-surface p-3">
        <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-ide-border bg-ide-panel-bg overflow-hidden focus-within:border-ide-accent/50 focus-within:ring-1 focus-within:ring-ide-accent/20 transition-all">
            {/* Text input */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAiLoading}
              placeholder={
                isListening
                  ? 'Listening...'
                  : isAiLoading
                    ? 'Generating...'
                    : 'Describe your circuit or ask a question...'
              }
              rows={2}
              className={cn(
                'w-full resize-none bg-transparent px-3 py-2 text-sm text-ide-text outline-none',
                'placeholder:text-ide-text-subtle',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              autoComplete="off"
              spellCheck={false}
            />

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between border-t border-ide-border px-2 py-1.5">
              <div className="flex items-center gap-1">
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
                    'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                    'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  title="Upload circuit image"
                >
                  <ImagePlus className="h-4 w-4" />
                </button>

                {/* Voice input button with recording state */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isAiLoading}
                  className={cn(
                    'relative flex h-7 w-7 items-center justify-center rounded-md transition-all',
                    isListening
                      ? 'mic-recording text-ide-error'
                      : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {/* Pulse ring when recording */}
                  {isListening && (
                    <span className="absolute inset-0 rounded-md animate-pulse-ring bg-ide-error/30" />
                  )}
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isAiLoading || !input.trim()}
                className={cn(
                  'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-all btn-press',
                  input.trim() && !isAiLoading
                    ? 'bg-ide-accent text-white hover:bg-ide-accent-hover'
                    : 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'
                )}
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
