'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Mic, MicOff, GraduationCap, Wrench, Send, ImagePlus, X,
  Sparkles, ArrowLeft, ArrowRight, Code, Bot, User, AlertCircle,
  Cpu, Zap, Copy, Check, ChevronDown, ChevronRight, Lightbulb,
  CircuitBoard, BookOpen, Eye,
} from 'lucide-react'
import { useAppStore, type TerminalEntry, undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview } from '@/store/useAppStore'
import { cn } from '@/utils/cn'

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Render inline markdown: **bold**, *italic*, `code`, [link](url) */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Split on: **bold**, *italic*, `inline code`
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let idx = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(<span key={idx++}>{text.slice(last, match.index)}</span>)
    const m = match[0]
    if (m.startsWith('**') && m.endsWith('**'))
      nodes.push(<strong key={idx++} className="font-semibold text-ide-text">{m.slice(2, -2)}</strong>)
    else if (m.startsWith('*') && m.endsWith('*'))
      nodes.push(<em key={idx++} className="italic text-ide-text-muted">{m.slice(1, -1)}</em>)
    else if (m.startsWith('`') && m.endsWith('`'))
      nodes.push(<code key={idx++} className="rounded bg-ide-panel-bg px-1 py-0.5 text-[11px] font-mono text-ide-accent">{m.slice(1, -1)}</code>)
    last = match.index + m.length
  }
  if (last < text.length) nodes.push(<span key={idx}>{text.slice(last)}</span>)
  return nodes
}

/* ─── Collapsible Code Block ──────────────────────────────────────────── */

function CollapsibleCodeBlock({ lang, code }: { lang?: string; code: string }) {
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const trimmed = code.trim()
  const lineCount = trimmed ? trimmed.split(/\r?\n/).length : 0
  const label = lang?.trim() || 'code'

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(trimmed)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [trimmed])

  return (
    <div className="my-2.5 rounded-lg overflow-hidden border border-ide-border/60 bg-ide-panel-bg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-medium text-ide-text-muted hover:bg-ide-panel-hover/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <Code className="h-3 w-3 text-ide-accent/70" />
          <span>{label}</span>
          {lineCount > 0 && <span className="text-ide-text-subtle">• {lineCount} lines</span>}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleCopy() }}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-ide-text-subtle hover:text-ide-accent hover:bg-ide-accent/10 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="h-3 w-3 text-ide-success" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </button>
      {open && (
        <pre className="px-3 py-2.5 overflow-x-auto border-t border-ide-border/40 text-[11px] leading-relaxed font-mono text-ide-success/90">
          <code>{trimmed}</code>
        </pre>
      )}
    </div>
  )
}

/* ─── Chat Message ────────────────────────────────────────────────────── */

