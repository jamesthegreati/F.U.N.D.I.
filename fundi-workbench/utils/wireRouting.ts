/**
 * Orthogonal wire routing utilities — Wokwi-grade quality
 *
 * Wokwi standard: 2.54 mm pitch ≈ 9.525 px per grid unit at 96 DPI.
 * All wire segments are strictly horizontal or vertical.
 *
 * Features:
 * - Multi-obstacle avoidance: wires wrap around ALL intersected components
 * - Proximity-based parallel overlap detection (not just exact-coordinate)
 * - Minimum Wokwi-standard 9.525 px clearance between parallel wires
 * - Source/target component exclusion (wires must reach their own pins)
 * - Recursive detour with depth limit to prevent infinite loops
 */

import type { WirePoint } from '@/types/wire';

type FirstLeg = 'horizontal' | 'vertical' | 'auto';

/* ─── Wokwi constants ──────────────────────────────────────────────── */

/** Wokwi grid unit: 2.54 mm at 96 DPI ≈ 9.525 px */
export const WOKWI_GRID_PX = 9.525;

/** Minimum clearance between parallel wires (≈ 1 Wokwi grid unit) */
export const WOKWI_WIRE_SPACING = WOKWI_GRID_PX;

/** Margin around component bounding boxes for wire clearance */
const COMPONENT_MARGIN = 12;

/** Extra padding when routing a detour around a component */
const DETOUR_PADDING = 18;

/** Pin exclusion zone: wires must route around pins to keep them accessible */
const PIN_EXCLUSION_RADIUS = 15;

/** Maximum detour recursion depth */
const MAX_DETOUR_DEPTH = 4;

/* ─── Types ────────────────────────────────────────────────────────── */

