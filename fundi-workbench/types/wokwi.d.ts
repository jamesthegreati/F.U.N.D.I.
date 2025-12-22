import type React from 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'wokwi-arduino-uno': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
            'wokwi-esp32-devkit-v1': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
            'wokwi-arduino-mega': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
            'wokwi-arduino-nano': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}