function ChatMessage({ entry }: { entry: TerminalEntry }) {
  const isUser = entry.type === 'cmd'
  const isAi = entry.type === 'ai'
  const isError = entry.type === 'error'
  const isLog = entry.type === 'log'

  const lastAiAppliedEntryId = useAppStore((s) => s.lastAiAppliedEntryId)
  const undoLastAiChanges = useAppStore((s) => s.undoLastAiChanges)
  const keepLastAiChanges = useAppStore((s) => s.keepLastAiChanges)
  const showAiControls = isAi && !!lastAiAppliedEntryId && entry.id === lastAiAppliedEntryId

  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        const lang = match?.[1] || ''
        const code = match?.[2] ?? part.slice(3, -3)
        return <CollapsibleCodeBlock key={i} lang={lang} code={code} />
      }
      // Render paragraphs with inline markdown
      const lines = part.split('\n')
      return (
        <div key={i} className="whitespace-pre-wrap">
          {lines.map((line, li) => (
            <span key={li}>
              {renderInlineMarkdown(line)}
              {li < lines.length - 1 && '\n'}
            </span>
          ))}
        </div>
      )
    })
  }

  // Log messages are compact system messages
  if (isLog) {
    return (
      <div className="mb-2 animate-fade-in px-1">
        <div className="flex items-start gap-2 rounded-md px-2 py-1.5 text-[11px] text-ide-text-muted bg-ide-panel-hover/30">
          <Zap className="mt-0.5 h-3 w-3 shrink-0 text-ide-text-subtle" />
          <span className="leading-relaxed">{entry.content}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mb-3 animate-fade-in', isUser && 'flex justify-end')}>
      <div className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row', 'max-w-[92%]')}>
        {/* Avatar */}
        <div className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
          isUser ? 'bg-ide-accent/15' : isError ? 'bg-ide-error/15' : 'bg-ide-success/15'
        )}>
          {isUser ? <User className="h-3.5 w-3.5 text-ide-accent" /> :
           isError ? <AlertCircle className="h-3.5 w-3.5 text-ide-error" /> :
           <Bot className="h-3.5 w-3.5 text-ide-success" />}
        </div>

        {/* Message bubble */}
        <div className={cn(
          'min-w-0 flex-1 rounded-lg px-3 py-2',
          isUser
            ? 'bg-ide-accent/10 border border-ide-accent/20'
            : isError
              ? 'bg-ide-error/5 border border-ide-error/20'
              : 'bg-ide-panel-surface border border-ide-border/50'
        )}>
          {/* Header */}
          <div className="mb-1 flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-semibold tracking-wide uppercase',
              isUser ? 'text-ide-accent/80' : isAi ? 'text-ide-success/80' : 'text-ide-error/80'
            )}>
              {isUser ? 'You' : isAi ? 'FUNDI' : 'Error'}
            </span>
            <span className="text-[9px] text-ide-text-subtle/60">{formatTimestamp(entry.timestamp)}</span>
          </div>

          {/* Content */}
          <div className="text-[12.5px] leading-[1.65] text-ide-text/90">{renderContent(entry.content)}</div>

          {/* AI action controls */}
          {showAiControls && (
            <div className="mt-3 flex items-center gap-2 border-t border-ide-border/30 pt-2.5">
              <button
                type="button"
                onClick={() => undoLastAiChanges()}
                className="flex items-center gap-1.5 rounded-md border border-ide-border/50 bg-ide-panel-bg px-2.5 py-1 text-[10px] font-medium text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
                title="Undo the changes applied by this AI response"
              >
                <ArrowLeft className="h-3 w-3" />
                Undo changes
              </button>
              <button
                type="button"
                onClick={() => keepLastAiChanges()}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium text-ide-success/80 hover:bg-ide-success/10 hover:text-ide-success transition-colors"
                title="Keep the changes and hide this prompt"
              >
                <Check className="h-3 w-3" />
                Keep
              </button>
              <span className="ml-auto text-[9px] text-ide-text-subtle">Test it, then decide</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Typing Indicator ────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="mb-3 flex gap-2.5 animate-fade-in">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ide-success/15">
        <Bot className="h-3.5 w-3.5 text-ide-success" />
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-ide-border/50 bg-ide-panel-surface px-4 py-2.5">
        <span className="fundi-typing-dot h-1.5 w-1.5 rounded-full bg-ide-accent" />
        <span className="fundi-typing-dot h-1.5 w-1.5 rounded-full bg-ide-accent [animation-delay:150ms]" />
        <span className="fundi-typing-dot h-1.5 w-1.5 rounded-full bg-ide-accent [animation-delay:300ms]" />
      </div>
    </div>
  )
}

/* ─── Context Bar ─────────────────────────────────────────────────────── */