export interface ComponentBounds {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PinObstacle {
    id: string; // Format: "partId:pinId"
    x: number;
    y: number;
    radius: number;
}

/* ─── Grid helpers ─────────────────────────────────────────────────── */

export function snapToGrid(value: number, gridSize: number): number {
    if (!Number.isFinite(value)) return value;
    if (!gridSize || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(point: WirePoint, gridSize: number): WirePoint {
    return { x: snapToGrid(point.x, gridSize), y: snapToGrid(point.y, gridSize) };
}

/* ─── Geometry helpers ─────────────────────────────────────────────── */

/**
 * Check if a segment intersects a circular pin obstacle.
 */
function segmentIntersectsPin(
    start: WirePoint,
    end: WirePoint,
    pin: PinObstacle
): boolean {
    // Calculate distance from pin center to line segment
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        // Zero-length segment: check distance from pin to point
        const dist = Math.hypot(start.x - pin.x, start.y - pin.y);
        return dist < pin.radius;
    }

    // Find closest point on segment to pin center
    let t = ((pin.x - start.x) * dx + (pin.y - start.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;

    const dist = Math.hypot(closestX - pin.x, closestY - pin.y);
    return dist < pin.radius;
}

/**
 * Convert pin obstacles to rectangular bounds for unified obstacle handling.
 * Each pin becomes a square bounding box centered on the pin.
 */
function pinsToComponentBounds(pins: PinObstacle[]): ComponentBounds[] {
    return pins.map((pin) => ({
        id: pin.id,
        x: pin.x - pin.radius,
        y: pin.y - pin.radius,
        width: pin.radius * 2,
        height: pin.radius * 2,
    }));
}

function segmentIntersectsBounds(
    start: WirePoint,
    end: WirePoint,
    bounds: ComponentBounds,
    margin: number = COMPONENT_MARGIN
): boolean {
    const left = bounds.x - margin;
    const right = bounds.x + bounds.width + margin;
    const top = bounds.y - margin;
    const bottom = bounds.y + bounds.height + margin;

    // Horizontal segment
    if (Math.abs(start.y - end.y) < 0.5) {
        const y = start.y;
        if (y < top || y > bottom) return false;
        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        return maxX > left && minX < right;
    }

    // Vertical segment
    if (Math.abs(start.x - end.x) < 0.5) {
        const x = start.x;
        if (x < left || x > right) return false;
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);
        return maxY > top && minY < bottom;
    }

    return false;
}

/**
 * Find all obstacles a segment intersects, sorted by distance from start.
 */
function findIntersectingBounds(
    start: WirePoint,
    end: WirePoint,
    obstacles: ComponentBounds[],
    margin: number = COMPONENT_MARGIN
): ComponentBounds[] {
    const hits = obstacles.filter((obs) => segmentIntersectsBounds(start, end, obs, margin));

    // Sort by distance from start so we handle them in order
    const isH = Math.abs(start.y - end.y) < 0.5;
    if (isH) {
        const dir = end.x > start.x ? 1 : -1;
        hits.sort((a, b) => (a.x - b.x) * dir);
    } else {
        const dir = end.y > start.y ? 1 : -1;
        hits.sort((a, b) => (a.y - b.y) * dir);
    }

    return hits;
}

/**
 * Calculate detour path around a single obstacle.
 * Chooses the shortest side to go around.
 */
function calculateDetour(
    start: WirePoint,
    end: WirePoint,
    obstacle: ComponentBounds,
    pathType: 'horizontal' | 'vertical',
    _gridSize: number
): WirePoint[] {
    const pad = DETOUR_PADDING;
    const oLeft = obstacle.x - pad;
    const oRight = obstacle.x + obstacle.width + pad;
    const oTop = obstacle.y - pad;
    const oBottom = obstacle.y + obstacle.height + pad;

    if (pathType === 'horizontal') {
        // Horizontal segment crossing obstacle — detour above or below
        const yCenterObs = obstacle.y + obstacle.height / 2;
        const distToTop = Math.abs(start.y - oTop);
        const distToBottom = Math.abs(start.y - oBottom);

        // Pick nearer side; if equal, prefer the side where start already is
        const above = start.y <= yCenterObs ? true : distToTop < distToBottom;
        const detourY = above ? oTop : oBottom;

        // Entry X: clamp to not go backward past start
        const goingRight = end.x > start.x;
        const entryX = goingRight
            ? Math.max(start.x, oLeft)
            : Math.min(start.x, oRight);
        const exitX = goingRight
            ? Math.min(end.x, oRight)
            : Math.max(end.x, oLeft);

        return [
            start,
            { x: entryX, y: start.y },
            { x: entryX, y: detourY },
            { x: exitX, y: detourY },
            { x: exitX, y: end.y },
            end,
        ];
    }

    // Vertical segment crossing obstacle — detour left or right
    const xCenterObs = obstacle.x + obstacle.width / 2;
    const distToLeft = Math.abs(start.x - oLeft);
    const distToRight = Math.abs(start.x - oRight);

    const goLeft = start.x <= xCenterObs ? true : distToLeft < distToRight;
    const detourX = goLeft ? oLeft : oRight;

    const goingDown = end.y > start.y;
    const entryY = goingDown
        ? Math.max(start.y, oTop)
        : Math.min(start.y, oBottom);
    const exitY = goingDown
        ? Math.min(end.y, oBottom)
        : Math.max(end.y, oTop);

    return [
        start,
        { x: start.x, y: entryY },
        { x: detourX, y: entryY },
        { x: detourX, y: exitY },
        { x: end.x, y: exitY },
        end,
    ];
}

/**
 * Route a single segment (start→end), detouring around ALL obstacles.
 * Recurse with depth limit to handle detour-creates-new-intersection cases.
 */
function routeSegmentAroundObstacles(
    start: WirePoint,
    end: WirePoint,
    obstacles: ComponentBounds[],
    gridSize: number,
    depth: number = 0
): WirePoint[] {
    if (depth > MAX_DETOUR_DEPTH) return [start, end];

    // Zero-length segment
    if (Math.abs(start.x - end.x) < 0.5 && Math.abs(start.y - end.y) < 0.5) {
        return [start];
    }

    const isH = Math.abs(start.y - end.y) < 0.5;
    const hits = findIntersectingBounds(start, end, obstacles);

    if (hits.length === 0) return [start, end];

    // Detour around the first (nearest) obstacle
    const obstacle = hits[0];
    const pathType: 'horizontal' | 'vertical' = isH ? 'horizontal' : 'vertical';
    const detour = calculateDetour(start, end, obstacle, pathType, gridSize);
    const cleaned = dedupeColinear(detour);

    // Recursively check each sub-segment of the detour for additional obstacles
    const result: WirePoint[] = [cleaned[0]];
    for (let i = 0; i < cleaned.length - 1; i++) {
        const subStart = cleaned[i];
        const subEnd = cleaned[i + 1];

        // Don't re-check against the obstacle we just detoured around
        const remaining = obstacles.filter((o) => o.id !== obstacle.id);
        const subRoute = routeSegmentAroundObstacles(subStart, subEnd, remaining, gridSize, depth + 1);

        // Append, skipping duplicate first point
        for (let j = 1; j < subRoute.length; j++) {
            result.push(subRoute[j]);
        }
    }

    return dedupeColinear(result);
}

/* ─── Collinear dedup ──────────────────────────────────────────────── */

function dedupeColinear(points: WirePoint[]): WirePoint[] {
    if (points.length <= 2) return points;

    const result: WirePoint[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        const prev = result[result.length - 1];
        const curr = points[i];
        const next = points[i + 1];

        // Skip duplicate points
        if (Math.abs(prev.x - curr.x) < 0.5 && Math.abs(prev.y - curr.y) < 0.5) continue;

        // Skip collinear points
        const colinearH = Math.abs(prev.y - curr.y) < 0.5 && Math.abs(curr.y - next.y) < 0.5;
        const colinearV = Math.abs(prev.x - curr.x) < 0.5 && Math.abs(curr.x - next.x) < 0.5;
        if (colinearH || colinearV) continue;

        result.push(curr);
    }

    const last = points[points.length - 1];
    const tail = result[result.length - 1];
    if (Math.abs(tail.x - last.x) >= 0.5 || Math.abs(tail.y - last.y) >= 0.5) {
        result.push(last);
    }
    return result;
}

/* ─── Parallel overlap avoidance ──────────────────────────────────── */

type Orientation = 'H' | 'V';

type Segment = {
    orientation: Orientation;
    coord: number; // y for H, x for V
    min: number;
    max: number;
    wireId?: string;
};

function toSegments(points: WirePoint[], wireId?: string): Segment[] {
    const segs: Segment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5) continue;
        if (Math.abs(a.y - b.y) < 0.5) {
            const min = Math.min(a.x, b.x);
            const max = Math.max(a.x, b.x);
            if (max - min > 0.5) segs.push({ orientation: 'H', coord: a.y, min, max, wireId });
        } else if (Math.abs(a.x - b.x) < 0.5) {
            const min = Math.min(a.y, b.y);
            const max = Math.max(a.y, b.y);
            if (max - min > 0.5) segs.push({ orientation: 'V', coord: a.x, min, max, wireId });
        }
    }
    return segs;
}

function rangesOverlapStrict(aMin: number, aMax: number, bMin: number, bMax: number): boolean {
    return Math.min(aMax, bMax) > Math.max(aMin, bMin) + 0.5;
}

/**
 * Proximity-based parallel overlap check.
 * Two same-orientation segments are "too close" if:
 *   - Their perpendicular coordinates are within minSpacing px
 *   - Their ranges along the shared axis overlap
 */
function hasParallelOverlapProximity(
    points: WirePoint[],
    occupied: Segment[],
    minSpacing: number = WOKWI_WIRE_SPACING
): boolean {
    const segs = toSegments(points);
    for (const s of segs) {
        for (const o of occupied) {
            if (s.orientation !== o.orientation) continue;
            if (Math.abs(s.coord - o.coord) >= minSpacing) continue;
            if (rangesOverlapStrict(s.min, s.max, o.min, o.max)) return true;
        }
    }
    return false;
}

function segmentOrientation(points: WirePoint[], idx: number): Orientation | null {
    if (idx < 0 || idx >= points.length - 1) return null;
    const a = points[idx];
    const b = points[idx + 1];
    if (Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) >= 0.5) return 'H';
    if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) >= 0.5) return 'V';
    return null;
}

