import type { LocationQueryValue } from "vue-router";

/**
 * Gets the query param value from the route
 * @param {LocationQueryValue | LocationQueryValue[]} value
 */
export function getQueryParam(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first ?? undefined;
}