function ContextBar() {
  const parts = useAppStore((s) => s.circuitParts)
  const connections = useAppStore((s) => s.connections)
  const files = useAppStore((s) => s.files)

  const partCount = parts.length
  const connCount = connections.length
  const fileCount = files.length
  const hasMcu = parts.some(p =>
    p.type.includes('arduino') || p.type.includes('esp32') || p.type.includes('pi-pico')
  )

  if (partCount === 0 && fileCount <= 1) return null

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1 border-b border-ide-border/40 bg-ide-panel-bg/50">
      <Eye className="h-3 w-3 shrink-0 text-ide-text-subtle/60" />
      <span className="text-[9px] text-ide-text-subtle/60 shrink-0">Context:</span>
      {hasMcu && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ide-success/10 px-2 py-0.5 text-[9px] text-ide-success/80">
          <Cpu className="h-2.5 w-2.5" /> MCU
        </span>
      )}
      {partCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ide-accent/10 px-2 py-0.5 text-[9px] text-ide-accent/80">
          <CircuitBoard className="h-2.5 w-2.5" /> {partCount} parts
        </span>
      )}
      {connCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ide-info/10 px-2 py-0.5 text-[9px] text-ide-info/80">
          <Zap className="h-2.5 w-2.5" /> {connCount} wires
        </span>
      )}
      {fileCount > 1 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-ide-warning/10 px-2 py-0.5 text-[9px] text-ide-warning/80">
          <Code className="h-2.5 w-2.5" /> {fileCount} files
        </span>
      )}
    </div>
  )
}

/* ─── Welcome Screen ──────────────────────────────────────────────────── */

const BUILDER_SUGGESTIONS = [
  { icon: Zap, label: 'Blink an LED', prompt: 'Build a simple LED blink circuit with an Arduino Uno' },
  { icon: Cpu, label: 'Temperature sensor', prompt: 'Build a DHT22 temperature and humidity sensor with LCD display' },
  { icon: CircuitBoard, label: 'Traffic light', prompt: 'Create a traffic light system with 3 LEDs and timed sequence' },
  { icon: Sparkles, label: 'Servo control', prompt: 'Build a servo motor controlled by a potentiometer' },
]

const TEACHER_SUGGESTIONS = [
  { icon: BookOpen, label: 'How LEDs work', prompt: 'Teach me how LEDs work and why we need resistors' },
  { icon: Lightbulb, label: 'Explain PWM', prompt: 'Explain PWM (Pulse Width Modulation) and demonstrate with an LED dimmer' },
  { icon: Zap, label: "Ohm's Law", prompt: "Teach me Ohm's Law with a practical circuit example" },
  { icon: Cpu, label: 'Digital vs Analog', prompt: 'Explain the difference between digital and analog signals with examples' },
]