function shiftSegmentKeepingEndpoints(
    points: WirePoint[],
    segmentIndex: number,
    orientation: Orientation,
    deltaPerp: number
): WirePoint[] {
    if (points.length < 2) return points;
    if (segmentIndex < 0 || segmentIndex >= points.length - 1) return points;
    if (Math.abs(deltaPerp) < 0.1) return points;

    const out = points.map((p) => ({ ...p }));
    const lastIdx = out.length - 1;

    if (orientation === 'H') {
        if (segmentIndex === 0) {
            const p0 = out[0];
            const jog = { x: p0.x, y: p0.y + deltaPerp };
            out.splice(1, 0, jog);
            out[2].y = jog.y;
        } else if (segmentIndex === lastIdx - 1) {
            const pN = out[lastIdx];
            const savedEnd = { x: pN.x, y: pN.y };
            const jog = { x: pN.x, y: pN.y + deltaPerp };
            out.splice(lastIdx, 0, jog);
            out[lastIdx - 1].y = jog.y;
            out[lastIdx + 1].x = savedEnd.x;
            out[lastIdx + 1].y = savedEnd.y;
        } else {
            out[segmentIndex].y += deltaPerp;
            out[segmentIndex + 1].y += deltaPerp;
        }
    } else {
        if (segmentIndex === 0) {
            const p0 = out[0];
            const jog = { x: p0.x + deltaPerp, y: p0.y };
            out.splice(1, 0, jog);
            out[2].x = jog.x;
        } else if (segmentIndex === lastIdx - 1) {
            const pN = out[lastIdx];
            const savedEnd = { x: pN.x, y: pN.y };
            const jog = { x: pN.x + deltaPerp, y: pN.y };
            out.splice(lastIdx, 0, jog);
            out[lastIdx - 1].x = jog.x;
            out[lastIdx + 1].x = savedEnd.x;
            out[lastIdx + 1].y = savedEnd.y;
        } else {
            out[segmentIndex].x += deltaPerp;
            out[segmentIndex + 1].x += deltaPerp;
        }
    }

    return dedupeColinear(out);
}

