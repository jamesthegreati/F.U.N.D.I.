'use client';

import React, {
    createContext,
    useContext,
    useReducer,
    useCallback,
    type ReactNode,
} from 'react';
import { nanoid } from 'nanoid';
import type {
    Wire,
    WirePoint,
    WiringState,
    PinReference,
} from '@/types/wire';
import { DEFAULT_WIRE_COLOR } from '@/types/wire';

// Actions
type WiringAction =
    | { type: 'START_WIRE'; payload: { pin: PinReference; position: WirePoint } }
    | { type: 'ADD_WAYPOINT'; payload: { position: WirePoint } }
    | { type: 'UPDATE_PREVIEW'; payload: { position: WirePoint } }
    | { type: 'COMPLETE_WIRE'; payload: { pin: PinReference; position: WirePoint } }
    | { type: 'CANCEL_WIRE' }
    | { type: 'SELECT_WIRE'; payload: { wireId: string | null } }
    | { type: 'DELETE_WIRE'; payload: { wireId: string } }
    | { type: 'UPDATE_WIRE_COLOR'; payload: { wireId: string; color: string } }
    | { type: 'UPDATE_WAYPOINT'; payload: { wireId: string; index: number; position: WirePoint } };

// Initial state
const initialState: WiringState = {
    mode: 'idle',
    wires: [],
    activeWireId: null,
    selectedWireId: null,
    previewPoint: null,
};

// Reducer
function wiringReducer(state: WiringState, action: WiringAction): WiringState {
    switch (action.type) {
        case 'START_WIRE': {
            const newWire: Wire = {
                id: nanoid(),
                sourcePin: action.payload.pin,
                targetPin: null,
                waypoints: [],
                color: DEFAULT_WIRE_COLOR,
            };
            return {
                ...state,
                mode: 'creating',
                wires: [...state.wires, newWire],
                activeWireId: newWire.id,
                selectedWireId: null,
                previewPoint: action.payload.position,
            };
        }

        case 'ADD_WAYPOINT': {
            if (!state.activeWireId) return state;
            return {
                ...state,
                wires: state.wires.map((wire) =>
                    wire.id === state.activeWireId
                        ? { ...wire, waypoints: [...wire.waypoints, action.payload.position] }
                        : wire
                ),
            };
        }

        case 'UPDATE_PREVIEW': {
            return {
                ...state,
                previewPoint: action.payload.position,
            };
        }

        case 'COMPLETE_WIRE': {
            if (!state.activeWireId) return state;
            return {
                ...state,
                mode: 'idle',
                wires: state.wires.map((wire) =>
                    wire.id === state.activeWireId
                        ? { ...wire, targetPin: action.payload.pin }
                        : wire
                ),
                activeWireId: null,
                previewPoint: null,
            };
        }

        case 'CANCEL_WIRE': {
            if (!state.activeWireId) return state;
            return {
                ...state,
                mode: 'idle',
                wires: state.wires.filter((w) => w.id !== state.activeWireId),
                activeWireId: null,
                previewPoint: null,
            };
        }

        case 'SELECT_WIRE': {
            return {
                ...state,
                selectedWireId: action.payload.wireId,
                mode: action.payload.wireId ? 'editing' : 'idle',
            };
        }

        case 'DELETE_WIRE': {
            return {
                ...state,
                wires: state.wires.filter((w) => w.id !== action.payload.wireId),
                selectedWireId:
                    state.selectedWireId === action.payload.wireId ? null : state.selectedWireId,
                mode: state.selectedWireId === action.payload.wireId ? 'idle' : state.mode,
            };
        }

        case 'UPDATE_WIRE_COLOR': {
            return {
                ...state,
                wires: state.wires.map((wire) =>
                    wire.id === action.payload.wireId
                        ? { ...wire, color: action.payload.color }
                        : wire
                ),
            };
        }

        case 'UPDATE_WAYPOINT': {
            return {
                ...state,
                wires: state.wires.map((wire) => {
                    if (wire.id !== action.payload.wireId) return wire;
                    const newWaypoints = [...wire.waypoints];
                    newWaypoints[action.payload.index] = action.payload.position;
                    return { ...wire, waypoints: newWaypoints };
                }),
            };
        }

        default:
            return state;
    }
}

// Context types
interface WiringContextValue {
    state: WiringState;
    startWire: (pin: PinReference, position: WirePoint) => void;
    addWaypoint: (position: WirePoint) => void;
    updatePreview: (position: WirePoint) => void;
    completeWire: (pin: PinReference, position: WirePoint) => void;
    cancelWire: () => void;
    selectWire: (wireId: string | null) => void;
    deleteWire: (wireId: string) => void;
    updateWireColor: (wireId: string, color: string) => void;
    updateWaypoint: (wireId: string, index: number, position: WirePoint) => void;
    getActiveWire: () => Wire | null;
    getSelectedWire: () => Wire | null;
}

const WiringContext = createContext<WiringContextValue | null>(null);

// Provider component
export function WiringProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(wiringReducer, initialState);

    const startWire = useCallback((pin: PinReference, position: WirePoint) => {
        dispatch({ type: 'START_WIRE', payload: { pin, position } });
    }, []);

    const addWaypoint = useCallback((position: WirePoint) => {
        dispatch({ type: 'ADD_WAYPOINT', payload: { position } });
    }, []);

    const updatePreview = useCallback((position: WirePoint) => {
        dispatch({ type: 'UPDATE_PREVIEW', payload: { position } });
    }, []);

    const completeWire = useCallback((pin: PinReference, position: WirePoint) => {
        dispatch({ type: 'COMPLETE_WIRE', payload: { pin, position } });
    }, []);

    const cancelWire = useCallback(() => {
        dispatch({ type: 'CANCEL_WIRE' });
    }, []);

    const selectWire = useCallback((wireId: string | null) => {
        dispatch({ type: 'SELECT_WIRE', payload: { wireId } });
    }, []);

    const deleteWire = useCallback((wireId: string) => {
        dispatch({ type: 'DELETE_WIRE', payload: { wireId } });
    }, []);

    const updateWireColor = useCallback((wireId: string, color: string) => {
        dispatch({ type: 'UPDATE_WIRE_COLOR', payload: { wireId, color } });
    }, []);

    const updateWaypoint = useCallback(
        (wireId: string, index: number, position: WirePoint) => {
            dispatch({ type: 'UPDATE_WAYPOINT', payload: { wireId, index, position } });
        },
        []
    );

    const getActiveWire = useCallback(() => {
        if (!state.activeWireId) return null;
        return state.wires.find((w) => w.id === state.activeWireId) ?? null;
    }, [state.activeWireId, state.wires]);

    const getSelectedWire = useCallback(() => {
        if (!state.selectedWireId) return null;
        return state.wires.find((w) => w.id === state.selectedWireId) ?? null;
    }, [state.selectedWireId, state.wires]);

    const value: WiringContextValue = {
        state,
        startWire,
        addWaypoint,
        updatePreview,
        completeWire,
        cancelWire,
        selectWire,
        deleteWire,
        updateWireColor,
        updateWaypoint,
        getActiveWire,
        getSelectedWire,
    };

    return <WiringContext.Provider value={value}>{children}</WiringContext.Provider>;
}

// Hook to use wiring context
export function useWiring(): WiringContextValue {
    const context = useContext(WiringContext);
    if (!context) {
        throw new Error('useWiring must be used within a WiringProvider');
    }
    return context;
}
