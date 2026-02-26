import { LogicGateDevice } from '../utils/simulation/logic';

type Case = { a: boolean; b?: boolean; out: boolean };

function runCase(name: string, gate: LogicGateDevice, cases: Case[]): void {
  for (const c of cases) {
    const result = gate.evaluate({ A: c.a, B: c.b ?? false }).Y;
    if (result !== c.out) {
      throw new Error(`${name} failed for A=${Number(c.a)} B=${Number(c.b ?? false)} expected=${Number(c.out)} got=${Number(result)}`);
    }
  }
}

async function main(): Promise<void> {
  runCase('NOT', new LogicGateDevice('not'), [
    { a: false, out: true },
    { a: true, out: false },
  ]);

  runCase('AND', new LogicGateDevice('and'), [
    { a: false, b: false, out: false },
    { a: false, b: true, out: false },
    { a: true, b: false, out: false },
    { a: true, b: true, out: true },
  ]);

  runCase('OR', new LogicGateDevice('or'), [
    { a: false, b: false, out: false },
    { a: false, b: true, out: true },
    { a: true, b: false, out: true },
    { a: true, b: true, out: true },
  ]);

  runCase('XOR', new LogicGateDevice('xor'), [
    { a: false, b: false, out: false },
    { a: false, b: true, out: true },
    { a: true, b: false, out: true },
    { a: true, b: true, out: false },
  ]);

  runCase('NAND', new LogicGateDevice('nand'), [
    { a: false, b: false, out: true },
    { a: false, b: true, out: true },
    { a: true, b: false, out: true },
    { a: true, b: true, out: false },
  ]);

  runCase('NOR', new LogicGateDevice('nor'), [
    { a: false, b: false, out: true },
    { a: false, b: true, out: false },
    { a: true, b: false, out: false },
    { a: true, b: true, out: false },
  ]);

  console.log('PASS: Logic gates (NOT/AND/OR/XOR/NAND/NOR) truth tables verified.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
