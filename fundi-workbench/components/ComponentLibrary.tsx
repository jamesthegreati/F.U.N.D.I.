'use client';

import '@wokwi/elements';
import { memo, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Cpu, Lightbulb, Gauge, Monitor, Zap, CircuitBoard, Settings, Cog, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WokwiPartType } from '@/lib/wokwiParts';
import { WOKWI_PARTS, type ComponentCategory } from '@/lib/wokwiParts';
import { cn } from '@/utils/cn';

export const FUNDI_PART_MIME = 'application/x-fundi-part';

type PartCatalogItem = {
  id: WokwiPartType;
  name: string;
  description?: string;
};

type CatalogCategory = {
  key: ComponentCategory;
  title: string;
  items: PartCatalogItem[];
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * Cache for extracted SVG content from Wokwi elements
 */
const svgCache = new Map<string, string | null>();

/**
 * Extract SVG content from a Wokwi custom element's shadow DOM
 */
function extractSvgFromElement(element: Element): string | null {
  // Try to get SVG from shadow root
  const shadowRoot = element.shadowRoot;
  if (shadowRoot) {
    const svg = shadowRoot.querySelector('svg');
    if (svg) {
      return svg.outerHTML;
    }
  }
  // Try direct child SVG
  const directSvg = element.querySelector('svg');
  if (directSvg) {
    return directSvg.outerHTML;
  }
  return null;
}

/**
 * Renders an actual Wokwi element as a preview icon with SVG extraction
 */
function WokwiElementPreview({
  elementTag,
  partId,
  fallbackIcon: FallbackIcon,
}: {
  elementTag: string;
  partId: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgState, setSvgState] = useState<{ partId: string; svg: string } | null>(null);
  const [fallbackPartId, setFallbackPartId] = useState<string | null>(null);

  const cached = svgCache.get(partId);
  const effectiveSvg = typeof cached === 'string' ? cached : svgState?.partId === partId ? svgState.svg : null;
  const usesFallback = cached === null || fallbackPartId === partId;

  useEffect(() => {
    // Cache hit: render directly from `cached`.
    if (svgCache.has(partId)) return;

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
        element.setAttribute('value', '1'); // Show lit state
      } else if (elementTag === 'wokwi-pushbutton') {
        element.setAttribute('color', 'red');
      } else if (elementTag === 'wokwi-rgb-led') {
        element.setAttribute('r', '1');
        element.setAttribute('g', '0');
        element.setAttribute('b', '0');
      } else if (elementTag === 'wokwi-neopixel') {
        element.setAttribute('r', '255');
        element.setAttribute('g', '100');
        element.setAttribute('b', '0');
      } else if (elementTag === 'wokwi-led-ring') {
        element.setAttribute('pixels', '16');
      } else if (elementTag === 'wokwi-neopixel-matrix') {
        element.setAttribute('rows', '8');
        element.setAttribute('cols', '8');
      } else if (elementTag === 'wokwi-lcd1602' || elementTag === 'wokwi-lcd2004') {
        // Without this, these sometimes render empty in previews.
        element.setAttribute('pins', 'i2c');
      }

      container.appendChild(element);

      // Wait for custom element to be defined and render
      const tryExtractSvg = () => {
        const svg = extractSvgFromElement(element);
        if (svg) {
          svgCache.set(partId, svg);
          setSvgState({ partId, svg });
          setFallbackPartId(null);
        } else {
          // Mark as fallback needed if no SVG after delay
          svgCache.set(partId, null);
          setFallbackPartId(partId);
        }
      };

      // Try immediately, then with delays for custom elements that render async
      requestAnimationFrame(() => {
        if (!extractSvgFromElement(element)) {
          setTimeout(tryExtractSvg, 100);
        } else {
          tryExtractSvg();
        }
      });
    } catch (error) {
      console.error(`Failed to create wokwi element: ${elementTag}`, error);
      svgCache.set(partId, null);
      // Avoid synchronous setState directly in the effect body.
      queueMicrotask(() => setFallbackPartId(partId));
    }
  }, [elementTag, partId]);

  // If we have extracted SVG, render it directly
  if (effectiveSvg) {
    return (
      <div 
        className="relative flex h-10 w-10 items-center justify-center overflow-hidden [&_svg]:h-auto [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: effectiveSvg }}
        style={{
          transform: 'scale(0.6)',
          transformOrigin: 'center',
        }}
      />
    );
  }

  // Render the actual element (for elements that don't expose SVG or while loading)
  return (
    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden">
      {/* Wokwi element container - scaled down */}
      <div
        ref={containerRef}
        className="transition-transform duration-300 ease-out group-hover:scale-110"
        style={{
          transform: 'scale(0.5)',
          transformOrigin: 'center',
        }}
      />
      {/* Fallback icon if element fails to load */}
      {usesFallback && (
        <FallbackIcon className="icon-balanced absolute h-7 w-7 text-ide-text-muted transition-colors group-hover:text-ide-accent" />
      )}
    </div>
  );
}

