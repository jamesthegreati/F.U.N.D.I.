import type React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'wokwi-arduino-uno': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}
