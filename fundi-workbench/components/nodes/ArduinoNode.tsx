'use client'

import '@wokwi/elements'
import { memo, useEffect, useRef, useState } from 'react'
import { Handle, Position } from '@xyflow/react'

import { ARDUINO_UNO_PINS, type ArduinoPin } from './pin-maps'

// The wokwi-arduino-uno element's internal coordinate system
// viewBox is "-4 0 72.58 53.34" but pinInfo uses scaled coordinates
// We need to map pinInfo coords to actual element pixels
const PIN_COORD_SCALE = {
  // pinInfo x ranges from ~87 to ~255.5, maps to element width
  minX: 83,
  maxX: 259.5,
  // pinInfo y: 9 = top, 191.5 = bottom
  minY: 0,
  maxY: 200,
}

function ArduinoNode() {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null)
  const [elementSize, setElementSize] = useState({ width: 274, height: 200 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const wokwiElement = containerRef.current.querySelector('wokwi-arduino-uno')
        if (wokwiElement) {
          const rect = wokwiElement.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setElementSize({ width: rect.width, height: rect.height })
          }
        }
      }
    }

    // Wait for web component to render
    const timer = setTimeout(updateSize, 100)
    window.addEventListener('resize', updateSize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Convert pinInfo coordinates to pixel position
  const getPinPosition = (pin: ArduinoPin) => {
    // Map x from pinInfo range to element width percentage
    const xPercent = ((pin.x - PIN_COORD_SCALE.minX) / (PIN_COORD_SCALE.maxX - PIN_COORD_SCALE.minX)) * 100

    // Map y: 9 = ~4.5%, 191.5 = ~95.75%
    const yPercent = (pin.y / PIN_COORD_SCALE.maxY) * 100

    return {
      left: `${xPercent}%`,
      top: `${yPercent}%`,
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <wokwi-arduino-uno />

      {ARDUINO_UNO_PINS.map((pin) => {
        const isHovered = hoveredPin === pin.id
        const position = getPinPosition(pin)
        const isTopRow = pin.row === 'top'

        return (
          <div
            key={pin.id}
            className="absolute"
            style={{
              left: position.left,
              top: position.top,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => setHoveredPin(pin.id)}
            onMouseLeave={() => setHoveredPin(null)}
          >
            <Handle
              id={pin.id}
              type={pin.type}
              position={isTopRow ? Position.Top : Position.Bottom}
              style={{
                position: 'relative',
                width: 8,
                height: 8,
                background: isHovered ? 'rgba(34, 197, 94, 0.95)' : 'rgba(34, 197, 94, 0.6)',
                border: isHovered ? '1.5px solid rgb(22, 163, 74)' : '1px solid rgba(22, 163, 74, 0.7)',
                borderRadius: '50%',
                cursor: 'crosshair',
                transition: 'all 0.1s ease',
                boxShadow: isHovered
                  ? '0 0 6px 1px rgba(34, 197, 94, 0.5)'
                  : 'none',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                zIndex: isHovered ? 100 : 10,
              }}
            />
            {isHovered && (
              <div
                className="pointer-events-none absolute z-50 whitespace-nowrap rounded bg-slate-900/95 px-1.5 py-0.5 text-[10px] font-medium text-green-400 shadow-md ring-1 ring-green-500/40"
                style={{
                  left: '50%',
                  top: isTopRow ? 'calc(100% + 4px)' : 'auto',
                  bottom: isTopRow ? 'auto' : 'calc(100% + 4px)',
                  transform: 'translateX(-50%)',
                }}
              >
                {pin.id.replace('.1', '').replace('.2', '').replace('.3', '')}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default memo(ArduinoNode)
