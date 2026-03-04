'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Terminal, Bot, Activity, Wifi, Upload, AlertTriangle, Unplug, PlugZap, Trash2, ArrowDownToLine, Send } from 'lucide-react'
import { CommandInterface } from './CommandInterface'
import { SerialMonitor } from './SerialMonitor'
import { LogicAnalyzerPanel } from '@/components/LogicAnalyzerPanel'
import { NetworkPanel } from '@/components/NetworkPanel'
import { ValidationPanel } from '@/components/ValidationPanel'
import { useCircuitValidation } from '@/hooks/useCircuitValidation'
import { cn } from '@/utils/cn'
import { useAppStore, getBackendUrl } from '@/store/useAppStore'

type TerminalTab = 'serial' | 'upload' | 'assistant' | 'logic' | 'network' | 'validation'

const ARDUINO_UPLOAD_BOARDS = [
  { id: 'wokwi-arduino-uno', label: 'Arduino Uno' },
  { id: 'wokwi-arduino-nano', label: 'Arduino Nano' },
  { id: 'wokwi-arduino-mega', label: 'Arduino Mega' },
  { id: 'wokwi-esp32-devkit-v1', label: 'ESP32 DevKit V1' },
] as const

function normalizeBoardType(partType: string): string {
  if ((partType || '').startsWith('wokwi-')) return partType
  return `wokwi-${partType}`
}

function detectArduinoBoardFromCircuit(parts: Array<{ type: string }>): { board: string | null; count: number } {
  const supported = new Set<string>(ARDUINO_UPLOAD_BOARDS.map((b) => b.id))
  let found: string | null = null
  let count = 0

  for (const p of parts) {
    const normalized = normalizeBoardType(String(p?.type || ''))
    if (!supported.has(normalized)) continue
    count += 1
    if (!found) found = normalized
  }

  return { board: found, count }
}

