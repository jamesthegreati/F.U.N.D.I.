'use client';

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { WirePoint } from '@/types/wire';
import { DEFAULT_WIRE_COLOR } from '@/types/wire';
import { calculateOrthogonalPoints, pointsToPathD, simplifyPolylinePoints } from '@/utils/wireRouting';

type PinRef = { partId: string; pinId: string };

interface WiringLayerProps {
  containerRef: React.RefObject<HTMLElement | null>;
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

function distanceToSegment(point: WirePoint, p1: WirePoint, p2: WirePoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.sqrt((point.x - p1.x) ** 2 + (point.y - p1.y) ** 2);
  }

  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared;
  t = Math.max(0, Math.min(1, t));

  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

function findNearestSegmentIndex(points: WirePoint[], p: WirePoint): number {
  if (points.length < 2) return 0;
  let bestIndex = 0;
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length - 1; i++) {
    const d = distanceToSegment(p, points[i], points[i + 1]);
    if (d < best) {
      best = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function WiringLayer({ containerRef }: WiringLayerProps) {
  const connections = useAppStore((s) => s.connections);
  const addConnection = useAppStore((s) => s.addConnection);
  const removeConnection = useAppStore((s) => s.removeConnection);
  const setConnectionPoints = useAppStore((s) => s.setConnectionPoints);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dragRef = useRef<{
    from: PinRef;
    fromPoint: WirePoint;
    cursor: WirePoint;
    hovered: PinRef | null;
    hoveredPoint: WirePoint | null;
    color: string;
  } | null>(null);

  const bendRef = useRef<{
    connectionId: string;
    // Original intermediate points (for ESC revert)
    originalPoints: WirePoint[] | undefined;
    // Indices (in the intermediate points array) of the two inserted points
    inserted: [number, number];
    orientation: 'horizontal' | 'vertical';
    fixedA: number;
    fixedB: number;
    finishOnPointerUp: boolean;
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

  // Global pointer wiring.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDownCapture = (e: PointerEvent) => {
      // If we're in persistent bend mode (double-click), any normal left click commits the bend
      // and exits bend mode (wire stays). Esc still cancels/reverts.
      if (bendRef.current && !bendRef.current.finishOnPointerUp && e.button === 0) {
        const pinEl = (e.target as HTMLElement | null)?.closest?.('[data-fundi-pin="true"]');
        if (!pinEl) {
          bendRef.current = null;
          forceTick((n) => n + 1);
        }
      }

      // Only start on pin elements.
      const pinEl = (e.target as HTMLElement | null)?.closest?.('[data-fundi-pin="true"]') as HTMLElement | null;
      if (!pinEl) return;

      const pinRef = getPinRefFromEl(pinEl);
      if (!pinRef) return;

      e.preventDefault();
      e.stopPropagation();

      const fromPoint = getPinCenterInContainer(pinEl, container);
      const cursor = getRelativePoint(e, container);

      dragRef.current = {
        from: pinRef,
        fromPoint,
        cursor,
        hovered: null,
        hoveredPoint: null,
        color: DEFAULT_WIRE_COLOR,
      };

      // Ensure we keep receiving move/up even if pointer leaves.
      try {
        pinEl.setPointerCapture(e.pointerId);
      } catch {
        // Ignore; not all targets allow capture here.
      }

      forceTick((n) => n + 1);
    };

    const onPointerMoveCapture = (e: PointerEvent) => {
      const cursor = getRelativePoint(e, container);

      if (bendRef.current) {
        const bend = bendRef.current;
        const connection = connections.find((c) => c.id === bend.connectionId);
        if (connection) {
          const currentPoints = (connection.points ?? []).slice();
          const [i1, i2] = bend.inserted;

          if (bend.orientation === 'horizontal') {
            if (currentPoints[i1]) currentPoints[i1] = { x: bend.fixedA, y: cursor.y };
            if (currentPoints[i2]) currentPoints[i2] = { x: bend.fixedB, y: cursor.y };
          } else {
            if (currentPoints[i1]) currentPoints[i1] = { x: cursor.x, y: bend.fixedA };
            if (currentPoints[i2]) currentPoints[i2] = { x: cursor.x, y: bend.fixedB };
          }

          setConnectionPoints(bend.connectionId, currentPoints);
          forceTick((n) => (n + 1) % 1000000);
        }
        return;
      }

      if (dragRef.current) {
        const pinEl = getPinElFromPoint(e.clientX, e.clientY);
        const hoveredRef = pinEl ? getPinRefFromEl(pinEl) : null;

        let hovered: PinRef | null = null;
        let hoveredPoint: WirePoint | null = null;
        if (hoveredRef && !samePin(hoveredRef, dragRef.current.from)) {
          hovered = hoveredRef;
          hoveredPoint = pinEl ? getPinCenterInContainer(pinEl, container) : null;
        }

        dragRef.current = {
          ...dragRef.current,
          cursor,
          hovered,
          hoveredPoint,
        };

        // Repaint preview smoothly.
        forceTick((n) => (n + 1) % 1000000);
      }
    };

    const onPointerUpCapture = (e: PointerEvent) => {
      if (bendRef.current) {
        // Commit bend by ending the drag; points stay in store.
        if (bendRef.current.finishOnPointerUp) {
          e.preventDefault();
          e.stopPropagation();
          bendRef.current = null;
          forceTick((n) => n + 1);
        }
        return;
      }

      const drag = dragRef.current;
      if (!drag) return;

      e.preventDefault();
      e.stopPropagation();

      if (drag.hovered) {
        addConnection({
          from: drag.from,
          to: drag.hovered,
          color: drag.color,
        });
      }

      dragRef.current = null;
      forceTick((n) => n + 1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (bendRef.current) {
          // Cancel bend-in-progress: restore original points.
          const { connectionId, originalPoints } = bendRef.current;
          setConnectionPoints(connectionId, originalPoints);
          bendRef.current = null;
          forceTick((n) => n + 1);
          return;
        }
        if (dragRef.current) {
          dragRef.current = null;
          forceTick((n) => n + 1);
        }
        if (selectedId) setSelectedId(null);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeConnection(selectedId);
        setSelectedId(null);
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
  }, [addConnection, connections, containerRef, removeConnection, selectedId, setConnectionPoints]);

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

  const renderedConnections = useMemo(() => {
    return connections
      .map((c) => {
        const a = getPinPoint(c.from);
        const b = getPinPoint(c.to);
        if (!a || !b) return null;

        // If the connection has manual points, treat them as intermediate polyline vertices.
        // Otherwise, generate a default orthogonal polyline.
        const rawPoints = c.points && c.points.length > 0
          ? [a, ...c.points, b]
          : calculateOrthogonalPoints(a, b, [], { firstLeg: 'horizontal' });

        const points = simplifyPolylinePoints(rawPoints);
        const d = pointsToPathD(points);
        return { id: c.id, d, color: c.color, a, b, points };
      })
      .filter(
        (x): x is { id: string; d: string; color: string; a: WirePoint; b: WirePoint; points: WirePoint[] } => Boolean(x)
      );
  }, [connections, getPinPoint]);

  const drag = dragRef.current;
  const preview = useMemo(() => {
    if (!drag) return null;

    const end = drag.hoveredPoint ?? drag.cursor;
    const d = pointsToPathD(calculateOrthogonalPoints(drag.fromPoint, end, [], { firstLeg: 'vertical' }));
    return { d, color: drag.color };
  }, [drag]);

  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
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
        // Deselect on background down (doesn't block node interactions due to pointerEvents none).
        if (!bendRef.current && selectedId) setSelectedId(null);
      }}
    >
      <g style={{ pointerEvents: 'auto' }}>
        {renderedConnections.map((w) => {
          const isSelected = selectedId === w.id;
          const strokeWidth = isSelected ? 3.5 : 2.5;

          const startBend = (clientX: number, clientY: number, pointerId?: number) => {
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();
            const cursor: WirePoint = clampToContainer(
              { x: clientX - containerRect.left, y: clientY - containerRect.top },
              containerRect
            );

            // Build a polyline to bend: use manual points if present, else default orthogonal points.
            const connection = connections.find((c) => c.id === w.id);
            if (!connection) return;

            const polyline = connection.points && connection.points.length > 0
              ? [w.a, ...connection.points, w.b]
              : calculateOrthogonalPoints(w.a, w.b, [], { firstLeg: 'horizontal' });

            const simplified = simplifyPolylinePoints(polyline);
            const segIndex = findNearestSegmentIndex(simplified, cursor);
            const p = simplified[segIndex];
            const q = simplified[segIndex + 1];
            if (!p || !q) return;

            const horizontal = p.y === q.y;

            const inserted1: WirePoint = horizontal
              ? { x: p.x, y: cursor.y }
              : { x: cursor.x, y: p.y };

            const inserted2: WirePoint = horizontal
              ? { x: q.x, y: cursor.y }
              : { x: cursor.x, y: q.y };

            const newFull = simplified.slice();
            newFull.splice(segIndex + 1, 0, inserted1, inserted2);

            const newIntermediate = newFull.slice(1, -1);
            const insertedIndices: [number, number] = [segIndex, segIndex + 1];

            bendRef.current = {
              connectionId: w.id,
              originalPoints: connection.points,
              inserted: insertedIndices,
              orientation: horizontal ? 'horizontal' : 'vertical',
              fixedA: horizontal ? p.x : p.y,
              fixedB: horizontal ? q.x : q.y,
              finishOnPointerUp: true,
            };

            setSelectedId(w.id);
            setConnectionPoints(w.id, newIntermediate);

            // Try to capture pointer so drag stays stable.
            if (typeof pointerId === 'number') {
              try {
                (container as any).setPointerCapture?.(pointerId);
              } catch {
                // ignore
              }
            }

            forceTick((n) => n + 1);
          };

          return (
            <g key={w.id}>
              {/* Hit target */}
              <path
                d={w.d}
                fill="none"
                stroke="transparent"
                strokeWidth={12}
                style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                onContextMenu={(e) => {
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  // Single left click selects.
                  if (e.button === 0 && e.detail < 2) {
                    e.stopPropagation();
                    setSelectedId(w.id);
                    return;
                  }

                  // Double click OR right click starts a bend drag like Wokwi.
                  if (e.button === 2 || (e.button === 0 && e.detail >= 2)) {
                    e.preventDefault();
                    e.stopPropagation();
                    startBend(e.clientX, e.clientY, e.pointerId);
                    if (bendRef.current) {
                      // Right-click: drag ends on pointerup. Double-click: persistent bend mode.
                      bendRef.current.finishOnPointerUp = e.button === 2;
                    }
                  }
                }}
              />

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
                  filter: isSelected
                    ? 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))'
                    : undefined,
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
            opacity={0.85}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </g>
    </svg>
  );
}

export default memo(WiringLayer);
