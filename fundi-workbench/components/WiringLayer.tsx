'use client';

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useStore } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import type { WirePoint } from '@/types/wire';
import {
  calculateOrthogonalPoints,
  pointsToPathD,
  findSegmentIndex,
  moveSegment,
  snapPointToGrid,
  avoidParallelOverlaps,
  type ComponentBounds,
} from '@/utils/wireRouting';

type PinRef = { partId: string; pinId: string };

interface WiringLayerProps {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Optional transient overrides for inner waypoints (used during part dragging for 60fps). */
  wirePointOverrides?: Map<string, WirePoint[] | undefined>;
}

type Mode = 'idle' | 'creating' | 'dragging-segment';

const HIT_STROKE = 15;

// Wokwi-like keyboard palette (0-9) + Copper default.
const WOKWI_COLOR_BY_DIGIT: Record<string, string> = {
  '0': '#000000', // black (GND)
  '1': '#8b4513', // brown
  '2': '#ef4444', // red (VCC)
  '3': '#f97316', // orange
  '4': '#eab308', // yellow
  '5': '#22c55e', // green
  '6': '#3b82f6', // blue
  '7': '#8b5cf6', // violet
  '8': '#9ca3af', // gray
  '9': '#ffffff', // white
};

const WOKWI_COLOR_PALETTE: Array<{ key: string; color: string }> = Object.entries(WOKWI_COLOR_BY_DIGIT).map(
  ([key, color]) => ({ key, color })
);

function isDigitKey(key: string): key is keyof typeof WOKWI_COLOR_BY_DIGIT {
  return Object.prototype.hasOwnProperty.call(WOKWI_COLOR_BY_DIGIT, key);
}

function clampToContainer(point: WirePoint, rect: DOMRect): WirePoint {
  return {
    x: Math.max(0, Math.min(rect.width, point.x)),
    y: Math.max(0, Math.min(rect.height, point.y)),
  };
}

function getRelativePoint(e: PointerEvent, container: HTMLElement): WirePoint {
  const rect = container.getBoundingClientRect();
  return clampToContainer({ x: e.clientX - rect.left, y: e.clientY - rect.top }, rect);
}

function isEventInsideContainer(e: PointerEvent, container: HTMLElement): boolean {
  const t = e.target as Node | null;
  if (!t) return false;
  return container.contains(t);
}

function getPinElFromPoint(x: number, y: number): HTMLElement | null {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const pin = (el as HTMLElement).closest?.('[data-fundi-pin="true"]') as HTMLElement | null;
  return pin;
}

function getPinRefFromEl(pinEl: HTMLElement): PinRef | null {
  const partId = pinEl.getAttribute('data-node-id') || pinEl.getAttribute('data-part-id');
  const pinId = pinEl.getAttribute('data-pin-id');
  if (!partId || !pinId) return null;
  return { partId, pinId };
}

function getPinCenterInContainer(pinEl: HTMLElement, container: HTMLElement): WirePoint {
  const pinRect = pinEl.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    x: pinRect.left + pinRect.width / 2 - containerRect.left,
    y: pinRect.top + pinRect.height / 2 - containerRect.top,
  };
}

function samePin(a: PinRef | null, b: PinRef | null): boolean {
  if (!a || !b) return false;
  return a.partId === b.partId && a.pinId === b.pinId;
}

function stripEndpoints(points: WirePoint[]): WirePoint[] {
  if (points.length <= 2) return [];
  return points.slice(1, -1);
}

function normalizePointsForStore(points: WirePoint[]): WirePoint[] | undefined {
  const inner = stripEndpoints(points);
  return inner.length ? inner : undefined;
}

function getGridSizeForZoom(zoom: number): number {
  // Simple heuristic: coarser grid when zoomed out.
  return zoom < 0.75 ? 20 : 10;
}

