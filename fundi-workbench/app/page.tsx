"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Code2, LayoutGrid, Loader2, MessageSquare, Play } from 'lucide-react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useStore,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'

import ArduinoNode from '@/components/nodes/ArduinoNode'
import WokwiPartNode from '@/components/nodes/WokwiPartNode'
import ComponentLibrary, { FUNDI_PART_MIME } from '@/components/ComponentLibrary'
import ControlDeck from '@/components/ControlDeck'
import SelectionOverlay from '@/components/SelectionOverlay'
import WiringLayer from '@/components/WiringLayer'
import { useDiagramSync } from '@/hooks/useDiagramSync'
import { useSimulation } from '@/hooks/useSimulation'
import { useAppStore } from '@/store/useAppStore'
import type { WirePoint } from '@/types/wire'
import { cn } from '@/utils/cn'

type MobileTabKey = 'chat' | 'code' | 'sim'

const nodeTypes = {
  arduino: ArduinoNode,
  wokwi: WokwiPartNode,
} satisfies NodeTypes

function translatePoints(points: WirePoint[] | undefined, delta: WirePoint): WirePoint[] | undefined {
  if (!points?.length) return points
  return points.map((p) => ({ x: p.x + delta.x, y: p.y + delta.y }))
}

function SimulationCanvasInner({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) {

  const addPart = useAppStore((s) => s.addPart)
  const updatePartsPositions = useAppStore((s) => s.updatePartsPositions)
  const selectedPartIds = useAppStore((s) => s.selectedPartIds)
  const setSelectedPartIds = useAppStore((s) => s.setSelectedPartIds)
  const toggleSelectedPartId = useAppStore((s) => s.toggleSelectedPartId)
  const connections = useAppStore((s) => s.connections)
  const updateWire = useAppStore((s) => s.updateWire)

  useDiagramSync()

  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect() ?? null
  }, [])

  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])

  // Seed a default part once.
  useEffect(() => {
    if (nodes.length) return
    const id = addPart({ type: 'arduino-uno', position: { x: 0, y: 0 } })
    setNodes([
      {
        id,
        type: 'wokwi',
        position: { x: 0, y: 0 },
        data: {
          getCanvasRect,
          partType: 'arduino-uno',
        },
        selected: true,
      },
    ])
    setSelectedPartIds([id])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update node data when handlers change (e.g. when wiring mode changes)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'arduino' || node.type === 'wokwi') {
          return {
            ...node,
            data: {
              ...node.data,
              getCanvasRect,
            },
          }
        }
        return node
      })
    )
  }, [getCanvasRect, setNodes])

  // Keep ReactFlow selection in sync with Zustand selection.
  useEffect(() => {
    const selectedSet = new Set(selectedPartIds)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: selectedSet.has(n.id) })))
  }, [selectedPartIds, setNodes])

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'default',
            animated: false,
            style: { stroke: 'var(--neon-cyan)', strokeWidth: 2, filter: 'drop-shadow(0 0 4px var(--neon-cyan))' },
          },
          eds
        )
      ),
    [setEdges]
  )

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
  }, [])

  const onNodeClick = useCallback(
    (e: React.MouseEvent, node: Node) => {
      // Avoid selecting while wiring starts from a pin.
      if ((e.target as HTMLElement | null)?.closest?.('[data-fundi-pin="true"]')) return

      if (e.shiftKey) {
        toggleSelectedPartId(node.id)
      } else {
        setSelectedPartIds([node.id])
      }
    },
    [setSelectedPartIds, toggleSelectedPartId]
  )

  // Group-drag engine (60fps): transient node positions + transient wire waypoint overrides.
  const dragStartNodesRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const dragStartWirePointsRef = useRef<Map<string, WirePoint[] | undefined>>(new Map())
  const dragWireModeRef = useRef<Map<string, 'both' | 'one'>>(new Map())
  const [wirePointOverrides, setWirePointOverrides] = useState<Map<string, WirePoint[] | undefined> | null>(null)

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // If dragged node isn't selected, make it the only selection.
      if (!selectedPartIds.includes(node.id)) {
        setSelectedPartIds([node.id])
      }

      const selectedSet = new Set(selectedPartIds.includes(node.id) ? selectedPartIds : [node.id])

      dragStartNodesRef.current = new Map(
        nodes
          .filter((n) => selectedSet.has(n.id))
          .map((n) => [n.id, { x: n.position.x, y: n.position.y }])
      )

      dragStartWirePointsRef.current = new Map()
      dragWireModeRef.current = new Map()
      for (const c of connections) {
        if (!c.points?.length) continue
        const fromMoving = selectedSet.has(c.from.partId)
        const toMoving = selectedSet.has(c.to.partId)
        if (!fromMoving && !toMoving) continue
        dragStartWirePointsRef.current.set(c.id, c.points)
        dragWireModeRef.current.set(c.id, fromMoving && toMoving ? 'both' : 'one')
      }
    },
    [connections, nodes, selectedPartIds, setSelectedPartIds]
  )

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const start = dragStartNodesRef.current.get(node.id)
      if (!start) return
      const delta = { x: node.position.x - start.x, y: node.position.y - start.y }

      // Move all selected nodes by delta.
      setNodes((nds) =>
        nds.map((n) => {
          const s = dragStartNodesRef.current.get(n.id)
          if (!s) return n
          return { ...n, position: { x: s.x + delta.x, y: s.y + delta.y } }
        })
      )

      // Maintain wire waypoint structure when both endpoints move, otherwise clear waypoints.
      const overrides = new Map<string, WirePoint[] | undefined>()
      for (const [wireId, basePoints] of dragStartWirePointsRef.current.entries()) {
        const mode = dragWireModeRef.current.get(wireId)
        if (!mode) continue
        if (mode === 'both') {
          overrides.set(wireId, translatePoints(basePoints, delta))
        } else {
          overrides.set(wireId, undefined)
        }
      }
      setWirePointOverrides(overrides.size ? overrides : null)
    },
    [setNodes]
  )

  const onNodeDragStop = useCallback(() => {
    // Commit node positions to store.
    const updates: Array<{ id: string; x: number; y: number }> = []
    for (const [id] of dragStartNodesRef.current.entries()) {
      const n = nodes.find((nn) => nn.id === id)
      if (!n) continue
      updates.push({ id, x: n.position.x, y: n.position.y })
    }
    updatePartsPositions(updates)

    // Commit waypoint updates/clears.
    if (wirePointOverrides) {
      for (const [wireId, pts] of wirePointOverrides.entries()) {
        updateWire(wireId, pts)
      }
    }

    dragStartNodesRef.current = new Map()
    dragStartWirePointsRef.current = new Map()
    dragWireModeRef.current = new Map()
    setWirePointOverrides(null)
  },
    [nodes, updatePartsPositions, updateWire, wirePointOverrides]
  )

  // Drag-to-add: drop handler converts screen -> flow coords using current transform.
  const transform = useStore((s) => s.transform as [number, number, number])
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const container = canvasRef.current
      if (!container) return

      const partType = e.dataTransfer.getData(FUNDI_PART_MIME)
      if (!partType) return

      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const p = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const [tx, ty, zoom] = transform
      const flow = { x: (p.x - tx) / zoom, y: (p.y - ty) / zoom }

      const id = addPart({ type: partType, position: { x: flow.x, y: flow.y } })
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: 'wokwi',
          position: flow,
          data: { getCanvasRect, partType },
          selected: true,
        },
      ])

      setSelectedPartIds([id])
    },
    [addPart, getCanvasRect, setNodes, setSelectedPartIds, transform]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(FUNDI_PART_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  return (
    <div
      ref={canvasRef}
      className={cn('relative h-full w-full', 'cursor-default')}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ComponentLibrary />

      <SelectionOverlay containerRef={canvasRef} />

      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: 'var(--neon-cyan)',
            strokeWidth: edge.id === selectedEdge ? 3.5 : 2,
            filter: 'drop-shadow(0 0 4px var(--neon-cyan))',
          },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        fitView
        className="h-full w-full"
        style={{ cursor: 'inherit' }}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: { stroke: 'var(--neon-cyan)', strokeWidth: 2, filter: 'drop-shadow(0 0 4px var(--neon-cyan))' },
        }}
        connectionLineStyle={{ stroke: 'var(--neon-cyan)', strokeWidth: 2, filter: 'drop-shadow(0 0 4px var(--neon-cyan))' }}
      >
        <Background color="rgba(0, 255, 245, 0.08)" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />

        <WiringLayer
          containerRef={canvasRef}
          wirePointOverrides={wirePointOverrides ?? undefined}
        />
      </ReactFlow>
    </div>
  )
}

