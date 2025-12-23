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
            className="absolute z-50 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-sm"
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
                        className={`h-5 w-5 rounded border-2 transition-transform hover:scale-110 ${selectedWire.color === color
                                ? 'border-white'
                                : 'border-transparent hover:border-slate-500'
                            }`}
                        style={{ backgroundColor: color }}
                        title={`Change color to ${color}`}
                    />
                ))}
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-slate-700" />

            {/* Delete button */}
            <button
                type="button"
                onClick={handleDelete}
                className="flex h-6 w-6 items-center justify-center rounded text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                title="Delete wire"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {/* Close button */}
            <button
                type="button"
                onClick={handleClose}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-200"
                title="Close"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export default memo(WireToolbar);
