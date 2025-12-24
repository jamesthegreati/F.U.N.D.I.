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
            style: { stroke: 'var(--electric)', strokeWidth: 2.5 },
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
            stroke: 'var(--electric)',
            strokeWidth: edge.id === selectedEdge ? 3.5 : 2.5,
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
          style: { stroke: 'var(--electric)', strokeWidth: 2.5 },
        }}
        connectionLineStyle={{ stroke: 'var(--electric)', strokeWidth: 2.5 }}
      >
        <Background color="var(--brass-dim)" variant={BackgroundVariant.Dots} />
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
    <div className="h-screen overflow-hidden bg-void text-parchment scanlines">
      {/* Decorative Background Elements */}
      <div className="fixed -left-20 -top-20 h-64 w-64 rounded-full bg-brass/5 blur-[100px]" />
      <div className="fixed -right-20 -bottom-20 h-96 w-96 rounded-full bg-electric/5 blur-[120px]" />

      {/* Header - Refined Alchemist Aesthetic */}
      <header className="relative z-50 flex h-[64px] items-center justify-between border-b border-brass/20 bg-panel/40 px-8 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-brass/20 blur-sm animate-pulse" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-brass/40 bg-void shadow-[inset_0_0_10px_rgba(212,175,55,0.2)]">
              <span className="font-heading text-xl font-bold text-brass">F</span>
            </div>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-[0.2em] text-brass drop-shadow-[0_0_14px_rgba(212,175,55,0.18)]">
              FUNDI
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brass-dim">
              <span>Industrial Alchemist</span>
              <span className="h-1 w-1 rounded-full bg-brass/30" />
              <span>IoT Workbench</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] text-brass-dim">SYSTEM STATUS</span>
              <span className="font-mono text-[10px] text-electric">OPERATIONAL</span>
            </div>
            <div className="h-8 w-[1px] bg-brass/20" />
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] text-brass-dim">LATENCY</span>
              <span className="font-mono text-[10px] text-parchment/60">12ms</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile (<768px): stacked panels with tabs */}
      <div className="flex h-[calc(100vh-64px)] flex-col md:hidden">
        <div className="flex border-b border-brass/20 bg-panel">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.key === activeTab

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium',
                  'border-r border-brass/20 last:border-r-0 transition-all',
                  isActive
                    ? 'bg-panel text-brass border-b-2 border-b-brass'
                    : 'bg-void/50 text-brass-dim hover:text-brass'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden={true} />
                <span className="font-ui">{tab.label}</span>
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
            <section className="flex h-full w-full flex-col overflow-hidden bg-void">
              {compilationError && (
                <ConsoleLine text={compilationError} />
              )}
              <div className="min-h-0 flex-1 p-3">
                <textarea
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  spellCheck={false}
                  className={cn(
                    'h-full w-full resize-none glass-panel rounded-xl p-4',
                    'font-mono text-sm leading-6 text-parchment',
                    'focus:outline-none focus:ring-2 focus:ring-electric/50',
                    'placeholder:text-brass-dim/40'
                  )}
                  placeholder="// Write your Arduino code here..."
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
      <div className="hidden h-[calc(100vh-64px)] md:grid md:grid-cols-[1fr] md:gap-0">
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

          {/* Bottom - Code Editor "The Logbook" (Collapsible) */}
          <div
            className={cn(
              'relative z-40 flex flex-col border-t border-brass/20 bg-panel/60 backdrop-blur-xl transition-all duration-500 ease-in-out',
              codeEditorCollapsed ? 'h-[50px]' : 'h-[350px]'
            )}
          >
            <button
              type="button"
              onClick={() => setCodeEditorCollapsed((v) => !v)}
              className="flex h-[50px] items-center justify-between px-6 hover:bg-brass/5 transition-colors"
              aria-expanded={!codeEditorCollapsed}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-2 w-2 rounded-full transition-all duration-300",
                  codeEditorCollapsed ? "bg-brass/40" : "bg-electric animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                )} />
                <Code2 className="h-4 w-4 text-brass" aria-hidden={true} />
                <span className="font-heading text-xs font-bold tracking-[0.2em] text-brass">
                  THE LOGBOOK
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-brass-dim uppercase tracking-widest">
                  {codeEditorCollapsed ? "Expand Editor" : "Collapse Editor"}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-brass-dim transition-transform duration-500',
                    codeEditorCollapsed ? '-rotate-180' : 'rotate-0'
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
                <div className="min-h-0 flex-1 p-4">
                  <div className="relative h-full w-full">
                    {/* Decorative corner accents for the editor */}
                    <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-brass/30" />
                    <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-brass/30" />
                    <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-brass/30" />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-brass/30" />
                    
                    <textarea
                      value={code}
                      onChange={(e) => updateCode(e.target.value)}
                      spellCheck={false}
                      className={cn(
                        'h-full w-full resize-none bg-void/40 p-6',
                        'font-mono text-sm leading-7 text-parchment/90',
                        'focus:outline-none focus:ring-1 focus:ring-brass/20',
                        'placeholder:text-brass-dim/30 border border-brass/10 rounded-sm'
                      )}
                      placeholder="// Write your Arduino code here..."
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

function PanelHeader({
  icon: Icon,
  title,
  right,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  right?: React.ReactNode
}) {
  return (
    <header className="flex h-11 items-center gap-2 border-b border-slate-800 px-3">
      <Icon className="h-4 w-4 text-slate-300" aria-hidden={true} />
      <span className="text-sm font-medium text-slate-200">{title}</span>
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </header>
  )
}

function RunButton({
  isCompiling,
  onRun,
}: {
  isCompiling: boolean
  onRun: () => void
}) {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={isCompiling}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium',
        isCompiling
          ? 'bg-slate-900 text-slate-300'
          : 'bg-slate-950 text-slate-100 hover:bg-slate-900'
      )}
      title="Compile and run"
    >
      {isCompiling ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden={true} />
      ) : (
        <Play className="h-4 w-4" aria-hidden={true} />
      )}
      <span>Run</span>
    </button>
  )
}

function ConsoleLine({ text }: { text: string }) {
  return (
    <div className="border-b border-brass/20 bg-panel/40 px-4 py-2">
      <pre className="whitespace-pre-wrap break-words font-mono text-xs font-medium text-error">
        {text}
      </pre>
    </div>
  )
}

function PanelBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4">
      <div className="text-center font-ui text-sm font-medium text-brass-dim">
        {children}
      </div>
    </div>
  )
}