export function buildPartCatalog(): CatalogCategory[] {
  const base: Record<ComponentCategory, PartCatalogItem[]> = {
    mcu: [],
    displays: [],
    leds: [],
    input: [],
    output: [],
    passive: [],
    logic: [],
    motors: [],
  };

  for (const id of Object.keys(WOKWI_PARTS) as WokwiPartType[]) {
    const cfg = WOKWI_PARTS[id];
    const cat = cfg.category ?? 'mcu';
    if (base[cat]) {
      base[cat].push({ id, name: cfg.name, description: cfg.description });
    }
  }

  return [
    { key: 'mcu', title: 'MCU', items: base.mcu, icon: Cpu },
    { key: 'displays', title: 'Display', items: base.displays, icon: Monitor },
    { key: 'leds', title: 'LEDs', items: base.leds, icon: Lightbulb },
    { key: 'input', title: 'Input', items: base.input, icon: Gauge },
    { key: 'output', title: 'Output', items: base.output, icon: Zap },
    { key: 'passive', title: 'Wiring', items: base.passive, icon: CircuitBoard },
    { key: 'logic', title: 'Logic', items: base.logic, icon: Settings },
    { key: 'motors', title: 'Motors', items: base.motors, icon: Cog },
  ] satisfies CatalogCategory[];
}

function ComponentLibrary() {
  const categories = useMemo(() => buildPartCatalog(), []);
  const [active, setActive] = useState<CatalogCategory['key']>('mcu');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activeCategory = categories.find((c) => c.key === active) ?? categories[0];

  // Check scroll state
  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    
    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 120;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Category Tabs - Horizontal Scrollable */}
      <div className="mb-3 shrink-0 border-b border-ide-border pb-3">
        <div className="relative flex items-center">
          {/* Left scroll arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 z-10 flex h-full items-center rounded-l-lg bg-gradient-to-r from-ide-panel-bg via-ide-panel-bg to-transparent px-1"
              aria-label="Scroll left"
            >
              <ChevronLeft className="icon-balanced h-4 w-4 text-ide-text-muted transition-colors hover:text-ide-accent" />
            </button>
          )}
          
          {/* Scrollable tabs container */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-1 overflow-x-auto scroll-smooth px-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => {
              const isActive = cat.key === active;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActive(cat.key)}
                  className={cn(
                    'tab-pill snap-start flex min-w-[64px] shrink-0 flex-col items-center gap-1.5 border px-2.5 py-2 text-xs font-medium',
                    isActive
                      ? 'border-ide-accent/50 bg-ide-accent/20 text-ide-accent'
                      : 'border-transparent text-ide-text-muted hover:border-ide-border-subtle hover:bg-ide-panel-hover hover:text-ide-text'
                  )}
                  title={cat.title}
                >
                  <Icon className="icon-balanced h-4 w-4" />
                  <span className="text-[10px] leading-none">{cat.title}</span>
                </button>
              );
            })}
          </div>
          
          {/* Right scroll arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 z-10 flex h-full items-center rounded-r-lg bg-gradient-to-l from-ide-panel-bg via-ide-panel-bg to-transparent px-1"
              aria-label="Scroll right"
            >
              <ChevronRight className="icon-balanced h-4 w-4 text-ide-text-muted transition-colors hover:text-ide-accent" />
            </button>
          )}
        </div>
      </div>

      {/* Component Grid */}
      <div className="min-h-0 flex-1 overflow-auto">
        {activeCategory.items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-ide-text-subtle">
            No components in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
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
                    'interactive-elevate rounded-xl border p-2.5 transition-all duration-200',
                    'bg-ide-panel-surface border-ide-border',
                    'hover:border-ide-accent/50 hover:bg-ide-panel-hover',
                    'focus:outline-none focus:ring-2 focus:ring-ide-accent focus:ring-offset-2 focus:ring-offset-ide-panel-bg',
                    'active:cursor-grabbing active:scale-95 active:translate-y-0'
                  )}
                  title={item.description ?? item.name}
                >
                  {/* Actual Wokwi Element Preview */}
                  <WokwiElementPreview elementTag={wokwiConfig.element} partId={item.id} fallbackIcon={Icon} />

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
