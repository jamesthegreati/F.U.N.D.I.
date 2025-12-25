"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  FileCode,
  FolderOpen,
  FolderTree,
  Layers,
  Maximize2,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  Square,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Github,
} from 'lucide-react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'
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
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react'

import ArduinoNode from '@/components/nodes/ArduinoNode'
import WokwiPartNode from '@/components/nodes/WokwiPartNode'
import ComponentLibrary, { FUNDI_PART_MIME } from '@/components/ComponentLibrary'
import StatusBadge from '@/components/StatusBadge'
import SelectionOverlay from '@/components/SelectionOverlay'
import WiringLayer from '@/components/WiringLayer'
import { TerminalPanel } from '@/components/terminal'
import { useDiagramSync } from '@/hooks/useDiagramSync'
import { useSimulation } from '@/hooks/useSimulation'
import { useAppStore, type ProjectFile } from '@/store/useAppStore'
import type { WirePoint } from '@/types/wire'
import { cn } from '@/utils/cn'

const nodeTypes = {
  arduino: ArduinoNode,
  wokwi: WokwiPartNode,
} satisfies NodeTypes

function translatePoints(points: WirePoint[] | undefined, delta: WirePoint): WirePoint[] | undefined {
  if (!points?.length) return points
  return points.map((p) => ({ x: p.x + delta.x, y: p.y + delta.y }))
}

/* ============================================
   Canvas Toolbar Overlay
   ============================================ */
function CanvasToolbar({ 
  onZoomIn, 
  onZoomOut, 
  onFitView,
  onResetView,
}: { 
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onResetView: () => void
}) {
  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-1 glass-panel rounded-lg p-1">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <div className="mx-1 h-5 w-px bg-ide-border" />
      <button
        type="button"
        onClick={onFitView}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
        title="Fit View"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onResetView}
        className="flex h-8 w-8 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
        title="Reset View"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}

/* ============================================
   Unified Action Bar (Command Center)
   ============================================ */
