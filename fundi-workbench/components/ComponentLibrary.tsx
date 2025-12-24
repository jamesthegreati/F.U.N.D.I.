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
      className="absolute left-6 top-6 z-30 w-72 glass-panel-heavy rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border-alchemist"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="relative border-b border-brass/20 px-6 py-5 bg-void/40">
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-brass/20 animate-pulse" />
        <h2 className="font-heading text-xs font-bold tracking-[0.3em] text-brass uppercase">
          Component Library
        </h2>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-brass-dim/60">
          Drag to manifest in workbench
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-brass/10 bg-void/30">
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
                  'relative flex-1 px-2 py-4 transition-all duration-300',
                  'hover:bg-brass/5 group',
                  isActive
                    ? 'text-brass'
                    : 'text-brass-dim hover:text-brass/80'
                )}
                title={cat.title}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className="font-mono text-[8px] uppercase tracking-tighter leading-tight">{cat.title}</span>
                </div>
                {/* Gold Underline Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-brass shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Grid */}
      <div className="max-h-[60vh] overflow-auto p-4 custom-scrollbar">
        {activeCategory.items.length === 0 ? (
          <div className="px-2 py-6 text-center font-mono text-xs text-brass-dim/60">
            No components in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
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
                    'rounded-xl border transition-all duration-300',
                    'bg-void/40 border-brass/10',
                    'hover:border-brass/40 hover:bg-brass/5 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]',
                    'active:cursor-grabbing active:scale-95'
                  )}
                  title={item.description ?? item.name}
                >
                  {/* Decorative corner on hover */}
                  <div className="absolute right-1 top-1 h-2 w-2 border-r border-t border-brass/0 group-hover:border-brass/40 transition-all" />
                  
                  {/* Large Centered Icon */}
                  <Icon className="h-8 w-8 text-brass-dim/60 transition-all duration-300 group-hover:scale-110 group-hover:text-brass" />
                  
                  {/* Label at Bottom */}
                  <div className="mt-3 px-2 text-center">
                    <div className="font-mono text-[9px] uppercase tracking-widest leading-tight text-parchment/60 group-hover:text-parchment transition-colors">
                      {item.name}
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  {item.description && (
                    <div className="pointer-events-none absolute -top-2 left-1/2 z-50 hidden w-48 -translate-x-1/2 -translate-y-full rounded-lg border border-brass/30 bg-panel/95 px-3 py-2 shadow-xl backdrop-blur-md group-hover:block">
                      <p className="font-mono text-[10px] leading-relaxed text-parchment/90">
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
      
      {/* Footer Decoration */}
      <div className="h-1 bg-gradient-to-r from-transparent via-brass/20 to-transparent" />
    </aside>
  );
}

export default memo(ComponentLibrary);
