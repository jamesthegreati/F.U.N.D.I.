import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { calculateCircuitLayout } from '@/utils/circuitLayout'
import { WOKWI_PARTS } from '@/lib/wokwiParts'

export type CircuitPart = {
  id: string
  /** Wokwi part key (e.g. 'arduino-uno') or element type (e.g. 'wokwi-arduino-uno') */
  type: string
  position: {
    x: number
    y: number
  }
  rotate?: number
  attrs?: Record<string, unknown>
}

export type CircuitConnection = {
  source: string
  target: string
  color: string
}

export interface Connection {
  id: string
  from: { partId: string; pinId: string }
  to: { partId: string; pinId: string }
  color: string
  points?: { x: number; y: number }[]
}

/** Terminal history entry for CLI-style AI chat */
export type TerminalEntry = {
  id: string
  type: 'cmd' | 'log' | 'ai' | 'error'
  content: string
  timestamp: number
}

/** Project file for multi-file support */
export type ProjectFile = {
  path: string
  content: string
  isMain: boolean
  includeInSimulation: boolean
  isReadOnly?: boolean
}

/** Project structure for workspace management */
export type Project = {
  id: string
  name: string
  lastModified: number
  files: ProjectFile[]
  circuitParts: CircuitPart[]
  connections: Connection[]
}

/** Settings stored in local storage */
export type AppSettings = {
  editorFontSize: number
  editorTheme: 'light' | 'dark'
  editorTabSize: number
  defaultBoardTarget: string
  geminiApiKeyOverride: string | null
}

export type AppState = {
  // Multi-project management
  projects: Project[]
  currentProjectId: string | null

  // Legacy code support - now derived from current project's main file
  code: string
  diagramJson: string
  circuitParts: CircuitPart[]
  circuitConnections: CircuitConnection[]
  connections: Connection[]
  isRunning: boolean

  // Multi-file support
  files: ProjectFile[]
  activeFilePath: string | null
  openFilePaths: string[]

  isCompiling: boolean
  compilationError: string | null
  compilationMissingHeader: string | null
  compilationLibrarySuggestions: Array<{ name: string; installed: boolean }>
  isInstallingLibrary: boolean
  libraryInstallError: string | null
  hex: string | null
  compiledBoard: string | null

  nextWireColorIndex: number

  selectedPartIds: string[]

  // Counter to trigger auto-fit after AI generates a circuit
  circuitGeneratedVersion: number

  // Terminal/AI Chat state
  terminalHistory: TerminalEntry[]
  isAiLoading: boolean

  // Copilot-style: allow undoing the last AI-applied change set after testing
  lastAiAppliedEntryId: string | null
  lastAiUndoSnapshot: {
    code: string
    circuitParts: CircuitPart[]
    connections: Connection[]
    files: ProjectFile[]
    activeFilePath: string | null
    openFilePaths: string[]
  } | null

  // Teacher mode toggle (Socratic Tutor feature)
  teacherMode: boolean

  // Image staging for AI
  stagedImageData: string | null

  // Settings
  settings: AppSettings

  // Project management actions
  createProject: (name: string) => string
  deleteProject: (id: string) => void
  loadProject: (id: string) => void
  saveCurrentProject: () => void
  getCurrentProject: () => Project | null

  // File management actions
  addFile: (path: string, content?: string, isMain?: boolean) => void
  deleteFile: (path: string) => void
  renameFile: (oldPath: string, newPath: string) => void
  updateFileContent: (path: string, content: string) => void
  setActiveFile: (path: string | null) => void
  openFile: (path: string) => void
  closeFile: (path: string) => void
  toggleFileSimulation: (path: string) => void

  updateCode: (newCode: string) => void
  setDiagramJson: (json: string) => void
  updateCircuit: (nodes: unknown, edges: unknown) => void
  toggleSimulation: () => void

  compileAndRun: () => Promise<void>
  installCompilationLibrary: (header: string, library: string) => Promise<void>

  listArduinoPorts: () => Promise<Array<{ address: string; label?: string | null }>>
  uploadToArduino: (port: string) => Promise<{ success: boolean; error?: string | null; output?: string | null }>

  addPart: (part: {
    type: string
    position: { x: number; y: number }
    rotate?: number
    attrs?: Record<string, string>
  }) => string
  removePart: (id: string) => void
  updatePartsPositions: (updates: Array<{ id: string; x: number; y: number }>) => void

  setSelectedPartIds: (ids: string[]) => void
  toggleSelectedPartId: (id: string) => void
  clearSelectedParts: () => void
  updatePartAttrs: (id: string, attrs: Record<string, unknown>) => void
  setCircuitPartAttr: (id: string, key: string, value: unknown) => void

  addConnection: (conn: Omit<Connection, 'id'>) => string
  allocateNextWireColor: () => string
  removeConnection: (id: string) => void
  updateWireColor: (id: string, color: string) => void
  updateWire: (id: string, points: { x: number; y: number }[] | undefined) => void

  // Terminal/AI Chat actions
  submitCommand: (text: string, imageData?: string) => Promise<void>
  addTerminalEntry: (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => string
  clearTerminalHistory: () => void
  setTeacherMode: (enabled: boolean) => void

  undoLastAiChanges: () => void
  keepLastAiChanges: () => void

  // Image staging actions
  stageImage: (imageData: string) => void
  clearStagedImage: () => void

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void

  // Apply AI-generated circuit to canvas
  applyGeneratedCircuit: (parts: CircuitPart[], connections: Connection[]) => void
}

type AiAction = 'answer' | 'update_code' | 'update_circuit' | 'update_both'

// Map custom-element tag -> FUNDI part type.
// IMPORTANT: multiple part types may point at the same element (aliases).
// We intentionally keep the *first* mapping to make normalization stable.
const ELEMENT_TO_FUNDI_PART_TYPE: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [key, cfg] of Object.entries(WOKWI_PARTS)) {
    const el = cfg?.element
    if (typeof el !== 'string' || el.length === 0) continue
    if (!(el in map)) map[el] = key
  }
  return map
})()

const DEFAULT_PART_ATTRS: Record<string, Record<string, string>> = {
  // NeoPixel family
  neopixel: { pixels: '8' },
  'led-ring': { pixels: '16' },
  'neopixel-ring': { pixels: '16' },
  'neopixel-matrix': { rows: '8', cols: '8' },

  // LCDs: default to I2C so they render before wiring
  lcd1602: { pins: 'i2c' },
  lcd2004: { pins: 'i2c' },
}

function normalizeFundiPartType(rawType: string): string {
  const t = String(rawType || '').trim()
  if (!t) return t

  // Already a valid FUNDI part type key.
  if (WOKWI_PARTS[t as keyof typeof WOKWI_PARTS]) return t

  // Sometimes the model emits element tags (e.g. 'wokwi-ssd1306').
  if (ELEMENT_TO_FUNDI_PART_TYPE[t]) return ELEMENT_TO_FUNDI_PART_TYPE[t]

  // Sometimes the model emits non-prefixed names ('ssd1306'), try mapping via element.
  const maybeElement = t.startsWith('wokwi-') ? t : `wokwi-${t}`
  if (ELEMENT_TO_FUNDI_PART_TYPE[maybeElement]) return ELEMENT_TO_FUNDI_PART_TYPE[maybeElement]

  // Fall back to stripping a leading prefix.
  if (t.startsWith('wokwi-')) return t.slice('wokwi-'.length)
  return t
}

