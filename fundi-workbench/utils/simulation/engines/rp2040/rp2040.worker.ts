type SignalLevel = 0 | 1

type WorkerIn =
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'reset' }
  | { type: 'write-pin'; pinId: string; level: SignalLevel }

type WorkerOut =
  | { type: 'serial'; line: string }
  | { type: 'pin-change'; pinId: string; level: SignalLevel }

const pinStates = new Map<string, SignalLevel>()
let ticker: number | null = null
let heartbeat = 0

function emit(msg: WorkerOut) {
  postMessage(msg)
}

function stopTicker() {
  if (ticker != null) {
    clearInterval(ticker)
    ticker = null
  }
}

onmessage = (event: MessageEvent<WorkerIn>) => {
  const msg = event.data
  if (!msg) return

  if (msg.type === 'start') {
    stopTicker()
    emit({ type: 'serial', line: '[rp2040] worker simulation session started' })
    ticker = self.setInterval(() => {
      heartbeat += 1
      if (heartbeat % 3 === 0) {
        emit({ type: 'serial', line: `[rp2040] heartbeat ${heartbeat}` })
      }
    }, 350)
    return
  }

  if (msg.type === 'stop') {
    stopTicker()
    emit({ type: 'serial', line: '[rp2040] worker simulation session stopped' })
    return
  }

  if (msg.type === 'reset') {
    pinStates.clear()
    heartbeat = 0
    emit({ type: 'serial', line: '[rp2040] reset' })
    return
  }

  if (msg.type === 'write-pin') {
    pinStates.set(msg.pinId, msg.level)
    emit({ type: 'pin-change', pinId: msg.pinId, level: msg.level })
  }
}
