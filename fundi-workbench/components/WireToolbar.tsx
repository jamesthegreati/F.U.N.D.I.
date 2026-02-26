'use client';

import { memo } from 'react';
import { Trash2, X } from 'lucide-react';
import { WIRE_COLORS } from '@/types/wire';
import { useWiring } from '@/store/WiringContext';

interface WireToolbarProps {
    position: { x: number; y: number };
}

/**
 * Floating toolbar shown when a wire is selected.
 * Provides color palette and delete button.
 */
function WireToolbar({ position }: WireToolbarProps) {
    const { getSelectedWire, updateWireColor, deleteWire, selectWire } = useWiring();
    const selectedWire = getSelectedWire();

    if (!selectedWire) return null;

    const handleColorClick = (color: string) => {
        updateWireColor(selectedWire.id, color);
    };

    const handleDelete = () => {
        deleteWire(selectedWire.id);
    };

    const handleClose = () => {
        selectWire(null);
    };

    return (
        <div
            className="absolute z-50 flex items-center gap-1.5 rounded-xl border border-ide-border bg-ide-panel-surface/95 p-2 shadow-ide-lg backdrop-blur-md animate-in"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -100%) translateY(-8px)',
            }}
        >
            {/* Color palette */}
            <div className="flex gap-0.5">
                {WIRE_COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => handleColorClick(color)}
                        className={`h-5 w-5 rounded-full border-2 transition-all duration-200 ${selectedWire.color === color
                                ? 'border-ide-text scale-110'
                                : 'border-transparent hover:border-ide-border-focus hover:scale-105'
                            }`}
                        style={{ backgroundColor: color }}
                        title={`Change color to ${color}`}
                    />
                ))}
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-ide-border" />

            {/* Delete button */}
            <button
                type="button"
                onClick={handleDelete}
                className="btn-press flex h-7 w-7 items-center justify-center rounded-lg text-ide-error transition-colors hover:bg-ide-error/20"
                title="Delete wire"
            >
                <Trash2 className="icon-balanced h-4 w-4" />
            </button>

            {/* Close button */}
            <button
                type="button"
                onClick={handleClose}
                className="btn-press flex h-7 w-7 items-center justify-center rounded-lg text-ide-text-muted transition-colors hover:bg-ide-panel-hover hover:text-ide-text"
                title="Close"
            >
                <X className="icon-balanced h-4 w-4" />
            </button>
        </div>
    );
}

export default memo(WireToolbar);
