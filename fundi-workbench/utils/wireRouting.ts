/**
 * Orthogonal wire routing utilities
 *
 * Wokwi-style routing: all wire segments are strictly horizontal or vertical,
 * alternating between the two to create clean orthogonal paths.
 *
 * Enhanced with component avoidance: wires wrap around components instead of
 * crossing through them, keeping pins and connections visible.
 */

import type { WirePoint } from '@/types/wire';

type FirstLeg = 'horizontal' | 'vertical';

/**
 * Bounding box of a component for obstacle avoidance
 */
export interface ComponentBounds {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Result of checking if a segment intersects an obstacle
 */
interface IntersectionResult {
    intersects: boolean;
    normalizedPath: WirePoint[];
}

export function snapToGrid(value: number, gridSize: number): number {
    if (!Number.isFinite(value)) return value;
    if (!gridSize || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
}

/**
 * Check if a line segment (horizontal or vertical) intersects a bounding box
 * Returns true if the segment goes through or touches the box
 */
function segmentIntersectsBounds(
    start: WirePoint,
    end: WirePoint,
    bounds: ComponentBounds,
    margin: number = 15
): boolean {
    const expanded = {
        left: bounds.x - margin,
        right: bounds.x + bounds.width + margin,
        top: bounds.y - margin,
        bottom: bounds.y + bounds.height + margin,
    };

    // Horizontal segment
    if (start.y === end.y) {
        const y = start.y;
        if (y < expanded.top || y > expanded.bottom) return false;

        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);

        // Check if horizontal line crosses the expanded box
        return maxX >= expanded.left && minX <= expanded.right;
    }

    // Vertical segment
    if (start.x === end.x) {
        const x = start.x;
        if (x < expanded.left || x > expanded.right) return false;

        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        // Check if vertical line crosses the expanded box
        return maxY >= expanded.top && minY <= expanded.bottom;
    }

    // Diagonal segment - shouldn't happen in our orthogonal routing, but handle it
    return false;
}

/**
 * Find all bounding boxes that a path segment intersects
 */
function findIntersectingBounds(
    start: WirePoint,
    end: WirePoint,
    obstacles: ComponentBounds[]
): ComponentBounds[] {
    return obstacles.filter((obs) => segmentIntersectsBounds(start, end, obs));
}

/**
 * Calculate the shortest detour around an obstacle for a given segment
 * Returns a new path that goes around the obstacle
 */
function calculateDetour(
    start: WirePoint,
    end: WirePoint,
    obstacle: ComponentBounds,
    originalPathType: 'horizontal' | 'vertical',
    gridSize: number
): WirePoint[] {
    const margin = 25; // Extra spacing from component edge for visibility
    const expLeft = obstacle.x - margin;
    const expRight = obstacle.x + obstacle.width + margin;
    const expTop = obstacle.y - margin;
    const expBottom = obstacle.y + obstacle.height + margin;

    // For horizontal segments that cross through
    if (originalPathType === 'horizontal') {
        const y = start.y;
        const above = y < obstacle.y + obstacle.height / 2;
        const detourY = above ? expTop : expBottom;

        // Route: go up/down around, then across, then back down/up
        return [
            start,
            { x: start.x, y: detourY },
            { x: end.x, y: detourY },
            end,
        ];
    }

    // For vertical segments that cross through
    const x = start.x;
    const left = x < obstacle.x + obstacle.width / 2;
    const detourX = left ? expLeft : expRight;

    // Route: go left/right around, then up/down, then back
    return [
        start,
        { x: detourX, y: start.y },
        { x: detourX, y: end.y },
        end,
    ];
}

/**
 * Check if a point is inside any bounding box
 */
function pointInBounds(point: WirePoint, obstacles: ComponentBounds[], margin: number = 5): boolean {
    return obstacles.some((obs) => {
        const expanded = {
            left: obs.x - margin,
            right: obs.x + obs.width + margin,
            top: obs.y - margin,
            bottom: obs.y + obs.height + margin,
        };
        return (
            point.x >= expanded.left &&
            point.x <= expanded.right &&
            point.y >= expanded.top &&
            point.y <= expanded.bottom
        );
    });
}

/**
 * Check if a whole path segment (between two points) would cross through obstacles
 * Returns true if the segment intersects any obstacle bounding box
 */
function pathIntersectsObstacles(
    start: WirePoint,
    end: WirePoint,
    obstacles: ComponentBounds[]
): boolean {
    // Check if any point along the path is inside an obstacle
    // For orthogonal paths, we need to check the entire segment
    for (const obs of obstacles) {
        if (segmentIntersectsBounds(start, end, obs)) {
            return true;
        }
    }
    return false;
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
 * Supports smooth corners with optional quadratic Bezier curves.
 * @param points - Array of wire waypoints
 * @param cornerRadius - Radius for rounded corners (0 = sharp corners)
 */
export function pointsToPathD(points: WirePoint[], cornerRadius: number = 8): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    // If no corner radius, use simple straight lines
    if (cornerRadius <= 0 || points.length === 2) {
        const [first, ...rest] = points;
        return `M ${first.x} ${first.y}` + rest.map((p) => ` L ${p.x} ${p.y}`).join('');
    }

    // With corner radius: use quadratic curves at bends
    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        // Calculate the maximum radius we can use at this corner
        const distToPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const distToNext = Math.hypot(next.x - curr.x, next.y - curr.y);
        const r = Math.min(cornerRadius, distToPrev / 2, distToNext / 2);

        if (r <= 0) {
            // No room for corner, use straight line
            d += ` L ${curr.x} ${curr.y}`;
            continue;
        }

        // Calculate direction vectors
        const dx1 = curr.x - prev.x;
        const dy1 = curr.y - prev.y;
        const dx2 = next.x - curr.x;
        const dy2 = next.y - curr.y;

        // Normalize directions
        const len1 = Math.hypot(dx1, dy1);
        const len2 = Math.hypot(dx2, dy2);

        if (len1 === 0 || len2 === 0) {
            d += ` L ${curr.x} ${curr.y}`;
            continue;
        }

        const nx1 = dx1 / len1;
        const ny1 = dy1 / len1;
        const nx2 = dx2 / len2;
        const ny2 = dy2 / len2;

        // Points where corner curve starts and ends
        const startX = curr.x - nx1 * r;
        const startY = curr.y - ny1 * r;
        const endX = curr.x + nx2 * r;
        const endY = curr.y + ny2 * r;

        // Line to start of corner, then quadratic curve through corner
        d += ` L ${startX} ${startY}`;
        d += ` Q ${curr.x} ${curr.y} ${endX} ${endY}`;
    }

