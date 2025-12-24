import { create } from 'zustand'
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

export type AppState = {
  code: string
  diagramJson: string
  circuitParts: CircuitPart[]
  circuitConnections: CircuitConnection[]
  connections: Connection[]
  isRunning: boolean

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

export const useAppStore = create<AppState>((set, get) => ({
  code: defaultCode,
  diagramJson: '',
  circuitParts: [],
  circuitConnections: [],
  connections: [],
  isRunning: false,

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

  updateCode: (newCode) => {
    set({ code: newCode })
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
      const res = await fetch(`${baseUrl}/api/v1/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: get().code, board }),
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

  applyGeneratedCircuit: (parts, newConnections) => {
    // Replace current circuit with AI-generated one
    set({
      circuitParts: parts,
      connections: newConnections,
    })
  },

  submitCommand: async (text, imageData) => {
    const trimmed = text.trim()
    if (!trimmed && !imageData) return

    // Add user command to history
    if (trimmed) {
      get().addTerminalEntry({ type: 'cmd', content: trimmed })
    }
    if (imageData) {
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
          image_data: imageData || null,
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
      }
      
      get().addTerminalEntry({ type: 'ai', content: response || 'Generated successfully.' })

      // Apply generated circuit parts and connections to canvas
      if (data.circuit_parts && Array.isArray(data.circuit_parts)) {
        const newParts: CircuitPart[] = data.circuit_parts.map((p: { id: string; type: string; x: number; y: number; attrs?: Record<string, string> }) => ({
          id: p.id || nanoid(),
          type: p.type,
          position: { x: p.x || 0, y: p.y || 0 },
          rotate: 0,
          attrs: p.attrs || {},
        }))
        
        const newConnections: Connection[] = (data.connections || []).map((c: { source_part: string; source_pin: string; target_part: string; target_pin: string }) => ({
          id: nanoid(),
          from: { partId: c.source_part, pinId: c.source_pin },
          to: { partId: c.target_part, pinId: c.target_pin },
          color: get().allocateNextWireColor(),
        }))
        
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
}))
