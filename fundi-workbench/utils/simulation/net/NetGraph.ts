export type CircuitConnection = { from: { partId: string; pinId: string }; to: { partId: string; pinId: string } }

export type NetPinIdentity = {
  boardPinId: string
  netId: string
  signalType: 'digital' | 'analog' | 'pwm' | 'protocol'
}

function keyOf(partId: string, pinId: string): string {
  return `${partId}:${pinId}`
}

export function buildAdjacency(connections: CircuitConnection[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>()
  for (const conn of connections) {
    const a = keyOf(conn.from.partId, conn.from.pinId)
    const b = keyOf(conn.to.partId, conn.to.pinId)
    if (!adjacency.has(a)) adjacency.set(a, new Set())
    if (!adjacency.has(b)) adjacency.set(b, new Set())
    adjacency.get(a)!.add(b)
    adjacency.get(b)!.add(a)
  }
  return adjacency
}

export function resolveNetId(adjacency: Map<string, Set<string>>, startKey: string): string {
  const queue = [startKey]
  const seen = new Set(queue)
  const nodes: string[] = []
  while (queue.length) {
    const node = queue.shift()!
    nodes.push(node)
    const neighbors = adjacency.get(node)
    if (!neighbors) continue
    for (const n of neighbors) {
      if (!seen.has(n)) {
        seen.add(n)
        queue.push(n)
      }
    }
  }
  nodes.sort()
  return nodes.join('|')
}

export function findConnectedBoardPinId(
  adjacency: Map<string, Set<string>>,
  startKey: string,
  boardPartId: string
): string | null {
  const queue = [startKey]
  const seen = new Set(queue)

  while (queue.length) {
    const cur = queue.shift()!
    const idx = cur.indexOf(':')
    if (idx > 0) {
      const partId = cur.slice(0, idx)
      const pinId = cur.slice(idx + 1)
      if (partId === boardPartId) {
        return pinId
      }
    }

    const neighbors = adjacency.get(cur)
    if (!neighbors) continue
    for (const n of neighbors) {
      if (!seen.has(n)) {
        seen.add(n)
        queue.push(n)
      }
    }
  }

  return null
}
