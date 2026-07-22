import { describe, expect, it } from "vitest";

import getAuthHeaders from "./getAuthHeaders";

describe("getAuthHeaders", () => {
  it("returns a Bearer auth header when a token exists", () => {
    expect(getAuthHeaders("test-token")).toEqual({
      Authorization: "Bearer test-token",
    });
  });

  it("returns undefined when no token exists", () => {
    expect(getAuthHeaders()).toBeUndefined();
  });
});
