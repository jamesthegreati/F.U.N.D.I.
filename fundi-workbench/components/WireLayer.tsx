'use client';

import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { useWiring } from '@/store/WiringContext';
import {
    calculateOrthogonalPath,
    calculatePreviewPath,
    pointsToSvgPath,
} from '@/utils/wireRouting';
import type { Wire, WirePoint } from '@/types/wire';
import WireToolbar from './WireToolbar';

interface WireLayerProps {
    /** Map of nodeId:pinId to absolute coordinates */
    pinPositions: Map<string, WirePoint>;
    /** Container element for coordinate calculations */
    containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * SVG overlay that renders all wires with orthogonal routing.
 * Handles wire rendering, preview during creation, selection, and visual handles.
 */
function WireLayer({ pinPositions, containerRef }: WireLayerProps) {
    const {
        state,
        getActiveWire,
        selectWire,
        cancelWire,
    } = useWiring();

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

    // Update dimensions when container changes
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [containerRef]);

    // Handle escape key to cancel wire creation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && state.mode === 'creating') {
                cancelWire();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.mode, cancelWire]);

    // Get pin position from map
    const getPinPosition = useCallback(
        (nodeId: string, pinId: string): WirePoint | null => {
            const key = `${nodeId}:${pinId}`;
            return pinPositions.get(key) ?? null;
        },
        [pinPositions]
    );

    // Calculate path for a completed wire
    const getWirePath = useCallback(
        (wire: Wire): WirePoint[] | null => {
            const sourcePos = getPinPosition(wire.sourcePin.nodeId, wire.sourcePin.pinId);
            if (!sourcePos) return null;

            if (!wire.targetPin) {
                // Still creating - use preview point
                if (!state.previewPoint) return null;
                return calculatePreviewPath(sourcePos, state.previewPoint, wire.waypoints);
            }

            const targetPos = getPinPosition(wire.targetPin.nodeId, wire.targetPin.pinId);
            if (!targetPos) return null;

            return calculateOrthogonalPath(sourcePos, targetPos, wire.waypoints);
        },
        [getPinPosition, state.previewPoint]
    );

    // Handle wire click for selection
    const handleWireClick = useCallback(
        (e: React.MouseEvent, wireId: string, pathPoints: WirePoint[]) => {
            e.stopPropagation();
            selectWire(wireId);

            // Calculate toolbar position (midpoint of wire)
            if (pathPoints.length >= 2) {
                const midIndex = Math.floor(pathPoints.length / 2);
                const midPoint = pathPoints[midIndex];
                setToolbarPosition({ x: midPoint.x, y: midPoint.y });
            }
        },
        [selectWire]
    );

    // Handle background click to deselect
    const handleBackgroundClick = useCallback(() => {
        if (state.selectedWireId) {
            selectWire(null);
            setToolbarPosition(null);
        }
    }, [state.selectedWireId, selectWire]);

    // Render a single wire
    const renderWire = useCallback(
        (wire: Wire) => {
            const pathPoints = getWirePath(wire);
            if (!pathPoints || pathPoints.length < 2) return null;

            const isSelected = state.selectedWireId === wire.id;
            const isCreating = state.activeWireId === wire.id && !wire.targetPin;

            return (
                <g key={wire.id}>
                    {/* Invisible wider hit area for easier clicking */}
                    <polyline
                        points={pointsToSvgPath(pathPoints)}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={12}
                        style={{ cursor: isCreating ? 'default' : 'pointer' }}
                        onClick={(e) => !isCreating && handleWireClick(e, wire.id, pathPoints)}
                    />

                    {/* Visible wire */}
                    <polyline
                        points={pointsToSvgPath(pathPoints)}
                        fill="none"
                        stroke={wire.color}
                        strokeWidth={isSelected ? 3 : 2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            transition: 'stroke-width 0.1s ease',
                            filter: isSelected ? 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.5))' : undefined,
                        }}
                    />

                    {/* Selection handles */}
                    {isSelected && (
                        <>
                            {/* Endpoint handles */}
                            <circle
                                cx={pathPoints[0].x}
                                cy={pathPoints[0].y}
                                r={5}
                                fill="#a855f7"
                                stroke="#7c3aed"
                                strokeWidth={2}
                            />
                            <circle
                                cx={pathPoints[pathPoints.length - 1].x}
                                cy={pathPoints[pathPoints.length - 1].y}
                                r={5}
                                fill="#a855f7"
                                stroke="#7c3aed"
                                strokeWidth={2}
                            />

                            {/* Waypoint handles */}
                            {wire.waypoints.map((wp, index) => (
                                <circle
                                    key={index}
                                    cx={wp.x}
                                    cy={wp.y}
                                    r={4}
                                    fill="#a855f7"
                                    stroke="#7c3aed"
                                    strokeWidth={1.5}
                                    style={{ cursor: 'move' }}
                                />
                            ))}
                        </>
                    )}
                </g>
            );
        },
        [getWirePath, state.selectedWireId, state.activeWireId, handleWireClick]
    );

    // Only render completed wires and the active one
    const completedWires = useMemo(
        () => state.wires.filter((w) => w.targetPin !== null),
        [state.wires]
    );

    const activeWire = getActiveWire();

    if (dimensions.width === 0 || dimensions.height === 0) {
        return null;
    }

    return (
        <>
            <svg
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'visible',
                    zIndex: 10,
                }}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                onClick={handleBackgroundClick}
            >
                {/* Render completed wires */}
                <g style={{ pointerEvents: 'auto' }}>
                    {completedWires.map(renderWire)}
                </g>

                {/* Render active wire being created */}
                {activeWire && renderWire(activeWire)}
            </svg>

            {/* Toolbar for selected wire */}
            {state.selectedWireId && toolbarPosition && (
                <WireToolbar position={toolbarPosition} />
            )}
        </>
    );
}

export default memo(WireLayer);
