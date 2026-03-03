'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Type,
  Cpu,
  Key,
  Save,
  RotateCcw,
  Server,
  Shield,
  Bot,
  HardDrive,
  ChevronRight,
  Zap,
  GraduationCap,
  Eye,
  Timer,
  Sparkles,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { useAppStore, type AppSettings, getBackendUrl } from '@/store/useAppStore'
import { cn } from '@/utils/cn'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const fontSizeOptions = [12, 14, 16, 18, 20]
const tabSizeOptions = [2, 4, 8]
const boardOptions = [
  { value: 'wokwi-arduino-uno', label: 'Arduino Uno' },
  { value: 'wokwi-arduino-nano', label: 'Arduino Nano' },
  { value: 'wokwi-arduino-mega', label: 'Arduino Mega' },
  { value: 'wokwi-esp32-devkit-v1', label: 'ESP32 DevKit V1' },
  { value: 'wokwi-pi-pico', label: 'Raspberry Pi Pico' },
]
const debounceOptions = [
  { value: 200, label: '200ms – Fast' },
  { value: 500, label: '500ms – Balanced' },
  { value: 1000, label: '1s – Relaxed' },
  { value: 2000, label: '2s – Slow' },
]
const autoSaveIntervalOptions = [
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 120000, label: '2 minutes' },
  { value: 300000, label: '5 minutes' },
]

type SectionId = 'editor' | 'compiler' | 'validation' | 'ai' | 'project' | 'api' | 'backend'

const sections: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'editor', label: 'Editor', icon: Type },
  { id: 'compiler', label: 'Compiler', icon: Cpu },
  { id: 'validation', label: 'Circuit Validation', icon: Shield },
  { id: 'ai', label: 'AI & Assistant', icon: Bot },
  { id: 'project', label: 'Project', icon: HardDrive },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'backend', label: 'Backend', icon: Server },
]

/* ------------------------------------------------------------------ */
/*  Reusable components                                               */
/* ------------------------------------------------------------------ */

function SectionCard({
  id,
  icon: Icon,
  title,
  description,
  children,
  accentColor = 'ide-accent',
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: ReactNode
  accentColor?: string
}) {
  return (
    <section id={id} className="scroll-mt-20 animate-fade-in">
      <div className="rounded-xl border border-ide-border bg-ide-panel-surface overflow-hidden">
        {/* Card header with accent stripe */}
        <div className={cn(
          'border-b border-ide-border px-5 py-4',
          'bg-gradient-to-r from-ide-panel-surface to-ide-panel-bg'
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              accentColor === 'ide-accent' && 'bg-ide-accent/10',
              accentColor === 'ide-success' && 'bg-ide-success/10',
              accentColor === 'ide-info' && 'bg-ide-info/10',
              accentColor === 'ide-warning' && 'bg-ide-warning/10',
            )}>
              <Icon className={cn(
                'h-[18px] w-[18px]',
                accentColor === 'ide-accent' && 'text-ide-accent',
                accentColor === 'ide-success' && 'text-ide-success',
                accentColor === 'ide-info' && 'text-ide-info',
                accentColor === 'ide-warning' && 'text-ide-warning',
              )} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ide-text">{title}</h3>
              <p className="text-xs text-ide-text-muted leading-relaxed mt-0.5">{description}</p>
            </div>
          </div>
        </div>
        {/* Card body */}
        <div className="divide-y divide-ide-border/50">
          {children}
        </div>
      </div>
    </section>
  )
}

