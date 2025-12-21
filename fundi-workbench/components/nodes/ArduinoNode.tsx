'use client'

import '@wokwi/elements'
import type { CSSProperties } from 'react'
import { Handle, Position } from '@xyflow/react'

const HANDLE_SIZE = 14

const hiddenHandleStyle: CSSProperties = {
  width: HANDLE_SIZE,
  height: HANDLE_SIZE,
  background: 'transparent',
  border: 'none',
  opacity: 0,
}

export default function ArduinoNode() {
  return (
    <div className="relative overflow-hidden rounded-md border border-slate-800 bg-slate-950">
      <div className="p-3">
        <div className="relative">
          <wokwi-arduino-uno />

          {/* Pin 13 (approx top 5%, right 10%) */}
          <Handle
            id="pin-13"
            type="source"
            position={Position.Right}
            style={{ ...hiddenHandleStyle, left: 155, top: 20 }}
          />

          {/* Pin 2 */}
          <Handle
            id="pin-2"
            type="source"
            position={Position.Right}
            style={{ ...hiddenHandleStyle, left: 155, top: 85 }}
          />

          {/* GND (bottom) */}
          <Handle
            id="gnd"
            type="source"
            position={Position.Bottom}
            style={{ ...hiddenHandleStyle, left: 78, top: 186 }}
          />
        </div>
      </div>
    </div>
  )
}
