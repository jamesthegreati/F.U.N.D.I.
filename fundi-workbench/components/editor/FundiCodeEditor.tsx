'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef } from 'react'
import type { editor as MonacoEditorNS } from 'monaco-editor'
import { loader } from '@monaco-editor/react'

import { useTheme } from '@/components/ThemeProvider'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Turbopack does not reliably serve Monaco's worker/assets from node_modules.
// Point Monaco at a stable CDN path instead, matching the installed monaco-editor version.
const MONACO_VERSION = '0.55.1'
if (typeof window !== 'undefined') {
  const monacoCdnBase = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`

  // Ensure Monaco can always resolve its language/editor workers.
  // Without this, Turbopack/dev can fail to serve worker assets, and Monaco init fails silently.
  ;(window as any).MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
      switch (label) {
        case 'json':
          return `${monacoCdnBase}/vs/language/json/json.worker.js`
        case 'css':
        case 'scss':
        case 'less':
          return `${monacoCdnBase}/vs/language/css/css.worker.js`
        case 'html':
        case 'handlebars':
        case 'razor':
          return `${monacoCdnBase}/vs/language/html/html.worker.js`
        case 'typescript':
        case 'javascript':
          return `${monacoCdnBase}/vs/language/typescript/ts.worker.js`
        default:
          return `${monacoCdnBase}/vs/editor/editor.worker.js`
      }
    },
  }

  loader.config({
    paths: {
      vs: `${monacoCdnBase}/vs`,
    },
  })
}

type FundiCodeEditorProps = {
  path: string
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  fontSize: number
  tabSize: number
}

type Monaco = typeof import('monaco-editor')

function parseRgbTriplet(raw: string): { r: number; g: number; b: number } | null {
  const nums = raw
    .trim()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))

  if (nums.length < 3) return null
  const [r, g, b] = nums
  return { r, g, b }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

function rgba({ r, g, b }: { r: number; g: number; b: number }, a: number) {
  const alpha = Math.max(0, Math.min(1, a))
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`
}

function readCssRgbVar(varName: string) {
  if (typeof window === 'undefined') return null
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName)
  if (!value) return null
  return parseRgbTriplet(value)
}

function defineFundiThemes(monaco: Monaco) {
  const panelBg = readCssRgbVar('--ide-panel-bg')
  const panelSurface = readCssRgbVar('--ide-panel-surface')
  const border = readCssRgbVar('--ide-border')
  const text = readCssRgbVar('--ide-text')
  const textMuted = readCssRgbVar('--ide-text-muted')
  const accent = readCssRgbVar('--ide-accent')

  if (!panelBg || !panelSurface || !border || !text || !textMuted || !accent) return

  const background = rgbToHex(panelBg)
  const surface = rgbToHex(panelSurface)
  const borderHex = rgbToHex(border)
  const foreground = rgbToHex(text)
  const muted = rgbToHex(textMuted)
  const accentHex = rgbToHex(accent)

  monaco.editor.defineTheme('fundi-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': background,
      'editor.foreground': foreground,
      'editorLineNumber.foreground': muted,
      'editorLineNumber.activeForeground': foreground,
      'editorCursor.foreground': accentHex,
      'editor.selectionBackground': rgba(accent, 0.25),
      'editor.inactiveSelectionBackground': rgba(accent, 0.12),
      'editor.selectionHighlightBackground': rgba(accent, 0.12),
      // VS Code-style active line highlight: very subtle neutral tint (avoid accent/red cast).
      'editor.lineHighlightBackground': rgba(border, 0.14),
      'editor.lineHighlightBorder': 'transparent',
      'editorWhitespace.foreground': rgba(textMuted, 0.25),
      'editorIndentGuide.background1': rgba(border, 0.55),
      'editorIndentGuide.activeBackground1': rgba(accent, 0.55),
      'editorWidget.background': surface,
      'editorWidget.border': borderHex,
      'editorSuggestWidget.background': surface,
      'editorSuggestWidget.border': borderHex,
      'editorSuggestWidget.selectedBackground': rgba(accent, 0.16),
      'peekView.border': borderHex,
      'peekViewResult.background': surface,
      'peekViewEditor.background': background,
    },
  })

  monaco.editor.defineTheme('fundi-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': background,
      'editor.foreground': foreground,
      'editorLineNumber.foreground': muted,
      'editorLineNumber.activeForeground': foreground,
      'editorCursor.foreground': accentHex,
      'editor.selectionBackground': rgba(accent, 0.22),
      'editor.inactiveSelectionBackground': rgba(accent, 0.12),
      'editor.selectionHighlightBackground': rgba(accent, 0.10),
      // VS Code-style active line highlight: very subtle neutral tint (avoid accent/red cast).
      'editor.lineHighlightBackground': rgba(border, 0.22),
      'editor.lineHighlightBorder': 'transparent',
      'editorWhitespace.foreground': rgba(textMuted, 0.35),
      'editorIndentGuide.background1': rgba(border, 0.9),
      'editorIndentGuide.activeBackground1': rgba(accent, 0.55),
      'editorWidget.background': surface,
      'editorWidget.border': borderHex,
      'editorSuggestWidget.background': surface,
      'editorSuggestWidget.border': borderHex,
      'editorSuggestWidget.selectedBackground': rgba(accent, 0.14),
      'peekView.border': borderHex,
      'peekViewResult.background': surface,
      'peekViewEditor.background': background,
    },
  })
}