/**
 * Avoids parallel overlaps between different wires using Wokwi-standard spacing.
 *
 * Uses proximity-based detection: two parallel segments within WOKWI_WIRE_SPACING
 * pixels of each other with overlapping ranges are considered conflicting.
 *
 * Spacing between lanes: exactly WOKWI_WIRE_SPACING (9.525 px ≈ 2.54 mm).
 */
export function avoidParallelOverlaps(
    wires: Array<{ id: string; points: WirePoint[] }>,
    options: { gridSize: number; maxLanes?: number } = { gridSize: 10 }
): Map<string, WirePoint[]> {
    const maxLanes = options.maxLanes ?? 8;
    const allOccupied: Segment[] = [];
    const result = new Map<string, WirePoint[]>();

    for (const w of wires) {
        let pts = dedupeColinear(w.points);

        // Fast path: no conflict
        if (!hasParallelOverlapProximity(pts, allOccupied)) {
            allOccupied.push(...toSegments(pts, w.id));
            result.set(w.id, pts);
            continue;
        }

        // Try shifting overlapping segments into free lanes
        let improved = true;
        let safety = 0;
        while (improved && safety++ < 12) {
            improved = false;
            for (let segIdx = 0; segIdx < pts.length - 1; segIdx++) {
                const ori = segmentOrientation(pts, segIdx);
                if (!ori) continue;

                // Check if THIS segment overlaps with occupied
                const segArr = toSegments([pts[segIdx], pts[segIdx + 1]]);
                if (!segArr.length) continue;
                const seg = segArr[0];

                let overlaps = false;
                for (const o of allOccupied) {
                    if (seg.orientation !== o.orientation) continue;
                    if (Math.abs(seg.coord - o.coord) >= WOKWI_WIRE_SPACING) continue;
                    if (rangesOverlapStrict(seg.min, seg.max, o.min, o.max)) {
                        overlaps = true;
                        break;
                    }
                }
                if (!overlaps) continue;

                // Deterministic lane preference based on wire id
                const hash =
                    [...w.id].reduce((acc, ch) => ((acc * 31) ^ ch.charCodeAt(0)) >>> 0, 7) +
                    segIdx * 97;
                const preferPositive = (hash & 1) === 0;

                let best: WirePoint[] | null = null;
                for (let lane = 1; lane <= maxLanes; lane++) {
                    // Use Wokwi standard spacing per lane
                    const d = lane * WOKWI_WIRE_SPACING;
                    const deltas = preferPositive ? [d, -d] : [-d, d];
                    for (const deltaPerp of deltas) {
                        const candidate = shiftSegmentKeepingEndpoints(pts, segIdx, ori, deltaPerp);
                        if (!hasParallelOverlapProximity(candidate, allOccupied)) {
                            best = candidate;
                            break;
                        }
                    }
                    if (best) break;
                }

                if (best) {
                    pts = best;
                    improved = true;
                    break; // re-scan from start
                }
            }
        }

        allOccupied.push(...toSegments(pts, w.id));
        result.set(w.id, pts);
    }

    return result;
}