function ArduinoUploadTab({ isActive }: { isActive: boolean }) {
  const circuitParts = useAppStore((s) => s.circuitParts)
  const files = useAppStore((s) => s.files)
  const code = useAppStore((s) => s.code)
  const listArduinoPorts = useAppStore((s) => s.listArduinoPorts)

  const [ports, setPorts] = useState<Array<{ address: string; label?: string | null }>>([])
  const [selectedPort, setSelectedPort] = useState<string>('')
  const [selectedBoard, setSelectedBoard] = useState<string>(ARDUINO_UPLOAD_BOARDS[0].id)

  const [isLoadingPorts, setIsLoadingPorts] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadOutput, setUploadOutput] = useState<string | null>(null)

  const detection = useMemo(() => detectArduinoBoardFromCircuit(circuitParts), [circuitParts])
  const detectedBoard = detection.board
  const detectedCount = detection.count
  const boardLocked = detectedCount === 1 && !!detectedBoard

  useEffect(() => {
    // Lock board selection to the circuit to avoid wrong-board uploads.
    if (detectedCount === 1 && detectedBoard && selectedBoard !== detectedBoard) {
      setSelectedBoard(detectedBoard)
    }
  }, [detectedBoard, detectedCount, selectedBoard])

  const refreshPorts = useCallback(async () => {
    setIsLoadingPorts(true)
    try {
      const next = await listArduinoPorts()
      setPorts(next)

      // Load a remembered port if possible.
      let remembered = ''
      try {
        remembered = String(localStorage.getItem('fundi-upload-port') || '').trim()
      } catch {
        // ignore
      }

      const preferred = remembered && next.some((p) => p.address === remembered) ? remembered : ''

      // Best-effort: keep selection if still present, otherwise select the first port.
      const stillThere = next.some((p) => p.address === selectedPort)
      if (!stillThere) setSelectedPort(preferred || next[0]?.address || '')
    } finally {
      setIsLoadingPorts(false)
    }
  }, [listArduinoPorts, selectedPort])

  useEffect(() => {
    // Initial load.
    refreshPorts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // When the tab is opened, refresh ports so users don't have to hit Refresh.
    if (isActive) refreshPorts()
  }, [isActive, refreshPorts])

  useEffect(() => {
    // Remember last-selected port.
    const p = (selectedPort || '').trim()
    if (!p) return
    try {
      localStorage.setItem('fundi-upload-port', p)
    } catch {
      // ignore
    }
  }, [selectedPort])

  const compileAndUpload = useCallback(async () => {
    setUploadError(null)
    setUploadOutput(null)

    if (detectedCount === 0) {
      setUploadError('Add an Arduino Uno/Nano/Mega to the circuit to upload.')
      return
    }
    if (detectedCount > 1) {
      setUploadError('Multiple Arduino boards detected. Keep only one to upload safely.')
      return
    }

    if (!detectedBoard) {
      setUploadError('No supported Arduino board detected (Uno/Nano/Mega).')
      return
    }

    const port = (selectedPort || '').trim()
    if (!port) {
      setUploadError('Select a serial port first.')
      return
    }

    // Ensure we are compiling/uploading for the board that exists in the circuit.
    if (selectedBoard !== detectedBoard) {
      setUploadError('Selected board does not match the Arduino in the circuit.')
      return
    }

    const filesForCompilation = (files || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((f) => !!f && (f as any).includeInSimulation)
      .reduce((acc, f) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const path = String((f as any).path || '')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = String((f as any).content || '')
        if (path) acc[path] = content
        return acc
      }, {} as Record<string, string>)

    const baseUrl = getBackendUrl()

    setIsUploading(true)
    try {
      const res = await fetch(`${baseUrl}/api/v1/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          board: selectedBoard,
          files: filesForCompilation,
          upload: true,
          upload_port: port,
        }),
      })

      const data = (await res.json().catch(() => null)) as
        | {
            success?: boolean
            error?: string | null
            upload_success?: boolean | null
            upload_error?: string | null
            upload_output?: string | null
          }
        | null

      if (!res.ok) {
        setUploadError((data && (data.error || data.upload_error)) || res.statusText || 'Upload failed.')
        setUploadOutput(data?.upload_output || null)
        return
      }

      if (!data?.success) {
        setUploadError(data?.error || 'Compilation failed.')
        return
      }

      if (!data?.upload_success) {
        setUploadError(data?.upload_error || 'Upload failed.')
        setUploadOutput(data?.upload_output || null)
        return
      }

      setUploadError(null)
      setUploadOutput(data?.upload_output || 'Upload completed successfully.')
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      const isNetworkError = raw === 'Failed to fetch' || raw.includes('NetworkError') || raw.includes('ECONNREFUSED')
      setUploadError(
        isNetworkError
          ? `Cannot reach backend at ${getBackendUrl()}. Start it with "docker compose up" or update the Backend URL in Settings.`
          : raw || 'Upload request failed.'
      )
    } finally {
      setIsUploading(false)
    }
  }, [code, detectedBoard, detectedCount, files, selectedBoard, selectedPort])

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4">
      {/* ── Upload section ── */}
      <div>
        <div className="mb-3">
          <div className="text-xs font-semibold text-ide-text">Hardware Upload</div>
          <div className="mt-0.5 text-[11px] text-ide-text-muted">
            Supports Arduino Uno/Nano/Mega and ESP32 DevKit V1.
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-ide-text-muted mb-1">Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              disabled={boardLocked}
              className="w-full rounded-md border border-ide-border bg-ide-panel-surface px-2 py-1.5 text-xs text-ide-text outline-none focus:ring-2 focus:ring-ide-accent/30"
            >
              {ARDUINO_UPLOAD_BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-ide-text-muted">
              {detectedCount === 0
                ? 'No supported board detected in circuit.'
                : detectedCount > 1
                  ? `Multiple boards detected (${detectedCount}).`
                  : boardLocked
                    ? `Detected in circuit: ${detectedBoard} (locked)`
                    : `Detected in circuit: ${detectedBoard}`}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-ide-text-muted">Port</label>
              <button
                type="button"
                onClick={refreshPorts}
                disabled={isLoadingPorts}
                className={cn(
                  'text-[11px] rounded px-2 py-1 border border-ide-border transition-colors',
                  isLoadingPorts
                    ? 'text-ide-text-subtle cursor-not-allowed'
                    : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover',
                )}
              >
                {isLoadingPorts ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="w-full rounded-md border border-ide-border bg-ide-panel-surface px-2 py-1.5 text-xs text-ide-text outline-none focus:ring-2 focus:ring-ide-accent/30"
            >
              <option value="">Select a port…</option>
              {ports.map((p) => (
                <option key={p.address} value={p.address}>
                  {p.label ? `${p.label} (${p.address})` : p.address}
                </option>
              ))}
            </select>
            {ports.length === 0 && (
              <div className="mt-1 text-[11px] text-ide-text-muted">
                No ports found. Plug in your device and close any other Serial Monitor.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={compileAndUpload}
            disabled={isUploading || detectedCount !== 1}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors',
              isUploading || detectedCount !== 1
                ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'
                : 'bg-ide-success text-white hover:bg-ide-success/90',
            )}
          >
            {isUploading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                Compile &amp; Upload
              </>
            )}
          </button>

          {uploadError && (
            <div className="rounded-md border border-ide-error/30 bg-ide-error/10 px-2.5 py-2 text-xs text-ide-error">
              {uploadError}
            </div>
          )}

          {uploadOutput && (
            <pre className="max-h-40 overflow-auto rounded-md border border-ide-border bg-ide-panel-surface px-2.5 py-2 text-[11px] text-ide-text whitespace-pre-wrap">
              {uploadOutput}
            </pre>
          )}
        </div>
      </div>

      {/* ── Hardware Serial Monitor ── */}
      <HardwareSerialMonitor port={selectedPort} />
    </div>
  )
}

/* ─── Hardware Serial Monitor (WebSocket) ────────────────────────────────── */

function HardwareSerialMonitor({ port }: { port: string }) {
  const [baudRate, setBaudRate] = useState(9600)
  const [lines, setLines] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, autoScroll])

  const connect = useCallback(() => {
    if (!port) { setError('Select a port first.'); return }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null }

    setError(null)
    setLines([])

    const rawBase = getBackendUrl()
    const wsBase = rawBase.replace(/^http/, 'ws')
    const url = `${wsBase}/api/v1/arduino/serial-monitor?port=${encodeURIComponent(port)}&baud_rate=${baudRate}`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onmessage = (ev) => {
      const text = String(ev.data || '')
      if (text.startsWith('[ERROR]')) {
        setError(text.replace('[ERROR] ', ''))
        ws.close()
        return
      }
      setLines(prev => [...prev.slice(-500), text])
    }
    ws.onerror = () => { setError('WebSocket connection error.'); setConnected(false) }
    ws.onclose = () => setConnected(false)
  }, [port, baudRate])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  useEffect(() => () => { wsRef.current?.close() }, [])

  const sendInput = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !inputValue) return
    wsRef.current.send(inputValue + '\n')
    setInputValue('')
  }, [inputValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); sendInput() }
  }, [sendInput])

  return (
    <div className="rounded-lg border border-ide-border/40 bg-ide-panel-surface/50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ide-border/40 bg-ide-panel-bg/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full transition-colors',
            connected ? 'bg-ide-success animate-pulse' : 'bg-ide-text-subtle/40'
          )} />
          <span className="text-[11px] font-medium text-ide-text-muted">Hardware Serial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={connected}
            className="h-6 rounded border border-ide-border bg-ide-panel-bg px-1 text-[10px] text-ide-text-muted outline-none disabled:opacity-50"
          >
            {[9600, 19200, 38400, 57600, 115200].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {connected ? (
            <button
              type="button"
              onClick={disconnect}
              title="Disconnect"
              className="flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium text-ide-error hover:bg-ide-error/10 transition-colors"
            >
              <Unplug className="h-3 w-3" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={!port}
              title="Connect to serial port"
              className={cn(
                'flex h-6 items-center gap-1 rounded px-2 text-[10px] font-medium transition-colors',
                port
                  ? 'text-ide-success hover:bg-ide-success/10'
                  : 'text-ide-text-subtle/40 cursor-not-allowed',
              )}
            >
              <PlugZap className="h-3 w-3" />
              Connect
            </button>
          )}
          <button
            type="button"
            onClick={() => setLines([])}
            title="Clear"
            className="flex h-6 w-6 items-center justify-center rounded text-ide-text-subtle hover:bg-ide-panel-hover hover:text-ide-text-muted transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => { setAutoScroll(true); if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }}
            title={autoScroll ? 'Auto-scroll on' : 'Scroll to bottom'}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition-colors',
              autoScroll ? 'text-ide-success bg-ide-success/10' : 'text-ide-text-subtle hover:bg-ide-panel-hover'
            )}
          >
            <ArrowDownToLine className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={() => {
          if (!scrollRef.current) return
          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
          if (scrollHeight - scrollTop - clientHeight > 30) setAutoScroll(false)
        }}
        className="h-32 overflow-y-auto bg-ide-panel-bg px-3 py-2 font-mono text-[11px]"
      >
        {error ? (
          <div className="text-ide-error">{error}</div>
        ) : lines.length === 0 ? (
          <div className="text-ide-text-subtle/50">
            {connected ? 'Waiting for serial output…' : 'Connect to see real hardware output'}
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="text-ide-success leading-relaxed">{line || '\u00A0'}</div>
          ))
        )}
      </div>

      <div className="border-t border-ide-border/40 px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connected}
            placeholder={connected ? 'Send to serial…' : 'Connect first'}
            className={cn(
              'h-6 flex-1 rounded border bg-ide-panel-surface px-2 font-mono text-[11px]',
              'text-ide-text placeholder:text-ide-text-subtle outline-none transition-colors',
              connected
                ? 'border-ide-border hover:border-ide-border-focus focus:border-ide-accent'
                : 'border-ide-border/40 cursor-not-allowed opacity-50'
            )}
          />
          <button
            type="button"
            onClick={sendInput}
            disabled={!connected || !inputValue}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition-colors',
              connected && inputValue
                ? 'bg-ide-accent text-white hover:bg-ide-accent/80'
                : 'bg-ide-panel-hover text-ide-text-subtle/40 cursor-not-allowed'
            )}
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

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

  // Keep visited tabs mounted so switching tabs feels instant and preserves scroll/input state.
  const [mounted, setMounted] = useState<Record<TerminalTab, boolean>>({
    serial: false,
    upload: false,
    assistant: true,
    validation: false,
    logic: false,
    network: false,
  })

  const isESP32 = boardType?.toLowerCase().includes('esp32')

  // Circuit validation hook
  const validation = useCircuitValidation()

  const availableTabs = useMemo(() => {
    const base: TerminalTab[] = ['serial', 'upload', 'assistant', 'validation', 'logic']
    if (isESP32) base.push('network')
    return base
  }, [isESP32])

  const activateTab = useCallback((tab: TerminalTab) => {
    // Guard: if the tab isn't available (e.g. network on non-ESP32), ignore.
    if (!availableTabs.includes(tab)) return
    setActiveTab(tab)
    setMounted((prev) => (prev[tab] ? prev : { ...prev, [tab]: true }))
    try {
      localStorage.setItem('fundi-terminal-tab', tab)
    } catch {
      // ignore
    }
  }, [availableTabs])

  // Restore last-used tab after hydration (avoids hydration mismatch).
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fundi-terminal-tab') as TerminalTab | null
      if (stored && availableTabs.includes(stored)) {
        // Defer state updates to avoid synchronous setState inside effect.
        queueMicrotask(() => {
          setActiveTab(stored)
          setMounted((prev) => (prev[stored] ? prev : { ...prev, [stored]: true }))
        })
      }
    } catch {
      // ignore
    }
  }, [availableTabs])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ide-panel-bg">
      {/* Tab header */}
      <div
        role="tablist"
        aria-label="Right panel"
        className="scrollbar-hide flex h-10 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-ide-border bg-ide-panel-surface px-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'serial'}
          onClick={() => activateTab('serial')}
          className={cn(
            'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
            activeTab === 'serial'
              ? 'border-ide-success/30 bg-ide-success/10 text-ide-success'
              : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Terminal className="icon-balanced h-3.5 w-3.5" />
          <span>Serial</span>
          {isSimulationRunning && (
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-ide-success" />
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'upload'}
          onClick={() => activateTab('upload')}
          className={cn(
            'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
            activeTab === 'upload'
              ? 'border-ide-success/30 bg-ide-success/10 text-ide-success'
              : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Upload className="icon-balanced h-3.5 w-3.5" />
          <span>Upload</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'assistant'}
          onClick={() => activateTab('assistant')}
          className={cn(
            'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
            activeTab === 'assistant'
              ? 'border-ide-accent/30 bg-ide-accent/10 text-ide-accent'
              : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Bot className="icon-balanced h-3.5 w-3.5" />
          <span>AI Assistant ✨</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'validation'}
          onClick={() => activateTab('validation')}
          className={cn(
            'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
            activeTab === 'validation'
              ? validation.hasCriticalIssues
                ? 'border-red-500/30 bg-red-500/10 text-red-500'
                : validation.hasErrors
                ? 'border-orange-500/30 bg-orange-500/10 text-orange-500'
                : validation.hasIssues
                ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                : 'border-green-500/30 bg-green-500/10 text-green-500'
              : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <AlertTriangle className="icon-balanced h-3.5 w-3.5" />
          <span>Validation</span>
          {validation.hasIssues && (
            <span className="ml-1 rounded-full bg-current px-1.5 py-0.5 text-[10px] font-bold text-white">
              {validation.issues.length}
            </span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'logic'}
          onClick={() => activateTab('logic')}
          className={cn(
            'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
            activeTab === 'logic'
              ? 'border-ide-warning/30 bg-ide-warning/10 text-ide-warning'
              : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Activity className="icon-balanced h-3.5 w-3.5" />
          <span>Logic Analyzer</span>
        </button>
        {isESP32 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'network'}
            onClick={() => activateTab('network')}
            className={cn(
              'tab-pill flex h-7 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-medium',
              activeTab === 'network'
                ? 'border-ide-info/30 bg-ide-info/10 text-ide-info'
                : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
            )}
          >
            <Wifi className="icon-balanced h-3.5 w-3.5" />
            <span>Network</span>
          </button>
        )}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1">
        {mounted.serial && (
          <div role="tabpanel" aria-label="Serial" className={cn('h-full', activeTab !== 'serial' && 'hidden')}>
            <SerialMonitor
              serialOutput={serialOutput}
              onClear={onClearSerial}
              isRunning={isSimulationRunning}
              onSendInput={onSendSerialInput}
            />
          </div>
        )}
        {mounted.upload && (
          <div role="tabpanel" aria-label="Upload" className={cn('h-full', activeTab !== 'upload' && 'hidden')}>
            <ArduinoUploadTab isActive={activeTab === 'upload'} />
          </div>
        )}
        {mounted.assistant && (
          <div role="tabpanel" aria-label="AI Assistant" className={cn('h-full', activeTab !== 'assistant' && 'hidden')}>
            <CommandInterface />
          </div>
        )}
        {mounted.validation && (
          <div role="tabpanel" aria-label="Validation" className={cn('h-full overflow-auto', activeTab !== 'validation' && 'hidden')}>
            <div className="p-4">
              <ValidationPanel issues={validation.issues} />
            </div>
          </div>
        )}
        {mounted.logic && (
          <div role="tabpanel" aria-label="Logic Analyzer" className={cn('h-full', activeTab !== 'logic' && 'hidden')}>
            <LogicAnalyzerPanel />
          </div>
        )}
        {mounted.network && (
          <div role="tabpanel" aria-label="Network" className={cn('h-full', activeTab !== 'network' && 'hidden')}>
            <NetworkPanel boardType={boardType} />
          </div>
        )}

        {!mounted.serial && activeTab === 'serial' && (
          <SerialMonitor
            serialOutput={serialOutput}
            onClear={onClearSerial}
            isRunning={isSimulationRunning}
            onSendInput={onSendSerialInput}
          />
        )}

        {!mounted.upload && activeTab === 'upload' && <ArduinoUploadTab isActive />}

        {!mounted.assistant && activeTab === 'assistant' && <CommandInterface />}
        {!mounted.logic && activeTab === 'logic' && <LogicAnalyzerPanel />}
        {!mounted.network && activeTab === 'network' && <NetworkPanel boardType={boardType} />}
      </div>
    </div>
  )
}
