"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Code2, LayoutGrid, Loader2, MessageSquare, Play } from 'lucide-react'
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
            style: { stroke: '#22c55e', strokeWidth: 2.5 },
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
            stroke: edge.id === selectedEdge ? '#10b981' : '#22c55e',
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
          style: { stroke: '#22c55e', strokeWidth: 2.5 },
        }}
        connectionLineStyle={{ stroke: '#22c55e', strokeWidth: 2.5 }}
      >
        <Background color="#99b3ec" variant={BackgroundVariant.Dots} />
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
    pinStates,
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

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Mobile (<768px): stacked panels with tabs */}
      <div className="flex h-full flex-col md:hidden">
        <div className="flex border-b border-slate-800">
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
                  'border-r border-slate-800 last:border-r-0',
                  isActive
                    ? 'bg-slate-900 text-slate-100'
                    : 'bg-slate-950 text-slate-300'
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
            <section className="flex h-full w-full flex-col overflow-hidden">
              <PanelHeader icon={MessageSquare} title="Chat Interface" />
              <PanelBody>Chat Area</PanelBody>
            </section>
          )}
          {activeTab === 'code' && (
            <section className="flex h-full w-full flex-col overflow-hidden">
              <PanelHeader
                icon={Code2}
                title="Code Workbench"
                right={
                  <RunButton
                    isCompiling={isCompiling}
                    onRun={() => void compileAndRun()}
                  />
                }
              />
              {compilationError && (
                <ConsoleLine text={compilationError} />
              )}
              <div className="min-h-0 flex-1 p-3">
                <textarea
                  value={code}
                  onChange={(e) => updateCode(e.target.value)}
                  spellCheck={false}
                  className={cn(
                    'h-full w-full resize-none rounded-lg border border-slate-800 bg-slate-950 p-3',
                    'font-mono text-[12px] leading-5 text-slate-100',
                    'focus:outline-none focus:ring-2 focus:ring-slate-700'
                  )}
                />
              </div>
            </section>
          )}
          {activeTab === 'sim' && (
            <section className="relative flex h-full w-full flex-col overflow-hidden">
              <PanelHeader
                icon={LayoutGrid}
                title="Simulation Canvas"
                right={
                  <SimControls
                    hasProgram={Boolean(hex && compiledBoard)}
                    isRunning={simIsRunning}
                    onRun={simRun}
                    onPause={simPause}
                    onStop={simStop}
                    pin13={pinStates[13]}
                  />
                }
              />
              <div className="min-h-0 flex-1">
                <SimulationCanvas />
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Desktop (>=768px): fixed 3-column layout */}
      <div className="hidden h-full md:flex">
        <section className="flex h-full w-[25%] flex-col overflow-hidden border-r border-slate-800">
          <PanelHeader icon={MessageSquare} title="Chat Interface" />
          <PanelBody>Chat Area</PanelBody>
        </section>

        <section className="flex h-full w-[35%] flex-col overflow-hidden border-r border-slate-800">
          <PanelHeader
            icon={Code2}
            title="Code Workbench"
            right={
              <RunButton
                isCompiling={isCompiling}
                onRun={() => void compileAndRun()}
              />
            }
          />
          {compilationError && (
            <ConsoleLine text={compilationError} />
          )}
          <div className="min-h-0 flex-1 p-3">
            <textarea
              value={code}
              onChange={(e) => updateCode(e.target.value)}
              spellCheck={false}
              className={cn(
                'h-full w-full resize-none rounded-lg border border-slate-800 bg-slate-950 p-3',
                'font-mono text-[12px] leading-5 text-slate-100',
                'focus:outline-none focus:ring-2 focus:ring-slate-700'
              )}
            />
          </div>
        </section>

        <section className="relative flex h-full w-[40%] flex-col overflow-hidden">
          <PanelHeader
            icon={LayoutGrid}
            title="Simulation Canvas"
            right={
              <SimControls
                hasProgram={Boolean(hex && compiledBoard)}
                isRunning={simIsRunning}
                onRun={simRun}
                onPause={simPause}
                onStop={simStop}
                pin13={pinStates[13]}
              />
            }
          />
          <div className="min-h-0 flex-1">
            <SimulationCanvas />
          </div>
        </section>
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
    <div className="border-b border-slate-800 bg-slate-950 px-3 py-2">
      <pre className="whitespace-pre-wrap break-words text-xs font-medium text-red-300">
        {text}
      </pre>
    </div>
  )
}

function SimControls({
  hasProgram,
  isRunning,
  onRun,
  onPause,
  onStop,
  pin13,
}: {
  hasProgram: boolean
  isRunning: boolean
  onRun: () => void
  onPause: () => void
  onStop: () => void
  pin13: boolean | undefined
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-[11px] font-medium text-slate-400 sm:block">
        Pin 13: <span className="text-slate-200">{pin13 ? 'HIGH' : 'LOW'}</span>
      </div>
      <button
        type="button"
        onClick={isRunning ? onPause : onRun}
        disabled={!hasProgram}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-slate-700 px-2.5 py-1.5 text-sm font-medium',
          !hasProgram
            ? 'bg-slate-950 text-slate-500'
            : 'bg-slate-950 text-slate-100 hover:bg-slate-900'
        )}
        title={!hasProgram ? 'Compile first' : isRunning ? 'Pause' : 'Run'}
      >
        {isRunning ? (
          <span className="text-xs">Pause</span>
        ) : (
          <span className="text-xs">Run</span>
        )}
      </button>
      <button
        type="button"
        onClick={onStop}
        disabled={!hasProgram}
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-slate-700 px-2.5 py-1.5 text-sm font-medium',
          !hasProgram
            ? 'bg-slate-950 text-slate-500'
            : 'bg-slate-950 text-slate-100 hover:bg-slate-900'
        )}
        title={!hasProgram ? 'Compile first' : 'Stop'}
      >
        <span className="text-xs">Stop</span>
      </button>
    </div>
  )
}

function PanelBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4">
      <div className="text-center text-sm font-medium text-slate-400">
        {children}
      </div>
    </div>
  )
}