function WiringLayer({ containerRef, wirePointOverrides }: WiringLayerProps) {
  const connections = useAppStore((s) => s.connections);
  const addConnection = useAppStore((s) => s.addConnection);
  const allocateNextWireColor = useAppStore((s) => s.allocateNextWireColor);
  const removeConnection = useAppStore((s) => s.removeConnection);
  const updateWireColor = useAppStore((s) => s.updateWireColor);
  const updateWire = useAppStore((s) => s.updateWire);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const zoom = useStore((s) => s.transform[2]);
  // Subscribe to node changes so wire endpoints update in real-time while parts move.
  // Using the store's nodes array reference is enough to invalidate memos during drags.
  const flowNodes = useStore((s) => (s as any).nodes as unknown[]);
  const gridSize = useMemo(() => getGridSizeForZoom(zoom), [zoom]);

  const modeRef = useRef<Mode>('idle');

  const creatingRef = useRef<{
    from: PinRef;
    fromPoint: WirePoint;
    waypoints: WirePoint[];
    cursor: WirePoint;
    hoveredPin: PinRef | null;
    hoveredPoint: WirePoint | null;
    color: string;
  } | null>(null);

  const segmentDragRef = useRef<{
    wireId: string;
    segmentIndex: number;
    startMouse: WirePoint;
    startPoints: WirePoint[];
    disableSnap: boolean;
  } | null>(null);

  const [, forceTick] = useState(0);

  // Track container size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  // Precompute all pin centers once per render to keep 60fps during drags.
  const pinCenters = useMemo(() => {
    const container = containerRef.current;
    if (!container) return new Map<string, WirePoint>();

    const containerRect = container.getBoundingClientRect();
    const els = container.querySelectorAll<HTMLElement>('[data-fundi-pin="true"][data-node-id][data-pin-id]');
    const next = new Map<string, WirePoint>();
    els.forEach((el) => {
      const partId = el.getAttribute('data-node-id');
      const pinId = el.getAttribute('data-pin-id');
      if (!partId || !pinId) return;
      const r = el.getBoundingClientRect();
      next.set(`${partId}:${pinId}`, {
        x: r.left + r.width / 2 - containerRect.left,
        y: r.top + r.height / 2 - containerRect.top,
      });
    });
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, dimensions.width, dimensions.height, zoom, flowNodes]);

  // Precompute component bounding boxes for obstacle avoidance
  const componentBounds = useMemo(() => {
    const container = containerRef.current;
    if (!container) return [] as ComponentBounds[];

    const containerRect = container.getBoundingClientRect();
    // Get all node elements (excluding the wiring layer itself which is in an SVG)
    // Looking for elements with data-node-id attribute
    const nodeElements = container.querySelectorAll<HTMLElement>('[data-node-id]');
    const bounds: ComponentBounds[] = [];

    nodeElements.forEach((el) => {
      const partId = el.getAttribute('data-node-id');
      if (!partId) return;

      // Get the bounding box of the node element
      const rect = el.getBoundingClientRect();

      // Convert to container-relative coordinates
      const x = rect.left - containerRect.left;
      const y = rect.top - containerRect.top;
      const width = rect.width;
      const height = rect.height;

      // Filter out tiny elements (like the pin hitboxes which have node-id too)
      if (width < 20 || height < 20) return;

      // Check if we already have bounds for this part (multiple pin elements might exist)
      if (!bounds.find(b => b.id === partId)) {
        bounds.push({ id: partId, x, y, width, height });
      }
    });

    return bounds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, dimensions.width, dimensions.height, zoom, flowNodes]);

  const getPinPoint = useCallback(
    (pin: PinRef): WirePoint | null => {
      return pinCenters.get(`${pin.partId}:${pin.pinId}`) ?? null;
    },
    [pinCenters]
  );

  const wireGeometry = useMemo(() => {
    const base = connections
      .map((c) => {
        const start = getPinPoint(c.from);
        const end = getPinPoint(c.to);

        if (!start || !end) {
          return null;
        }

        const waypoints = wirePointOverrides?.has(c.id)
          ? wirePointOverrides.get(c.id) ?? []
          : c.points ?? [];

        const points = calculateOrthogonalPoints(start, end, waypoints, {
          firstLeg: 'horizontal',
          obstacles: componentBounds,
          gridSize,
        });
        return { id: c.id, color: c.color, points };
      })
      .filter((x): x is { id: string; color: string; points: WirePoint[] } => Boolean(x));

    // Prevent PARALLEL overlaps between different wires (perpendicular crossings OK).
    const adjusted = avoidParallelOverlaps(
      base.map((w) => ({ id: w.id, points: w.points })),
      { gridSize }
    );

    return base.map((w) => {
      const points = adjusted.get(w.id) ?? w.points;
      return { ...w, points, d: pointsToPathD(points) };
    });
  }, [connections, getPinPoint, wirePointOverrides, gridSize, pinCenters, componentBounds]);

  const selectedWire = useMemo(() => {
    if (!selectedId) return null;
    return wireGeometry.find((w) => w.id === selectedId) ?? null;
  }, [selectedId, wireGeometry]);

  const selectedMidpoint = useMemo(() => {
    if (!selectedWire) return null;
    const pts = selectedWire.points;
    if (pts.length < 2) return null;
    const i = Math.floor(pts.length / 2);
    return pts[i];
  }, [selectedWire]);

  // Global pointer + keyboard interactions.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerMoveCapture = (e: PointerEvent) => {
      if (!container) return;
      if (!isEventInsideContainer(e, container)) return;

      if (modeRef.current === 'creating' && creatingRef.current) {
        const cursorRaw = getRelativePoint(e, container);
        const cursor = e.shiftKey ? cursorRaw : snapPointToGrid(cursorRaw, gridSize);

        const pinEl = getPinElFromPoint(e.clientX, e.clientY);
        const hoveredRef = pinEl ? getPinRefFromEl(pinEl) : null;

        let hoveredPin: PinRef | null = null;
        let hoveredPoint: WirePoint | null = null;
        if (hoveredRef && !samePin(hoveredRef, creatingRef.current.from)) {
          hoveredPin = hoveredRef;
          hoveredPoint = pinEl ? getPinCenterInContainer(pinEl, container) : null;
        }

        creatingRef.current = {
          ...creatingRef.current,
          cursor,
          hoveredPin,
          hoveredPoint,
        };
        forceTick((n) => (n + 1) % 1000000);
      }

      if (modeRef.current === 'dragging-segment' && segmentDragRef.current) {
        const curr = getRelativePoint(e, container);
        const drag = segmentDragRef.current;
        const delta = { x: curr.x - drag.startMouse.x, y: curr.y - drag.startMouse.y };

        const moved = moveSegment(drag.startPoints, drag.segmentIndex, delta, {
          snapTo: gridSize,
          disableSnap: drag.disableSnap,
        });

        updateWire(drag.wireId, normalizePointsForStore(moved));
        forceTick((n) => (n + 1) % 1000000);
      }
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!isEventInsideContainer(e, container)) return;

      // Click-away deselect: clicking anywhere else in the canvas clears wire selection,
      // except when interacting with the wire toolbar or wire hit targets.
      if (selectedId) {
        const target = e.target as HTMLElement | null;
        const insideToolbar = Boolean(target?.closest?.('[data-wire-toolbar="true"]'));
        const onWire = Boolean(target?.closest?.('[data-wire-hit="true"]'));
        if (!insideToolbar && !onWire) {
          setSelectedId(null);
        }
      }

      const pinEl = (e.target as HTMLElement | null)?.closest?.('[data-fundi-pin="true"]') as HTMLElement | null;
      const pinRef = pinEl ? getPinRefFromEl(pinEl) : null;

      // If we're creating and click a pin, complete the wire.
      if (modeRef.current === 'creating' && creatingRef.current) {
        if (pinEl && pinRef && !samePin(pinRef, creatingRef.current.from)) {
          e.preventDefault();
          e.stopPropagation();

          addConnection({
            from: creatingRef.current.from,
            to: pinRef,
            color: creatingRef.current.color,
            points: creatingRef.current.waypoints.length
              ? creatingRef.current.waypoints
              : undefined,
          });

          creatingRef.current = null;
          modeRef.current = 'idle';
          forceTick((n) => n + 1);
          return;
        }

        // Otherwise pin a waypoint at current cursor (empty space click).
        if (!pinEl) {
          e.preventDefault();
          e.stopPropagation();

          const pRaw = getRelativePoint(e, container);
          const p = e.shiftKey ? pRaw : snapPointToGrid(pRaw, gridSize);
          creatingRef.current = {
            ...creatingRef.current,
            waypoints: [...creatingRef.current.waypoints, p],
            cursor: p,
          };
          forceTick((n) => n + 1);
          return;
        }
      }

      // Start creating from a pin.
      if (pinEl && pinRef) {
        e.preventDefault();
        e.stopPropagation();

        const fromPointRaw = getPinCenterInContainer(pinEl, container);
        const fromPoint = snapPointToGrid(fromPointRaw, gridSize);
        const cursorRaw = getRelativePoint(e, container);
        const cursor = e.shiftKey ? cursorRaw : snapPointToGrid(cursorRaw, gridSize);

        creatingRef.current = {
          from: pinRef,
          fromPoint,
          waypoints: [],
          cursor,
          hoveredPin: null,
          hoveredPoint: null,
          color: allocateNextWireColor(),
        };

        modeRef.current = 'creating';
        setSelectedId(null);
        forceTick((n) => n + 1);
      }
    };

    const onPointerUpCapture = () => {
      if (modeRef.current === 'dragging-segment') {
        segmentDragRef.current = null;
        modeRef.current = 'idle';
        forceTick((n) => n + 1);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modeRef.current === 'creating') {
          creatingRef.current = null;
          modeRef.current = 'idle';
          forceTick((n) => n + 1);
        }
        if (modeRef.current === 'dragging-segment') {
          segmentDragRef.current = null;
          modeRef.current = 'idle';
          forceTick((n) => n + 1);
        }
        if (selectedId) setSelectedId(null);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeConnection(selectedId);
        setSelectedId(null);
      }

      if (isDigitKey(e.key)) {
        const color = WOKWI_COLOR_BY_DIGIT[e.key];
        if (modeRef.current === 'creating' && creatingRef.current) {
          creatingRef.current = { ...creatingRef.current, color };
          forceTick((n) => n + 1);
        } else if (selectedId) {
          updateWireColor(selectedId, color);
        }
      }
    };

    window.addEventListener('pointerdown', onPointerDownCapture, { capture: true });
    window.addEventListener('pointermove', onPointerMoveCapture, { capture: true });
    window.addEventListener('pointerup', onPointerUpCapture, { capture: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('pointerdown', onPointerDownCapture, true);
      window.removeEventListener('pointermove', onPointerMoveCapture, true);
      window.removeEventListener('pointerup', onPointerUpCapture, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [addConnection, allocateNextWireColor, containerRef, gridSize, removeConnection, selectedId, updateWire, updateWireColor]);

  const creating = creatingRef.current;
  const preview = useMemo(() => {
    if (!creating) return null;
    const end = creating.hoveredPoint ?? creating.cursor;
    const points = calculateOrthogonalPoints(creating.fromPoint, end, creating.waypoints, {
      firstLeg: 'vertical',
      obstacles: componentBounds,
      gridSize,
    });
    return { d: pointsToPathD(points), color: creating.color };
  }, [creating, forceTick, componentBounds, gridSize]);

  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes fundi-wire-dash {
          to {
            stroke-dashoffset: -24;
          }
        }
      `}</style>

      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 15,
        }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <g style={{ pointerEvents: 'auto' }}>
          {wireGeometry.map((w) => {
            const isSelected = selectedId === w.id;
            const isHovered = hoveredId === w.id;
            const strokeWidth = isSelected ? 3.5 : 2;
            const displayColor = isSelected ? '#00F0FF' : w.color; // Electric cyan when selected

            return (
              <g key={w.id}>
                {/* Hit target (also used for segment dragging) */}
                <path
                  d={w.d}
                  data-wire-hit="true"
                  data-wire-id={w.id}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={HIT_STROKE}
                  style={{ cursor: isSelected ? 'grab' : 'pointer', pointerEvents: 'stroke' }}
                  onPointerEnter={() => setHoveredId(w.id)}
                  onPointerLeave={() => setHoveredId((prev) => (prev === w.id ? null : prev))}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    setSelectedId(w.id);

                    // Segment dragging only when selected.
                    const container = containerRef.current;
                    if (!container) return;
                    if (selectedId !== w.id) return;

                    const rect = container.getBoundingClientRect();
                    const click: WirePoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                    const segIdx = findSegmentIndex(w.points, click, HIT_STROKE / 2);
                    if (segIdx === null) return;

                    segmentDragRef.current = {
                      wireId: w.id,
                      segmentIndex: segIdx,
                      startMouse: click,
                      startPoints: w.points,
                      disableSnap: e.shiftKey,
                    };
                    modeRef.current = 'dragging-segment';
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeConnection(w.id);
                    if (selectedId === w.id) setSelectedId(null);
                  }}
                />

                {/* Glow effect for selected wire */}
                {isSelected && (
                  <path
                    d={w.d}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth={strokeWidth + 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      pointerEvents: 'none',
                      opacity: 0.3,
                      filter: 'blur(4px)',
                    }}
                  />
                )}

                {/* Hover feedback (marching ants) */}
                {(isHovered || isSelected) && (
                  <path
                    d={w.d}
                    fill="none"
                    stroke={isSelected ? '#00F0FF' : '#D4AF37'}
                    strokeWidth={strokeWidth + 1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 6"
                    style={{
                      pointerEvents: 'none',
                      opacity: 0.4,
                      animation: 'fundi-wire-dash 1s linear infinite',
                    }}
                  />
                )}

                {/* Visible wire */}
                <path
                  d={w.d}
                  fill="none"
                  stroke={displayColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    pointerEvents: 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              </g>
            );
          })}

          {/* Preview (ghost) wire */}
          {preview && (
            <path
              d={preview.d}
              fill="none"
              stroke={preview.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 6"
              opacity={0.9}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      </svg>

      {/* Selected wire toolbar (color + delete) */}
      {selectedWire && selectedMidpoint && (
        <div
          data-wire-toolbar="true"
          className="absolute z-30 flex items-center gap-1 glass-panel rounded-lg p-2 shadow-2xl"
          style={{
            left: selectedMidpoint.x,
            top: selectedMidpoint.y,
            transform: 'translate(-50%, -110%)',
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => {
            // Prevent toolbar clicks from being treated as "click away".
            e.stopPropagation();
          }}
        >
          <div className="flex items-center gap-0.5">
            {WOKWI_COLOR_PALETTE.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => updateWireColor(selectedWire.id, c.color)}
                className={
                  'h-5 w-5 rounded border-2 transition-all ' +
                  (selectedWire.color.toLowerCase() === c.color.toLowerCase()
                    ? 'border-electric scale-110 shadow-lg shadow-electric/50'
                    : 'border-transparent hover:border-brass hover:scale-105')
                }
                style={{ backgroundColor: c.color }}
                title={`Color ${c.key}`}
              />
            ))}
          </div>

          <div className="mx-1 h-5 w-px bg-brass/30" />

          <button
            type="button"
            onClick={() => {
              removeConnection(selectedWire.id);
              setSelectedId(null);
            }}
            className="rounded px-2 py-1 font-mono text-[11px] font-medium text-error hover:bg-error/15 transition-colors"
            title="Delete wire (also: Delete key or double-click)"
          >
            Delete
          </button>
        </div>
      )}

      {/* Wire connection label tooltip on hover */}
      {hoveredId && !selectedId && (() => {
        const hoveredWire = wireGeometry.find(w => w.id === hoveredId);
        const hoveredConn = connections.find(c => c.id === hoveredId);
        if (!hoveredWire || !hoveredConn) return null;

        const pts = hoveredWire.points;
        if (pts.length < 2) return null;

        const midIdx = Math.floor(pts.length / 2);
        const midpoint = pts[midIdx];

        return (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: midpoint.x,
              top: midpoint.y,
              transform: 'translate(-50%, -100%) translateY(-8px)',
            }}
          >
            <div className="bg-ide-panel-bg/95 backdrop-blur-sm border border-ide-border rounded-md px-2.5 py-1.5 shadow-lg">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-ide-text-muted">{hoveredConn.from.partId}</span>
                <span className="text-ide-accent font-medium">{hoveredConn.from.pinId}</span>
                <span className="text-ide-text-subtle">→</span>
                <span className="text-ide-text-muted">{hoveredConn.to.partId}</span>
                <span className="text-ide-accent font-medium">{hoveredConn.to.pinId}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

export default memo(WiringLayer);