function UnifiedActionBar({
  isCompiling,
  compilationError,
  onRun,
  hasProgram,
  isRunning,
  onStop,
}: {
  isCompiling: boolean
  compilationError: string | null
  onRun: () => void
  hasProgram: boolean
  isRunning: boolean
  onStop: () => void
}) {
  return (
    <div className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="floating-bar flex items-center gap-2 px-3 py-2">
        {/* Primary Run Button */}
        <button
          type="button"
          onClick={onRun}
          disabled={isCompiling}
          className={cn(
            'group relative flex items-center gap-2 rounded-lg px-4 py-2',
            'text-sm font-semibold transition-all duration-200',
            'btn-press',
            isCompiling
              ? 'bg-ide-panel-hover text-ide-text-subtle cursor-not-allowed'
              : 'bg-ide-success text-white hover:bg-ide-success/90 shadow-lg shadow-ide-success/20',
          )}
          title="Compile and run"
        >
          {isCompiling ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Compiling...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>Run Simulation</span>
            </>
          )}
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={onStop}
          disabled={!hasProgram}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'transition-all duration-200 btn-press',
            !hasProgram
              ? 'text-ide-text-subtle cursor-not-allowed'
              : 'text-ide-text-muted hover:bg-ide-error/20 hover:text-ide-error',
          )}
          title="Stop simulation"
        >
          <Square className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-ide-border" />

        {/* Status Indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-ide-panel-bg/80 px-3 py-1.5">
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-colors duration-300',
              isCompiling
                ? 'bg-ide-warning animate-pulse'
                : compilationError
                  ? 'bg-ide-error'
                  : hasProgram
                    ? isRunning
                      ? 'bg-ide-success animate-pulse'
                      : 'bg-ide-success'
                    : 'bg-ide-text-subtle',
            )}
          />
          <span className="text-xs font-medium text-ide-text-muted">
            {isCompiling
              ? 'Compiling'
              : compilationError
                ? 'Error'
                : hasProgram
                  ? isRunning
                    ? 'Running'
                    : 'Ready'
                  : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Simulation Canvas Inner (ReactFlow)
   ============================================ */
function SimulationCanvasInner({ 
  canvasRef,
  isRunning,
}: { 
  canvasRef: React.RefObject<HTMLDivElement | null>
  isRunning: boolean
}) {
  const addPart = useAppStore((s) => s.addPart)
  const updatePartsPositions = useAppStore((s) => s.updatePartsPositions)
  const selectedPartIds = useAppStore((s) => s.selectedPartIds)
  const setSelectedPartIds = useAppStore((s) => s.setSelectedPartIds)
  const toggleSelectedPartId = useAppStore((s) => s.toggleSelectedPartId)
  const connections = useAppStore((s) => s.connections)
  const updateWire = useAppStore((s) => s.updateWire)
  const circuitParts = useAppStore((s) => s.circuitParts)

  useDiagramSync()

  const { zoomIn, zoomOut, fitView, setViewport } = useReactFlow()

  const getCanvasRect = useCallback(() => {
    return canvasRef.current?.getBoundingClientRect() ?? null
  }, [canvasRef])

  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  
  const initializedRef = useRef(false)

  // Seed a default part once.
  useEffect(() => {
    if (initializedRef.current) return
    if (nodes.length) return
    initializedRef.current = true
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

  // Sync ReactFlow nodes with circuitParts from store
  useEffect(() => {
    if (!initializedRef.current) return
    
    const newNodes: Node[] = circuitParts.map((part) => ({
      id: part.id,
      type: 'wokwi',
      position: { x: part.position.x, y: part.position.y },
      data: {
        getCanvasRect,
        partType: part.type.replace('wokwi-', ''),
      },
      selected: selectedPartIds.includes(part.id),
    }))
    
    const currentIds = new Set(nodes.map(n => n.id))
    const newIds = new Set(newNodes.map(n => n.id))
    const idsChanged = newIds.size !== currentIds.size || 
      [...newIds].some(id => !currentIds.has(id))
    
    if (newNodes.length > 0 && idsChanged) {
      setNodes(newNodes)
    }
  }, [circuitParts, getCanvasRect, nodes, selectedPartIds, setNodes])

  // Update node data when handlers change
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
            style: { stroke: 'var(--ide-accent)', strokeWidth: 2.5 },
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
      if ((e.target as HTMLElement | null)?.closest?.('[data-fundi-pin="true"]')) return

      if (e.shiftKey) {
        toggleSelectedPartId(node.id)
      } else {
        setSelectedPartIds([node.id])
      }
    },
    [setSelectedPartIds, toggleSelectedPartId]
  )

  // Group-drag engine
  const dragStartNodesRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const dragStartWirePointsRef = useRef<Map<string, WirePoint[] | undefined>>(new Map())
  const dragWireModeRef = useRef<Map<string, 'both' | 'one'>>(new Map())
  const [wirePointOverrides, setWirePointOverrides] = useState<Map<string, WirePoint[] | undefined> | null>(null)

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: Node) => {
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

      setNodes((nds) =>
        nds.map((n) => {
          const s = dragStartNodesRef.current.get(n.id)
          if (!s) return n
          return { ...n, position: { x: s.x + delta.x, y: s.y + delta.y } }
        })
      )

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
    const updates: Array<{ id: string; x: number; y: number }> = []
    for (const [id] of dragStartNodesRef.current.entries()) {
      const n = nodes.find((nn) => nn.id === id)
      if (!n) continue
      updates.push({ id, x: n.position.x, y: n.position.y })
    }
    updatePartsPositions(updates)

    if (wirePointOverrides) {
      for (const [wireId, pts] of wirePointOverrides.entries()) {
        updateWire(wireId, pts)
      }
    }

    dragStartNodesRef.current = new Map()
    dragStartWirePointsRef.current = new Map()
    dragWireModeRef.current = new Map()
    setWirePointOverrides(null)
  }, [nodes, updatePartsPositions, updateWire, wirePointOverrides])

  // Drag-to-add handler
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
    [addPart, canvasRef, getCanvasRect, setNodes, setSelectedPartIds, transform]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(FUNDI_PART_MIME)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleResetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 })
  }, [setViewport])

  return (
    <div
      ref={canvasRef}
      className={cn(
        'relative h-full w-full ide-canvas',
        isRunning && 'simulation-active rounded-lg'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CanvasToolbar
        onZoomIn={() => zoomIn({ duration: 200 })}
        onZoomOut={() => zoomOut({ duration: 200 })}
        onFitView={() => fitView({ duration: 300, padding: 0.2 })}
        onResetView={handleResetView}
      />

      <SelectionOverlay containerRef={canvasRef} />

      <ReactFlow
        nodes={nodes}
        edges={edges.map((edge) => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: 'var(--ide-text-muted)',
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
          style: { stroke: 'var(--ide-text-muted)', strokeWidth: 2 },
        }}
        connectionLineStyle={{ stroke: 'var(--ide-accent)', strokeWidth: 2 }}
      >
        <Background color="#333333" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls className="!left-4 !bottom-20" />

        <WiringLayer
          containerRef={canvasRef}
          wirePointOverrides={wirePointOverrides ?? undefined}
        />
      </ReactFlow>
    </div>
  )
}

function SimulationCanvas({ isRunning }: { isRunning: boolean }) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  return (
    <ReactFlowProvider>
      <SimulationCanvasInner canvasRef={canvasRef} isRunning={isRunning} />
    </ReactFlowProvider>
  )
}