function languageFromPath(path: string) {
  const lower = path.toLowerCase()
  if (lower.endsWith('.ino')) return 'cpp'
  if (lower.endsWith('.c')) return 'c'
  if (lower.endsWith('.h') || lower.endsWith('.hpp') || lower.endsWith('.cpp') || lower.endsWith('.cc')) return 'cpp'
  if (lower.endsWith('.json')) return 'json'
  if (lower.endsWith('.md')) return 'markdown'
  return 'plaintext'
}

export function FundiCodeEditor({ path, value, onChange, readOnly, fontSize, tabSize }: FundiCodeEditorProps) {
  const { theme } = useTheme()

  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  const disposablesRef = useRef<Array<{ dispose: () => void }>>([])

  const language = useMemo(() => languageFromPath(path), [path])

  // Keep Monaco in sync if content changes outside the editor (e.g. AI overwrite).
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const current = editor.getValue()
    if (current !== value) {
      editor.setValue(value)
    }
  }, [value, path])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    editor.updateOptions({
      fontSize,
      tabSize,
      insertSpaces: true,
      readOnly: !!readOnly,
      fontFamily: 'var(--font-mono)',
    })
  }, [fontSize, tabSize, readOnly])

  // Re-apply theme when app theme changes.
  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco) return
    // Recompute theme colors from current CSS variables.
    defineFundiThemes(monaco)
    monaco.editor.setTheme(theme === 'light' ? 'fundi-light' : 'fundi-dark')
  }, [theme])

  useEffect(() => {
    return () => {
      for (const d of disposablesRef.current) d.dispose()
      disposablesRef.current = []
    }
  }, [])

  return (
    <div className="fundi-monaco h-full w-full overflow-hidden rounded-md border border-ide-border bg-ide-panel-bg">
      <MonacoEditor
        path={path}
        defaultLanguage={language}
        defaultValue={value}
        onMount={(editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco

          // Register/update themes once we have access to CSS variables.
          defineFundiThemes(monaco)
          monaco.editor.setTheme(theme === 'light' ? 'fundi-light' : 'fundi-dark')

          // Apply per-file language (handles .ino -> cpp, etc.)
          const model = editor.getModel()
          if (model) {
            monaco.editor.setModelLanguage(model, language)
          }

          editor.updateOptions({
            fontSize,
            tabSize,
            insertSpaces: true,
            readOnly: !!readOnly,
            fontFamily: 'var(--font-mono)',
          })

          // Replace Monaco's built-in current-line overlay with a controlled decoration.
          // This avoids any unexpected strong/red highlight across themes.
          const activeLineDecorations = editor.createDecorationsCollection()

          const updateActiveLine = () => {
            const pos = editor.getPosition()
            if (!pos) return
            // Whole-line decorations are rendered in view overlays.
            activeLineDecorations.set([
              {
                range: new monaco.Range(pos.lineNumber, 1, pos.lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: 'fundi-active-line',
                },
              },
            ])
          }

          const clearActiveLine = () => {
            activeLineDecorations.clear()
          }

          // Only show highlight when focused (VS Code-like behavior).
          disposablesRef.current.push(
            editor.onDidChangeCursorPosition(updateActiveLine),
            editor.onDidFocusEditorWidget(updateActiveLine),
            editor.onDidBlurEditorWidget(clearActiveLine)
          )
          updateActiveLine()

          editor.focus()
        }}
        onChange={(next) => {
          onChange(next ?? '')
        }}
        options={{
          readOnly: !!readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          fontLigatures: true,
          minimap: { enabled: true },
          // Disable Monaco built-in active line highlight; we render our own subtle decoration.
          renderLineHighlight: 'none',
          bracketPairColorization: { enabled: true },
          guides: { indentation: true, bracketPairs: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          matchBrackets: 'always',
          folding: true,
          lineNumbers: 'on',
          wordWrap: 'off',
          quickSuggestions: { other: true, comments: false, strings: false },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          inlineSuggest: { enabled: true },
          parameterHints: { enabled: true },
          formatOnType: true,
          formatOnPaste: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            useShadows: false,
          },
          padding: {
            top: 12,
            bottom: 12,
          },
        }}
      />
    </div>
  )
}