/* ─── SVG path generation ──────────────────────────────────────────── */

/**
 * Convert points to SVG path with optional rounded corners at bends.
 * Corner radius default matches Wokwi visual style.
 */
export function pointsToPathD(points: WirePoint[], cornerRadius: number = 6): string {
    if (points.length === 0) return '';
    if (points.length === 1) return 'M ' + points[0].x + ' ' + points[0].y;

    if (cornerRadius <= 0 || points.length === 2) {
        const [first, ...rest] = points;
        return 'M ' + first.x + ' ' + first.y + rest.map((p) => ' L ' + p.x + ' ' + p.y).join('');
    }

    let d = 'M ' + points[0].x + ' ' + points[0].y;

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const distToPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const distToNext = Math.hypot(next.x - curr.x, next.y - curr.y);
        const r = Math.min(cornerRadius, distToPrev / 2, distToNext / 2);

        if (r <= 0) {
            d += ' L ' + curr.x + ' ' + curr.y;
            continue;
        }

        const len1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const len2 = Math.hypot(next.x - curr.x, next.y - curr.y);

        if (len1 === 0 || len2 === 0) {
            d += ' L ' + curr.x + ' ' + curr.y;
            continue;
        }

        const nx1 = (curr.x - prev.x) / len1;
        const ny1 = (curr.y - prev.y) / len1;
        const nx2 = (next.x - curr.x) / len2;
        const ny2 = (next.y - curr.y) / len2;

        const startX = curr.x - nx1 * r;
        const startY = curr.y - ny1 * r;
        const endX = curr.x + nx2 * r;
        const endY = curr.y + ny2 * r;

        d += ' L ' + startX + ' ' + startY;
        d += ' Q ' + curr.x + ' ' + curr.y + ' ' + endX + ' ' + endY;
    }

    const last = points[points.length - 1];
    d += ' L ' + last.x + ' ' + last.y;

    return d;
}

