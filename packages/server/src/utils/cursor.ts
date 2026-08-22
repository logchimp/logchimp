/**
 * EncodeCursor turns a cursor into an opaque Base64 string
 * @param {Date|string|number} t - Date (or value accepted by Date constructor)
 * @param {string} id
 * @returns {string}
 */
export function encodeCursor(t: string, id: string) {
  const payload = {
    created_at: new Date(t).toISOString(),
    ...((id ?? "").trim() ? { id } : {}),
  };
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64");
}

/**
 * DecodeCursor parses the Base64 string back into the cursor object
 * @param {string} cursorStr
 * @throws {Error} on invalid base64 or JSON
 */
export function decodeCursor(cursorStr: string): {
  createdAt: Date;
  id?: string;
} {
  const json = Buffer.from(cursorStr, "base64").toString("utf8");
  const data = JSON.parse(json);

  return {
    createdAt: new Date(data.created_at),
    id: data?.id,
  };
}
