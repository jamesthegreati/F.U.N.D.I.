import type React from 'react';

declare module '@wokwi/elements' {
    // Just ensuring the module is recognized
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'wokwi-arduino-uno': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}
