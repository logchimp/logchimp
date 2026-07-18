export function preview(name: string, fallback: string) {
  if (process.env.NODE_ENV === "development") {
    return fallback;
  }

  return `[${name}]`;
}
