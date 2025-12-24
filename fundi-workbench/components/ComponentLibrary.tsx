'use client';

import { memo, useMemo, useState } from 'react';
import { Cpu, Lightbulb, Gauge, Monitor, Sparkles } from 'lucide-react';
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
      { key: 'mcu', title: 'MCU', items: base.mcu, icon: Cpu },
      { key: 'displays', title: 'Display', items: base.displays, icon: Monitor },
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
      className="absolute left-8 top-8 z-30 w-80 foundry-panel rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden stagger-item"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="relative border-b-2 border-neon-cyan/20 px-7 py-6 bg-gradient-to-b from-steel to-steel-dark">
        <div className="absolute right-5 top-5 flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-neon-cyan/60 animate-pulse" />
          <div className="h-2 w-2 rounded-full bg-neon-green/60 animate-pulse-glow" style={{ color: 'var(--neon-green)' }} />
        </div>
        <h2 className="font-heading text-sm font-black tracking-[0.35em] text-neon-cyan uppercase chromatic-text">
          Component Library
        </h2>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan/50">
          Drag to manifest
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b-2 border-neon-cyan/15 bg-steel-dark">
        <div className="grid grid-cols-4">
          {categories.map((cat) => {
            const isActive = cat.key === active;
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                className={cn(
                  'relative px-3 py-5 transition-all duration-300',
                  'hover:bg-neon-cyan/5 group border-r-2 border-neon-cyan/10 last:border-r-0',
                  isActive
                    ? 'text-neon-cyan bg-steel'
                    : 'text-neon-cyan/40 hover:text-neon-cyan/70'
                )}
                title={cat.title}
              >
                <div className="flex flex-col items-center gap-2.5">
                  <Icon className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive && "scale-110 filter drop-shadow-[0_0_6px_currentColor]"
                  )} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] leading-tight font-bold">{cat.title}</span>
                </div>
                {/* Neon Underline Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-neon-cyan shadow-[0_0_12px_var(--neon-cyan)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Grid */}
      <div className="max-h-[65vh] overflow-auto p-5 bg-gradient-to-b from-steel-dark to-deep-void">
        {activeCategory.items.length === 0 ? (
          <div className="px-2 py-8 text-center font-mono text-xs text-neon-cyan/40">
            No components available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {activeCategory.items.map((item, idx) => {
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
                    'group relative flex aspect-square cursor-grab flex-col items-center justify-center stagger-item',
                    'rounded-lg border-2 transition-all duration-300',
                    'bg-gradient-to-br from-steel/80 to-steel-dark border-neon-cyan/15',
                    'hover:border-neon-cyan/50 hover:bg-gradient-to-br hover:from-steel hover:to-steel-light hover:shadow-glow-cyan',
                    'active:cursor-grabbing active:scale-95 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]'
                  )}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  title={item.description ?? item.name}
                >
                  {/* Corner Brackets */}
                  <div className="absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-neon-cyan/0 group-hover:border-neon-cyan/50 transition-all duration-300" />
                  <div className="absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-neon-cyan/0 group-hover:border-neon-cyan/50 transition-all duration-300" />
                  <div className="absolute left-1 bottom-1 h-3 w-3 border-l-2 border-b-2 border-neon-cyan/0 group-hover:border-neon-cyan/50 transition-all duration-300" />
                  <div className="absolute right-1 bottom-1 h-3 w-3 border-r-2 border-b-2 border-neon-cyan/0 group-hover:border-neon-cyan/50 transition-all duration-300" />
                  
                  {/* Large Centered Icon */}
                  <Icon className="h-10 w-10 text-neon-cyan/50 transition-all duration-300 group-hover:scale-110 group-hover:text-neon-cyan group-hover:filter group-hover:drop-shadow-[0_0_8px_currentColor]" />
                  
                  {/* Label at Bottom */}
                  <div className="mt-4 px-2 text-center">
                    <div className="font-mono text-[9px] uppercase tracking-[0.15em] leading-tight text-neon-cyan/60 group-hover:text-neon-cyan transition-colors font-bold">
                      {item.name}
                    </div>
                  </div>

                  {/* Enhanced Tooltip on hover */}
                  {item.description && (
                    <div className="pointer-events-none absolute -top-3 left-1/2 z-50 hidden w-56 -translate-x-1/2 -translate-y-full group-hover:block">
                      <div className="foundry-panel rounded-lg px-4 py-3 shadow-[0_0_30px_rgba(0,255,245,0.3)] backdrop-foundry">
                        <p className="font-mono text-[10px] leading-relaxed text-neon-cyan/90">
                          {item.description}
                        </p>
                        <div className="absolute -bottom-2 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-steel border-b-2 border-r-2 border-neon-cyan/20" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer Decoration */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent shadow-[0_0_10px_var(--neon-cyan)]" />
    </aside>
  );
}

export default memo(ComponentLibrary);
