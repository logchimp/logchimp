import { describe, expect, test, vi } from "vitest";

import { AiRequestError, createChatCompletion } from "./chatCompletion";

const ok = (content: unknown) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
  });

const options = {
  baseUrl: "http://localhost:11434/v1/",
  apiKey: "secret",
  model: "my-model",
  messages: [{ role: "user" as const, content: "hi" }],
};

describe("createChatCompletion", () => {
  test("sends an OpenAI-compatible request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok('{"title":"t"}'));

    const content = await createChatCompletion({ ...options, fetchImpl });

    expect(content).toBe('{"title":"t"}');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("http://localhost:11434/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer secret");
    expect(JSON.parse(init.body)).toEqual({
      model: "my-model",
      messages: options.messages,
      response_format: { type: "json_object" },
    });
  });

  test("omits the auth header without an API key and json mode when disabled", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok("x"));

    await createChatCompletion({
      ...options,
      apiKey: undefined,
      jsonMode: false,
      fetchImpl,
    });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
    expect(JSON.parse(init.body).response_format).toBeUndefined();
  });

  test("throws with the status on a non-2xx response", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 429 }));

    await expect(
      createChatCompletion({ ...options, fetchImpl }),
    ).rejects.toMatchObject({
      name: "AiRequestError",
      status: 429,
    });
  });

  test("throws on network errors", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      createChatCompletion({ ...options, fetchImpl }),
    ).rejects.toThrow(AiRequestError);
  });

  test.each([[""], [null], [undefined]])(
    "throws on empty content %s",
    async (value) => {
      const fetchImpl = vi.fn().mockResolvedValue(ok(value));

      await expect(
        createChatCompletion({ ...options, fetchImpl }),
      ).rejects.toThrow("empty response");
    },
  );
});