/* ============================================
   Code Editor Panel
   ============================================ */
function CodeEditorPanel({ 
  compilationError,
}: { 
  compilationError: string | null
}) {
  const files = useAppStore((s) => s.files)
  const openFilePaths = useAppStore((s) => s.openFilePaths)
  const activeFilePath = useAppStore((s) => s.activeFilePath)
  const setActiveFile = useAppStore((s) => s.setActiveFile)
  const closeFile = useAppStore((s) => s.closeFile)
  const updateFileContent = useAppStore((s) => s.updateFileContent)
  const settings = useAppStore((s) => s.settings)

  const activeFile = files.find(f => f.path === activeFilePath)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ide-panel-surface">
      {/* Tab bar */}
      <div className="flex h-9 shrink-0 items-center border-b border-ide-border bg-ide-panel-bg overflow-x-auto">
        {openFilePaths.map((path) => {
          const file = files.find(f => f.path === path)
          if (!file) return null
          const isActive = path === activeFilePath
          return (
            <div
              key={path}
              className={cn(
                'group flex h-full items-center gap-1.5 border-r border-ide-border px-2 text-xs font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-ide-panel-surface text-ide-text border-b-2 border-b-ide-accent'
                  : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'
              )}
              onClick={() => setActiveFile(path)}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{file.path}</span>
              {file.includeInSimulation && (
                <span className="h-1.5 w-1.5 rounded-full bg-ide-success shrink-0" title="Included in simulation" />
              )}
              {openFilePaths.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeFile(path)
                  }}
                  className="ml-1 flex h-4 w-4 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-ide-panel-hover transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Error banner */}
      {compilationError && (
        <div className="shrink-0 border-b border-ide-error/30 bg-ide-error/10 px-4 py-2">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-ide-error">
            {compilationError}
          </pre>
        </div>
      )}

      {/* Editor content */}
      <div className="min-h-0 flex-1 p-2">
        {activeFile ? (
          <textarea
            value={activeFile.content}
            onChange={(e) => updateFileContent(activeFile.path, e.target.value)}
            spellCheck={false}
            readOnly={activeFile.isReadOnly}
            style={{ fontSize: `${settings.editorFontSize}px`, tabSize: settings.editorTabSize }}
            className={cn(
              'h-full w-full resize-none rounded-md bg-ide-panel-bg p-4',
              'font-mono leading-6 text-ide-text',
              'border border-ide-border',
              'focus:outline-none focus:ring-1 focus:ring-ide-accent/50 focus:border-ide-accent/50',
              'placeholder:text-ide-text-subtle',
              activeFile.isReadOnly && 'opacity-75 cursor-not-allowed'
            )}
            placeholder="// Write your Arduino code here..."
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ide-text-subtle">
            <p className="text-sm">No file selected</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   Files Panel Component
   ============================================ */
function FilesPanel() {
  const files = useAppStore((s) => s.files)
  const activeFilePath = useAppStore((s) => s.activeFilePath)
  const openFile = useAppStore((s) => s.openFile)
  const addFile = useAppStore((s) => s.addFile)
  const deleteFile = useAppStore((s) => s.deleteFile)
  const renameFile = useAppStore((s) => s.renameFile)
  const toggleFileSimulation = useAppStore((s) => s.toggleFileSimulation)

  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: ProjectFile } | null>(null)
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleAddFile = () => {
    if (newFileName.trim()) {
      addFile(newFileName.trim())
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, file: ProjectFile) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, file })
  }

  const handleRename = (oldPath: string) => {
    if (renameValue.trim() && renameValue !== oldPath) {
      renameFile(oldPath, renameValue.trim())
    }
    setRenamingFile(null)
    setRenameValue('')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with actions */}
      <div className="flex items-center justify-between border-b border-ide-border px-3 py-2">
        <span className="text-xs font-medium text-ide-text-muted">PROJECT FILES</span>
        <button
          type="button"
          onClick={() => setShowNewFileInput(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
          title="New File"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* New file input */}
      {showNewFileInput && (
        <div className="border-b border-ide-border px-3 py-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddFile()
              if (e.key === 'Escape') {
                setShowNewFileInput(false)
                setNewFileName('')
              }
            }}
            placeholder="filename.cpp"
            className="w-full rounded border border-ide-border bg-ide-panel-bg px-2 py-1 text-xs text-ide-text placeholder:text-ide-text-subtle focus:border-ide-accent focus:outline-none"
            autoFocus
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-auto p-2">
        {files.map((file) => (
          <div
            key={file.path}
            onContextMenu={(e) => handleContextMenu(e, file)}
            onClick={() => openFile(file.path)}
            className={cn(
              'group flex items-center justify-between rounded px-2 py-1.5 text-xs cursor-pointer transition-colors',
              activeFilePath === file.path
                ? 'bg-ide-accent/20 text-ide-text'
                : 'text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text'
            )}
          >
            {renamingFile === file.path ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRename(file.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(file.path)
                  if (e.key === 'Escape') {
                    setRenamingFile(null)
                    setRenameValue('')
                  }
                }}
                className="flex-1 rounded border border-ide-accent bg-ide-panel-bg px-1 text-xs text-ide-text focus:outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{file.path}</span>
                {file.isMain && (
                  <span className="shrink-0 rounded bg-ide-accent/20 px-1 py-0.5 text-[9px] font-medium text-ide-accent">
                    main
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFileSimulation(file.path)
                }}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded transition-colors',
                  file.includeInSimulation
                    ? 'text-ide-success hover:bg-ide-success/20'
                    : 'text-ide-text-subtle hover:bg-ide-panel-hover'
                )}
                title={file.includeInSimulation ? 'Included in simulation' : 'Excluded from simulation'}
              >
                {file.includeInSimulation ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 w-40 rounded-lg border border-ide-border bg-ide-panel-surface py-1 shadow-lg"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                setRenamingFile(contextMenu.file.path)
                setRenameValue(contextMenu.file.path)
                setContextMenu(null)
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text"
            >
              Rename
            </button>
            {!contextMenu.file.isMain && (
              <button
                type="button"
                onClick={() => {
                  deleteFile(contextMenu.file.path)
                  setContextMenu(null)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-ide-error hover:bg-ide-error/10"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* ============================================
   Left Panel - The Assistant
   ============================================ */
type LeftPanelTab = 'components' | 'files'

function LeftPanel() {
  const [activeTab, setActiveTab] = useState<LeftPanelTab>('components')

  const tabs: { key: LeftPanelTab; label: string; icon: React.ElementType }[] = [
    { key: 'components', label: 'Components', icon: Layers },
    { key: 'files', label: 'Files', icon: FolderTree },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ide-panel-bg">
      {/* Tab header */}
      <div className="flex h-10 shrink-0 items-center border-b border-ide-border bg-ide-panel-surface">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex h-full items-center gap-1.5 px-3 text-xs font-medium transition-colors',
                isActive
                  ? 'text-ide-accent border-b-2 border-ide-accent'
                  : 'text-ide-text-muted hover:text-ide-text'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === 'components' && (
          <div className="h-full overflow-auto p-4">
            <ComponentLibrary />
          </div>
        )}
        {activeTab === 'files' && (
          <FilesPanel />
        )}
      </div>
    </div>
  )
}

/* ============================================
   Resize Handle Component
   ============================================ */
function ResizeHandle({ 
  direction = 'horizontal',
  className,
}: { 
  direction?: 'horizontal' | 'vertical'
  className?: string
}) {
  return (
    <PanelResizeHandle
      className={cn(
        'resize-handle group relative flex items-center justify-center',
        direction === 'horizontal' 
          ? 'w-1.5 cursor-col-resize'
          : 'h-1.5 cursor-row-resize',
        className
      )}
    >
      <div className={cn(
        'absolute rounded-full bg-ide-border opacity-0 group-hover:opacity-100 transition-opacity',
        direction === 'horizontal' 
          ? 'w-0.5 h-8'
          : 'h-0.5 w-8'
      )} />
    </PanelResizeHandle>
  )
}

/* ============================================
   Main IDE Shell Layout
   ============================================ */
export default function Home() {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  const files = useAppStore((s) => s.files)
  const circuitParts = useAppStore((s) => s.circuitParts)
  const connections = useAppStore((s) => s.connections)
  const compileAndRun = useAppStore((s) => s.compileAndRun)
  const isCompiling = useAppStore((s) => s.isCompiling)
  const compilationError = useAppStore((s) => s.compilationError)
  const hex = useAppStore((s) => s.hex)
  const compiledBoard = useAppStore((s) => s.compiledBoard)

  const {
    run: simRun,
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

  // Prepare project data for publishing
  const prepareProjectForPublish = useCallback(() => {
    return {
      files: files.map(f => ({ path: f.path, content: f.content })),
      circuit: {
        parts: circuitParts,
        connections: connections,
      },
    }
  }, [files, circuitParts, connections])

  return (
    <div className="relative h-screen overflow-hidden bg-ide-panel-bg text-ide-text">
      {/* Global Header - Compact Command Center (40px) */}
      <header className="relative z-50 flex h-10 items-center justify-between border-b border-ide-border bg-ide-panel-surface px-3">
        {/* Left - Logo & Project */}
        <div className="flex items-center gap-3">
          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
            title={leftPanelCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {leftPanelCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <Link href="/workspace" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-ide-accent">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            <div>
              <h1 className="text-xs font-semibold text-ide-text leading-none">
                FUNDI
              </h1>
              <p className="text-[9px] text-ide-text-muted leading-none mt-0.5">
                IoT Workbench
              </p>
            </div>
          </Link>

          <div className="h-5 w-px bg-ide-border" />
          
          <Link
            href="/workspace"
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
            title="Workspace"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Workspace</span>
          </Link>
        </div>

        {/* Center - Device Status */}
        <StatusBadge deviceName="Arduino Uno" isConnected={true} />

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-ide-accent/10 px-3 text-xs font-medium text-ide-accent hover:bg-ide-accent/20 transition-colors"
            title="Publish to Gallery"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </button>
          <Link
            href="/settings"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-ide-border bg-ide-panel-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Publish Project</h3>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-ide-text-muted hover:bg-ide-panel-hover hover:text-ide-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const data = prepareProjectForPublish()
                  console.log('Ready to publish to GitHub:', data)
                  // TODO: Implement GitHub OAuth and API integration
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover"
              >
                <Github className="h-5 w-5 text-ide-accent" />
                <div>
                  <div className="text-sm font-medium">Publish to GitHub</div>
                  <div className="text-xs text-ide-text-muted">
                    Create a new repository or gist
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  const data = prepareProjectForPublish()
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'fundi-project.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-ide-border bg-ide-panel-bg p-4 text-left transition-colors hover:border-ide-accent/50 hover:bg-ide-panel-hover"
              >
                <Share2 className="h-5 w-5 text-ide-accent" />
                <div>
                  <div className="text-sm font-medium">Download Project</div>
                  <div className="text-xs text-ide-text-muted">
                    Export as JSON file
                  </div>
                </div>
              </button>
            </div>
            <div className="mt-4 rounded-lg bg-ide-info/10 border border-ide-info/30 p-3">
              <p className="text-xs text-ide-info">
                ℹ️ GitHub integration requires authentication. Coming soon!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main IDE Layout - Resizable Panels */}
      <div className="h-[calc(100vh-40px)]">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Component Library (collapsible) */}
          {!leftPanelCollapsed && (
            <>
              <Panel 
                defaultSize={20} 
                minSize={15} 
                maxSize={35}
                className="bg-ide-panel-bg"
              >
                <LeftPanel />
              </Panel>
              <ResizeHandle direction="horizontal" />
            </>
          )}

          {/* Middle Panel - The Workshop (Canvas + Code Editor) */}
          <Panel defaultSize={leftPanelCollapsed ? 60 : 55} minSize={30}>
            <PanelGroup direction="vertical" className="h-full">
              {/* Top - Simulation Canvas (The Stage) */}
              <Panel defaultSize={60} minSize={30}>
                <div className="relative h-full overflow-hidden">
                  <SimulationCanvas isRunning={simIsRunning} />
                  
                  {/* Unified Action Bar */}
                  <UnifiedActionBar
                    isCompiling={isCompiling}
                    compilationError={compilationError}
                    onRun={() => void compileAndRun()}
                    hasProgram={Boolean(hex && compiledBoard)}
                    isRunning={simIsRunning}
                    onStop={simStop}
                  />
                </div>
              </Panel>

              <ResizeHandle direction="vertical" />

              {/* Bottom - Code Editor */}
              <Panel defaultSize={40} minSize={15}>
                <CodeEditorPanel
                  compilationError={compilationError}
                />
              </Panel>
            </PanelGroup>
          </Panel>

          <ResizeHandle direction="horizontal" />

          {/* Right Panel - Terminal/Serial (always visible) */}
          <Panel defaultSize={leftPanelCollapsed ? 40 : 25} minSize={15} maxSize={40}>
            <TerminalPanel
              serialOutput={serialOutput}
              onClearSerial={clearSerialOutput}
              isSimulationRunning={simIsRunning}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