    // Line to final point
    const last = points[points.length - 1];
    d += ` L ${last.x} ${last.y}`;

    return d;
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
 *
 * @param start - Starting point
 * @param end - Ending point
 * @param waypoints - Optional manual waypoints
 * @param options - Routing options including component bounds for avoidance
 */
export function calculateOrthogonalPoints(
    start: WirePoint,
    end: WirePoint,
    waypoints: WirePoint[] = [],
    options: { firstLeg?: FirstLeg; obstacles?: ComponentBounds[]; gridSize?: number } = {}
): WirePoint[] {
    const firstLeg = options.firstLeg ?? 'horizontal';
    const obstacles = options.obstacles ?? [];
    const gridSize = options.gridSize ?? 10;
    const all = [start, ...waypoints, end];
    const out: WirePoint[] = [start];

    // If no obstacles, use the original simple routing
    if (obstacles.length === 0) {
        for (let i = 1; i < all.length; i++) {
            const a = all[i - 1];
            const b = all[i];
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

    // Enhanced routing with component avoidance
    for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const b = all[i];

        if (a.x === b.x && a.y === b.y) continue;

        // Build the initial path for this segment
        let segmentPath: WirePoint[];
        if (firstLeg === 'horizontal') {
            const mid: WirePoint = { x: b.x, y: a.y };
            segmentPath = [a, mid, b];
        } else {
            const mid: WirePoint = { x: a.x, y: b.y };
            segmentPath = [a, mid, b];
        }

        // Check each segment of the path for obstacle intersections
        const finalPath: WirePoint[] = [a];
        for (let segIdx = 0; segIdx < segmentPath.length - 1; segIdx++) {
            const segStart = segmentPath[segIdx];
            const segEnd = segmentPath[segIdx + 1];

            // Skip if zero length
            if (segStart.x === segEnd.x && segStart.y === segEnd.y) continue;

            // Check if this segment intersects any obstacles
            const intersectsObs = findIntersectingBounds(segStart, segEnd, obstacles);

            if (intersectsObs.length === 0) {
                // No intersection, add segment directly
                finalPath.push(segEnd);
            } else {
                // Find the first obstacle that intersects
                const obstacle = intersectsObs[0];

                // Determine if this is horizontal or vertical segment
                const isHorizontal = segStart.y === segEnd.y;
                const pathType = isHorizontal ? 'horizontal' : 'vertical';

                // Calculate detour around the obstacle
                const detour = calculateDetour(segStart, segEnd, obstacle, pathType, gridSize);

                // Add intermediate detour points (excluding start since it's already in finalPath)
                for (let j = 1; j < detour.length; j++) {
                    finalPath.push(detour[j]);
                }
            }
        }

        // Add all points from this segment to the main output (skip first since it's the previous end)
        for (let j = 1; j < finalPath.length; j++) {
            out.push(finalPath[j]);
        }
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
