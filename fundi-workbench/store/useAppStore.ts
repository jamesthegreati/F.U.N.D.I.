import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type CircuitPart = {
  id: string
  /** Wokwi part key (e.g. 'arduino-uno') or element type (e.g. 'wokwi-arduino-uno') */
  type: string
  position: {
    x: number
    y: number
  }
  rotate?: number
  attrs?: Record<string, string>
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
  hex: string | null
  compiledBoard: string | null

  nextWireColorIndex: number

  selectedPartIds: string[]

  // Terminal/AI Chat state
  terminalHistory: TerminalEntry[]
  isAiLoading: boolean

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

  addConnection: (conn: Omit<Connection, 'id'>) => string
  allocateNextWireColor: () => string
  removeConnection: (id: string) => void
  updateWireColor: (id: string, color: string) => void
  updateWire: (id: string, points: { x: number; y: number }[] | undefined) => void

  // Terminal/AI Chat actions
  submitCommand: (text: string, imageData?: string) => Promise<void>
  addTerminalEntry: (entry: Omit<TerminalEntry, 'id' | 'timestamp'>) => void
  clearTerminalHistory: () => void
  setTeacherMode: (enabled: boolean) => void

  // Image staging actions
  stageImage: (imageData: string) => void
  clearStagedImage: () => void

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void

  // Apply AI-generated circuit to canvas
  applyGeneratedCircuit: (parts: CircuitPart[], connections: Connection[]) => void
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
        attrs: {},
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
      hex: null,
      compiledBoard: null,

      nextWireColorIndex: 0,

      selectedPartIds: [],

      // Terminal/AI Chat state
      terminalHistory: [],
      isAiLoading: false,

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

        set({ isCompiling: true, compilationError: null })

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
            | { success?: boolean; hex?: string | null; error?: string | null }
            | null

          if (!res.ok) {
            set({
              compilationError: (data && (data.error || (!data.success ? 'Compilation failed.' : null))) || res.statusText,
              hex: null,
              compiledBoard: null,
            })
            return
          }

          if (!data?.success || !data.hex) {
            set({ compilationError: data?.error || 'Compilation failed.', hex: null, compiledBoard: null })
            return
          }

          set({ hex: data.hex, compiledBoard: board, compilationError: null })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          set({ compilationError: msg || 'Compilation request failed.', hex: null, compiledBoard: null })
        } finally {
          set({ isCompiling: false })
        }
      },

      addPart: (part) => {
        const id = nanoid()
        const next: CircuitPart = {
          id,
          type: part.type,
          position: { x: part.position.x, y: part.position.y },
          rotate: part.rotate ?? 0,
          attrs: part.attrs ?? {},
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
        // Replace current circuit with AI-generated one
        set({
          circuitParts: parts,
          connections: newConnections,
        })
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

          // Format the AI response as a log entry
          let response = ''
          if (data.explanation) {
            response += data.explanation + '\n\n'
          }
          if (data.code) {
            response += '```cpp\n' + data.code + '\n```'
            // Also update the code editor
            set({ code: data.code })
            // Update the main file content
            const mainFile = get().files.find(f => f.isMain)
            if (mainFile) {
              get().updateFileContent(mainFile.path, data.code)
            }
          }

          get().addTerminalEntry({ type: 'ai', content: response || 'Generated successfully.' })

          // Process file changes from AI (GitHub Copilot-like codebase modifications)
          if (data.file_changes && Array.isArray(data.file_changes)) {
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
              get().addTerminalEntry({
                type: 'log',
                content: `📂 File changes applied:\n${fileActions.join('\n')}`,
              })
            }
          }


          // Apply generated circuit parts and connections to canvas
          if (data.circuit_parts && Array.isArray(data.circuit_parts)) {
            // Debug: Log raw AI response
            console.log('[AI Circuit Debug] Raw parts:', data.circuit_parts)
            console.log('[AI Circuit Debug] Raw connections:', data.connections)

            // Create a mapping from AI-generated IDs to actual generated IDs
            // This is critical for connections to work properly!
            const idMap = new Map<string, string>()

            const newParts: CircuitPart[] = data.circuit_parts.map((p: { id: string; type: string; x: number; y: number; attrs?: Record<string, string> }) => {
              const newId = nanoid()
              // Map the AI's ID (e.g., "arduino1") to our generated ID
              if (p.id) {
                idMap.set(p.id, newId)
              }
              return {
                id: newId,
                type: p.type,
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

              // LED pins: normalize anode/cathode variations
              if (partLower.includes('led') && !partLower.includes('neopixel') && !partLower.includes('bar') && !partLower.includes('ring') && !partLower.includes('matrix')) {
                if (/^(a|anode|\+|positive|vcc|an)$/i.test(p)) return 'A'
                if (/^(c|k|cathode|-|negative|gnd|cat)$/i.test(p)) return 'C'
              }

              // Arduino digital pins: strip D/PIN prefix (D13 -> 13, PIN13 -> 13)
              if (partLower.includes('arduino') || partLower.includes('uno') || partLower.includes('nano') || partLower.includes('mega')) {
                const digitalMatch = p.match(/^(?:d|pin)?(\d+)$/i)
                if (digitalMatch) return digitalMatch[1]

                // Keep GND pins as-is or normalize to GND.1
                if (/^gnd$/i.test(p)) return 'GND.1'
              }

              // Resistor pins
              if (partLower.includes('resistor')) {
                if (/^(1|one|left|l)$/i.test(p)) return '1'
                if (/^(2|two|right|r)$/i.test(p)) return '2'
              }

              // Buzzer pins
              if (partLower.includes('buzzer')) {
                if (/^(1|signal|sig|s|\+|positive|vcc)$/i.test(p)) return '1'
                if (/^(2|gnd|ground|-|negative)$/i.test(p)) return '2'
              }

              // Servo pins
              if (partLower.includes('servo')) {
                if (/^(pwm|signal|sig|s|pulse)$/i.test(p)) return 'PWM'
                if (/^(v\+|vcc|5v|power|\+)$/i.test(p)) return 'V+'
                if (/^(gnd|ground|-)$/i.test(p)) return 'GND'
              }

              return p // Return as-is if no normalization needed
            }

            // Get part type from AI parts for normalization
            const getPartTypeFromAIParts = (aiPartId: string): string => {
              const part = data.circuit_parts.find((p: { id: string; type: string }) => p.id === aiPartId)
              return part?.type || ''
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
