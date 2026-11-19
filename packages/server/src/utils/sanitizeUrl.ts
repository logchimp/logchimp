import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

// Create a DOM window for DOMPurify to use (once per process)
const window = new JSDOM("").window;
// @ts-expect-error
const DOMPurify = createDOMPurify(window as unknown);

export function sanitizeUrl(value: string): string | null {
  const imgDiv = `<img src="${value}">`;

  // Sanitize the HTML using DOMPurify
  const sanitized = (
    DOMPurify.sanitize(imgDiv, {
      ALLOWED_TAGS: ["img"],
      ALLOWED_ATTR: ["src"],
      ALLOW_DATA_ATTR: false,
    }) || ""
  ).trim();

  const url = sanitized.substring(10, sanitized.length - 2);
  return url || null;
}
