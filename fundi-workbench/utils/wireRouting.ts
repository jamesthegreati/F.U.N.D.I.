/**
 * Orthogonal wire routing utilities
 * 
 * Wokwi-style routing: all wire segments are strictly horizontal or vertical,
 * alternating between the two to create clean orthogonal paths.
 */

import type { WirePoint } from '@/types/wire';

type FirstLeg = 'horizontal' | 'vertical';

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

/**
 * Simplify a polyline by removing duplicate points and collapsing colinear points.
 * Useful for rendering wires while keeping raw editing points in state.
 */
export function simplifyPolylinePoints(points: WirePoint[]): WirePoint[] {
    return dedupeColinear(points);
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
