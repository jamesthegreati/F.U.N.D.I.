'use client';

export type ScheduledCycleCallback = () => void;

type ScheduledEvent = {
  cycle: number;
  callback: ScheduledCycleCallback;
};

/**
 * Tiny scheduler keyed by AVR CPU cycle counter.
 *
 * The simulator runs the CPU in tight loops (not real time). For timing-sensitive
 * protocols (e.g. DHT), we schedule pin transitions against `cpu.cycles`.
 */
export class CycleScheduler {
  private events: ScheduledEvent[] = [];

  clear(): void {
    this.events = [];
  }

  get size(): number {
    return this.events.length;
  }

  schedule(cycle: number, callback: ScheduledCycleCallback): void {
    if (!Number.isFinite(cycle)) return;

    const evt: ScheduledEvent = { cycle: Math.max(0, Math.floor(cycle)), callback };

    // Insert sorted by cycle (small N).
    const idx = this.events.findIndex((e) => e.cycle > evt.cycle);
    if (idx === -1) {
      this.events.push(evt);
    } else {
      this.events.splice(idx, 0, evt);
    }
  }

  runDue(nowCycle: number): void {
    if (this.events.length === 0) return;

    const now = Math.floor(nowCycle);
    let i = 0;
    while (i < this.events.length && this.events[i]!.cycle <= now) {
      const evt = this.events[i]!;
      try {
        evt.callback();
      } catch {
        // Swallow callback errors to avoid wedging the simulation loop.
      }
      i++;
    }

    if (i > 0) {
      this.events.splice(0, i);
    }
  }
}
