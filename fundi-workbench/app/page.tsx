"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Code2, LayoutGrid, Bot, Settings } from 'lucide-react'
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
import FloatingControlBar from '@/components/FloatingControlBar'
import StatusBadge from '@/components/StatusBadge'
import SelectionOverlay from '@/components/SelectionOverlay'
import WiringLayer from '@/components/WiringLayer'
import { TerminalPanel } from '@/components/terminal'
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
      className={cn('relative h-full w-full bg-pro-bg', 'cursor-default')}
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
            stroke: 'var(--pro-text-muted)',
            strokeWidth: edge.id === selectedEdge ? 3 : 2,
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
        style={{ cursor: 'inherit', background: 'transparent' }}
        defaultEdgeOptions={{
          type: 'default',
          animated: false,
          style: { stroke: 'var(--pro-text-muted)', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: 'var(--pro-accent)', strokeWidth: 2 }}
      >
        <Background color="#D4D4D8" variant={BackgroundVariant.Dots} gap={20} size={1} />
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
  const [activeTab, setActiveTab] = useState<MobileTabKey>('sim')

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
    serialOutput,
    clearSerialOutput,
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
        { key: 'chat' as const, label: 'AI', icon: Bot },
        { key: 'code' as const, label: 'Code', icon: Code2 },
        { key: 'sim' as const, label: 'Circuit', icon: LayoutGrid },
      ],
    []
  )

  const [codeEditorCollapsed, setCodeEditorCollapsed] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden bg-pro-bg text-pro-text">
      {/* Header - Minimal Command Center Style (48px) */}
      <header className="relative z-50 flex h-12 items-center justify-between border-b border-pro-border bg-pro-surface/80 px-4 backdrop-blur-md">
        {/* Left - Project Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pro-accent">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-pro-text">
              FUNDI
            </h1>
            <p className="text-[10px] text-pro-text-muted">
              IoT Workbench
            </p>
          </div>
        </div>

        {/* Center - Device Status */}
        <div className="hidden md:block">
          <StatusBadge deviceName="Nano Banana Pro" isConnected={true} />
        </div>

        {/* Right - User/Settings */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-pro-text-muted hover:bg-pro-bg-subtle hover:text-pro-text transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" aria-hidden={true} />
          </button>
        </div>
      </header>

      {/* Mobile (<768px): stacked panels with tabs */}
      <div className="flex h-[calc(100vh-48px)] flex-col md:hidden">
        <div className="flex border-b border-pro-border bg-pro-surface">
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
                  'border-r border-pro-border last:border-r-0 transition-all',
                  isActive
                    ? 'bg-pro-surface text-pro-accent border-b-2 border-b-pro-accent'
                    : 'bg-pro-bg text-pro-text-muted hover:text-pro-text'
                )}
              >
                <Icon className="h-4 w-4" aria-hidden={true} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex h-full min-h-0 flex-1">
          {activeTab === 'chat' && (
            <section className="flex h-full w-full flex-col overflow-hidden bg-zinc-950">
              <TerminalPanel
                serialOutput={serialOutput}
                onClearSerial={clearSerialOutput}
                isSimulationRunning={simIsRunning}
              />
            </section>
          )}
          {activeTab === 'code' && (
            <section className="flex h-full w-full flex-col overflow-hidden bg-pro-bg">
              {compilationError && (
                <ConsoleLine text={compilationError} />
              )}
              <div className="min-h-0 flex-1 p-3">
                <textarea
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  spellCheck={false}
                  className={cn(
                    'h-full w-full resize-none pro-card p-4',
                    'font-mono text-sm leading-6 text-pro-text',
                    'focus:outline-none focus:ring-2 focus:ring-pro-accent/30',
                    'placeholder:text-pro-text-subtle'
                  )}
                  placeholder="// Write your Arduino code here..."
                />
              </div>
            </section>
          )}
          {activeTab === 'sim' && (
            <section className="relative flex h-full w-full flex-col overflow-hidden bg-pro-bg">
              <div className="min-h-0 flex-1">
                <SimulationCanvas />
              </div>
              {/* Mobile Floating Control Bar */}
              <FloatingControlBar
                isCompiling={isCompiling}
                compilationError={compilationError}
                onRun={() => void compileAndRun()}
                hasProgram={Boolean(hex && compiledBoard)}
                isRunning={simIsRunning}
                onPause={simPause}
                onStop={simStop}
              />
            </section>
          )}
        </div>
      </div>

      {/* Desktop (>=768px): Command Center Grid Layout */}
      <div className="hidden h-[calc(100vh-48px)] md:grid md:grid-cols-[60%_40%]">
        {/* Left (60%) - The Workbench (React Flow) */}
        <div className="relative flex flex-col overflow-hidden border-r border-pro-border">
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <SimulationCanvas />
            
            {/* Floating Control Bar */}
            <FloatingControlBar
              isCompiling={isCompiling}
              compilationError={compilationError}
              onRun={() => void compileAndRun()}
              hasProgram={Boolean(hex && compiledBoard)}
              isRunning={simIsRunning}
              onPause={simPause}
              onStop={simStop}
            />
          </div>
        </div>

        {/* Right (40%) - Vertical Split: Code Editor + Terminal/AI */}
        <div className="flex flex-col overflow-hidden bg-pro-bg">
          {/* Top - Code Editor "The Logbook" (Collapsible) */}
          <div
            className={cn(
              'relative flex flex-col border-b border-pro-border bg-pro-surface transition-all duration-300 ease-in-out',
              codeEditorCollapsed ? 'h-11' : 'flex-1'
            )}
          >
            <button
              type="button"
              onClick={() => setCodeEditorCollapsed((v) => !v)}
              className="flex h-11 shrink-0 items-center justify-between px-4 hover:bg-pro-bg-subtle transition-colors border-b border-pro-border"
              aria-expanded={!codeEditorCollapsed}
            >
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 text-pro-text-muted" aria-hidden={true} />
                <span className="text-sm font-medium text-pro-text">
                  Code Editor
                </span>
                {!codeEditorCollapsed && (
                  <span className="rounded-full bg-pro-bg-subtle px-2 py-0.5 text-[10px] font-medium text-pro-text-muted">
                    sketch.ino
                  </span>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-pro-text-muted transition-transform duration-300',
                  codeEditorCollapsed ? 'rotate-180' : 'rotate-0'
                )}
                aria-hidden={true}
              />
            </button>

            {!codeEditorCollapsed && (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {compilationError && (
                  <ConsoleLine text={compilationError} />
                )}
                <div className="min-h-0 flex-1 p-3">
                  <textarea
                    value={code}
                    onChange={(e) => updateCode(e.target.value)}
                    spellCheck={false}
                    className={cn(
                      'h-full w-full resize-none rounded-lg bg-pro-bg p-4',
                      'font-mono text-sm leading-6 text-pro-text',
                      'border border-pro-border',
                      'focus:outline-none focus:ring-2 focus:ring-pro-accent/20 focus:border-pro-accent/30',
                      'placeholder:text-pro-text-subtle'
                    )}
                    placeholder="// Write your Arduino code here..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom - Terminal Panel (Serial + AI) */}
          <div
            className={cn(
              'flex flex-col overflow-hidden',
              codeEditorCollapsed ? 'flex-1' : 'h-[280px]'
            )}
          >
            <TerminalPanel
              serialOutput={serialOutput}
              onClearSerial={clearSerialOutput}
              isSimulationRunning={simIsRunning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ConsoleLine({ text }: { text: string }) {
  return (
    <div className="border-b border-pro-error/20 bg-pro-error/5 px-4 py-2">
      <pre className="whitespace-pre-wrap break-words font-mono text-xs font-medium text-pro-error">
        {text}
      </pre>
    </div>
  )
}