/* ─── Segment editing ──────────────────────────────────────────────── */

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
    return Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) >= 0.5;
}

function isVerticalSegment(a: WirePoint, b: WirePoint): boolean {
    return Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) >= 0.5;
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

    if (!isH && !isV) return points;

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

/* ─── Main routing function ────────────────────────────────────────── */

/**
 * Wokwi-style orthogonal routing between two points.
 *
 * @param start - Starting pin position
 * @param end - Ending pin position
 * @param waypoints - Manual bend waypoints
 * @param options - Routing options
 *   - firstLeg: preferred initial direction
 *   - obstacles: component bounding boxes to avoid
 *   - pinObstacles: pin exclusion zones to avoid (wires must not block pin access)
 *   - excludeIds: part IDs whose bounds should NOT be avoided (source/target parts)
 *   - excludePinIds: pin IDs (format "partId:pinId") that should NOT be avoided (source/target pins)
 *   - gridSize: snap grid for routing
 */
export function calculateOrthogonalPoints(
    start: WirePoint,
    end: WirePoint,
    waypoints: WirePoint[] = [],
    options: {
        firstLeg?: FirstLeg;
        obstacles?: ComponentBounds[];
        pinObstacles?: PinObstacle[];
        excludeIds?: string[];
        excludePinIds?: string[];
        gridSize?: number;
    } = {}
): WirePoint[] {
    const firstLeg = options.firstLeg ?? 'auto';
    const rawObstacles = options.obstacles ?? [];
    const rawPinObstacles = options.pinObstacles ?? [];
    const excludeIds = new Set(options.excludeIds ?? []);
    const excludePinIds = new Set(options.excludePinIds ?? []);
    const gridSize = options.gridSize ?? WOKWI_GRID_PX;

    // Filter out source/target component bounds — wires MUST reach their own pins
    const obstacles = rawObstacles.filter((o) => !excludeIds.has(o.id));

    // Filter out source/target pin obstacles
    const pinObstacles = rawPinObstacles.filter((p) => !excludePinIds.has(p.id));

    // Merge pin obstacles into the obstacles array as rectangular bounds
    const allObstacles = [...obstacles, ...pinsToComponentBounds(pinObstacles)];

    const all = [start, ...waypoints, end];
    const out: WirePoint[] = [start];

    const resolveFirstLeg = (a: WirePoint, b: WirePoint): 'horizontal' | 'vertical' => {
        if (firstLeg !== 'auto') return firstLeg;

        const dx = Math.abs(b.x - a.x);
        const dy = Math.abs(b.y - a.y);

        if (dx < 0.5) return 'vertical';
        if (dy < 0.5) return 'horizontal';

        if (allObstacles.length === 0) return dx >= dy ? 'horizontal' : 'vertical';

        // Score both orientations by how many obstacles they hit
        const horizontalPath: WirePoint[] = [a, { x: b.x, y: a.y }, b];
        const verticalPath: WirePoint[] = [a, { x: a.x, y: b.y }, b];

        const countIntersections = (path: WirePoint[]): number => {
            let n = 0;
            for (let i = 0; i < path.length - 1; i++) {
                n += findIntersectingBounds(path[i], path[i + 1], allObstacles).length;
            }
            return n;
        };

        const hHits = countIntersections(horizontalPath);
        const vHits = countIntersections(verticalPath);

        if (hHits !== vHits) return hHits < vHits ? 'horizontal' : 'vertical';
        return dx >= dy ? 'horizontal' : 'vertical';
    };

    for (let i = 1; i < all.length; i++) {
        const a = all[i - 1];
        const b = all[i];
        if (Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5) continue;

        const leg = resolveFirstLeg(a, b);

        // Build the L-shaped base path
        let segmentPath: WirePoint[];
        if (leg === 'horizontal') {
            segmentPath = [a, { x: b.x, y: a.y }, b];
        } else {
            segmentPath = [a, { x: a.x, y: b.y }, b];
        }

        if (allObstacles.length === 0) {
            // No obstacles: simple L-path
            for (let j = 1; j < segmentPath.length; j++) {
                const p = segmentPath[j];
                if (Math.abs(p.x - a.x) >= 0.5 || Math.abs(p.y - a.y) >= 0.5) {
                    out.push(p);
                }
            }
        } else {
            // Route each sub-segment around obstacles
            const finalPath: WirePoint[] = [a];
            for (let segIdx = 0; segIdx < segmentPath.length - 1; segIdx++) {
                const segStart = segmentPath[segIdx];
                const segEnd = segmentPath[segIdx + 1];

                if (Math.abs(segStart.x - segEnd.x) < 0.5 && Math.abs(segStart.y - segEnd.y) < 0.5) continue;

                const routed = routeSegmentAroundObstacles(segStart, segEnd, allObstacles, gridSize);

                // Append skipping the first point (already in finalPath)
                for (let j = 1; j < routed.length; j++) {
                    finalPath.push(routed[j]);
                }
            }

            for (let j = 1; j < finalPath.length; j++) {
                out.push(finalPath[j]);
            }
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

/* ─── Legacy compatibility exports ─────────────────────────────────── */

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
        const midPoint: WirePoint = { x: curr.x, y: prev.y };

        if (Math.abs(midPoint.x - prev.x) >= 0.5 || Math.abs(midPoint.y - prev.y) >= 0.5) {
            if (Math.abs(midPoint.x - curr.x) >= 0.5 || Math.abs(midPoint.y - curr.y) >= 0.5) {
                path.push(midPoint);
            }
        }
        path.push(curr);
    }

    return path;
}

export function calculatePreviewPath(
    start: WirePoint,
    cursor: WirePoint,
    waypoints: WirePoint[] = []
): WirePoint[] {
    if (waypoints.length === 0) {
        const path: WirePoint[] = [start];
        const midPoint: WirePoint = { x: start.x, y: cursor.y };
        if (Math.abs(midPoint.y - start.y) >= 0.5) {
            path.push(midPoint);
        }
        path.push(cursor);
        return path;
    }

    const lastWaypoint = waypoints[waypoints.length - 1];
    const pathToLastWaypoint = calculateOrthogonalPath(start, lastWaypoint, waypoints.slice(0, -1));
    const midPoint: WirePoint = { x: lastWaypoint.x, y: cursor.y };

    if (Math.abs(midPoint.y - lastWaypoint.y) >= 0.5) {
        pathToLastWaypoint.push(midPoint);
    }
    pathToLastWaypoint.push(cursor);

    return pathToLastWaypoint;
}

export function pointsToSvgPath(points: WirePoint[]): string {
    return points.map((p) => p.x + ',' + p.y).join(' ');
}

export function isPointNearWire(
    point: WirePoint,
    wirePoints: WirePoint[],
    threshold: number = 8
): boolean {
    for (let i = 0; i < wirePoints.length - 1; i++) {
        const p1 = wirePoints[i];
        const p2 = wirePoints[i + 1];
        const distance = distanceToSegment(point, p1, p2);
        if (distance <= threshold) return true;
    }
    return false;
}

function distanceToSegment(point: WirePoint, p1: WirePoint, p2: WirePoint): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
        return Math.sqrt((point.x - p1.x) ** 2 + (point.y - p1.y) ** 2);
    }

    let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = p1.x + t * dx;
    const projY = p1.y + t * dy;

    return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
}

export function findClickedHandle(
    point: WirePoint,
    wirePoints: WirePoint[],
    threshold: number = 10
): number | null {
    for (let i = 0; i < wirePoints.length; i++) {
        const wp = wirePoints[i];
        const distance = Math.sqrt((point.x - wp.x) ** 2 + (point.y - wp.y) ** 2);
        if (distance <= threshold) return i;
    }
    return null;
}
