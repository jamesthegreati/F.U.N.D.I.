declare module '@wokwi/elements' {}

import type React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wokwi-arduino-uno': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'wokwi-led': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
      'wokwi-resistor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >
    }
  }
}

export {}
