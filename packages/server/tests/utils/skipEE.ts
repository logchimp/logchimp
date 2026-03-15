import { describe, it } from "vitest";

/**
 * Conditionally skip entire test suites for EE features when SKIP_EE_TESTS is set
 */
export const describeEE =
  process.env.SKIP_EE_TESTS === "true" ? describe.skip : describe;

/**
 * Conditionally skip individual tests for EE features when SKIP_EE_TESTS is set
 */
export const itEE = process.env.SKIP_EE_TESTS === "true" ? it.skip : it;
