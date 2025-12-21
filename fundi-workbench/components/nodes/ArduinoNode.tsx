'use client'

import '@wokwi/elements'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Handle, Position } from '@xyflow/react'

const HANDLE_SIZE = 26

const hiddenHandleStyle: CSSProperties = {
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  background: 'transparent',
  border: 'none',
  opacity: 0,
}

type UnoPinInfo = {
  name: string
  x: number
  y: number
}

type PinPercent = {
  xPct: number
  yPct: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUnoPinInfo(value: unknown): value is UnoPinInfo {
  if (!isRecord(value)) return false
  return (
    typeof value.name === 'string' &&
    typeof value.x === 'number' &&
    typeof value.y === 'number'
  )
}

async function waitForPinInfo(el: HTMLElement, timeoutMs = 5000) {
  const start = performance.now()

  while (true) {
    const pinInfo = (el as unknown as { pinInfo?: unknown }).pinInfo

    if (Array.isArray(pinInfo) && pinInfo.every(isUnoPinInfo) && pinInfo.length > 0) {
      return pinInfo
    }

    if (performance.now() - start > timeoutMs) {
      throw new Error('Timed out waiting for wokwi-arduino-uno.pinInfo')
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }
}

function toPct(value: number, total: number) {
  return (value / total) * 100
}

function clampPct(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

function getSvgIntrinsicSize(el: HTMLElement) {
  const root = (el as unknown as { shadowRoot?: ShadowRoot }).shadowRoot
  const svg = root?.querySelector('svg') as SVGSVGElement | null
  if (!svg) return null

  const width = svg.width?.baseVal?.value
  const height = svg.height?.baseVal?.value

  if (
    typeof width === 'number' &&
    typeof height === 'number' &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return { width, height }
  }

  const widthAttr = svg.getAttribute('width')
  const heightAttr = svg.getAttribute('height')
  const widthNum = widthAttr ? Number(widthAttr) : NaN
  const heightNum = heightAttr ? Number(heightAttr) : NaN

  if (
    Number.isFinite(widthNum) &&
    Number.isFinite(heightNum) &&
    widthNum > 0 &&
    heightNum > 0
  ) {
    return { width: widthNum, height: heightNum }
  }

  const vb = svg.viewBox?.baseVal
  if (vb && vb.width > 0 && vb.height > 0) {
    return { width: vb.width, height: vb.height }
  }

  return null
}

export default function ArduinoNode() {
  const unoRef = useRef<HTMLElement | null>(null)
  const [pinMap, setPinMap] = useState<Record<string, PinPercent> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      const el = unoRef.current
      if (!el) return

      await customElements.whenDefined('wokwi-arduino-uno')
      const pins = await waitForPinInfo(el)
      const size = getSvgIntrinsicSize(el)
      if (!size) return

      const next: Record<string, PinPercent> = {}
      for (const p of pins) {
        next[p.name] = {
          xPct: clampPct(toPct(p.x, size.width)),
          yPct: clampPct(toPct(p.y, size.height)),
        }
      }

      // Choose the bottom-most GND pin to align with "GND (bottom)".
      const gndPins = pins.filter((p) => p.name.startsWith('GND'))
      if (gndPins.length > 0) {
        const lowest = gndPins.reduce((acc, cur) => (cur.y > acc.y ? cur : acc))
        next.GND = {
          xPct: clampPct(toPct(lowest.x, size.width)),
          yPct: clampPct(toPct(lowest.y, size.height)),
        }
      }

      if (!cancelled) setPinMap(next)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const pin13 = pinMap?.['13']
  const pin2 = pinMap?.['2']
  const gnd = pinMap?.GND

  const handleBaseStyle = useMemo<CSSProperties>(
    () => ({
      ...hiddenHandleStyle,
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      pointerEvents: 'all',
      cursor: 'crosshair',
    }),
    []
  )

  return (
    <div className="relative overflow-hidden rounded-md border border-slate-800 bg-slate-950">
      <div className="p-3">
        <div className="relative inline-block">
          <wokwi-arduino-uno ref={unoRef as unknown as React.RefObject<HTMLElement>} />

          {/* Pin 13 */}
          {pin13 && (
            <Handle
              id="pin-13"
              type="source"
              position={Position.Right}
              style={{
                ...handleBaseStyle,
                left: `${pin13.xPct}%`,
                top: `${pin13.yPct}%`,
              }}
            />
          )}

          {/* Pin 2 */}
          {pin2 && (
            <Handle
              id="pin-2"
              type="source"
              position={Position.Right}
              style={{
                ...handleBaseStyle,
                left: `${pin2.xPct}%`,
                top: `${pin2.yPct}%`,
              }}
            />
          )}

          {/* GND (bottom-most) */}
          {gnd && (
            <Handle
              id="gnd"
              type="source"
              position={Position.Bottom}
              style={{
                ...handleBaseStyle,
                left: `${gnd.xPct}%`,
                top: `${gnd.yPct}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
