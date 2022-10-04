interface UseTrimType {
	value: string
	size: number
	trail?: string
}

export function useTrim({ value, size, trail = '...'}: UseTrimType) {
	if (!value) return "";
  const valueLength = value.length;

  value = value.slice(0, size);
  return value.trim() + (valueLength > size ? trail : "");
}
