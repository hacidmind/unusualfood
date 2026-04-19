/**
 * Seeded random number generator (xorshift32-based).
 * Same seed always produces the same sequence — deterministic shuffle.
 */
function xorshift(seed: number): number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  s ^= s << 13;
  s ^= s >>> 17;
  s ^= s << 5;
  return s >>> 0;
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 * Returns a new array — does not mutate the input.
 */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = (seed ^ 0xdeadbeef) >>> 0;

  for (let i = result.length - 1; i > 0; i--) {
    s = xorshift(s);
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