function SimulationCanvas() {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  return (
    <ReactFlowProvider>
      <SimulationCanvasInner canvasRef={canvasRef} />
    </ReactFlowProvider>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<MobileTabKey>('chat')

  const code = useAppStore((s) => s.code)
  const updateCode = useAppStore((s) => s.updateCode)
  const compileAndRun = useAppStore((s) => s.compileAndRun)
  const isCompiling = useAppStore((s) => s.isCompiling)
  const compilationError = useAppStore((s) => s.compilationError)
  const hex = useAppStore((s) => s.hex)
  const compiledBoard = useAppStore((s) => s.compiledBoard)

  const {
    run: simRun,
    pause: simPause,
    stop: simStop,
    isRunning: simIsRunning,
  } = useSimulation(hex, compiledBoard ?? '')

  useEffect(() => {
    if (!hex || !compiledBoard) return
    if (isCompiling) return
    if (compilationError) return
    if (simIsRunning) return
    simRun()
  }, [compiledBoard, compilationError, hex, isCompiling, simIsRunning, simRun])

  const tabs = useMemo(
    () =>
      [
        { key: 'chat' as const, label: 'Chat', icon: MessageSquare },
        { key: 'code' as const, label: 'Code', icon: Code2 },
        { key: 'sim' as const, label: 'Sim', icon: LayoutGrid },
      ],
    []
  )

  const [codeEditorCollapsed, setCodeEditorCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-void text-neon-cyan crt-container">
      {/* Ambient Glow Effects */}
      <div className="fixed left-0 top-0 h-96 w-96 rounded-full bg-neon-cyan/5 blur-[120px] animate-float-drift" />
      <div className="fixed right-0 bottom-0 h-96 w-96 rounded-full bg-neon-magenta/5 blur-[120px] animate-float-drift" style={{ animationDelay: '2s' }} />

      {/* Header - Neon Foundry Aesthetic */}
      <header className="relative z-50 flex h-[72px] items-center justify-between border-b-2 border-neon-cyan/20 backdrop-foundry px-8 foundry-panel">
        <div className="flex items-center gap-6 stagger-item">
          <div className="relative">
            <div className="absolute -inset-2 rounded-lg bg-neon-cyan/20 blur-md animate-pulse-glow" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-steel-light to-steel-dark border-2 border-neon-cyan/40 shadow-glow-cyan">
              <span className="font-heading text-2xl font-black text-neon-cyan glow-cyan">F</span>
            </div>
          </div>
          <div>
            <h1 className="font-heading text-3xl font-black tracking-[0.25em] text-neon-cyan glow-cyan chromatic-text">
              F.U.N.D.I.
            </h1>
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-neon-cyan/50">
              <span className="font-bold">Neon Foundry</span>
              <span className="h-1 w-1 rounded-full bg-neon-cyan/30 animate-pulse" />
              <span>IoT Workbench</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-6 md:flex stagger-item" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-end">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neon-cyan/40">System</span>
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-neon-green glow-cyan">Operational</span>
            </div>
            <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-neon-cyan/30 to-transparent" />
            <div className="flex flex-col items-end">
              <span className="font-mono text-[9px] uppercase tracking-widest text-neon-cyan/40">Latency</span>
              <span className="font-mono text-xs font-bold text-neon-cyan/70">8ms</span>
            </div>
            <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-neon-cyan/30 to-transparent" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-neon-green status-glow" style={{ color: 'var(--neon-green)' }} />
              <span className="font-mono text-xs uppercase tracking-wider text-neon-green">Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile (<768px): stacked panels with tabs */}
      <div className="flex h-[calc(100vh-72px)] flex-col md:hidden">
        <div className="flex border-b-2 border-neon-cyan/20 bg-steel-dark">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon
            const isActive = tab.key === activeTab

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 px-4 py-4 text-sm font-bold uppercase tracking-wider font-heading',
                  'border-r-2 border-neon-cyan/20 last:border-r-0 transition-all duration-300 stagger-item',
                  isActive
                    ? 'bg-steel text-neon-cyan border-b-4 border-b-neon-cyan shadow-glow-cyan'
                    : 'bg-steel-dark text-neon-cyan/40 hover:text-neon-cyan/70 hover:bg-steel/50'
                )}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <Icon className={cn("h-5 w-5", isActive && "filter drop-shadow-[0_0_4px_currentColor]")} aria-hidden={true} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex h-full min-h-0 flex-1">
          {activeTab === 'chat' && (
            <section className="flex h-full w-full flex-col overflow-hidden">
              <PanelBody>Chat Interface Coming Soon</PanelBody>
            </section>
          )}
          {activeTab === 'code' && (
            <section className="flex h-full w-full flex-col overflow-hidden bg-deep-void">
              {compilationError && (
                <ConsoleLine text={compilationError} />
              )}
              <div className="min-h-0 flex-1 p-4">
                <textarea
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  spellCheck={false}
                  className="h-full w-full resize-none terminal-input rounded-lg p-6 text-sm leading-7"
                  placeholder="// Initialize your embedded system code..."
                />
              </div>
            </section>
          )}
          {activeTab === 'sim' && (
            <section className="relative flex h-full w-full flex-col overflow-hidden bg-void">
              <div className="min-h-0 flex-1">
                <SimulationCanvas />
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Desktop (>=768px): The Holy Trinity Bento Grid Layout */}
      <div className="hidden h-[calc(100vh-72px)] md:grid md:grid-cols-[1fr] md:gap-0">
        {/* Center - Workbench + Code Editor */}
        <div className="flex flex-col overflow-hidden">
          {/* Top - The Workbench (React Flow) */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <SimulationCanvas />
            
            {/* Floating ControlDeck */}
            <ControlDeck
              isCompiling={isCompiling}
              compilationError={compilationError}
              onRun={() => void compileAndRun()}
              hasProgram={Boolean(hex && compiledBoard)}
              isRunning={simIsRunning}
              onPause={simPause}
              onStop={simStop}
            />
          </div>

          {/* Bottom - Code Editor "The Terminal" (Collapsible) */}
          <div
            className={cn(
              'relative z-40 flex flex-col border-t-2 border-neon-cyan/20 backdrop-foundry transition-all duration-500 ease-out foundry-panel',
              codeEditorCollapsed ? 'h-[56px]' : 'h-[380px]'
            )}
          >
            <button
              type="button"
              onClick={() => setCodeEditorCollapsed((v) => !v)}
              className="flex h-[56px] items-center justify-between px-8 hover:bg-neon-cyan/5 transition-all duration-300 group"
              aria-expanded={!codeEditorCollapsed}
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "h-3 w-3 rounded-sm transition-all duration-500 border-2",
                  codeEditorCollapsed 
                    ? "bg-steel-light border-neon-cyan/30" 
                    : "bg-neon-cyan border-neon-cyan shadow-glow-cyan status-glow"
                )} style={{ color: 'var(--neon-cyan)' }} />
                <Code2 className="h-5 w-5 text-neon-cyan filter drop-shadow-[0_0_4px_currentColor]" aria-hidden={true} />
                <span className="font-heading text-sm font-black tracking-[0.3em] text-neon-cyan uppercase chromatic-text">
                  Terminal Editor
                </span>
              </div>
              <div className="flex items-center gap-5">
                <span className="font-mono text-[10px] text-neon-cyan/50 uppercase tracking-[0.2em] group-hover:text-neon-cyan/80 transition-colors">
                  {codeEditorCollapsed ? "Expand" : "Minimize"}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-neon-cyan transition-all duration-500 filter drop-shadow-[0_0_4px_currentColor]',
                    codeEditorCollapsed ? 'rotate-180' : 'rotate-0'
                  )}
                  aria-hidden={true}
                />
              </div>
            </button>

            {!codeEditorCollapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {compilationError && (
                  <ConsoleLine text={compilationError} />
                )}
                <div className="min-h-0 flex-1 p-6">
                  <div className="relative h-full w-full">
                    {/* Corner Brackets */}
                    <div className="absolute -left-2 -top-2 h-6 w-6 border-l-2 border-t-2 border-neon-cyan/40" />
                    <div className="absolute -right-2 -top-2 h-6 w-6 border-r-2 border-t-2 border-neon-cyan/40" />
                    <div className="absolute -bottom-2 -left-2 h-6 w-6 border-b-2 border-l-2 border-neon-cyan/40" />
                    <div className="absolute -bottom-2 -right-2 h-6 w-6 border-b-2 border-r-2 border-neon-cyan/40" />
                    
                    <textarea
                      value={code}
                      onChange={(e) => updateCode(e.target.value)}
                      spellCheck={false}
                      className="h-full w-full resize-none terminal-input rounded p-6 text-sm leading-7"
                      placeholder="// Initialize your embedded system code..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ConsoleLine({ text }: { text: string }) {
  return (
    <div className="border-b-2 border-danger/30 bg-steel-dark/95 px-6 py-3 backdrop-foundry">
      <pre className="whitespace-pre-wrap break-words font-mono text-xs font-medium text-danger filter drop-shadow-[0_0_6px_currentColor]">
        {text}
      </pre>
    </div>
  )
}

function PanelBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4">
      <div className="text-center font-ui text-sm font-medium text-neon-cyan/60">
        {children}
      </div>
    </div>
  )
}
