'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Type, 
  Cpu, 
  Key,
  Save,
  RotateCcw,
  Server,
} from 'lucide-react'
import { useAppStore, type AppSettings, getBackendUrl } from '@/store/useAppStore'
import { cn } from '@/utils/cn'

const fontSizeOptions = [12, 14, 16, 18, 20]
const tabSizeOptions = [2, 4, 8]
const boardOptions = [
  { value: 'wokwi-arduino-uno', label: 'Arduino Uno' },
  { value: 'wokwi-arduino-nano', label: 'Arduino Nano' },
  { value: 'wokwi-arduino-mega', label: 'Arduino Mega' },
  { value: 'wokwi-esp32-devkit-v1', label: 'ESP32 DevKit V1' },
  { value: 'wokwi-pi-pico', label: 'Raspberry Pi Pico' },
]

function SettingCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-ide-border bg-ide-panel-surface p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ide-accent/10">
          <Icon className="h-5 w-5 text-ide-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ide-text">{title}</h3>
          <p className="text-xs text-ide-text-muted">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SettingRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-ide-text-muted">{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [backendStatus, setBackendStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [backendStatusMsg, setBackendStatusMsg] = useState('')

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Reset test status when the user changes the backend URL
  useEffect(() => {
    setBackendStatus('idle')
    setBackendStatusMsg('')
  }, [localSettings.backendUrl])

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

  return (
    <div className="min-h-screen bg-ide-panel-bg text-ide-text">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-ide-border bg-ide-panel-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-ide-text-muted hover:text-ide-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Editor</span>
            </Link>
            <div className="h-5 w-px bg-ide-border" />
            <h1 className="text-sm font-semibold">Settings</h1>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-ide-text-muted hover:bg-ide-panel-hover transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-ide-accent px-3 text-sm font-medium text-white hover:bg-ide-accent-hover transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {/* Editor Settings */}
          <SettingCard
            icon={Type}
            title="Editor Settings"
            description="Customize the code editor appearance and behavior"
          >
            <SettingRow label="Font Size">
              <select
                value={localSettings.editorFontSize}
                onChange={(e) => handleChange('editorFontSize', Number(e.target.value))}
                className="rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-1.5 text-sm text-ide-text focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
              >
                {fontSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Tab Size">
              <select
                value={localSettings.editorTabSize}
                onChange={(e) => handleChange('editorTabSize', Number(e.target.value))}
                className="rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-1.5 text-sm text-ide-text focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
              >
                {tabSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} spaces
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label="Theme">
              <div className="flex rounded-lg border border-ide-border p-0.5">
                <button
                  type="button"
                  onClick={() => handleChange('editorTheme', 'light')}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    localSettings.editorTheme === 'light'
                      ? 'bg-ide-accent text-white'
                      : 'text-ide-text-muted hover:text-ide-text'
                  )}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('editorTheme', 'dark')}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    localSettings.editorTheme === 'dark'
                      ? 'bg-ide-accent text-white'
                      : 'text-ide-text-muted hover:text-ide-text'
                  )}
                >
                  Dark
                </button>
              </div>
            </SettingRow>
          </SettingCard>

          {/* Compiler Settings */}
          <SettingCard
            icon={Cpu}
            title="Compiler Settings"
            description="Configure default compilation options"
          >
            <SettingRow label="Default Board Target">
              <select
                value={localSettings.defaultBoardTarget}
                onChange={(e) => handleChange('defaultBoardTarget', e.target.value)}
                className="rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-1.5 text-sm text-ide-text focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
              >
                {boardOptions.map((board) => (
                  <option key={board.value} value={board.value}>
                    {board.label}
                  </option>
                ))}
              </select>
            </SettingRow>
          </SettingCard>

          {/* API Key Management */}
          <SettingCard
            icon={Key}
            title="API Key Management"
            description="Override the default Gemini API key (stored locally)"
          >
            <div>
              <label className="mb-1.5 block text-sm text-ide-text-muted">
                Gemini API Key Override
              </label>
              <input
                type="password"
                value={localSettings.geminiApiKeyOverride || ''}
                onChange={(e) => handleChange('geminiApiKeyOverride', e.target.value || null)}
                placeholder="Enter your API key..."
                className="w-full rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
              />
              <p className="mt-2 text-xs text-ide-text-subtle">
                If set, this key will be used instead of the server&apos;s default key. 
                The key is stored in your browser&apos;s local storage.
              </p>
            </div>
          </SettingCard>

          {/* Backend Connection */}
          <SettingCard
            icon={Server}
            title="Backend Connection"
            description="Configure the backend server URL used for compilation and AI features"
          >
            <div>
              <label className="mb-1.5 block text-sm text-ide-text-muted">
                Backend URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.backendUrl || ''}
                  onChange={(e) => handleChange('backendUrl', e.target.value)}
                  placeholder="http://127.0.0.1:8000"
                  className="flex-1 rounded-lg border border-ide-border bg-ide-panel-bg px-3 py-2 text-sm text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none focus:ring-1 focus:ring-ide-accent/50"
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
                <p className="mt-2 text-xs text-green-500">{backendStatusMsg}</p>
              )}
              {backendStatus === 'error' && (
                <p className="mt-2 text-xs text-red-400">{backendStatusMsg}</p>
              )}
              <p className="mt-2 text-xs text-ide-text-subtle">
                Leave empty to use the default ({process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}). 
                If running locally, start the backend with <code className="rounded bg-ide-panel-bg px-1">docker compose up</code>.
              </p>
            </div>
          </SettingCard>
        </div>
      </main>
    </div>
  )
}
