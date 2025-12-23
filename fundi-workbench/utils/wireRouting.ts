/**
 * Orthogonal wire routing utilities
 * 
 * Wokwi-style routing: all wire segments are strictly horizontal or vertical,
 * alternating between the two to create clean orthogonal paths.
 */

import type { WirePoint } from '@/types/wire';

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
