'use client'

import '@wokwi/elements'

import { useEffect, useRef } from 'react'

type UnoPinInfo = {
  name: string
  x: number
  y: number
}

type UnoPinPercent = {
  name: string
  xPct: number
  yPct: number
}

function toPct(value: number, total: number) {
  return Number(((value / total) * 100).toFixed(4))
}

function formatAsTsConstant(pins: UnoPinPercent[]) {
  const lines = pins.map(
    (p) =>
      `  { name: ${JSON.stringify(p.name)}, xPct: ${p.xPct}, yPct: ${p.yPct} },`
  )

  return [
    'export const ARDUINO_UNO_PINS = [',
    ...lines,
    
    '] as const',
  ].join('\n')
}

async function waitForPinInfo(el: HTMLElement, timeoutMs = 5000) {
  const start = performance.now()

  while (true) {
    const pinInfo = (el as unknown as { pinInfo?: unknown }).pinInfo
    if (Array.isArray(pinInfo) && pinInfo.length > 0) return pinInfo as UnoPinInfo[]

    if (performance.now() - start > timeoutMs) {
      throw new Error(
        'Timed out waiting for wokwi-arduino-uno.pinInfo. Make sure @wokwi/elements is loaded and the element rendered.'
      )
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

function getSvgViewBoxSize(el: HTMLElement) {
  const root = (el as unknown as { shadowRoot?: ShadowRoot }).shadowRoot
  const svg = root?.querySelector('svg') as SVGSVGElement | null

  if (!svg) return null

  const vb = svg.viewBox?.baseVal
  if (vb && vb.width > 0 && vb.height > 0) {
    return { width: vb.width, height: vb.height }
  }

  // Fallback: try width/height attributes if present.
  const widthAttr = svg.getAttribute('width')
  const heightAttr = svg.getAttribute('height')
  const width = widthAttr ? Number(widthAttr) : NaN
  const height = heightAttr ? Number(heightAttr) : NaN

  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return { width, height }
  }

  return null
}

function getSvgBBox(el: HTMLElement) {
  const root = (el as unknown as { shadowRoot?: ShadowRoot }).shadowRoot
  const svg = root?.querySelector('svg') as SVGSVGElement | null
  if (!svg) return null

  const bbox = svg.getBBox()
  if (bbox.width <= 0 || bbox.height <= 0) return null
  return bbox
}

export default function PinExtractor() {
  const unoRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const el = unoRef.current
      if (!el) return

      try {
        // Ensure the element is upgraded/defined.
        await customElements.whenDefined('wokwi-arduino-uno')

        const pins = await waitForPinInfo(el)
        const bbox = getSvgBBox(el)
        const size = getSvgViewBoxSize(el)

        if (!bbox) {
          throw new Error(
            'Could not read <svg> bbox from wokwi-arduino-uno shadowRoot. Cannot normalize pinInfo to percentages.'
          )
        }

        const normalized: UnoPinPercent[] = pins.map((p) => ({
          name: p.name,
          xPct: toPct(p.x - bbox.x, bbox.width),
          yPct: toPct(p.y - bbox.y, bbox.height),
        }))

        // Stable ordering for copy/paste diffs.
        normalized.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

        const code = formatAsTsConstant(normalized)
        if (cancelled) return

        // Copy/paste friendly output.
        console.log(code)

        // Also log some metadata for sanity checks.
        console.log('UNO bbox:', bbox)
        console.log('UNO viewBox size (optional):', size)
        console.log('Raw pinInfo (first 5):', pins.slice(0, 5))
      } catch (err) {
        if (cancelled) return
        console.error(err)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      aria-hidden={true}
      style={{
        position: 'fixed',
        left: -10000,
        top: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
      }}
    >
      <wokwi-arduino-uno ref={unoRef as unknown as React.RefObject<HTMLElement>} />
    </div>
  )
}
