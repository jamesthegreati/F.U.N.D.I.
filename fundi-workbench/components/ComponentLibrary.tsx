'use client';

import { memo, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WokwiPartType } from '@/lib/wokwiParts';
import { WOKWI_PARTS } from '@/lib/wokwiParts';

export const FUNDI_PART_MIME = 'application/x-fundi-part';

type PartCatalogItem = {
  id: WokwiPartType;
  name: string;
  description?: string;
};

type CatalogCategory = {
  key: 'mcu' | 'displays' | 'leds' | 'sensors';
  title: string;
  items: PartCatalogItem[];
};

export function buildPartCatalog(): CatalogCategory[] {
  const base: Record<CatalogCategory['key'], PartCatalogItem[]> = {
    mcu: [],
    displays: [],
    leds: [],
    sensors: [],
  };

  for (const id of Object.keys(WOKWI_PARTS) as WokwiPartType[]) {
    const cfg = WOKWI_PARTS[id];
    const cat = cfg.category ?? 'mcu';
    base[cat].push({ id, name: cfg.name, description: cfg.description });
  }

  return (
    [
      { key: 'mcu', title: 'MCUs', items: base.mcu },
      { key: 'displays', title: 'Displays', items: base.displays },
      { key: 'leds', title: 'LEDs', items: base.leds },
      { key: 'sensors', title: 'Sensors', items: base.sensors },
    ] satisfies CatalogCategory[]
  );
}

function ComponentLibrary() {
  const categories = useMemo(() => buildPartCatalog(), []);
  const [active, setActive] = useState<CatalogCategory['key']>('mcu');
  const [collapsed, setCollapsed] = useState(false);

  const activeCategory = categories.find((c) => c.key === active) ?? categories[0];

  return (
    <aside
      className="absolute left-3 top-3 z-30 w-56 rounded-lg border border-slate-800 bg-slate-950/90 shadow-xl backdrop-blur"
      style={{ pointerEvents: 'auto' }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between border-b border-slate-800 px-3 py-2"
        aria-expanded={!collapsed}
      >
        <span className="text-xs font-semibold tracking-wide text-slate-200">Components</span>
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <span>{collapsed ? 'Show' : 'Hide'}</span>
          <ChevronDown
            className={
              'h-3 w-3 transition-transform ' + (collapsed ? '-rotate-90' : 'rotate-0')
            }
            aria-hidden={true}
          />
        </span>
      </button>

      {!collapsed && (
        <>
          <div className="flex items-center gap-2 border-b border-slate-800 p-2">
            <label className="text-[11px] font-medium text-slate-400">Category</label>
            <select
              className="flex-1 rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-200"
              value={active}
              onChange={(e) => setActive(e.target.value as CatalogCategory['key'])}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.title}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500">Drag to add</span>
          </div>

          <div className="max-h-[60vh] overflow-auto p-2">
            {activeCategory.items.length === 0 ? (
              <div className="px-2 py-3 text-xs text-slate-500">No parts in this category yet.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {activeCategory.items.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'copy';
                      e.dataTransfer.setData(FUNDI_PART_MIME, item.id);
                    }}
                    className="group rounded-md border border-slate-800 bg-slate-950 px-2 py-2 text-left hover:bg-slate-900"
                    title={item.description ?? item.name}
                  >
                    <div className="text-xs font-medium text-slate-200 group-hover:text-slate-50">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                        {item.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export default memo(ComponentLibrary);