function SettingRow({
  label,
  description,
  icon: Icon,
  children,
}: {
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-ide-text-subtle" />}
        <div className="min-w-0">
          <div className="text-sm text-ide-text">{label}</div>
          {description && <div className="text-xs text-ide-text-subtle mt-0.5 leading-relaxed">{description}</div>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  id?: string
}) {
  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ide-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ide-panel-bg',
        checked ? 'bg-ide-accent' : 'bg-ide-border'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string | number
  onChange: (val: string) => void
  options: { value: string | number; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-1.5 text-sm text-ide-text focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50 transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex rounded-lg border border-ide-border p-0.5 bg-ide-panel-bg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-ide-accent text-white shadow-sm'
              : 'text-ide-text-muted hover:text-ide-text'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main settings page                                                */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [backendStatusMsg, setBackendStatusMsg] = useState('')
  const [activeSection, setActiveSection] = useState<SectionId>('editor')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    if (key === 'backendUrl') {
      setBackendStatus('idle')
      setBackendStatusMsg('')
    }
  }

  const handleSave = () => {
    updateSettings(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const testBackendConnection = async () => {
    setBackendStatus('testing')
    setBackendStatusMsg('')
    const url = (localSettings.backendUrl || getBackendUrl()).replace(/\/+$/, '')
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        setBackendStatus('ok')
        setBackendStatusMsg(`Connected to ${url}`)
      } else {
        setBackendStatus('error')
        setBackendStatusMsg(`Server returned ${res.status}`)
      }
    } catch (err) {
      setBackendStatus('error')
      const isTimeout = err instanceof DOMException && err.name === 'TimeoutError'
      setBackendStatusMsg(
        isTimeout
          ? `Connection timed out after 5 seconds. Is ${url} correct?`
          : `Cannot reach ${url}. Make sure the backend is running.`
      )
    }
  }

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Track which section is visible via IntersectionObserver
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const sectionEls = sections.map(s => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (sectionEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId)
            break
          }
        }
      },
      { root: container, rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    )

    for (const el of sectionEls) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ide-panel-bg text-ide-text">
      {/* ─── Sticky header ─── */}
      <header className="shrink-0 border-b border-ide-border bg-ide-panel-surface/95 backdrop-blur-sm z-50">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-ide-text-muted hover:text-ide-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back to Editor</span>
            </Link>
            <div className="h-5 w-px bg-ide-border" />
            <h1 className="text-sm font-semibold tracking-tight">Settings</h1>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-ide-text-muted hover:bg-ide-panel-hover transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-ide-accent px-3 text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors shadow-ide-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              </>
            ) : (
              <span className="text-xs text-ide-text-subtle">All changes saved</span>
            )}
          </div>
        </div>
      </header>

      {/* ─── Body: sidebar nav + scrollable content ─── */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar navigation */}
        <nav className="hidden md:flex w-52 shrink-0 flex-col gap-1 border-r border-ide-border bg-ide-panel-surface/50 px-3 py-4 overflow-y-auto">
          {sections.map((s) => {
            const Icon = s.icon
            const isActive = activeSection === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150',
                  isActive
                    ? 'bg-ide-accent/10 text-ide-accent font-medium'
                    : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-ide-accent' : 'text-ide-text-subtle group-hover:text-ide-text-muted'
                )} />
                {s.label}
                <ChevronRight className={cn(
                  'ml-auto h-3.5 w-3.5 transition-all',
                  isActive ? 'opacity-100 text-ide-accent' : 'opacity-0 group-hover:opacity-50'
                )} />
              </button>
            )
          })}
        </nav>

        {/* Scrollable settings content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 space-y-6 pb-24">

            {/* ═══════════ Editor ═══════════ */}
            <SectionCard id="editor" icon={Type} title="Editor" description="Customize the code editor appearance and behavior">
              <SettingRow label="Font Size" description="Size of text in the code editor">
                <SelectInput
                  value={localSettings.editorFontSize}
                  onChange={(v) => handleChange('editorFontSize', Number(v))}
                  options={fontSizeOptions.map((s) => ({ value: s, label: `${s}px` }))}
                />
              </SettingRow>
              <SettingRow label="Tab Size" description="Number of spaces per indentation level">
                <SelectInput
                  value={localSettings.editorTabSize}
                  onChange={(v) => handleChange('editorTabSize', Number(v))}
                  options={tabSizeOptions.map((s) => ({ value: s, label: `${s} spaces` }))}
                />
              </SettingRow>
              <SettingRow label="Theme" description="Editor color scheme">
                <SegmentedControl
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                  value={localSettings.editorTheme}
                  onChange={(v) => handleChange('editorTheme', v as 'light' | 'dark')}
                />
              </SettingRow>
            </SectionCard>

            {/* ═══════════ Compiler ═══════════ */}
            <SectionCard id="compiler" icon={Cpu} title="Compiler" description="Configure default compilation and board settings">
              <SettingRow label="Default Board" description="Target board for new projects and compilation" icon={Cpu}>
                <SelectInput
                  value={localSettings.defaultBoardTarget}
                  onChange={(v) => handleChange('defaultBoardTarget', v)}
                  options={boardOptions.map((b) => ({ value: b.value, label: b.label }))}
                />
              </SettingRow>
            </SectionCard>

            {/* ═══════════ Circuit Validation ═══════════ */}
            <SectionCard
              id="validation"
              icon={Shield}
              title="Circuit Validation"
              description="Real-time electrical safety checks detect issues like missing resistors, short circuits, and voltage mismatches"
              accentColor="ide-success"
            >
              <SettingRow
                label="Enable Circuit Validation"
                description="Automatically check your circuit for electrical safety issues as you build"
                icon={Zap}
              >
                <Toggle
                  checked={localSettings.enableElectricalValidation}
                  onChange={(v) => handleChange('enableElectricalValidation', v)}
                />
              </SettingRow>
              <SettingRow
                label="Educational Mode"
                description="Show detailed explanations, calculations, and learning resources with each issue"
                icon={GraduationCap}
              >
                <Toggle
                  checked={localSettings.educationalMode}
                  onChange={(v) => handleChange('educationalMode', v)}
                />
              </SettingRow>
              <SettingRow
                label="Show Info-Level Issues"
                description="Display informational tips alongside errors and warnings"
                icon={Eye}
              >
                <Toggle
                  checked={localSettings.showInfoValidations}
                  onChange={(v) => handleChange('showInfoValidations', v)}
                />
              </SettingRow>
              <SettingRow
                label="Validation Speed"
                description="How quickly validation runs after circuit changes"
                icon={Timer}
              >
                <SelectInput
                  value={localSettings.validationDebounceMs}
                  onChange={(v) => handleChange('validationDebounceMs', Number(v))}
                  options={debounceOptions}
                />
              </SettingRow>

              {/* Inline status banner */}
              <div className="px-5 py-3.5">
                <div className={cn(
                  'rounded-lg border px-4 py-3 text-xs',
                  localSettings.enableElectricalValidation
                    ? 'border-ide-success/20 bg-ide-success/5 text-ide-success'
                    : 'border-ide-border bg-ide-panel-bg text-ide-text-subtle'
                )}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {localSettings.enableElectricalValidation
                        ? 'Validation is active — your circuits are being checked in real-time'
                        : 'Validation is paused — enable it to detect circuit safety issues'
                      }
                    </span>
                  </div>
                  {localSettings.enableElectricalValidation && (
                    <p className="mt-1.5 ml-[22px] text-ide-text-subtle leading-relaxed">
                      Checks include: missing current-limiting resistors, voltage mismatches, short circuits, I²C pull-ups, overcurrent, and power budget analysis.
                    </p>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ═══════════ AI & Assistant ═══════════ */}
            <SectionCard
              id="ai"
              icon={Bot}
              title="AI & Assistant"
              description="Configure the AI assistant, teacher mode, and generation behavior"
              accentColor="ide-info"
            >
              <SettingRow
                label="Teacher Mode"
                description="AI guides you with questions and hints instead of giving direct answers"
                icon={Sparkles}
              >
                <Toggle
                  checked={localSettings.teacherModeEnabled}
                  onChange={(v) => handleChange('teacherModeEnabled', v)}
                />
              </SettingRow>
            </SectionCard>

            {/* ═══════════ Project ═══════════ */}
            <SectionCard id="project" icon={HardDrive} title="Project" description="Auto-save and project management preferences">
              <SettingRow
                label="Auto-Save"
                description="Automatically save project changes to local storage"
                icon={RefreshCw}
              >
                <Toggle
                  checked={localSettings.autoSaveEnabled}
                  onChange={(v) => handleChange('autoSaveEnabled', v)}
                />
              </SettingRow>
              <SettingRow
                label="Auto-Save Interval"
                description="How often to save (when auto-save is enabled)"
                icon={Clock}
              >
                <SelectInput
                  value={localSettings.autoSaveIntervalMs}
                  onChange={(v) => handleChange('autoSaveIntervalMs', Number(v))}
                  options={autoSaveIntervalOptions}
                />
              </SettingRow>
            </SectionCard>

            {/* ═══════════ API Keys ═══════════ */}
            <SectionCard id="api" icon={Key} title="API Keys" description="Manage your API keys for AI features (stored locally in your browser)">
              <div className="px-5 py-4">
                <label className="mb-1.5 block text-sm text-ide-text-muted">
                  Gemini API Key Override
                </label>
                <input
                  type="password"
                  value={localSettings.geminiApiKeyOverride || ''}
                  onChange={(e) => handleChange('geminiApiKeyOverride', e.target.value || null)}
                  placeholder="Enter your API key…"
                  className="w-full rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50 transition-colors"
                />
                <p className="mt-2 text-xs text-ide-text-subtle leading-relaxed">
                  If set, this key overrides the server&apos;s default key. Stored in your browser&apos;s local storage only — never sent to third parties.
                </p>
              </div>
            </SectionCard>

            {/* ═══════════ Backend ═══════════ */}
            <SectionCard id="backend" icon={Server} title="Backend Connection" description="Configure the backend server for compilation and AI features">
              <div className="px-5 py-4 space-y-3">
                <label className="block text-sm text-ide-text-muted">
                  Backend URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localSettings.backendUrl || ''}
                    onChange={(e) => handleChange('backendUrl', e.target.value)}
                    placeholder="http://127.0.0.1:8000"
                    className="flex-1 rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={testBackendConnection}
                    disabled={backendStatus === 'testing'}
                    className="shrink-0 rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors disabled:opacity-50"
                  >
                    {backendStatus === 'testing' ? 'Testing…' : 'Test Connection'}
                  </button>
                </div>
                {backendStatus === 'ok' && (
                  <p className="text-xs text-ide-success">{backendStatusMsg}</p>
                )}
                {backendStatus === 'error' && (
                  <p className="text-xs text-ide-error">{backendStatusMsg}</p>
                )}
                <p className="text-xs text-ide-text-subtle leading-relaxed">
                  Leave empty to use the default ({process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}).
                  Start the backend with <code className="rounded bg-ide-panel-bg px-1 py-0.5 font-mono text-ide-text-muted">docker compose up</code>.
                </p>
              </div>
            </SectionCard>

          </div>
        </div>
      </div>

      {/* ─── Floating save bar (mobile) ─── */}
      {hasChanges && (
        <div className="md:hidden shrink-0 border-t border-ide-border bg-ide-panel-surface/95 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-lg border border-ide-border text-sm text-ide-text-muted hover:bg-ide-panel-hover transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-ide-accent text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
