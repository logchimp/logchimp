import { describe, expect, test } from "vitest";

import { MAX_MESSAGE_LENGTH, normalizeSlackText } from "./formatMessage";

describe("normalizeSlackText", () => {
  test("replaces user mentions", () => {
    expect(normalizeSlackText("hey <@U123ABC> and <@W9XYZ|bob>")).toBe(
      "hey @user and @user",
    );
  });

  test("unwraps links", () => {
    expect(
      normalizeSlackText(
        "see <https://example.com/a?b=1|the doc> or <https://example.com>",
      ),
    ).toBe("see the doc (https://example.com/a?b=1) or https://example.com");
  });

  test("replaces channels and broadcast mentions", () => {
    expect(normalizeSlackText("<#C123ABC|design> <!here> <!channel>")).toBe(
      "#design @here @channel",
    );
  });

  test("decodes HTML entities", () => {
    expect(normalizeSlackText("a &lt; b &amp;&amp; c &gt; d")).toBe(
      "a < b && c > d",
    );
  });

  test("trims and limits the length", () => {
    expect(normalizeSlackText("   hello  ")).toBe("hello");
    expect(
      normalizeSlackText("a".repeat(MAX_MESSAGE_LENGTH + 500)),
    ).toHaveLength(MAX_MESSAGE_LENGTH);
  });

  test("empty text stays empty", () => {
    expect(normalizeSlackText("  ")).toBe("");
  });
});
