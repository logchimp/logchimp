import crypto from "node:crypto";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";

const signingSecret = "test-signing-secret";

vi.mock("../../utils/logchimpConfig", () => ({
  configManager: {
    getConfig: () => ({ slackSigningSecret: signingSecret }),
  },
}));

const convertMessageToPost = vi.fn();
vi.mock("../../worker/tasks/slack", () => ({
  slackQueue: {
    convertMessageToPost: (...args: unknown[]) => convertMessageToPost(...args),
  },
}));

// the router also exposes the (authenticated) settings endpoints, which are not under test
vi.mock("../../middlewares/auth", () => ({ authRequired: [] }));
vi.mock("../../repository/slack", () => ({}));

import slackRouter from "../../routes/v1/slack";

const app = express();
app.use(express.json());
app.use("/api/v1", slackRouter);

const URL = "/api/v1/integrations/slack/interactions";

function signedRequest(
  payload: unknown,
  { secret = signingSecret, ts = Math.floor(Date.now() / 1000) } = {},
) {
  const body = `payload=${encodeURIComponent(JSON.stringify(payload))}`;
  const signature = `v0=${crypto
    .createHmac("sha256", secret)
    .update(`v0:${ts}:${body}`)
    .digest("hex")}`;

  return request(app)
    .post(URL)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .set("X-Slack-Request-Timestamp", String(ts))
    .set("X-Slack-Signature", signature)
    .send(body);
}

const shortcutPayload = {
  type: "message_action",
  callback_id: "logchimp_create_post",
  team: { id: "T1" },
  user: { id: "U1" },
  channel: { id: "C1" },
  message: {
    ts: "1700000000.000100",
    text: "there is a glitch in the side panel",
  },
  trigger_id: "123.456",
};

beforeEach(() => {
  convertMessageToPost.mockReset().mockResolvedValue(undefined);
});

describe("POST /integrations/slack/interactions", () => {
  test("acknowledges with 200 and queues the conversion", async () => {
    const res = await signedRequest(shortcutPayload);

    expect(res.status).toBe(200);
    expect(convertMessageToPost).toHaveBeenCalledWith({
      teamId: "T1",
      channelId: "C1",
      messageTs: "1700000000.000100",
      slackUserId: "U1",
      text: "there is a glitch in the side panel",
    });
  });

  test("rejects a request signed with the wrong secret", async () => {
    const res = await signedRequest(shortcutPayload, { secret: "wrong" });

    expect(res.status).toBe(401);
    expect(convertMessageToPost).not.toHaveBeenCalled();
  });

  test("rejects a stale request", async () => {
    const res = await signedRequest(shortcutPayload, {
      ts: Math.floor(Date.now() / 1000) - 3600,
    });

    expect(res.status).toBe(401);
    expect(convertMessageToPost).not.toHaveBeenCalled();
  });

  test("rejects an unsigned request", async () => {
    const res = await request(app)
      .post(URL)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(`payload=${encodeURIComponent(JSON.stringify(shortcutPayload))}`);

    expect(res.status).toBe(401);
  });

  test("ignores other shortcuts and interaction types with 200", async () => {
    expect(
      (await signedRequest({ ...shortcutPayload, callback_id: "other" }))
        .status,
    ).toBe(200);
    expect((await signedRequest({ type: "block_actions" })).status).toBe(200);
    expect(convertMessageToPost).not.toHaveBeenCalled();
  });

  test("returns 400 for a malformed payload", async () => {
    const body = "payload=not-json";
    const ts = Math.floor(Date.now() / 1000);
    const signature = `v0=${crypto
      .createHmac("sha256", signingSecret)
      .update(`v0:${ts}:${body}`)
      .digest("hex")}`;

    const res = await request(app)
      .post(URL)
      .set("Content-Type", "application/x-www-form-urlencoded")
      .set("X-Slack-Request-Timestamp", String(ts))
      .set("X-Slack-Signature", signature)
      .send(body);

    expect(res.status).toBe(400);
  });

  test("returns 500 when the job can't be queued, so Slack shows an error", async () => {
    convertMessageToPost.mockRejectedValue(new Error("redis down"));

    const res = await signedRequest(shortcutPayload);

    expect(res.status).toBe(500);
  });
});
