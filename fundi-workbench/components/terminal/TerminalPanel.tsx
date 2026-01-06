'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Terminal, Bot, Activity, Wifi, Upload } from 'lucide-react'
import { CommandInterface } from './CommandInterface'
import { SerialMonitor } from './SerialMonitor'
import { LogicAnalyzerPanel } from '@/components/LogicAnalyzerPanel'
import { NetworkPanel } from '@/components/NetworkPanel'
import { cn } from '@/utils/cn'
import { useAppStore } from '@/store/useAppStore'

type TerminalTab = 'serial' | 'upload' | 'assistant' | 'logic' | 'network'

const ARDUINO_UPLOAD_BOARDS = [
  { id: 'wokwi-arduino-uno', label: 'Arduino Uno' },
  { id: 'wokwi-arduino-nano', label: 'Arduino Nano' },
  { id: 'wokwi-arduino-mega', label: 'Arduino Mega' },
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
      .filter((f) => !!f && (f as any).includeInSimulation)
      .reduce((acc, f) => {
        const path = String((f as any).path || '')
        const content = String((f as any).content || '')
        if (path) acc[path] = content
        return acc
      }, {} as Record<string, string>)

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

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
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(msg || 'Upload request failed.')
    } finally {
      setIsUploading(false)
    }
  }, [code, detectedBoard, detectedCount, files, selectedBoard, selectedPort])

  return (
    <div className="h-full p-3">
      <div className="mb-3">
        <div className="text-xs font-semibold text-ide-text">Arduino Upload</div>
        <div className="mt-0.5 text-[11px] text-ide-text-muted">
          Upload supports Uno/Nano/Mega only.
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
              ? 'No Arduino Uno/Nano/Mega detected in circuit.'
              : detectedCount > 1
                ? `Multiple Arduino boards detected (${detectedCount}).`
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
              No ports found. Plug in the Arduino and close Arduino IDE/Serial Monitor if it’s open.
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
              Compile & Upload
            </>
          )}
        </button>

        {uploadError && (
          <div className="rounded-md border border-ide-error/30 bg-ide-error/10 px-2.5 py-2 text-xs text-ide-error">
            {uploadError}
          </div>
        )}

        {uploadOutput && (
          <pre className="max-h-48 overflow-auto rounded-md border border-ide-border bg-ide-panel-surface px-2.5 py-2 text-[11px] text-ide-text whitespace-pre-wrap">
            {uploadOutput}
          </pre>
        )}
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
    logic: false,
    network: false,
  })

  const isESP32 = boardType?.toLowerCase().includes('esp32')

  const availableTabs = useMemo(() => {
    const base: TerminalTab[] = ['serial', 'upload', 'assistant', 'logic']
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
        className="scrollbar-hide flex h-9 shrink-0 items-center gap-1 border-b border-ide-border bg-ide-panel-surface px-1.5 overflow-x-auto"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'serial'}
          onClick={() => activateTab('serial')}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'serial'
              ? 'bg-ide-success/10 text-ide-success'
              : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
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
          role="tab"
          aria-selected={activeTab === 'upload'}
          onClick={() => activateTab('upload')}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'upload'
              ? 'bg-ide-success/10 text-ide-success'
              : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>Upload</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'assistant'}
          onClick={() => activateTab('assistant')}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'assistant'
              ? 'bg-ide-accent/10 text-ide-accent'
              : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          <span>AI Assistant ✨</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'logic'}
          onClick={() => activateTab('logic')}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap',
            activeTab === 'logic'
              ? 'bg-ide-warning/10 text-ide-warning'
              : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
          )}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Logic Analyzer</span>
        </button>
        {isESP32 && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'network'}
            onClick={() => activateTab('network')}
            className={cn(
              'flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap',
              activeTab === 'network'
                ? 'bg-ide-info/10 text-ide-info'
                : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
            )}
          >
            <Wifi className="h-3.5 w-3.5" />
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
