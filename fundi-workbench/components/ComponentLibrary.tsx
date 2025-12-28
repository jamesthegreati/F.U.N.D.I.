'use client';

import { memo, useMemo, useState } from 'react';
import { Cpu, Lightbulb, Gauge, Monitor } from 'lucide-react';
import type { WokwiPartType } from '@/lib/wokwiParts';
import { WOKWI_PARTS } from '@/lib/wokwiParts';
import { COMPONENT_SVGS } from '@/lib/componentSvgs';
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
      { key: 'sensors', title: 'Input', items: base.sensors, icon: Gauge },
    ] satisfies CatalogCategory[]
  );
}

function ComponentLibrary() {
  const categories = useMemo(() => buildPartCatalog(), []);
  const [active, setActive] = useState<CatalogCategory['key']>('mcu');

  const activeCategory = categories.find((c) => c.key === active) ?? categories[0];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Category Tabs - Horizontal Pills */}
      <div className="shrink-0 border-b border-ide-border pb-3 mb-3">
        <div className="flex gap-1">
          {categories.map((cat) => {
            const isActive = cat.key === active;
            const Icon = cat.icon;

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActive(cat.key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-ide-accent/20 text-ide-accent'
                    : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'
                )}
                title={cat.title}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Grid */}
      <div className="min-h-0 flex-1 overflow-auto">
        {activeCategory.items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-ide-text-subtle">
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
                    'group relative flex cursor-grab flex-col items-center justify-center',
                    'rounded-lg border p-3 transition-all duration-200',
                    'bg-ide-panel-surface border-ide-border',
                    'hover:border-ide-accent/50 hover:bg-ide-panel-hover',
                    'active:cursor-grabbing active:scale-95'
                  )}
                  title={item.description ?? item.name}
                >
                  {/* SVG Component Icon (Wokwi-style) or fallback to category icon */}
                  {COMPONENT_SVGS[item.id] ? (
                    <div
                      className="h-10 w-10 transition-all group-hover:scale-110"
                      dangerouslySetInnerHTML={{ __html: COMPONENT_SVGS[item.id] }}
                    />
                  ) : (
                    <Icon className="h-8 w-8 text-ide-text-muted transition-colors group-hover:text-ide-accent" />
                  )}

                  {/* Label */}
                  <div className="mt-2 text-center">
                    <div className="font-mono text-[10px] text-ide-text-muted group-hover:text-ide-text transition-colors leading-tight">
                      {item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ComponentLibrary);
