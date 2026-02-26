import { DFlipFlopDevice, DSRFlipFlopDevice } from '../utils/simulation/logic';

function assertEq(name: string, actual: boolean, expected: boolean): void {
  if (actual !== expected) {
    throw new Error(`${name} expected=${Number(expected)} got=${Number(actual)}`);
  }
}

async function main(): Promise<void> {
  const dff = new DFlipFlopDevice();

  let out = dff.evaluate({ D: false, CLK: false });
  assertEq('DFF init Q', out.Q, false);

  out = dff.evaluate({ D: true, CLK: true });
  assertEq('DFF latch high Q', out.Q, true);

  out = dff.evaluate({ D: false, CLK: true });
  assertEq('DFF hold while CLK high', out.Q, true);

  out = dff.evaluate({ D: false, CLK: false });
  assertEq('DFF no edge', out.Q, true);

  out = dff.evaluate({ D: false, CLK: true });
  assertEq('DFF latch low on rising', out.Q, false);
  assertEq('DFF NQ complement', out.NQ, true);

  const dsr = new DSRFlipFlopDevice();
  let dsrOut = dsr.evaluate({ D: false, CLK: false, S: false, R: false });
  assertEq('DSR init Q', dsrOut.Q, false);

  dsrOut = dsr.evaluate({ D: false, CLK: false, S: true, R: false });
  assertEq('DSR set Q', dsrOut.Q, true);

  dsrOut = dsr.evaluate({ D: false, CLK: false, S: false, R: true });
  assertEq('DSR reset Q', dsrOut.Q, false);

  dsrOut = dsr.evaluate({ D: true, CLK: false, S: false, R: false });
  assertEq('DSR prepare D with no edge', dsrOut.Q, false);

  dsrOut = dsr.evaluate({ D: true, CLK: true, S: false, R: false });
  assertEq('DSR rising edge latch D', dsrOut.Q, true);

  console.log('PASS: D and DSR flip-flops behavior verified.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