const DEFAULT_WIRE_COLOR_CYCLE = [
  '#B87333', // copper (default)
  '#22c55e', // green
  '#3b82f6', // blue
  '#ef4444', // red
  '#eab308', // yellow
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#000000', // black
  '#ffffff', // white
] as const

const defaultCode =
  'void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }'

const defaultSettings: AppSettings = {
  editorFontSize: 14,
  editorTheme: 'dark',
  editorTabSize: 2,
  defaultBoardTarget: 'wokwi-arduino-uno',
  geminiApiKeyOverride: null,
}

function createDefaultProject(name: string = 'Untitled Project'): Project {
  return {
    id: nanoid(),
    name,
    lastModified: Date.now(),
    files: [
      {
        path: 'main.cpp',
        content: defaultCode,
        isMain: true,
        includeInSimulation: true,
      },
    ],
    circuitParts: [],
    connections: [],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null
}

function toCircuitParts(nodes: unknown): CircuitPart[] {
  if (!Array.isArray(nodes)) return []

  return nodes
    .map((node) => {
      if (!isRecord(node)) return null

      const id = typeof node.id === 'string' ? node.id : ''
      const nodeType = typeof node.type === 'string' ? node.type : 'unknown'

      // Try to carry Wokwi partType from node data (for node.type === 'wokwi').
      const data = isRecord(node.data) ? node.data : null
      const dataPartType = data && typeof data.partType === 'string' ? data.partType : null

      // Preserve per-part attributes (e.g., LED color, resistor value)
      const dataAttrsRaw = data && isRecord(data.attrs) ? data.attrs : null
      const attrs: Record<string, string> = dataAttrsRaw
        ? Object.fromEntries(
          Object.entries(dataAttrsRaw)
            .filter(([k, v]) => typeof k === 'string' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'))
            .map(([k, v]) => [k, String(v)])
        )
        : {}

      const type =
        (nodeType === 'wokwi' && dataPartType) ? dataPartType :
          (nodeType === 'arduino' ? 'arduino-uno' : nodeType)
      const position = isRecord(node.position) ? node.position : {}
      const x = typeof position.x === 'number' ? position.x : 0
      const y = typeof position.y === 'number' ? position.y : 0

      if (!id) return null

      return {
        id,
        type,
        position: { x, y },
        rotate: 0,
        attrs,
      } satisfies CircuitPart
    })
    .filter(isNotNull)
}

function toCircuitConnections(edges: unknown): CircuitConnection[] {
  if (!Array.isArray(edges)) return []

  return edges
    .map((edge) => {
      if (!isRecord(edge)) return null

      const source = typeof edge.source === 'string' ? edge.source : ''
      const target = typeof edge.target === 'string' ? edge.target : ''

      // Try common React Flow / XYFlow shapes for a stroke color.
      const style = isRecord(edge.style) ? edge.style : null
      const data = isRecord(edge.data) ? edge.data : null

      const colorCandidate =
        (typeof edge.color === 'string' && edge.color) ||
        (style && typeof style.stroke === 'string' && style.stroke) ||
        (data && typeof data.color === 'string' && data.color)

      if (!source || !target) return null

      return {
        source,
        target,
        color: colorCandidate || 'currentColor',
      } satisfies CircuitConnection
    })
    .filter(isNotNull)
}

function normalizeBoardType(partType: string): string {
  if (partType.startsWith('wokwi-')) return partType
  return `wokwi-${partType}`
}

function findMicrocontroller(parts: CircuitPart[]): CircuitPart | null {
  const supported = new Set([
    'wokwi-arduino-uno',
    'wokwi-arduino-nano',
    'wokwi-arduino-mega',
    'wokwi-esp32-devkit-v1',
    'wokwi-pi-pico',
  ])

  for (const p of parts) {
    const normalized = normalizeBoardType(p.type)
    if (supported.has(normalized)) return p
  }

  return null
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Multi-project state
      projects: [],
      currentProjectId: null,

      // Legacy compatibility
      code: defaultCode,
      diagramJson: '',
      circuitParts: [],
      circuitConnections: [],
      connections: [],
      isRunning: false,

      // Multi-file support
      files: [
        {
          path: 'main.cpp',
          content: defaultCode,
          isMain: true,
          includeInSimulation: true,
        },
      ],
      activeFilePath: 'main.cpp',
      openFilePaths: ['main.cpp'],

      isCompiling: false,
      compilationError: null,
      compilationMissingHeader: null,
      compilationLibrarySuggestions: [],
      isInstallingLibrary: false,
      libraryInstallError: null,
      hex: null,
      compiledBoard: null,

      nextWireColorIndex: 0,

      selectedPartIds: [],

      // Counter to trigger auto-fit after AI generates a circuit
      circuitGeneratedVersion: 0,

      // Terminal/AI Chat state
      terminalHistory: [],
      isAiLoading: false,

      lastAiAppliedEntryId: null,
      lastAiUndoSnapshot: null,

      // Teacher mode (Socratic Tutor feature)
      teacherMode: false,

      // Image staging
      stagedImageData: null,

      // Settings
      settings: defaultSettings,

      // Project management
      createProject: (name) => {
        const newProject = createDefaultProject(name)
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: newProject.id,
          files: newProject.files,
          circuitParts: newProject.circuitParts,
          connections: newProject.connections,
          code: newProject.files.find(f => f.isMain)?.content || defaultCode,
          activeFilePath: 'main.cpp',
          openFilePaths: ['main.cpp'],
        }))
        return newProject.id
      },

      deleteProject: (id) => {
        set((state) => {
          const filtered = state.projects.filter(p => p.id !== id)
          const wasCurrentProject = state.currentProjectId === id
          return {
            projects: filtered,
            currentProjectId: wasCurrentProject
              ? (filtered[0]?.id || null)
              : state.currentProjectId,
          }
        })
        // If deleted current project, load another or reset
        if (get().currentProjectId === null && get().projects.length > 0) {
          get().loadProject(get().projects[0].id)
        }
      },

      loadProject: (id) => {
        const project = get().projects.find(p => p.id === id)
        if (!project) return

        set({
          currentProjectId: id,
          files: project.files,
          circuitParts: project.circuitParts,
          connections: project.connections,
          code: project.files.find(f => f.isMain)?.content || defaultCode,
          activeFilePath: project.files.find(f => f.isMain)?.path || project.files[0]?.path || null,
          openFilePaths: [project.files.find(f => f.isMain)?.path || project.files[0]?.path].filter(Boolean) as string[],
        })
      },

      saveCurrentProject: () => {
        const { currentProjectId, files, circuitParts, connections, projects } = get()
        if (!currentProjectId) return

        set({
          projects: projects.map(p =>
            p.id === currentProjectId
              ? { ...p, files, circuitParts, connections, lastModified: Date.now() }
              : p
          ),
        })
      },

      getCurrentProject: () => {
        const { currentProjectId, projects } = get()
        return projects.find(p => p.id === currentProjectId) || null
      },

      // File management
      addFile: (path, content = '', isMain = false) => {
        const newFile: ProjectFile = {
          path,
          content,
          isMain,
          includeInSimulation: true,
        }
        set((state) => ({
          files: [...state.files, newFile],
          openFilePaths: [...state.openFilePaths, path],
          activeFilePath: path,
        }))
      },

      deleteFile: (path) => {
        set((state) => {
          const filtered = state.files.filter(f => f.path !== path)
          const newActivePath = state.activeFilePath === path
            ? (filtered.find(f => f.isMain)?.path || filtered[0]?.path || null)
            : state.activeFilePath
          return {
            files: filtered,
            openFilePaths: state.openFilePaths.filter(p => p !== path),
            activeFilePath: newActivePath,
          }
        })
      },

      renameFile: (oldPath, newPath) => {
        set((state) => ({
          files: state.files.map(f =>
            f.path === oldPath ? { ...f, path: newPath } : f
          ),
          openFilePaths: state.openFilePaths.map(p => p === oldPath ? newPath : p),
          activeFilePath: state.activeFilePath === oldPath ? newPath : state.activeFilePath,
        }))
      },

      updateFileContent: (path, content) => {
        set((state) => ({
          files: state.files.map(f =>
            f.path === path ? { ...f, content } : f
          ),
          // Also update legacy code if it's the main file
          code: state.files.find(f => f.path === path && f.isMain) ? content : state.code,
        }))
      },

      setActiveFile: (path) => {
        set({ activeFilePath: path })
      },

      openFile: (path) => {
        set((state) => ({
          openFilePaths: state.openFilePaths.includes(path)
            ? state.openFilePaths
            : [...state.openFilePaths, path],
          activeFilePath: path,
        }))
      },

      closeFile: (path) => {
        set((state) => {
          const filtered = state.openFilePaths.filter(p => p !== path)
          return {
            openFilePaths: filtered,
            activeFilePath: state.activeFilePath === path
              ? (filtered[filtered.length - 1] || null)
              : state.activeFilePath,
          }
        })
      },

      toggleFileSimulation: (path) => {
        set((state) => ({
          files: state.files.map(f =>
            f.path === path ? { ...f, includeInSimulation: !f.includeInSimulation } : f
          ),
        }))
      },

      updateCode: (newCode) => {
        set({ code: newCode })
        // Also update the active file if it's the main file
        const activeFile = get().files.find(f => f.path === get().activeFilePath)
        if (activeFile?.isMain) {
          get().updateFileContent(activeFile.path, newCode)
        }
      },

      setDiagramJson: (json) => {
        set({ diagramJson: json })
      },

      updateCircuit: (nodes, edges) => {
        const circuitParts = toCircuitParts(nodes)
        const circuitConnections = toCircuitConnections(edges)

        set({ circuitParts, circuitConnections })
      },

      toggleSimulation: () => {
        set({ isRunning: !get().isRunning })
      },

      compileAndRun: async () => {
        const mcu = findMicrocontroller(get().circuitParts)
        if (!mcu) {
          set({ compilationError: 'No supported microcontroller found in the circuit.', hex: null, compiledBoard: null })
          return
        }

        const board = normalizeBoardType(mcu.type)

        set({
          isCompiling: true,
          compilationError: null,
          compilationMissingHeader: null,
          compilationLibrarySuggestions: [],
          libraryInstallError: null,
        })

        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

          // Build files object for multi-file compilation
          const filesForCompilation = get().files
            .filter(f => f.includeInSimulation)
            .reduce((acc, f) => {
              acc[f.path] = f.content
              return acc
            }, {} as Record<string, string>)

          const res = await fetch(`${baseUrl}/api/v1/compile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: get().code,
              board,
              files: filesForCompilation,
            }),
          })

          const data = (await res.json().catch(() => null)) as
            | {
                success?: boolean
                hex?: string | null
                error?: string | null
                missing_header?: string | null
                library_suggestions?: Array<{ name?: string; installed?: boolean }> | null
              }
            | null

          if (!res.ok) {
            set({
              compilationError: (data && (data.error || (!data.success ? 'Compilation failed.' : null))) || res.statusText,
              compilationMissingHeader: data?.missing_header || null,
              compilationLibrarySuggestions: (data?.library_suggestions || [])
                .filter((x): x is { name?: string; installed?: boolean } => !!x && typeof x === 'object')
                .map((x) => ({ name: String(x.name || ''), installed: !!x.installed }))
                .filter((x) => !!x.name),
              hex: null,
              compiledBoard: null,
            })
            return
          }

          if (!data?.success || !data.hex) {
            set({
              compilationError: data?.error || 'Compilation failed.',
              compilationMissingHeader: data?.missing_header || null,
              compilationLibrarySuggestions: (data?.library_suggestions || [])
                .filter((x): x is { name?: string; installed?: boolean } => !!x && typeof x === 'object')
                .map((x) => ({ name: String(x.name || ''), installed: !!x.installed }))
                .filter((x) => !!x.name),
              hex: null,
              compiledBoard: null,
            })
            return
          }

          set({
            hex: data.hex,
            compiledBoard: board,
            compilationError: null,
            compilationMissingHeader: null,
            compilationLibrarySuggestions: [],
            libraryInstallError: null,
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          set({
            compilationError: msg || 'Compilation request failed.',
            compilationMissingHeader: null,
            compilationLibrarySuggestions: [],
            hex: null,
            compiledBoard: null,
          })
        } finally {
          set({ isCompiling: false })
        }
      },

      listArduinoPorts: async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
          const res = await fetch(`${baseUrl}/api/v1/arduino/ports`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          })

          const data = (await res.json().catch(() => null)) as
            | { ports?: Array<{ address?: string; label?: string | null }> | null }
            | null

          const ports = (data?.ports || [])
            .filter((p): p is { address?: string; label?: string | null } => !!p && typeof p === 'object')
            .map((p) => ({ address: String(p.address || '').trim(), label: p.label ?? null }))
            .filter((p) => !!p.address)

          if (!res.ok) return []
          return ports
        } catch {
          return []
        }
      },

      uploadToArduino: async (port) => {
        const p = String(port || '').trim()
        const artifact = get().hex
        const board = get().compiledBoard

        if (!p) return { success: false, error: 'Port is required', output: null }
        if (!artifact || !board) return { success: false, error: 'Nothing compiled yet (compile first).', output: null }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
          const res = await fetch(`${baseUrl}/api/v1/arduino/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artifact, board, port: p }),
          })

          const data = (await res.json().catch(() => null)) as
            | { success?: boolean; error?: string | null; output?: string | null }
            | null

          if (!res.ok || !data?.success) {
            return { success: false, error: data?.error || res.statusText || 'Upload failed.', output: data?.output || null }
          }

          return { success: true, error: null, output: data.output || null }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          return { success: false, error: msg || 'Upload request failed.', output: null }
        }
      },

      installCompilationLibrary: async (header, library) => {
        const h = (header || '').trim()
        const lib = (library || '').trim()
        if (!h || !lib) return

        set({ isInstallingLibrary: true, libraryInstallError: null })
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
          const res = await fetch(`${baseUrl}/api/v1/compile/install-library`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ header: h, library: lib }),
          })

          const data = (await res.json().catch(() => null)) as
            | { success?: boolean; error?: string | null }
            | null

          if (!res.ok || !data?.success) {
            set({ libraryInstallError: data?.error || res.statusText || 'Library install failed.' })
            return
          }

          // Refresh diagnostics by recompiling.
          await get().compileAndRun()
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          set({ libraryInstallError: msg || 'Library install request failed.' })
        } finally {
          set({ isInstallingLibrary: false })
        }
      },

      addPart: (part) => {
        const id = nanoid()
        const incomingAttrs = part.attrs ?? {}
        const defaults = DEFAULT_PART_ATTRS[part.type] ?? {}
        const attrs = Object.keys(incomingAttrs).length > 0 ? incomingAttrs : { ...defaults }
        const next: CircuitPart = {
          id,
          type: part.type,
          position: { x: part.position.x, y: part.position.y },
          rotate: part.rotate ?? 0,
          attrs,
        }
        set({ circuitParts: [...get().circuitParts, next] })
        return id
      },

      removePart: (id) => {
        set((state) => ({
          circuitParts: state.circuitParts.filter(p => p.id !== id),
          // Also remove any connections involving this part
          connections: state.connections.filter(
            c => c.from.partId !== id && c.to.partId !== id
          ),
          selectedPartIds: state.selectedPartIds.filter(pid => pid !== id),
        }))
      },

      updatePartsPositions: (updates) => {
        if (!updates.length) return
        const byId = new Map(updates.map((u) => [u.id, u]))
        set({
          circuitParts: get().circuitParts.map((p) => {
            const u = byId.get(p.id)
            if (!u) return p
            return { ...p, position: { x: u.x, y: u.y } }
          }),
        })
      },

      setSelectedPartIds: (ids) => {
        set({ selectedPartIds: [...new Set(ids)] })
      },

      toggleSelectedPartId: (id) => {
        const curr = get().selectedPartIds
        if (curr.includes(id)) {
          set({ selectedPartIds: curr.filter((x) => x !== id) })
        } else {
          set({ selectedPartIds: [...curr, id] })
        }
      },

      clearSelectedParts: () => {
        set({ selectedPartIds: [] })
      },

      updatePartAttrs: (id, attrs) => {
        set({
          circuitParts: get().circuitParts.map((p) =>
            p.id === id ? { ...p, attrs: { ...p.attrs, ...attrs } } : p
          ),
        })
      },

      setCircuitPartAttr: (id, key, value) => {
        set({
          circuitParts: get().circuitParts.map((p) =>
            p.id === id ? { ...p, attrs: { ...p.attrs, [key]: value } } : p
          ),
        })
      },

      addConnection: (conn) => {
        const id = nanoid()
        set({ connections: [...get().connections, { ...conn, id }] })
        return id
      },

      allocateNextWireColor: () => {
        const idx = get().nextWireColorIndex
        const color = DEFAULT_WIRE_COLOR_CYCLE[idx % DEFAULT_WIRE_COLOR_CYCLE.length]
        set({ nextWireColorIndex: idx + 1 })
        return color
      },

      removeConnection: (id) => {
        set({ connections: get().connections.filter((c) => c.id !== id) })
      },

      updateWireColor: (id, color) => {
        set({
          connections: get().connections.map((c) =>
            c.id === id ? { ...c, color } : c
          ),
        })
      },

      updateWire: (id, points) => {
        set({
          connections: get().connections.map((c) =>
            c.id === id ? { ...c, points } : c
          ),
        })
      },

      // Terminal/AI Chat actions
      addTerminalEntry: (entry) => {
        const newEntry: TerminalEntry = {
          id: nanoid(),
          timestamp: Date.now(),
          ...entry,
        }
        set({ terminalHistory: [...get().terminalHistory, newEntry] })
        return newEntry.id
      },

      clearTerminalHistory: () => {
        set({ terminalHistory: [] })
      },

      setTeacherMode: (enabled) => {
        set({ teacherMode: enabled })
        get().addTerminalEntry({
          type: 'log',
          content: enabled
            ? '🎓 Teacher Mode enabled. AI will explain concepts before providing implementations.'
            : '🔧 Builder Mode enabled. AI will focus on generating code and circuits.',
        })
      },

      undoLastAiChanges: () => {
        const snap = get().lastAiUndoSnapshot
        if (!snap) return
        set({
          code: snap.code,
          circuitParts: snap.circuitParts,
          connections: snap.connections,
          files: snap.files,
          openFilePaths: snap.openFilePaths,
          lastAiAppliedEntryId: null,
          lastAiUndoSnapshot: null,
        })
        get().addTerminalEntry({ type: 'log', content: '↩️ Undid last AI-applied changes.' })
      },

      keepLastAiChanges: () => {
        set({ lastAiAppliedEntryId: null, lastAiUndoSnapshot: null })
      },

      // Image staging
      stageImage: (imageData) => {
        set({ stagedImageData: imageData })
      },

      clearStagedImage: () => {
        set({ stagedImageData: null })
      },

      // Settings
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      applyGeneratedCircuit: (parts, newConnections) => {
        // Sensor default attrs - ensure sensors work in simulation
        const sensorDefaults: Record<string, Record<string, string>> = {
          'wokwi-dht22': { temperature: '25', humidity: '50' },
          'wokwi-dht11': { temperature: '25', humidity: '50' },
          'wokwi-hc-sr04': { distance: '100' },
          'wokwi-potentiometer': { value: '50' },
          'wokwi-slide-potentiometer': { value: '50' },
          'wokwi-ntc-temperature-sensor': { temperature: '25' },
          'wokwi-pir-motion-sensor': { motion: '0' },
          'wokwi-photoresistor-sensor': { lux: '500' },
          'wokwi-ds18b20': { temperature: '25' },
          'wokwi-gas-sensor': { gasLevel: '200' },
          'wokwi-tilt-sensor': { tilted: '0' },
        }

        // Output device default attrs - ensure visual feedback in simulation
        const outputDefaults: Record<string, Record<string, string>> = {
          'wokwi-led': { color: 'red' },
          'wokwi-rgb-led': { common: 'cathode' },
          'wokwi-servo': { horn: 'single' },
          // LCD pin mode is inferred from connections (i2c vs full)
          'wokwi-7segment': { color: 'red', common: 'cathode' },
          'wokwi-neopixel': { pixels: '8' },
          'wokwi-neopixel-matrix': { rows: '8', cols: '8' },
          'wokwi-led-ring': { pixels: '16' },
          'wokwi-neopixel-ring': { pixels: '16' },
          'wokwi-buzzer': { volume: '1' },
          'wokwi-ssd1306': { i2cAddress: '0x3C' },
        }

        const inferLcdPinsMode = (partId: string): 'full' | 'i2c' | null => {
          const pins = new Set<string>();
          for (const c of newConnections) {
            if (c.from.partId === partId) pins.add(String(c.from.pinId));
            if (c.to.partId === partId) pins.add(String(c.to.pinId));
          }

          // Parallel/"full" pins
          const fullPins = new Set([
            'RS',
            'E',
            'RW',
            'V0',
            'VSS',
            'VDD',
            'A',
            'K',
            'D0',
            'D1',
            'D2',
            'D3',
            'D4',
            'D5',
            'D6',
            'D7',
          ]);

          for (const p of pins) {
            if (fullPins.has(p)) return 'full';
          }

          // I2C pins
          if (pins.has('SDA') || pins.has('SCL')) return 'i2c';
          return null;
        }

        // Merge all component defaults
        const allDefaults = { ...sensorDefaults, ...outputDefaults }

        // Apply defaults to parts that may be missing attrs
        const partsWithDefaults = parts.map(part => {
          const typeLower = String(part.type).toLowerCase()
          const defaults = allDefaults[typeLower] || allDefaults[part.type] || {}
          let attrs = { ...defaults, ...(part.attrs || {}) }

          // Ensure LCD1602/LCD2004 pin mode matches the generated wiring.
          // If we force the wrong mode (e.g. i2c) the canvas can't attach wires to RS/E/D4..D7, etc.
          if ((typeLower === 'wokwi-lcd1602' || typeLower === 'wokwi-lcd2004' || typeLower === 'lcd1602' || typeLower === 'lcd2004') && (part.attrs == null || (part.attrs as Record<string, unknown>).pins == null)) {
            const inferred = inferLcdPinsMode(part.id)
            // Default to I2C only when we have no signal either way.
            attrs = { ...attrs, pins: inferred ?? 'i2c' }
          }

          // Return part with merged attrs, or original if no defaults or changes
          if (Object.keys(attrs).length > 0) {
            return { ...part, attrs }
          }
          return part
        })

        // Check if AI provided meaningful positions (non-zero coordinates)
        const hasAiPositions = partsWithDefaults.some(p =>
          p.position && (p.position.x !== 0 || p.position.y !== 0)
        )

        // Only apply layout algorithm if AI didn't provide positions
        // This preserves AI's intended layout when coordinates exist
        const finalParts = hasAiPositions
          ? partsWithDefaults
          : calculateCircuitLayout(partsWithDefaults, newConnections)

        // Replace current circuit with AI-generated one
        // Increment version to trigger auto-fit in canvas
        // Clear hex to stop any running simulation
        set((state) => ({
          circuitParts: finalParts,
          connections: newConnections,
          circuitGeneratedVersion: state.circuitGeneratedVersion + 1,
          hex: null,
          compiledBoard: null,
          compilationError: null,
        }))
      },

      submitCommand: async (text, imageData) => {
        const trimmed = text.trim()
        const finalImageData = imageData ?? get().stagedImageData

        if (!trimmed && !finalImageData) return

        // Clear staged image after use
        if (finalImageData) {
          set({ stagedImageData: null })
        }

        // Add user command to history
        if (trimmed) {
          get().addTerminalEntry({ type: 'cmd', content: trimmed })
        }
        if (finalImageData) {
          get().addTerminalEntry({ type: 'log', content: '📷 Image uploaded for circuit recognition' })
        }

        // Handle slash commands
        if (trimmed.startsWith('/')) {
          const cmd = trimmed.toLowerCase()
          if (cmd === '/clear') {
            set({ terminalHistory: [] })
            return
          }
          if (cmd === '/help') {
            get().addTerminalEntry({
              type: 'log',
              content: `Available commands:
/clear - Clear terminal history
/help - Show this help message
/teacher - Toggle Teacher Mode (explains concepts)
/builder - Toggle Builder Mode (direct generation)
/files - List all project files
/components - List current circuit components
/code - Show current code

Or type any prompt to generate Arduino code and circuits.
You can also upload images of physical circuits for recognition.`,
            })
            return
          }
          if (cmd === '/teacher') {
            get().setTeacherMode(true)
            return
          }
          if (cmd === '/builder') {
            get().setTeacherMode(false)
            return
          }
          if (cmd === '/files') {
            const files = get().files
            const fileList = files.map(f => `  ${f.isMain ? '📄' : '📁'} ${f.path}${f.isMain ? ' (main)' : ''}`).join('\n')
            get().addTerminalEntry({
              type: 'log',
              content: `📂 Project Files:\n${fileList || '  (no files)'}`,
            })
            return
          }
          if (cmd === '/components') {
            const parts = get().circuitParts
            const partList = parts.map(p => `  🔌 ${p.id}: ${p.type} at (${p.position.x}, ${p.position.y})`).join('\n')
            get().addTerminalEntry({
              type: 'log',
              content: `🔧 Circuit Components (${parts.length}):\n${partList || '  (no components)'}`,
            })
            return
          }
          if (cmd === '/code') {
            const code = get().code
            get().addTerminalEntry({
              type: 'log',
              content: `📝 Current Code:\n\`\`\`cpp\n${code}\n\`\`\``,
            })
            return
          }
          get().addTerminalEntry({
            type: 'error',
            content: `Unknown command: ${trimmed}. Type /help for available commands.`,
          })
          return
        }

        // Call AI generate endpoint
        set({ isAiLoading: true })
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

          // Sync state with backend for AI context
          await fetch(`${baseUrl}/api/v1/ai-tools/sync-state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              files: get().files,
              components: get().circuitParts,
              connections: get().connections,
              compilation: {
                is_compiling: get().isCompiling,
                error: get().compilationError,
                hex: get().hex,
                board: get().compiledBoard,
              },
            }),
          }).catch(() => { }) // Ignore sync errors

          // Get current circuit state for context (bi-directional awareness)
          const currentCircuit = JSON.stringify({
            parts: get().circuitParts,
            connections: get().connections,
          })

          const res = await fetch(`${baseUrl}/api/v1/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: trimmed || 'Analyze this circuit image and recreate it',
              teacher_mode: get().teacherMode,
              image_data: finalImageData || null,
              current_circuit: get().circuitParts.length > 0 ? currentCircuit : null,
            }),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => null)
            const errorMsg = errorData?.detail || res.statusText || 'Request failed'
            get().addTerminalEntry({ type: 'error', content: `Error: ${errorMsg}` })
            return
          }

          const data = await res.json()

          const action: AiAction | null =
            typeof data.action === 'string' ? (data.action as AiAction) : null

          const shouldApplyCode: boolean =
            typeof data.apply_code === 'boolean'
              ? data.apply_code
              : action
                ? (action === 'update_code' || action === 'update_both')
                : true

          const shouldApplyCircuit: boolean =
            typeof data.apply_circuit === 'boolean'
              ? data.apply_circuit
              : action
                ? (action === 'update_circuit' || action === 'update_both')
                : true

          const shouldApplyFiles: boolean =
            typeof data.apply_files === 'boolean'
              ? data.apply_files
              : action
                ? (action === 'update_code' || action === 'update_both')
                : true

          // Copilot-style checkpoint: if we are about to apply anything, capture a pre-AI snapshot.
          const willApplyAnything =
            (shouldApplyCode && !!data.code) ||
            (shouldApplyCircuit && Array.isArray(data.circuit_parts) && data.circuit_parts.length > 0) ||
            (shouldApplyFiles && Array.isArray(data.file_changes) && data.file_changes.length > 0)

          const undoSnapshot = willApplyAnything
            ? {
              code: get().code,
              circuitParts: [...get().circuitParts],
              connections: [...get().connections],
              files: get().files.map((f) => ({ ...f })),
              activeFilePath: get().activeFilePath,
              openFilePaths: [...get().openFilePaths],
            }
            : null

          let appliedSomething = false

          // Format the AI response as a log entry
          let response = ''
          if (data.explanation) {
            response += data.explanation + '\n\n'
          }

          // Only show/apply code when backend says to apply it.
          if (data.code && shouldApplyCode) {
            response += '```cpp\n' + data.code + '\n```'

            // Also update the code editor
            set({ code: data.code })

            // Update the main file content
            const mainFile = get().files.find(f => f.isMain)
            if (mainFile) {
              get().updateFileContent(mainFile.path, data.code)
            }

            appliedSomething = true
          }

          const aiEntryId = get().addTerminalEntry({ type: 'ai', content: response || 'Generated successfully.' })

          // Process file changes from AI (GitHub Copilot-like codebase modifications)
          if (shouldApplyFiles && data.file_changes && Array.isArray(data.file_changes)) {
            const fileActions: string[] = []
            for (const change of data.file_changes) {
              const { action, path, content, description } = change as {
                action: string;
                path: string;
                content?: string;
                description?: string
              }

              if (action === 'create' && path && content) {
                // Check if file already exists
                const existing = get().files.find(f => f.path === path)
                if (!existing) {
                  get().addFile(path, content, false)
                  fileActions.push(`📄 Created: ${path}${description ? ` (${description})` : ''}`)
                } else {
                  // Update existing file
                  get().updateFileContent(path, content)
                  fileActions.push(`✏️ Updated: ${path}${description ? ` (${description})` : ''}`)
                }
              } else if (action === 'update' && path && content) {
                get().updateFileContent(path, content)
                fileActions.push(`✏️ Updated: ${path}${description ? ` (${description})` : ''}`)
              } else if (action === 'delete' && path) {
                get().deleteFile(path)
                fileActions.push(`🗑️ Deleted: ${path}`)
              }
            }

            if (fileActions.length > 0) {
              appliedSomething = true
            }

            if (fileActions.length > 0) {
              get().addTerminalEntry({
                type: 'log',
                content: `📂 File changes applied:\n${fileActions.join('\n')}`,
              })
            }
          }


          // Apply generated circuit parts and connections to canvas
          if (shouldApplyCircuit && data.circuit_parts && Array.isArray(data.circuit_parts)) {
            // Debug: Log raw AI response
            console.log('[AI Circuit Debug] Raw parts:', data.circuit_parts)
            console.log('[AI Circuit Debug] Raw connections:', data.connections)

            // Create a mapping from AI-generated IDs to actual generated IDs
            // This is critical for connections to work properly!
            const idMap = new Map<string, string>()

            // Also keep a mapping from AI part id -> normalized part type, for pin normalization.
            const aiTypeMap = new Map<string, string>()

            const newParts: CircuitPart[] = data.circuit_parts.map((p: { id: string; type: string; x: number; y: number; attrs?: Record<string, string> }) => {
              const newId = nanoid()
              // Map the AI's ID (e.g., "arduino1") to our generated ID
              if (p.id) {
                idMap.set(p.id, newId)
              }

              const normalizedType = normalizeFundiPartType(p.type)
              if (p.id) {
                aiTypeMap.set(p.id, normalizedType)
              }
              return {
                id: newId,
                type: normalizedType,
                position: { x: p.x || 0, y: p.y || 0 },
                rotate: 0,
                attrs: p.attrs || {},
              }
            })

            // Helper function to get wire color based on signal type or pin name
            const getWireColor = (conn: { color?: string; signal_type?: string; source_pin: string; target_pin: string }): string => {
              // Use AI-provided color if available
              if (conn.color) return conn.color

              // Signal type color map
              const signalColors: Record<string, string> = {
                power: '#ef4444',    // Red
                ground: '#000000',   // Black
                digital: '#3b82f6',  // Blue
                analog: '#22c55e',   // Green
                pwm: '#eab308',      // Yellow
                i2c: '#8b5cf6',      // Purple
                spi: '#f97316',      // Orange
                uart: '#06b6d4',     // Cyan
              }

              if (conn.signal_type && signalColors[conn.signal_type.toLowerCase()]) {
                return signalColors[conn.signal_type.toLowerCase()]
              }

              // Infer from pin names
              const pins = [conn.source_pin, conn.target_pin].map(p => p.toUpperCase())
              for (const pin of pins) {
                if (['VCC', '5V', '3V3', '3.3V', 'VIN'].includes(pin)) return signalColors.power
                if (['GND', 'GROUND'].includes(pin)) return signalColors.ground
                if (pin.startsWith('A')) return signalColors.analog
                if (pin.includes('SDA') || pin.includes('SCL')) return signalColors.i2c
                if (['MOSI', 'MISO', 'SCK', 'SS'].some(s => pin.includes(s))) return signalColors.spi
                if (pin.includes('TX') || pin.includes('RX')) return signalColors.uart
              }

              // Fallback to allocated color
              return get().allocateNextWireColor()
            }

            // Helper function to normalize pin names from AI output to exact wokwi-elements format
            const normalizePinName = (pin: string, partType: string): string => {
              const p = pin.toString().trim()
              const pUpper = p.toUpperCase()
              const partLower = partType.toLowerCase()

              // ========================
              // ESP32 GPIO pins
              // ========================
              if (partLower.includes('esp32')) {
                // GPIO13 → 13, IO13 → 13, D13 → 13
                const gpioMatch = p.match(/^(?:gpio|io|d)?(\d+)$/i)
                if (gpioMatch) return gpioMatch[1]
                // I2C defaults for ESP32: SDA → 21, SCL → 22
                if (/^sda$/i.test(p)) return '21'
                if (/^scl$/i.test(p)) return '22'
                // Power pins
                if (/^(3v3?|3\.3v)$/i.test(p)) return '3V3'
                if (/^(5v|vin)$/i.test(p)) return 'VIN'
                if (/^gnd$/i.test(p)) return 'GND.1'
              }

              // ========================
              // LED pins: normalize anode/cathode variations
              // ========================
              if (partLower.includes('led') && !partLower.includes('neopixel') && !partLower.includes('bar') && !partLower.includes('ring') && !partLower.includes('matrix')) {
                if (/^(a|anode|\+|positive|vcc|an)$/i.test(p)) return 'A'
                if (/^(c|k|cathode|-|negative|gnd|cat)$/i.test(p)) return 'C'
              }

              // ========================
              // NeoPixel / WS2812 / Addressable LEDs
              // ========================
              if (partLower.includes('neopixel') || partLower.includes('ws2812')) {
                if (/^(din|data|in|signal)$/i.test(p)) return 'DIN'
                if (/^(dout|do|out)$/i.test(p)) return 'DOUT'
                if (/^(vcc|5v|\+|vdd)$/i.test(p)) return 'VCC'
                if (/^(gnd|vss|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // Arduino digital/analog pins
              // ========================
              if (partLower.includes('arduino') || partLower.includes('uno') || partLower.includes('nano') || partLower.includes('mega')) {
                // Digital: D13 → 13, PIN13 → 13, also handles mega pins 22-53
                const digitalMatch = p.match(/^(?:d|pin)?(\d{1,2})$/i)
                if (digitalMatch) return digitalMatch[1]
                // Analog: A0, A1, etc. - keep as-is but uppercase
                const analogMatch = p.match(/^a(\d)$/i)
                if (analogMatch) return `A${analogMatch[1]}`
                // Power pins
                if (/^(5v|vcc)$/i.test(p)) return '5V'
                if (/^(3v3?|3\.3v)$/i.test(p)) return '3.3V'
                if (/^vin$/i.test(p)) return 'VIN'
                // GND pins - normalize to GND.1
                if (/^gnd$/i.test(p)) return 'GND.1'
                if (/^gnd\.?[123]$/i.test(p)) return p.toUpperCase().replace('.', '.')
              }

              // ========================
              // LCD1602 / LCD2004 displays
              // ========================
              if (partLower.includes('lcd1602') || partLower.includes('lcd2004') || partLower.includes('lcd')) {
                // I2C mode pins
                if (/^sda$/i.test(p)) return 'SDA'
                if (/^scl$/i.test(p)) return 'SCL'
                // Parallel mode pins
                if (/^(rs|register.?select)$/i.test(p)) return 'RS'
                if (/^(e|en|enable)$/i.test(p)) return 'E'
                if (/^(rw|read.?write)$/i.test(p)) return 'RW'
                if (/^(v0|contrast|vo)$/i.test(p)) return 'V0'
                if (/^(vss|gnd)$/i.test(p)) return 'VSS'
                if (/^(vdd|vcc|5v)$/i.test(p)) return 'VDD'
                if (/^(led\+|a|backlight\+)$/i.test(p)) return 'A'
                if (/^(led-|k|backlight-)$/i.test(p)) return 'K'
                // Data pins D0-D7
                const dataMatch = p.match(/^d?([0-7])$/i)
                if (dataMatch) return `D${dataMatch[1]}`
              }

              // ========================
              // SSD1306 / OLED displays (I2C)
              // ========================
              if (partLower.includes('ssd1306') || partLower.includes('oled')) {
                if (/^sda$/i.test(p)) return 'SDA'
                if (/^scl$/i.test(p)) return 'SCL'
                if (/^(vcc|vdd|3v3?|5v|\+)$/i.test(p)) return 'VCC'
                if (/^(gnd|ground|vss|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // DHT22 / DHT11 temperature sensors
              // ========================
              if (partLower.includes('dht')) {
                if (/^(data|sda|out|signal|dat)$/i.test(p)) return 'SDA'
                if (/^(vcc|vdd|\+|5v|3v3?)$/i.test(p)) return 'VCC'
                if (/^(gnd|ground|-)$/i.test(p)) return 'GND'
                if (/^nc$/i.test(p)) return 'NC'
              }

              // ========================
              // HC-SR04 Ultrasonic sensor
              // ========================
              if (partLower.includes('hc-sr04') || partLower.includes('sr04') || partLower.includes('ultrasonic')) {
                if (/^(trig|trigger)$/i.test(p)) return 'TRIG'
                if (/^echo$/i.test(p)) return 'ECHO'
                if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // Potentiometer
              // ========================
              if (partLower.includes('potentiometer')) {
                if (/^(sig|signal|wiper|out|w)$/i.test(p)) return 'SIG'
                if (/^(vcc|\+|5v|cw)$/i.test(p)) return 'VCC'
                if (/^(gnd|-|ccw)$/i.test(p)) return 'GND'
              }

              // ========================
              // Slide potentiometer
              // ========================
              if (partLower.includes('slide') && partLower.includes('potentiometer')) {
                if (/^(sig|signal|wiper|out)$/i.test(p)) return 'SIG'
                if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // Pushbutton
              // ========================
              if (partLower.includes('pushbutton') || partLower.includes('button')) {
                // Wokwi uses 1.l, 1.r, 2.l, 2.r for 4-pin buttons
                if (/^(1|left|l|in|a)$/i.test(p)) return '1.l'
                if (/^(2|right|r|out|b)$/i.test(p)) return '2.l'
                // Already correct formats - normalize case
                if (/^[12]\.[lr]$/i.test(p)) return p.toLowerCase()
              }

              // ========================
              // Resistor pins
              // ========================
              if (partLower.includes('resistor')) {
                if (/^(1|one|left|l|a)$/i.test(p)) return '1'
                if (/^(2|two|right|r|b)$/i.test(p)) return '2'
              }

              // ========================
              // Buzzer pins
              // ========================
              if (partLower.includes('buzzer')) {
                if (/^(1|signal|sig|s|\+|positive|vcc)$/i.test(p)) return '1'
                if (/^(2|gnd|ground|-|negative)$/i.test(p)) return '2'
              }

              // ========================
              // Servo pins
              // ========================
              if (partLower.includes('servo')) {
                if (/^(pwm|signal|sig|s|pulse|ctrl|control)$/i.test(p)) return 'PWM'
                if (/^(v\+|vcc|5v|power|\+)$/i.test(p)) return 'V+'
                if (/^(gnd|ground|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // PIR Motion sensor
              // ========================
              if (partLower.includes('pir') || partLower.includes('motion')) {
                if (/^(out|signal|sig|data)$/i.test(p)) return 'OUT'
                if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // Photoresistor / LDR
              // ========================
              if (partLower.includes('photoresistor') || partLower.includes('ldr')) {
                if (/^(ao|out|signal|a0)$/i.test(p)) return 'AO'
                if (/^(do|digital)$/i.test(p)) return 'DO'
                if (/^(vcc|5v|\+)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // IR Receiver
              // ========================
              if (partLower.includes('ir') && partLower.includes('receiver')) {
                if (/^(out|signal|data)$/i.test(p)) return 'OUT'
                if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // Membrane Keypad
              // ========================
              if (partLower.includes('keypad') || partLower.includes('membrane')) {
                // Row pins R1-R4
                const rowMatch = p.match(/^r(\d)$/i)
                if (rowMatch) return `R${rowMatch[1]}`
                // Column pins C1-C4
                const colMatch = p.match(/^c(\d)$/i)
                if (colMatch) return `C${colMatch[1]}`
              }

              // ========================
              // Rotary Encoder (KY-040)
              // ========================
              if (partLower.includes('rotary') || partLower.includes('encoder') || partLower.includes('ky-040')) {
                if (/^(clk|clock|a)$/i.test(p)) return 'CLK'
                if (/^(dt|data|b)$/i.test(p)) return 'DT'
                if (/^(sw|switch|button)$/i.test(p)) return 'SW'
                if (/^(vcc|\+|5v)$/i.test(p)) return 'VCC'
                if (/^(gnd|-)$/i.test(p)) return 'GND'
              }

              // ========================
              // MPU6050 accelerometer/gyroscope
              // ========================
              if (partLower.includes('mpu6050') || partLower.includes('accelerometer') || partLower.includes('gyro')) {
                if (/^sda$/i.test(p)) return 'SDA'
                if (/^scl$/i.test(p)) return 'SCL'
                if (/^(vcc|3v3?)$/i.test(p)) return 'VCC'
                if (/^gnd$/i.test(p)) return 'GND'
                if (/^int$/i.test(p)) return 'INT'
              }

              // ========================
              // Generic I2C devices fallback
              // ========================
              if (/^sda$/i.test(p)) return 'SDA'
              if (/^scl$/i.test(p)) return 'SCL'

              // ========================
              // Generic power pins fallback
              // ========================
              if (/^(vcc|5v|3v3?|vin|\+)$/i.test(p)) return pUpper.replace('3V3', '3.3V')
              if (/^(gnd|ground|vss|-)$/i.test(p)) return 'GND'

              return p // Return as-is if no normalization needed
            }

            // Get part type from AI parts for normalization
            const getPartTypeFromAIParts = (aiPartId: string): string => {
              return aiTypeMap.get(aiPartId) || ''
            }

            const newConnections: Connection[] = (data.connections || []).map((c: { source_part: string; source_pin: string; target_part: string; target_pin: string; color?: string; signal_type?: string; label?: string }) => {
              // Translate AI-generated part IDs to our actual generated IDs
              const fromPartId = idMap.get(c.source_part) || c.source_part
              const toPartId = idMap.get(c.target_part) || c.target_part

              // Normalize pin names based on part types
              const sourcePartType = getPartTypeFromAIParts(c.source_part)
              const targetPartType = getPartTypeFromAIParts(c.target_part)
              const normalizedSourcePin = normalizePinName(c.source_pin, sourcePartType)
              const normalizedTargetPin = normalizePinName(c.target_pin, targetPartType)

              console.log('[AI Circuit] Creating connection:', {
                aiSource: c.source_part,
                aiSourcePin: c.source_pin,
                normalizedSourcePin,
                aiTarget: c.target_part,
                aiTargetPin: c.target_pin,
                normalizedTargetPin,
              })

              return {
                id: nanoid(),
                from: { partId: fromPartId, pinId: normalizedSourcePin },
                to: { partId: toPartId, pinId: normalizedTargetPin },
                color: getWireColor(c),
              }
            })

            // Debug: Log ID mapping and final connections
            console.log('[AI Circuit Debug] ID mapping:', Object.fromEntries(idMap))
            console.log('[AI Circuit Debug] Final connections:', newConnections.map(c => ({
              from: `${c.from.partId}:${c.from.pinId}`,
              to: `${c.to.partId}:${c.to.pinId}`,
            })))

            get().applyGeneratedCircuit(newParts, newConnections)
            get().addTerminalEntry({
              type: 'log',
              content: `✨ Applied ${newParts.length} components and ${newConnections.length} connections to canvas`,
            })

            appliedSomething = true
          }

          // If anything was applied, save the snapshot so the user can keep/undo like Copilot.
          if (appliedSomething && undoSnapshot) {
            set({ lastAiAppliedEntryId: aiEntryId, lastAiUndoSnapshot: undoSnapshot })
          } else {
            // No changes were applied; clear any previous AI checkpoint to avoid confusing UI.
            set({ lastAiAppliedEntryId: null, lastAiUndoSnapshot: null })
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          get().addTerminalEntry({ type: 'error', content: `Error: ${msg}` })
        } finally {
          set({ isAiLoading: false })
        }
      },
    }),
    {
      name: 'fundi-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
        settings: state.settings,
      }),
    }
  )
)

// Temporal store type for undo/redo
type TemporalState = {
  pastStates: Partial<AppState>[]
  futureStates: Partial<AppState>[]
  undo: () => void
  redo: () => void
  clear: () => void
}

// Create a separate temporal store that wraps the main store's state
const temporalHistory: { past: Partial<AppState>[]; future: Partial<AppState>[] } = {
  past: [],
  future: [],
}

const MAX_HISTORY = 50

// Helper to get trackable state
const getTrackableState = (): Partial<AppState> => {
  const state = useAppStore.getState()
  return {
    circuitParts: [...state.circuitParts],
    connections: [...state.connections],
    code: state.code,
    files: state.files.map((f) => ({ ...f })),
    activeFilePath: state.activeFilePath,
    openFilePaths: [...state.openFilePaths],
  }
}

// Helper to check if state changed
const statesEqual = (a: Partial<AppState>, b: Partial<AppState>): boolean => {
  return (
    JSON.stringify(a.circuitParts) === JSON.stringify(b.circuitParts) &&
    JSON.stringify(a.connections) === JSON.stringify(b.connections) &&
    a.code === b.code &&
    JSON.stringify(a.files) === JSON.stringify(b.files) &&
    a.activeFilePath === b.activeFilePath &&
    JSON.stringify(a.openFilePaths) === JSON.stringify(b.openFilePaths)
  )
}

// Subscribe to store changes and track history
let lastTrackedState = getTrackableState()
useAppStore.subscribe((state) => {
  const currentTrackable = {
    circuitParts: state.circuitParts,
    connections: state.connections,
    code: state.code,
    files: state.files,
    activeFilePath: state.activeFilePath,
    openFilePaths: state.openFilePaths,
  }

  if (!statesEqual(lastTrackedState, currentTrackable)) {
    temporalHistory.past.push(lastTrackedState)
    if (temporalHistory.past.length > MAX_HISTORY) {
      temporalHistory.past.shift()
    }
    temporalHistory.future = [] // Clear redo stack on new change
    lastTrackedState = { ...currentTrackable }
  }
})

// Undo function
export const undo = (): void => {
  if (temporalHistory.past.length === 0) return

  const previousState = temporalHistory.past.pop()!
  temporalHistory.future.push(getTrackableState())

  useAppStore.setState({
    circuitParts: previousState.circuitParts || [],
    connections: previousState.connections || [],
    code: previousState.code || '',
    files: (previousState.files as ProjectFile[] | undefined) || [],
    activeFilePath: (previousState.activeFilePath as string | null | undefined) ?? null,
    openFilePaths: (previousState.openFilePaths as string[] | undefined) || [],
  })
  lastTrackedState = { ...previousState }
}

// Redo function  
export const redo = (): void => {
  if (temporalHistory.future.length === 0) return

  const nextState = temporalHistory.future.pop()!
  temporalHistory.past.push(getTrackableState())

  useAppStore.setState({
    circuitParts: nextState.circuitParts || [],
    connections: nextState.connections || [],
    code: nextState.code || '',
    files: (nextState.files as ProjectFile[] | undefined) || [],
    activeFilePath: (nextState.activeFilePath as string | null | undefined) ?? null,
    openFilePaths: (nextState.openFilePaths as string[] | undefined) || [],
  })
  lastTrackedState = { ...nextState }
}

// Check if undo is available
export const canUndo = (): boolean => temporalHistory.past.length > 0

// Check if redo is available
export const canRedo = (): boolean => temporalHistory.future.length > 0

type TrackableSnapshot = {
  circuitParts: CircuitPart[]
  connections: Connection[]
  code: string
}

const summarizeDiff = (from: TrackableSnapshot, to: TrackableSnapshot): string => {
  const aLines = String(from.code || '').split(/\r?\n/)
  const bLines = String(to.code || '').split(/\r?\n/)

  let start = 0
  while (start < aLines.length && start < bLines.length && aLines[start] === bLines[start]) {
    start++
  }

  let endA = aLines.length - 1
  let endB = bLines.length - 1
  while (endA >= start && endB >= start && aLines[endA] === bLines[endB]) {
    endA--
    endB--
  }

  const removedLines = endA >= start ? (endA - start + 1) : 0
  const addedLines = endB >= start ? (endB - start + 1) : 0

  const fromPartIds = new Set((from.circuitParts || []).map(p => p.id))
  const toPartIds = new Set((to.circuitParts || []).map(p => p.id))
  let partsRemoved = 0
  let partsAdded = 0
  for (const id of fromPartIds) if (!toPartIds.has(id)) partsRemoved++
  for (const id of toPartIds) if (!fromPartIds.has(id)) partsAdded++

  const fromConnIds = new Set((from.connections || []).map(c => c.id))
  const toConnIds = new Set((to.connections || []).map(c => c.id))
  let wiresRemoved = 0
  let wiresAdded = 0
  for (const id of fromConnIds) if (!toConnIds.has(id)) wiresRemoved++
  for (const id of toConnIds) if (!fromConnIds.has(id)) wiresAdded++

  const codeChanged = (addedLines + removedLines) > 0
  const circuitChanged = (partsAdded + partsRemoved + wiresAdded + wiresRemoved) > 0

  const pieces: string[] = []
  if (codeChanged) pieces.push(`Code +${addedLines}/-${removedLines} lines`)
  if (circuitChanged) pieces.push(`Canvas parts +${partsAdded}/-${partsRemoved}, wires +${wiresAdded}/-${wiresRemoved}`)
  if (pieces.length === 0) return 'No changes'
  return pieces.join(' • ')
}

export const getUndoPreview = (): string | null => {
  if (temporalHistory.past.length === 0) return null
  const previousState = temporalHistory.past[temporalHistory.past.length - 1] as TrackableSnapshot
  return summarizeDiff(getTrackableState() as TrackableSnapshot, previousState)
}

export const getRedoPreview = (): string | null => {
  if (temporalHistory.future.length === 0) return null
  const nextState = temporalHistory.future[temporalHistory.future.length - 1] as TrackableSnapshot
  return summarizeDiff(getTrackableState() as TrackableSnapshot, nextState)
}

// Clear history
export const clearHistory = (): void => {
  temporalHistory.past = []
  temporalHistory.future = []
  lastTrackedState = getTrackableState()
}