function WelcomeScreen({ teacherMode, onSuggestion }: { teacherMode: boolean; onSuggestion: (prompt: string) => void }) {
  const suggestions = teacherMode ? TEACHER_SUGGESTIONS : BUILDER_SUGGESTIONS

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="mb-5 text-center">
          <div className={cn(
            'mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl',
            teacherMode ? 'bg-ide-accent/10' : 'bg-ide-success/10'
          )}>
            {teacherMode
              ? <GraduationCap className="h-5.5 w-5.5 text-ide-accent" />
              : <Bot className="h-5.5 w-5.5 text-ide-success" />
            }
          </div>
          <h3 className="text-sm font-semibold text-ide-text">
            {teacherMode ? 'FUNDI Teacher' : 'FUNDI Assistant'}
          </h3>
          <p className="mt-1 text-[11px] text-ide-text-muted leading-relaxed">
            {teacherMode
              ? 'Learn electronics concepts step by step. I\'ll explain the why behind every circuit.'
              : 'Describe what you want to build. I\'ll generate the code and wiring.'
            }
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onSuggestion(s.prompt)}
              className="group flex w-full items-center gap-2.5 rounded-lg border border-ide-border/40 bg-ide-panel-surface/50 px-3 py-2 text-left transition-all hover:border-ide-accent/30 hover:bg-ide-panel-hover/60"
            >
              <s.icon className="h-3.5 w-3.5 shrink-0 text-ide-text-subtle group-hover:text-ide-accent transition-colors" />
              <span className="text-[11px] text-ide-text-muted group-hover:text-ide-text transition-colors">{s.label}</span>
              <ChevronRight className="ml-auto h-3 w-3 text-ide-text-subtle/40 group-hover:text-ide-accent/60 transition-colors" />
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[9px] text-ide-text-subtle/50">
          Type a prompt below or pick a suggestion • /help for commands
        </p>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export function CommandInterface() {
  const terminalHistory = useAppStore((s) => s.terminalHistory)
  const isAiLoading = useAppStore((s) => s.isAiLoading)
  const submitCommand = useAppStore((s) => s.submitCommand)
  const teacherMode = useAppStore((s) => s.teacherMode)
  const setTeacherMode = useAppStore((s) => s.setTeacherMode)

  const stagedImageData = useAppStore((s) => s.stagedImageData)
  const stageImage = useAppStore((s) => s.stageImage)
  const clearStagedImage = useAppStore((s) => s.clearStagedImage)

  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [tempInput, setTempInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const undoEnabled = canUndo()
  const redoEnabled = canRedo()
  const undoPreview = getUndoPreview()
  const redoPreview = getRedoPreview()

  const commandHistory = useMemo(() =>
    terminalHistory.filter(e => e.type === 'cmd').map(e => e.content).reverse(),
    [terminalHistory]
  )

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [terminalHistory, isAiLoading])

  useEffect(() => { inputRef.current?.focus() }, [])

  // Speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return
    recognitionRef.current = new SpeechRecognitionAPI()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-US'
    recognitionRef.current.onresult = (event: { results: { transcript: string }[][] }) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev ? prev + ' ' + transcript : transcript)
      setIsListening(false)
    }
    recognitionRef.current.onerror = () => setIsListening(false)
    recognitionRef.current.onend = () => setIsListening(false)
  }, [])

  const doSubmit = useCallback((text: string) => {
    if (!text.trim() || isAiLoading) return
    void submitCommand(text)
    setInput('')
    setHistoryIndex(-1)
    setTempInput('')
  }, [isAiLoading, submitCommand])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    doSubmit(input)
  }, [input, doSubmit])

  const handleSubmitToBuilder = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!input.trim() || isAiLoading) return
    void submitCommand(input, undefined, { teacherModeOverride: false })
    setInput('')
  }, [input, isAiLoading, submitCommand])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      doSubmit(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      if (historyIndex === -1) setTempInput(input)
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setInput(commandHistory[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex <= 0) { setHistoryIndex(-1); setInput(tempInput); return }
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setInput(commandHistory[newIndex])
    }
  }, [input, doSubmit, commandHistory, historyIndex, tempInput])

  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) { alert('Speech recognition is not supported in this browser.'); return }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false) }
    else { recognitionRef.current.start(); setIsListening(true) }
  }, [isListening])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const reader = new FileReader()
      reader.onload = (event) => { stageImage(event.target?.result as string) }
      reader.readAsDataURL(file)
    } catch (err) { console.error('Error reading image:', err) }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [stageImage])

  const handleGenerateFromImage = useCallback(() => {
    void submitCommand('Analyze this circuit image and recreate it as a virtual Wokwi circuit with appropriate code')
  }, [submitCommand])

  return (
    <div className="flex h-full flex-col bg-ide-panel-bg" onClick={() => inputRef.current?.focus()}>
      {/* ── Header: Mode toggle + Undo/Redo ── */}
      <div className="flex items-center justify-between border-b border-ide-border bg-ide-panel-surface px-2.5 py-1.5">
        <div className="flex items-center rounded-lg bg-ide-panel-bg/80 p-0.5">
          <button
            type="button"
            onClick={() => setTeacherMode(false)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
              !teacherMode
                ? 'bg-ide-success/15 text-ide-success shadow-sm'
                : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover/50'
            )}
          >
            <Wrench className="h-3 w-3" />
            Build
          </button>
          <button
            type="button"
            onClick={() => setTeacherMode(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all',
              teacherMode
                ? 'bg-ide-accent/15 text-ide-accent shadow-sm'
                : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover/50'
            )}
          >
            <GraduationCap className="h-3 w-3" />
            Learn
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center rounded-lg bg-ide-panel-bg/80 p-0.5">
            <button
              type="button"
              onClick={() => undo()}
              disabled={!undoEnabled}
              title={undoPreview ?? 'Nothing to undo'}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-all',
                undoEnabled ? 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text' : 'text-ide-text-subtle/40 cursor-not-allowed'
              )}
              aria-label="Undo"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => redo()}
              disabled={!redoEnabled}
              title={redoPreview ?? 'Nothing to redo'}
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-md transition-all',
                redoEnabled ? 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text' : 'text-ide-text-subtle/40 cursor-not-allowed'
              )}
              aria-label="Redo"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Context awareness bar ── */}
      <ContextBar />

      {/* ── Chat area ── */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {terminalHistory.length === 0 ? (
          <WelcomeScreen teacherMode={teacherMode} onSuggestion={doSubmit} />
        ) : (
          <>
            {terminalHistory.map((entry) => (
              <ChatMessage key={entry.id} entry={entry} />
            ))}
          </>
        )}
        {isAiLoading && <TypingIndicator />}
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-ide-border bg-ide-panel-surface p-2.5">
        <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-ide-border/60 bg-ide-panel-bg overflow-hidden focus-within:border-ide-accent/40 focus-within:ring-1 focus-within:ring-ide-accent/15 transition-all">
            {/* Staged image */}
            {stagedImageData && (
              <div className="border-b border-ide-border/40 p-2">
                <div className="relative inline-block">
                  <img src={stagedImageData} alt="Staged circuit" className="h-16 rounded-md border border-ide-border/40 object-cover" />
                  <button
                    type="button"
                    onClick={clearStagedImage}
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-ide-error text-white hover:bg-ide-error/80 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateFromImage}
                  disabled={isAiLoading}
                  className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-ide-accent/10 px-3 py-1 text-[10px] font-medium text-ide-accent hover:bg-ide-accent/20 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  Analyze &amp; Recreate Circuit
                </button>
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAiLoading}
              placeholder={
                isListening ? 'Listening...'
                : isAiLoading ? 'Thinking...'
                : stagedImageData ? 'Describe what you see or click analyze...'
                : teacherMode ? 'Ask a question or describe what you want to learn...'
                : 'Describe the circuit you want to build...'
              }
              rows={2}
              className={cn(
                'w-full resize-none bg-transparent px-3 py-2 text-[12.5px] text-ide-text outline-none leading-relaxed',
                'placeholder:text-ide-text-subtle/50',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
              autoComplete="off"
              spellCheck={false}
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-ide-border/40 px-2 py-1">
              <div className="flex items-center gap-0.5">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAiLoading}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                    stagedImageData ? 'text-ide-accent bg-ide-accent/10' : 'text-ide-text-subtle hover:bg-ide-panel-hover hover:text-ide-text-muted',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  title="Upload circuit image"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isAiLoading}
                  className={cn(
                    'relative flex h-6 w-6 items-center justify-center rounded-md transition-all',
                    isListening ? 'mic-recording text-ide-error' : 'text-ide-text-subtle hover:bg-ide-panel-hover hover:text-ide-text-muted',
                    'disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isListening && <span className="absolute inset-0 rounded-md animate-pulse-ring bg-ide-error/30" />}
                </button>
              </div>

              <div className="flex items-center gap-1">
                {teacherMode && (
                  <button
                    type="button"
                    onClick={handleSubmitToBuilder}
                    disabled={isAiLoading || !input.trim()}
                    className={cn(
                      'flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-medium transition-all',
                      input.trim() && !isAiLoading
                        ? 'bg-ide-success/15 text-ide-success hover:bg-ide-success/25'
                        : 'text-ide-text-subtle/40 cursor-not-allowed'
                    )}
                    title="Send to Builder (applies changes directly)"
                  >
                    <Wrench className="h-3 w-3" />
                    Build
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isAiLoading || (!input.trim() && !stagedImageData)}
                  className={cn(
                    'flex h-6 items-center gap-1 rounded-md px-2.5 text-[10px] font-medium transition-all',
                    (input.trim() || stagedImageData) && !isAiLoading
                      ? 'bg-ide-accent text-white hover:bg-ide-accent-hover'
                      : 'bg-ide-panel-hover text-ide-text-subtle/40 cursor-not-allowed'
                  )}
                >
                  <Send className="h-3 w-3" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
