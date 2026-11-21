import type { LocationQueryValue } from "vue-router";
import isHexColor from "validator/es/lib/isHexColor";

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
    typeof value === "string" && !value.startsWith("#") && isHexColor(value)
  );
}
