'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { useAppStore } from '@/store/useAppStore';
import type { WirePoint } from '@/types/wire';

interface SelectionOverlayProps {
  containerRef: React.RefObject<HTMLElement | null>;
}

function toFlowPoint(p: WirePoint, transform: [number, number, number]): WirePoint {
  const [tx, ty, zoom] = transform;
  return { x: (p.x - tx) / zoom, y: (p.y - ty) / zoom };
}

function rectFromPoints(a: WirePoint, b: WirePoint) {
  const left = Math.min(a.x, b.x);
  const top = Math.min(a.y, b.y);
  const right = Math.max(a.x, b.x);
  const bottom = Math.max(a.y, b.y);
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function intersects(r1: { left: number; top: number; right: number; bottom: number }, r2: { left: number; top: number; right: number; bottom: number }) {
  return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function SelectionOverlay({ containerRef }: SelectionOverlayProps) {
  const setSelectedPartIds = useAppStore((s) => s.setSelectedPartIds);

  const transform = useStore((s) => s.transform as [number, number, number]);
  const nodes = useStore((s) => (s as any).nodes as Node[]);

  const dragRef = useRef<{
    start: WirePoint;
    current: WirePoint;
    active: boolean;
  } | null>(null);

  const [box, setBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  const nodesForSelection = useMemo(() => nodes ?? [], [nodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isBackgroundTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest('[data-fundi-pin="true"]')) return false;
      if (target.closest('.react-flow__node')) return false;
      // Pane/background within ReactFlow.
      return Boolean(target.closest('.react-flow__pane'));
    };

    const getRel = (e: PointerEvent): WirePoint => {
      const rect = container.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (!isBackgroundTarget(e.target)) return;

      e.preventDefault();

      const start = getRel(e);
      dragRef.current = { start, current: start, active: true };
      setBox({ left: start.x, top: start.y, width: 0, height: 0 });
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current?.active) return;
      const curr = getRel(e);
      dragRef.current.current = curr;

      const r = rectFromPoints(dragRef.current.start, curr);
      setBox({ left: r.left, top: r.top, width: r.width, height: r.height });
    };

    const onPointerUp = () => {
      if (!dragRef.current?.active) return;

      const start = dragRef.current.start;
      const curr = dragRef.current.current;
      dragRef.current = null;
      setBox(null);

      // Ignore tiny drags.
      const rScreen = rectFromPoints(start, curr);
      if (rScreen.width < 4 || rScreen.height < 4) return;

      const aFlow = toFlowPoint({ x: rScreen.left, y: rScreen.top }, transform);
      const bFlow = toFlowPoint({ x: rScreen.right, y: rScreen.bottom }, transform);
      const rFlow = rectFromPoints(aFlow, bFlow);

      const selected: string[] = [];
      for (const n of nodesForSelection) {
        const pos =
          (n as any).positionAbsolute ??
          (n as any).internals?.positionAbsolute ??
          n.position;
        const w = (n as any).measured?.width ?? (n as any).width ?? 0;
        const h = (n as any).measured?.height ?? (n as any).height ?? 0;

        const nr = { left: pos.x, top: pos.y, right: pos.x + w, bottom: pos.y + h };
        if (intersects(rFlow, nr)) {
          selected.push(n.id);
        }
      }

      setSelectedPartIds(selected);
    };

    window.addEventListener('pointerdown', onPointerDown, { capture: true });
    window.addEventListener('pointermove', onPointerMove, { capture: true });
    window.addEventListener('pointerup', onPointerUp, { capture: true });

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointermove', onPointerMove, true);
      window.removeEventListener('pointerup', onPointerUp, true);
    };
  }, [containerRef, nodesForSelection, setSelectedPartIds, transform]);

  if (!box) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden={true}
    >
      <div
        style={{
          position: 'absolute',
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
        }}
        className="rounded border border-emerald-400/80 bg-emerald-400/10"
      />
    </div>
  );
}

export default memo(SelectionOverlay);
