import { Mux2Device } from '../utils/simulation/logic';

async function main(): Promise<void> {
  const mux = new Mux2Device();

  const cases = [
    { i0: false, i1: false, s: false, y: false },
    { i0: true, i1: false, s: false, y: true },
    { i0: true, i1: false, s: true, y: false },
    { i0: false, i1: true, s: true, y: true },
  ];

  for (const c of cases) {
    const out = mux.evaluate({ I0: c.i0, I1: c.i1, S: c.s }).Y;
    if (out !== c.y) {
      throw new Error(`MUX failed for I0=${Number(c.i0)} I1=${Number(c.i1)} S=${Number(c.s)} expected=${Number(c.y)} got=${Number(out)}`);
    }
  }

  console.log('PASS: MUX selection logic verified.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
