'use client';

import { useState } from 'react';
import { WOKWI_PARTS, WokwiPartType } from '@/lib/wokwiParts';
import WokwiPartNode from './nodes/WokwiPartNode';

/**
 * Component selector UI that allows switching between different Wokwi parts
 */
export default function PartSelector() {
    const [selectedPart, setSelectedPart] = useState<WokwiPartType>('arduino-uno');

    const partOptions = Object.entries(WOKWI_PARTS).map(([key, config]) => ({
        value: key as WokwiPartType,
        label: config.name,
        description: config.description,
    }));

    return (
        <div className="flex flex-col gap-4">
            {/* Selector UI */}
            <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <label className="text-sm text-slate-400 font-medium">Component:</label>
                <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value as WokwiPartType)}
                    className="bg-slate-900 text-slate-200 px-3 py-1.5 rounded border border-slate-600 
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
                               text-sm cursor-pointer"
                >
                    {partOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="text-xs text-slate-500 hidden sm:inline">
                    {WOKWI_PARTS[selectedPart]?.description}
                </span>
            </div>

            {/* Part Display */}
            <div className="flex justify-center items-center p-4 bg-slate-900/30 rounded-lg border border-slate-800 min-h-[300px]">
                <WokwiPartNode partType={selectedPart} />
            </div>

            {/* Pin count info */}
            <div className="text-center text-xs text-slate-500">
                Hover over pins to see their names
            </div>
        </div>
    );
}
