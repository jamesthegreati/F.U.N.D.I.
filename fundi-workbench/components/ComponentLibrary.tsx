'use client';

import '@wokwi/elements';
import { memo, useMemo, useState, useRef, useEffect } from 'react';
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

/**
 * Renders an actual Wokwi element as a preview icon
 */
function WokwiElementPreview({
  elementTag,
  fallbackIcon: FallbackIcon,
}: {
  elementTag: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing content
    container.innerHTML = '';

    try {
      // Create the wokwi element
      const element = document.createElement(elementTag);

      // Set common attributes for better preview appearance
      if (elementTag === 'wokwi-led') {
        element.setAttribute('color', 'red');
      } else if (elementTag === 'wokwi-rgb-led') {
        element.setAttribute('color', '#ff0000');
      } else if (elementTag === 'wokwi-pushbutton' || elementTag === 'wokwi-pushbutton-6mm') {
        element.setAttribute('color', 'red');
      } else if (elementTag === 'wokwi-resistor') {
        element.setAttribute('value', '220');
      } else if (elementTag === 'wokwi-potentiometer' || elementTag === 'wokwi-slide-potentiometer') {
        element.setAttribute('value', '50');
      }

      container.appendChild(element);
      
      // Mark as loaded after a brief delay to ensure element is rendered
      setTimeout(() => setHasLoaded(true), 100);
    } catch (error) {
      console.error(`Failed to create wokwi element: ${elementTag}`, error);
      setHasLoaded(false);
    }
  }, [elementTag]);

  return (
    <div className="relative h-10 w-10 flex items-center justify-center overflow-hidden">
      {/* Wokwi element container - scaled down */}
      <div
        ref={containerRef}
        className="transition-all group-hover:scale-110"
        style={{
          transform: 'scale(0.5)',
          transformOrigin: 'center',
        }}
      />
      {/* Fallback icon - shown if element hasn't loaded */}
      {!hasLoaded && (
        <FallbackIcon className="absolute h-8 w-8 text-ide-text-muted transition-colors group-hover:text-ide-accent" />
      )}
    </div>
  );
}

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
      {/* Category Tabs - Horizontal Scrollable with Snap Points */}
      <div className="shrink-0 border-b border-ide-border pb-3 mb-3">
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-1">
            {categories.map((cat) => {
              const isActive = cat.key === active;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActive(cat.key)}
                  className={cn(
                    'snap-start shrink-0 min-w-[60px] flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-ide-accent/20 text-ide-accent'
                      : 'text-ide-text-muted hover:text-ide-text hover:bg-ide-panel-hover'
                  )}
                  title={cat.title}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] leading-tight">{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Component Grid */}
      <div className="min-h-0 flex-1 overflow-auto">
        {activeCategory.items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-ide-text-subtle">
            No components in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {activeCategory.items.map((item) => {
              const wokwiConfig = WOKWI_PARTS[item.id];
              const Icon = activeCategory.icon;

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Add ${item.name} component`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData(FUNDI_PART_MIME, item.id);
                  }}
                  onKeyDown={(e) => {
                    // Allow keyboard users to trigger component addition
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Show component info on keyboard activation
                      alert(`Drag '${item.name}' to the canvas to add it.\n\n${item.description || 'No description available.'}`);
                    }
                  }}
                  className={cn(
                    'group relative flex cursor-grab flex-col items-center justify-center',
                    'rounded-lg border p-2 transition-all duration-200',
                    'bg-ide-panel-surface border-ide-border',
                    'hover:border-ide-accent/50 hover:bg-ide-panel-hover',
                    'focus:outline-none focus:ring-2 focus:ring-ide-accent focus:ring-offset-2 focus:ring-offset-ide-panel-bg',
                    'active:cursor-grabbing active:scale-95'
                  )}
                  title={item.description ?? item.name}
                >
                  {/* Actual Wokwi Element Preview */}
                  <WokwiElementPreview elementTag={wokwiConfig.element} fallbackIcon={Icon} />

                  {/* Label */}
                  <div className="mt-1.5 text-center">
                    <div className="font-mono text-[9px] text-ide-text-muted group-hover:text-ide-text transition-colors leading-tight">
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
