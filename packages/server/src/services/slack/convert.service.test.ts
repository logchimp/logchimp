import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  type ConvertDeps,
  type ConvertMessageJobData,
  ConversionError,
  convertMessageToPost,
  reportConversionFailure,
} from "./convert.service";

const job: ConvertMessageJobData = {
  teamId: "T1",
  channelId: "C1",
  messageTs: "1700000000.000100",
  slackUserId: "U1",
  text: "The product is ok as I told <@U2> but there is a glitch in the side panel.",
};

let postMessage: ReturnType<typeof vi.fn>;
let deps: ConvertDeps;

beforeEach(() => {
  postMessage = vi.fn().mockResolvedValue(undefined);
  deps = {
    config: () =>
      ({
        webUrl: "https://feedback.example.com/",
        aiBaseUrl: "https://ai.example.com/v1",
        aiApiKey: "key",
        aiModel: "model",
      }) as ReturnType<ConvertDeps["config"]>,
    slack: () =>
      ({
        postMessage,
        getUserEmail: vi.fn().mockResolvedValue("jane@example.com"),
      }) as unknown as ReturnType<ConvertDeps["slack"]>,
    getSettings: vi
      .fn()
      .mockResolvedValue({ notificationChannelId: "CNOTIFY" }),
    findImport: vi.fn().mockResolvedValue(null),
    startImport: vi.fn().mockResolvedValue(undefined),
    completeImport: vi.fn().mockResolvedValue(undefined),
    failImport: vi.fn().mockResolvedValue(undefined),
    findUserIdByEmail: vi.fn().mockResolvedValue("user-1"),
    getUserAccess: vi
      .fn()
      .mockResolvedValue({ isBlocked: false, permissions: ["post:create"] }),
    extractFeedback: vi.fn().mockResolvedValue({
      title: "Fix glitch in the side panel",
      description: "A glitch appears in the side panel.",
    }),
    createPost: vi.fn().mockImplementation(async (o) => ({
      postId: "post-1",
      title: o.title,
      slug: o.slug,
    })),
  };
});

const sentTo = (channel: string) =>
  postMessage.mock.calls
    .map(([m]) => m)
    .filter((m) => m.channel === channel)
    .map((m) => m.text as string);

