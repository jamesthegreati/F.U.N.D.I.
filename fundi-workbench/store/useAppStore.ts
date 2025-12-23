import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type CircuitPart = {
  id: string
  type: string
  position: {
    x: number
    y: number
  }
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

export type AppState = {
  code: string
  circuitParts: CircuitPart[]
  circuitConnections: CircuitConnection[]
  connections: Connection[]
  isRunning: boolean

  updateCode: (newCode: string) => void
  updateCircuit: (nodes: unknown, edges: unknown) => void
  toggleSimulation: () => void

  addConnection: (conn: Omit<Connection, 'id'>) => string
  removeConnection: (id: string) => void
  updateWireColor: (id: string, color: string) => void
  setConnectionPoints: (id: string, points: Connection['points']) => void
}

const defaultCode =
  'void setup() { pinMode(13, OUTPUT); } void loop() { digitalWrite(13, HIGH); delay(1000); digitalWrite(13, LOW); delay(1000); }'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toCircuitParts(nodes: unknown): CircuitPart[] {
  if (!Array.isArray(nodes)) return []

  return nodes
    .map((node) => {
      if (!isRecord(node)) return null

      const id = typeof node.id === 'string' ? node.id : ''
      const type = typeof node.type === 'string' ? node.type : 'unknown'
      const position = isRecord(node.position) ? node.position : {}
      const x = typeof position.x === 'number' ? position.x : 0
      const y = typeof position.y === 'number' ? position.y : 0

      if (!id) return null

      return {
        id,
        type,
        position: { x, y },
      } satisfies CircuitPart
    })
    .filter((part): part is CircuitPart => Boolean(part))
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
    .filter((conn): conn is CircuitConnection => Boolean(conn))
}

export const useAppStore = create<AppState>((set, get) => ({
  code: defaultCode,
  circuitParts: [],
  circuitConnections: [],
  connections: [],
  isRunning: false,

  updateCode: (newCode) => {
    set({ code: newCode })
  },

  updateCircuit: (nodes, edges) => {
    const circuitParts = toCircuitParts(nodes)
    const circuitConnections = toCircuitConnections(edges)

    set({ circuitParts, circuitConnections })
  },

  toggleSimulation: () => {
    set({ isRunning: !get().isRunning })
  },

  addConnection: (conn) => {
    const id = nanoid()
    set({ connections: [...get().connections, { ...conn, id }] })
    return id
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

  setConnectionPoints: (id, points) => {
    set({
      connections: get().connections.map((c) =>
        c.id === id ? { ...c, points } : c
      ),
    })
  },
}))
