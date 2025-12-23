'use client';

import { memo, useMemo, useState } from 'react';
import { Cpu, Lightbulb, Gauge, Monitor } from 'lucide-react';
import type { WokwiPartType } from '@/lib/wokwiParts';
import { WOKWI_PARTS } from '@/lib/wokwiParts';
import { cn } from '@/utils/cn';

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
  icon: React.ComponentType<{ className?: string }>;
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
      { key: 'mcu', title: 'Microcontrollers', items: base.mcu, icon: Cpu },
      { key: 'displays', title: 'Displays', items: base.displays, icon: Monitor },
      { key: 'leds', title: 'LEDs', items: base.leds, icon: Lightbulb },
      { key: 'sensors', title: 'Sensors', items: base.sensors, icon: Gauge },
    ] satisfies CatalogCategory[]
  );
}

function ComponentLibrary() {
  const categories = useMemo(() => buildPartCatalog(), []);
  const [active, setActive] = useState<CatalogCategory['key']>('mcu');

  const activeCategory = categories.find((c) => c.key === active) ?? categories[0];

  return (
    <aside
      className="absolute left-3 top-3 z-30 w-64 glass-panel rounded-xl shadow-2xl"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="border-b border-brass/20 px-4 py-3">
        <h2 className="font-heading text-sm font-bold tracking-wider text-brass">
          COMPONENT LIBRARY
        </h2>
        <p className="mt-1 font-mono text-[10px] text-brass-dim">
          Drag to add to workbench
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-brass/20 bg-void/20">
        <div className="flex">
          {categories.map((cat) => {
            const isActive = cat.key === active;
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                className={cn(
                  'relative flex-1 px-3 py-2.5 text-xs font-medium transition-all',
                  'hover:bg-brass/5',
                  isActive
                    ? 'text-brass'
                    : 'text-brass-dim hover:text-brass'
                )}
                title={cat.title}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span className="font-ui text-[10px] leading-tight">{cat.title}</span>
                </div>
                {/* Gold Underline Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brass" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Grid */}
      <div className="max-h-[60vh] overflow-auto p-3">
        {activeCategory.items.length === 0 ? (
          <div className="px-2 py-6 text-center font-mono text-xs text-brass-dim/60">
            No components in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {activeCategory.items.map((item) => {
              const Icon = activeCategory.icon;
              
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData(FUNDI_PART_MIME, item.id);
                  }}
                  className={cn(
                    'group relative flex aspect-square cursor-grab flex-col items-center justify-center',
                    'rounded-lg border transition-all duration-200',
                    'bg-void/40 border-white/5',
                    'hover:border-electric hover:bg-electric/5 hover:shadow-lg hover:shadow-electric/20',
                    'active:cursor-grabbing active:scale-95'
                  )}
                  title={item.description ?? item.name}
                >
                  {/* Large Centered Icon */}
                  <Icon className="h-8 w-8 text-brass-dim transition-colors group-hover:text-electric" />
                  
                  {/* Label at Bottom */}
                  <div className="mt-2 px-2 text-center">
                    <div className="font-mono text-[10px] leading-tight text-parchment/80 group-hover:text-electric">
                      {item.name}
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  {item.description && (
                    <div className="pointer-events-none absolute -top-2 left-1/2 z-50 hidden w-48 -translate-x-1/2 -translate-y-full rounded-lg border border-brass/30 bg-panel/95 px-3 py-2 shadow-xl backdrop-blur-md group-hover:block">
                      <p className="font-mono text-[11px] leading-relaxed text-parchment">
                        {item.description}
                      </p>
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-brass/30 bg-panel/95" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(ComponentLibrary);