describe("convertMessageToPost", () => {
  test("creates the post and notifies the user (DM) and the notification channel", async () => {
    await convertMessageToPost(job, { attempt: 0 }, deps);

    // the AI only sees plain text, no Slack mention markup
    expect(deps.extractFeedback).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "The product is ok as I told @user but there is a glitch in the side panel.",
        baseUrl: "https://ai.example.com/v1",
        model: "model",
      }),
    );

    expect(deps.createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        title: "Fix glitch in the side panel",
        contentMarkdown: "A glitch appears in the side panel.",
      }),
    );
    expect(deps.completeImport).toHaveBeenCalledWith(
      { teamId: "T1", channelId: "C1", messageTs: "1700000000.000100" },
      { userId: "user-1", postId: "post-1" },
    );

    const dms = sentTo("U1");
    expect(dms).toHaveLength(2);
    expect(dms[0]).toContain("Converting your message");
    expect(dms[1]).toMatch(
      /^:white_check_mark: .*<https:\/\/feedback\.example\.com\/posts\/fix-glitch-in-the-side-panel-[\w-]+\|Fix glitch in the side panel>$/,
    );

    const channelMessages = sentTo("CNOTIFY");
    expect(channelMessages).toHaveLength(1);
    expect(channelMessages[0]).toContain("<@U1> created a new LogChimp post");
    // the original message text is never posted to the channel
    expect(channelMessages[0]).not.toContain("glitch in the side panel.");
  });

  test("skips the notification channel when none is selected", async () => {
    deps.getSettings = vi
      .fn()
      .mockResolvedValue({ notificationChannelId: null });

    await convertMessageToPost(job, { attempt: 0 }, deps);

    expect(postMessage).toHaveBeenCalledTimes(2);
    expect(sentTo("U1")).toHaveLength(2);
  });

  test("a failing Slack notification doesn't fail the conversion", async () => {
    postMessage.mockRejectedValue(new Error("channel_not_found"));

    await expect(
      convertMessageToPost(job, { attempt: 0 }, deps),
    ).resolves.toBeUndefined();
    expect(deps.createPost).toHaveBeenCalledTimes(1);
  });

  test("retries don't repeat the 'processing' DM", async () => {
    await convertMessageToPost(job, { attempt: 1 }, deps);

    expect(sentTo("U1")).toHaveLength(1);
    expect(sentTo("U1")[0]).toContain(":white_check_mark:");
  });

  test("a message that already became a post is not converted again", async () => {
    deps.findImport = vi.fn().mockResolvedValue({
      id: "i1",
      status: "completed",
      post: { postId: "post-1", title: "Existing", slug: "existing-abc" },
    });

    await convertMessageToPost(job, { attempt: 0 }, deps);

    expect(deps.extractFeedback).not.toHaveBeenCalled();
    expect(deps.createPost).not.toHaveBeenCalled();
    expect(sentTo("U1")[0]).toContain(
      "<https://feedback.example.com/posts/existing-abc|Existing>",
    );
  });

  test("a completed import whose post was deleted can be converted again", async () => {
    deps.findImport = vi
      .fn()
      .mockResolvedValue({ id: "i1", status: "completed", post: null });

    await convertMessageToPost(job, { attempt: 0 }, deps);

    expect(deps.createPost).toHaveBeenCalledTimes(1);
  });

  test("falls back to the title without a link when LOGCHIMP_WEB_URL is unset", async () => {
    deps.config = () =>
      ({
        aiBaseUrl: "https://ai.example.com/v1",
        aiModel: "model",
      }) as ReturnType<ConvertDeps["config"]>;

    await convertMessageToPost(job, { attempt: 0 }, deps);

    expect(sentTo("U1")[1]).toBe(
      ":white_check_mark: Your message is now a LogChimp post: Fix glitch in the side panel",
    );
  });

  test("fails without a LogChimp account for the Slack email", async () => {
    deps.findUserIdByEmail = vi.fn().mockResolvedValue(null);

    await expect(
      convertMessageToPost(job, { attempt: 0 }, deps),
    ).rejects.toThrow(/no LogChimp account for jane@example\.com/);
    expect(deps.createPost).not.toHaveBeenCalled();
  });

  test.each([
    ["blocked", { isBlocked: true, permissions: ["post:create"] }],
    ["without post:create", { isBlocked: false, permissions: ["post:read"] }],
    ["unknown", null],
  ])("fails for a user who is %s", async (_name, access) => {
    deps.getUserAccess = vi.fn().mockResolvedValue(access);

    await expect(
      convertMessageToPost(job, { attempt: 0 }, deps),
    ).rejects.toThrow(ConversionError);
    expect(deps.extractFeedback).not.toHaveBeenCalled();
  });

  test("fails when the AI provider isn't configured", async () => {
    deps.config = () => ({}) as ReturnType<ConvertDeps["config"]>;

    await expect(
      convertMessageToPost(job, { attempt: 0 }, deps),
    ).rejects.toThrow(/AI provider isn't configured/);
  });

  test("fails for a message without text", async () => {
    await expect(
      convertMessageToPost({ ...job, text: "   " }, { attempt: 0 }, deps),
    ).rejects.toThrow(/no text/);
  });

  test("AI errors are not wrapped, so the queue can retry them", async () => {
    deps.extractFeedback = vi.fn().mockRejectedValue(new Error("boom"));

    const err = await convertMessageToPost(job, { attempt: 0 }, deps).catch(
      (e) => e,
    );

    expect(err).not.toBeInstanceOf(ConversionError);
    expect(deps.createPost).not.toHaveBeenCalled();
  });

  test("overlong titles overflow into the description", async () => {
    deps.extractFeedback = vi
      .fn()
      .mockResolvedValue({ title: "x".repeat(150), description: "details" });

    await convertMessageToPost(job, { attempt: 0 }, deps);

    const created = vi.mocked(deps.createPost).mock.calls[0][0];
    expect(created.title).toHaveLength(100);
    expect(created.contentMarkdown).toContain("details");
  });

  test("HTML in the AI output is sanitised", async () => {
    deps.extractFeedback = vi.fn().mockResolvedValue({
      title: "<script>alert(1)</script>Fix it",
      description: "<img src=x onerror=alert(1)>text",
    });

    await convertMessageToPost(job, { attempt: 0 }, deps);

    const created = vi.mocked(deps.createPost).mock.calls[0][0];
    expect(created.title).not.toContain("<script>");
    expect(created.contentMarkdown).not.toContain("onerror");
  });
});

describe("reportConversionFailure", () => {
  test("records the failure and DMs the user a readable reason", async () => {
    await reportConversionFailure(
      job,
      new ConversionError("There is no LogChimp account for jane@example.com."),
      deps,
    );

    expect(deps.failImport).toHaveBeenCalledWith(
      { teamId: "T1", channelId: "C1", messageTs: "1700000000.000100" },
      expect.stringContaining("no LogChimp account"),
    );
    expect(sentTo("U1")[0]).toContain(
      "no LogChimp account for jane@example.com",
    );
  });

  test("doesn't leak internal error details to Slack", async () => {
    await reportConversionFailure(
      job,
      new Error("connect ECONNREFUSED 10.0.0.5:5432"),
      deps,
    );

    expect(sentTo("U1")[0]).not.toContain("10.0.0.5");
    expect(sentTo("U1")[0]).toContain("Something went wrong");
  });
});
