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
} from '@/utils/wireRouting';

type PinRef = { partId: string; pinId: string };

interface WiringLayerProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

type Mode = 'idle' | 'creating' | 'dragging-segment';

const HIT_STROKE = 15;

// Wokwi-like keyboard palette (0-9).
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

function WiringLayer({ containerRef }: WiringLayerProps) {
  const connections = useAppStore((s) => s.connections);
  const addConnection = useAppStore((s) => s.addConnection);
  const removeConnection = useAppStore((s) => s.removeConnection);
  const updateWireColor = useAppStore((s) => s.updateWireColor);
  const updateWire = useAppStore((s) => s.updateWire);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const zoom = useStore((s) => s.transform[2]);
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

  const getPinPoint = useCallback(
    (pin: PinRef): WirePoint | null => {
      const container = containerRef.current;
      if (!container) return null;

      const selector = `[data-fundi-pin="true"][data-node-id="${CSS.escape(pin.partId)}"][data-pin-id="${CSS.escape(pin.pinId)}"]`;
      const el = container.querySelector(selector) as HTMLElement | null;
      if (!el) return null;
      return getPinCenterInContainer(el, container);
    },
    [containerRef]
  );

  const wireGeometry = useMemo(() => {
    return connections
      .map((c) => {
        const start = getPinPoint(c.from);
        const end = getPinPoint(c.to);
        if (!start || !end) return null;

        const waypoints = c.points ?? [];
        const points = calculateOrthogonalPoints(start, end, waypoints, { firstLeg: 'horizontal' });
        const d = pointsToPathD(points);
        return { id: c.id, color: c.color, points, d };
      })
      .filter((x): x is { id: string; color: string; points: WirePoint[]; d: string } => Boolean(x));
  }, [connections, getPinPoint]);

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
          color: WOKWI_COLOR_BY_DIGIT['5'],
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
  }, [addConnection, containerRef, gridSize, removeConnection, selectedId, updateWire, updateWireColor]);

  const creating = creatingRef.current;
  const preview = useMemo(() => {
    if (!creating) return null;
    const end = creating.hoveredPoint ?? creating.cursor;
    const points = calculateOrthogonalPoints(creating.fromPoint, end, creating.waypoints, {
      firstLeg: 'vertical',
    });
    return { d: pointsToPathD(points), color: creating.color };
  }, [creating, forceTick]);

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
          zIndex: 10,
        }}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        onPointerDown={() => {
          if (selectedId) setSelectedId(null);
        }}
      >
        <g style={{ pointerEvents: 'auto' }}>
          {wireGeometry.map((w) => {
            const isSelected = selectedId === w.id;
            const isHovered = hoveredId === w.id;
            const strokeWidth = isSelected ? 3.5 : 2.5;

            return (
              <g key={w.id}>
                {/* Hit target (also used for segment dragging) */}
                <path
                  d={w.d}
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

                {/* Hover feedback (marching ants) */}
                {(isHovered || isSelected) && (
                  <path
                    d={w.d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={strokeWidth + 1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 6"
                    style={{
                      pointerEvents: 'none',
                      opacity: 0.25,
                      animation: 'fundi-wire-dash 1s linear infinite',
                    }}
                  />
                )}

                {/* Visible wire */}
                <path
                  d={w.d}
                  fill="none"
                  stroke={w.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    pointerEvents: 'none',
                    transition: 'stroke-width 0.1s ease',
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
    </>
  );
}

export default memo(WiringLayer);
