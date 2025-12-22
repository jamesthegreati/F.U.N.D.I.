export interface ElementPin {
    name: string;
    x: number;
    y: number;
    // Add other properties if needed
}

declare module '@wokwi/elements' {
    export interface ElementPin {
        name: string;
        x: number;
        y: number;
    }
}

import type React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'wokwi-arduino-uno': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement> & {
                    // You can access this via ref, it's not a React prop
                },
                HTMLElement
            > & {
                pinInfo?: ElementPin[];
            };
            // ... other elements
        }
    }
}
