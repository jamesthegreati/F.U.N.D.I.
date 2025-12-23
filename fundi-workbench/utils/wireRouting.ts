/**
 * Orthogonal wire routing utilities
 * 
 * Wokwi-style routing: all wire segments are strictly horizontal or vertical,
 * alternating between the two to create clean orthogonal paths.
 */

import type { WirePoint } from '@/types/wire';

type FirstLeg = 'horizontal' | 'vertical';

export function snapToGrid(value: number, gridSize: number): number {
    if (!Number.isFinite(value)) return value;
    if (!gridSize || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(point: WirePoint, gridSize: number): WirePoint {
    return { x: snapToGrid(point.x, gridSize), y: snapToGrid(point.y, gridSize) };
}

function dedupeColinear(points: WirePoint[]): WirePoint[] {
    if (points.length <= 2) return points;

    const result: WirePoint[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        const prev = result[result.length - 1];
        const curr = points[i];
        const next = points[i + 1];

        const sameAsPrev = prev.x === curr.x && prev.y === curr.y;
        if (sameAsPrev) continue;

        const colinearHorizontal = prev.y === curr.y && curr.y === next.y;
        const colinearVertical = prev.x === curr.x && curr.x === next.x;
        if (colinearHorizontal || colinearVertical) {
            continue;
        }

        result.push(curr);
    }

    const last = points[points.length - 1];
    const tail = result[result.length - 1];
    if (tail.x !== last.x || tail.y !== last.y) {
        result.push(last);
    }
    return result;
}

type Orientation = 'H' | 'V';

type Segment = {
    orientation: Orientation;
    coord: number; // y for H, x for V
    min: number;
    max: number;
};

function toSegments(points: WirePoint[]): Segment[] {
    const segs: Segment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (a.x === b.x && a.y === b.y) continue;
        if (a.y === b.y) {
            const min = Math.min(a.x, b.x);
            const max = Math.max(a.x, b.x);
            if (min !== max) segs.push({ orientation: 'H', coord: a.y, min, max });
        } else if (a.x === b.x) {
            const min = Math.min(a.y, b.y);
            const max = Math.max(a.y, b.y);
            if (min !== max) segs.push({ orientation: 'V', coord: a.x, min, max });
        }
    }
    return segs;
}

function rangesOverlapStrict(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
    // Strict overlap: touching at a single point is OK.
    return Math.min(aMax, bMax) > Math.max(aMin, bMin);
}

function hasParallelOverlap(points: WirePoint[], occupied: Map<string, Segment[]>): boolean {
    const segs = toSegments(points);
    for (const s of segs) {
        const key = `${s.orientation}:${s.coord}`;
        const list = occupied.get(key);
        if (!list?.length) continue;
        for (const o of list) {
            if (rangesOverlapStrict(s.min, s.max, o.min, o.max)) return true;
        }
    }
    return false;
}

function addOccupied(points: WirePoint[], occupied: Map<string, Segment[]>): void {
    for (const s of toSegments(points)) {
        const key = `${s.orientation}:${s.coord}`;
        const list = occupied.get(key);
        if (list) list.push(s);
        else occupied.set(key, [s]);
    }
}

function shiftSegmentKeepingEndpoints(
    points: WirePoint[],
    segmentIndex: number,
    orientation: Orientation,
    deltaPerp: number
): WirePoint[] {
    if (points.length < 2) return points;
    if (segmentIndex < 0 || segmentIndex >= points.length - 1) return points;
    if (deltaPerp === 0) return points;

    const out = points.map((p) => ({ ...p }));
    const lastIdx = out.length - 1;

    if (orientation === 'H') {
        // Horizontal segment => shift Y.
        if (segmentIndex === 0) {
            const p0 = out[0];
            const p1 = out[1];
            // Insert a vertical jog at the start point.
            const jog = { x: p0.x, y: p0.y + deltaPerp };
            out.splice(1, 0, jog);
            // Original p1 shifts (now at index 2).
            out[2].y = jog.y;
        } else if (segmentIndex === lastIdx - 1) {
            const pN1 = out[lastIdx - 1];
            const pN = out[lastIdx];
            // Insert a vertical jog before the end point.
            const jog = { x: pN.x, y: pN.y + deltaPerp };
            out.splice(lastIdx, 0, jog);
            // Shift previous point to align with jog.
            out[lastIdx - 1].y = jog.y;
            // Keep endpoint anchored.
            out[lastIdx + 1].x = pN.x;
            out[lastIdx + 1].y = pN.y;
        } else {
            out[segmentIndex].y += deltaPerp;
            out[segmentIndex + 1].y += deltaPerp;
        }
    } else {
        // Vertical segment => shift X.
        if (segmentIndex === 0) {
            const p0 = out[0];
            const p1 = out[1];
            const jog = { x: p0.x + deltaPerp, y: p0.y };
            out.splice(1, 0, jog);
            out[2].x = jog.x;
        } else if (segmentIndex === lastIdx - 1) {
            const pN1 = out[lastIdx - 1];
            const pN = out[lastIdx];
            const jog = { x: pN.x + deltaPerp, y: pN.y };
            out.splice(lastIdx, 0, jog);
            out[lastIdx - 1].x = jog.x;
            out[lastIdx + 1].x = pN.x;
            out[lastIdx + 1].y = pN.y;
        } else {
            out[segmentIndex].x += deltaPerp;
            out[segmentIndex + 1].x += deltaPerp;
        }
    }

    return dedupeColinear(out);
}

function segmentOrientation(points: WirePoint[], idx: number): Orientation | null {
    if (idx < 0 || idx >= points.length - 1) return null;
    const a = points[idx];
    const b = points[idx + 1];
    if (a.y === b.y && a.x !== b.x) return 'H';
    if (a.x === b.x && a.y !== b.y) return 'V';
    return null;
}

/**
 * Avoids PARALLEL overlaps between different wires.
 * - Horizontal-on-horizontal overlaps are removed by shifting Y.
 * - Vertical-on-vertical overlaps are removed by shifting X.
 * - Perpendicular crossings are allowed.
 *
 * This is a rendering-time deconfliction pass: endpoints stay anchored.
 */
export function avoidParallelOverlaps(
    wires: Array<{ id: string; points: WirePoint[] }>,
    options: { gridSize: number; maxLanes?: number } = { gridSize: 10 }
): Map<string, WirePoint[]> {
    const gridSize = options.gridSize || 10;
    const maxLanes = options.maxLanes ?? 6;
    const occupied = new Map<string, Segment[]>();
    const result = new Map<string, WirePoint[]>();

    // Stable, deterministic order: as provided.
    for (const w of wires) {
        let pts = dedupeColinear(w.points);

        // If there is no conflict, accept quickly.
        if (!hasParallelOverlap(pts, occupied)) {
            addOccupied(pts, occupied);
            result.set(w.id, pts);
            continue;
        }

        // Try shifting each segment into a free lane.
        let improved = true;
        let safety = 0;
        while (improved && safety++ < 8) {
            improved = false;
            for (let segIdx = 0; segIdx < pts.length - 1; segIdx++) {
                const ori = segmentOrientation(pts, segIdx);
                if (!ori) continue;

                // Fast skip: only attempt if THIS segment overlaps.
                const segs = toSegments([pts[segIdx], pts[segIdx + 1]]);
                if (!segs.length) continue;
                const seg = segs[0];
                const key = `${seg.orientation}:${seg.coord}`;
                const list = occupied.get(key);
                if (!list?.length) continue;

                let overlaps = false;
                for (const o of list) {
                    if (rangesOverlapStrict(seg.min, seg.max, o.min, o.max)) {
                        overlaps = true;
                        break;
                    }
                }
                if (!overlaps) continue;

                // Determine a deterministic lane preference.
                const hash =
                    [...w.id].reduce((acc, ch) => ((acc * 31) ^ ch.charCodeAt(0)) >>> 0, 7) +
                    segIdx * 97;
                const preferPositive = (hash & 1) === 0;

                let best: WirePoint[] | null = null;
                for (let lane = 1; lane <= maxLanes; lane++) {
                    const d = lane * gridSize;
                    const deltas = preferPositive ? [d, -d] : [-d, d];
                    for (const deltaPerp of deltas) {
                        const candidate = shiftSegmentKeepingEndpoints(pts, segIdx, ori, deltaPerp);
                        if (!hasParallelOverlap(candidate, occupied)) {
                            best = candidate;
                            break;
                        }
                    }
                    if (best) break;
                }

                if (best) {
                    pts = best;
                    improved = true;
                    break; // re-scan from start with updated geometry
                }
            }
        }

        addOccupied(pts, occupied);
        result.set(w.id, pts);
    }

    return result;
}

/**
 * Convert an array of points to an SVG path `d` string.
 * Uses straight line segments between points.
 */
export function pointsToPathD(points: WirePoint[]): string {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y}` + rest.map((p) => ` L ${p.x} ${p.y}`).join('');
}

export function findSegmentIndex(
    points: WirePoint[],
    clickPoint: WirePoint,
    threshold: number = 8
): number | null {
    if (points.length < 2) return null;
    let bestIdx: number | null = null;
    let bestDist = Infinity;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dist = distanceToSegment(clickPoint, p1, p2);
        if (dist <= threshold && dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }

    return bestIdx;
}

function isHorizontalSegment(a: WirePoint, b: WirePoint): boolean {
    return a.y === b.y && a.x !== b.x;
}

function isVerticalSegment(a: WirePoint, b: WirePoint): boolean {
    return a.x === b.x && a.y !== b.y;
}

export function moveSegment(
    points: WirePoint[],
    segmentIndex: number,
    delta: WirePoint,
    options: { snapTo?: number; disableSnap?: boolean } = {}
): WirePoint[] {
    if (points.length < 2) return points;
    if (segmentIndex < 0 || segmentIndex >= points.length - 1) return points;

    const out = points.map((p) => ({ ...p }));
    const a = out[segmentIndex];
    const b = out[segmentIndex + 1];

    const isH = isHorizontalSegment(a, b);
    const isV = isVerticalSegment(a, b);

    if (!isH && !isV) {
        // Non-orthogonal; refuse to move.
        return points;
    }

    if (isH) {
        let nextY = a.y + delta.y;
        if (!options.disableSnap && options.snapTo) {
            nextY = snapToGrid(nextY, options.snapTo);
        }
        a.y = nextY;
        b.y = nextY;
    } else {
        let nextX = a.x + delta.x;
        if (!options.disableSnap && options.snapTo) {
            nextX = snapToGrid(nextX, options.snapTo);
        }
        a.x = nextX;
        b.x = nextX;
    }

    return dedupeColinear(out);
}

/**
 * Wokwi-like orthogonal routing between two points.
 * - Produces only horizontal/vertical segments.
 * - Optionally threads through `waypoints` (manual bends).
 * - Uses a simple 2-segment strategy per hop.
 */
export function calculateOrthogonalPoints(
    start: WirePoint,
    end: WirePoint,
    waypoints: WirePoint[] = [],
    options: { firstLeg?: FirstLeg } = {}
): WirePoint[] {
    const firstLeg = options.firstLeg ?? 'horizontal';
    const all = [start, ...waypoints, end];
    const out: WirePoint[] = [start];

    for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const b = all[i];

        // Same point.
        if (a.x === b.x && a.y === b.y) continue;

        if (firstLeg === 'horizontal') {
            const mid: WirePoint = { x: b.x, y: a.y };
            if (mid.x !== a.x || mid.y !== a.y) out.push(mid);
        } else {
            const mid: WirePoint = { x: a.x, y: b.y };
            if (mid.x !== a.x || mid.y !== a.y) out.push(mid);
        }
        out.push(b);
    }

    return dedupeColinear(out);
}

export function calculateOrthogonalPathD(
    start: WirePoint,
    end: WirePoint,
    waypoints: WirePoint[] = [],
    options: { firstLeg?: FirstLeg } = {}
): string {
    return pointsToPathD(calculateOrthogonalPoints(start, end, waypoints, options));
}

/**
 * Calculate the orthogonal path between two points with optional waypoints.
 * Returns an array of points forming the complete path.
 */
export function calculateOrthogonalPath(
    start: WirePoint,
    end: WirePoint,
    waypoints: WirePoint[] = []
): WirePoint[] {
    const allPoints = [start, ...waypoints, end];
    const path: WirePoint[] = [start];

    for (let i = 1; i < allPoints.length; i++) {
        const prev = allPoints[i - 1];
        const curr = allPoints[i];

        // Create orthogonal path between consecutive points
        // Strategy: horizontal first, then vertical
        const midPoint: WirePoint = { x: curr.x, y: prev.y };

        // Only add midpoint if it's different from prev and curr
        if (midPoint.x !== prev.x || midPoint.y !== prev.y) {
            if (midPoint.x !== curr.x || midPoint.y !== curr.y) {
                path.push(midPoint);
            }
        }

        path.push(curr);
    }

    return path;
}

/**
 * Calculate orthogonal preview path during wire creation.
 * Starts with vertical movement, then horizontal to reach the cursor.
 */
export function calculatePreviewPath(
    start: WirePoint,
    cursor: WirePoint,
    waypoints: WirePoint[] = []
): WirePoint[] {
    if (waypoints.length === 0) {
        // Direct from start to cursor with orthogonal routing
        const path: WirePoint[] = [start];

        // Start vertical, then horizontal (Wokwi-style)
        const midPoint: WirePoint = { x: start.x, y: cursor.y };

        if (midPoint.y !== start.y) {
            path.push(midPoint);
        }

        path.push(cursor);
        return path;
    }

    // With waypoints: path through waypoints, then to cursor
    const lastWaypoint = waypoints[waypoints.length - 1];
    const pathToLastWaypoint = calculateOrthogonalPath(start, lastWaypoint, waypoints.slice(0, -1));

    // From last waypoint to cursor
    const midPoint: WirePoint = { x: lastWaypoint.x, y: cursor.y };

    if (midPoint.y !== lastWaypoint.y) {
        pathToLastWaypoint.push(midPoint);
    }

    pathToLastWaypoint.push(cursor);

    return pathToLastWaypoint;
}

/**
 * Convert array of points to SVG polyline points string
 */
export function pointsToSvgPath(points: WirePoint[]): string {
    return points.map(p => `${p.x},${p.y}`).join(' ');
}

/**
 * Check if a point is near a wire segment (for click detection)
 */
export function isPointNearWire(
    point: WirePoint,
    wirePoints: WirePoint[],
    threshold: number = 8
): boolean {
    for (let i = 0; i < wirePoints.length - 1; i++) {
        const p1 = wirePoints[i];
        const p2 = wirePoints[i + 1];

        const distance = distanceToSegment(point, p1, p2);
        if (distance <= threshold) {
            return true;
        }
    }
    return false;
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceToSegment(point: WirePoint, p1: WirePoint, p2: WirePoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        // p1 and p2 are the same point
        return Math.sqrt((point.x - p1.x) ** 2 + (point.y - p1.y) ** 2);
    }

    // Project point onto line segment
    let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;

    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

/**
 * Find which waypoint handle is being clicked
 */
export function findClickedHandle(
    point: WirePoint,
    wirePoints: WirePoint[],
    threshold: number = 10
): number | null {
    for (let i = 0; i < wirePoints.length; i++) {
        const wp = wirePoints[i];
        const distance = Math.sqrt((point.x - wp.x) ** 2 + (point.y - wp.y) ** 2);
        if (distance <= threshold) {
            return i;
        }
    }
    return null;
}
