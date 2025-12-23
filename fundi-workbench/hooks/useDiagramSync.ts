'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WOKWI_PARTS } from '@/lib/wokwiParts';

function resolveWokwiType(type: string): string {
  const cfg = (WOKWI_PARTS as Record<string, { element: string } | undefined>)[type];
  if (cfg?.element) return cfg.element;
  if (type.startsWith('wokwi-')) return type;
  return type;
}

export function useDiagramSync() {
  const circuitParts = useAppStore((s) => s.circuitParts);
  const connections = useAppStore((s) => s.connections);
  const setDiagramJson = useAppStore((s) => s.setDiagramJson);

  const diagram = useMemo(() => {
    return {
      version: 1,
      parts: circuitParts.map((p) => ({
        id: p.id,
        type: resolveWokwiType(p.type),
        top: Math.round(p.position.y),
        left: Math.round(p.position.x),
        rotate: p.rotate ?? 0,
        attrs: p.attrs ?? {},
      })),
      connections: connections.map((c) => [
        `${c.from.partId}:${c.from.pinId}`,
        `${c.to.partId}:${c.to.pinId}`,
        c.color,
        [],
      ]),
    };
  }, [circuitParts, connections]);

  useEffect(() => {
    setDiagramJson(JSON.stringify(diagram, null, 2));
  }, [diagram, setDiagramJson]);
}
