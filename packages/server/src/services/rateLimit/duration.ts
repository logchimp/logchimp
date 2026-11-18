type DurationUnit = "ms" | "s" | "m" | "h" | "d" | "w";

/**
 * A human readable duration, e.g. `"10 s"`, `"1 m"`, `"24h"`, `"7 d"`.
 */
export type Duration = `${number} ${DurationUnit}` | `${number}${DurationUnit}`;

const MULTIPLIERS: Record<DurationUnit, number> = {
  ms: 1,
  s: 1000,
  m: 1000 * 60,
  h: 1000 * 60 * 60,
  d: 1000 * 60 * 60 * 24,
  w: 1000 * 60 * 60 * 24 * 7,
};

/**
 * Convert a human readable duration (or a plain millisecond number) to
 * milliseconds.
 *
 * @example
 * ms("10 s"); // 10_000
 * ms("1 m"); // 60_000
 * ms(500); // 500
 */
export function ms(duration: Duration | number): number {
  if (typeof duration === "number") {
    if (!Number.isFinite(duration) || duration < 1) {
      throw new Error(`Window size must be at least 1 ms, got: ${duration}`);
    }
    return Math.round(duration);
  }

  const match = duration.match(/^(\d+(?:\.\d+)?)\s?(ms|s|m|h|d|w)$/);
  if (!match) {
    throw new Error(`Unable to parse window size: ${duration}`);
  }

  const value = Number.parseFloat(match[1]);
  const unit = match[2] as DurationUnit;
  const result = Math.round(value * MULTIPLIERS[unit]);

  if (result < 1) {
    throw new Error(`Window size must be at least 1 ms, got: ${duration}`);
  }

  return result;
}
