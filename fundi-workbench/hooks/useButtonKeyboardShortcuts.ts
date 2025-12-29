'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Key binding configuration for pushbutton components
 * Maps keyboard keys to button part IDs
 */
export interface KeyBinding {
    /** Key code or character to bind */
    key: string;
    /** Part ID of the button to trigger */
    partId: string;
    /** Display label for the key */
    label?: string;
}

/**
 * Hook to manage keyboard shortcuts for pushbutton components
 * @param bindings Array of key bindings
 * @param onButtonPress Callback when a button is pressed
 * @param onButtonRelease Callback when a button is released
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useButtonKeyboardShortcuts(
    bindings: KeyBinding[],
    onButtonPress: (partId: string) => void,
    onButtonRelease: (partId: string) => void,
    enabled: boolean = true
) {
    // Track currently pressed keys to avoid repeated events
    const pressedKeys = useRef<Set<string>>(new Set());

    // Create lookup map for quick key->partId resolution
    const keyToPartId = useRef<Map<string, string>>(new Map());

    // Update binding map when bindings change
    useEffect(() => {
        keyToPartId.current.clear();
        for (const binding of bindings) {
            keyToPartId.current.set(binding.key.toLowerCase(), binding.partId);
        }
    }, [bindings]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        // Ignore if user is typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        const key = e.key.toLowerCase();
        const partId = keyToPartId.current.get(key);

        if (partId && !pressedKeys.current.has(key)) {
            pressedKeys.current.add(key);
            onButtonPress(partId);
            console.log(`[KeyboardShortcut] Button press: ${key} -> ${partId}`);
        }
    }, [enabled, onButtonPress]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (!enabled) return;

        const key = e.key.toLowerCase();
        const partId = keyToPartId.current.get(key);

        if (partId && pressedKeys.current.has(key)) {
            pressedKeys.current.delete(key);
            onButtonRelease(partId);
            console.log(`[KeyboardShortcut] Button release: ${key} -> ${partId}`);
        }
    }, [enabled, onButtonRelease]);

    // Clear all pressed keys when focus is lost
    const handleBlur = useCallback(() => {
        for (const key of pressedKeys.current) {
            const partId = keyToPartId.current.get(key);
            if (partId) {
                onButtonRelease(partId);
            }
        }
        pressedKeys.current.clear();
    }, [onButtonRelease]);

    useEffect(() => {
        if (!enabled) return;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);

            // Release any pressed keys on unmount
            handleBlur();
        };
    }, [enabled, handleKeyDown, handleKeyUp, handleBlur]);
}

/**
 * Default key suggestions based on button position/index
 */
export const DEFAULT_BUTTON_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

/**
 * Generate automatic key bindings for a list of button part IDs
 */
export function generateAutoBindings(buttonPartIds: string[]): KeyBinding[] {
    return buttonPartIds.map((partId, index) => ({
        key: DEFAULT_BUTTON_KEYS[index] || `F${index - 9}`,
        partId,
        label: `Button ${index + 1}`,
    }));
}
