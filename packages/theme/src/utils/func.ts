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

export function isHexColorWithoutHash(value: unknown) {
  return (
    typeof value === "string" &&
    /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6})$/.test(value)
  );
}
