"use client"

import { useCallback, useMemo, useRef, useState } from 'react'
import { Code2, LayoutGrid, MessageSquare } from 'lucide-react'
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'

import ArduinoNode from '@/components/nodes/ArduinoNode'
import WokwiPartNode from '@/components/nodes/WokwiPartNode'
import WireLayer from '@/components/WireLayer'
import { WiringProvider, useWiring } from '@/store/WiringContext'
import type { WirePoint } from '@/types/wire'
import { cn } from '@/utils/cn'

type MobileTabKey = 'chat' | 'code' | 'sim'

const nodeTypes = {
  arduino: ArduinoNode,
  wokwi: WokwiPartNode,
} satisfies NodeTypes

function SimulationCanvas() {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [pinPositions, setPinPositions] = useState<Map<string, WirePoint>>(
    () => new Map()
  )

  const { state, startWire, completeWire, cancelWire, updatePreview } =
    useWiring()

  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect() ?? null
  }, [])

  const handlePinClick = useCallback(
    (nodeId: string, pinId: string, position: WirePoint) => {
      setPinPositions((prev) => {
        const next = new Map(prev)
        next.set(`${nodeId}:${pinId}`, position)
        return next
      })

      if (state.mode === 'creating') {
        const active = state.activeWireId
        const activeWire = active
          ? state.wires.find((w) => w.id === active)
          : null

        // Clicking the same pin again cancels (simple, predictable UX)
        if (
          activeWire &&
          activeWire.sourcePin.nodeId === nodeId &&
          activeWire.sourcePin.pinId === pinId
        ) {
          cancelWire()
          return
        }

        completeWire({ nodeId, pinId }, position)
        return
      }

      startWire({ nodeId, pinId }, position)
    },
    [state.mode, state.activeWireId, state.wires, startWire, completeWire, cancelWire]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (state.mode !== 'creating') return
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      updatePreview({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    },
    [state.mode, updatePreview]
  )

  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([
    {
      id: 'arduino-1',
      type: 'arduino',
      position: { x: 0, y: 0 },
      data: {
        onPinClick: handlePinClick,
        getCanvasRect,
      },
    },
  ])

  // Update node data when handlers change (e.g. when wiring mode changes)
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'arduino' || node.type === 'wokwi') {
          return {
            ...node,
            data: {
              ...node.data,
              onPinClick: handlePinClick,
              getCanvasRect,
            },
          }
        }
        return node
      })
    )
  }, [handlePinClick, getCanvasRect, setNodes])

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

  return (
    <div
      ref={canvasRef}
      className={cn(
        'relative h-full w-full',
        state.mode === 'creating' ? 'cursor-crosshair' : 'cursor-default'
      )}
      onMouseMove={handleMouseMove}
    >
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
      </ReactFlow>

      <WireLayer pinPositions={pinPositions} containerRef={canvasRef} />
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<MobileTabKey>('chat')

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
              <PanelHeader icon={Code2} title="Code Workbench" />
              <PanelBody>Monaco Editor</PanelBody>
            </section>
          )}
          {activeTab === 'sim' && (
            <section className="relative flex h-full w-full flex-col overflow-hidden">
              <PanelHeader icon={LayoutGrid} title="Simulation Canvas" />
              <div className="min-h-0 flex-1">
                <WiringProvider>
                  <SimulationCanvas />
                </WiringProvider>
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
          <PanelHeader icon={Code2} title="Code Workbench" />
          <PanelBody>Monaco Editor</PanelBody>
        </section>

        <section className="relative flex h-full w-[40%] flex-col overflow-hidden">
          <PanelHeader icon={LayoutGrid} title="Simulation Canvas" />
          <div className="min-h-0 flex-1">
            <WiringProvider>
              <SimulationCanvas />
            </WiringProvider>
          </div>
        </section>
      </div>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
}) {
  return (
    <header className="flex h-11 items-center gap-2 border-b border-slate-800 px-3">
      <Icon className="h-4 w-4 text-slate-300" aria-hidden={true} />
      <span className="text-sm font-medium text-slate-200">{title}</span>
    </header>
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
