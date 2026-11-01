import { UnrecoverableError } from "bullmq";
import * as v from "valibot";

import { createPostRequestBodySchema } from "../../controllers/post/schema";
import {
  computePermissions,
  getUserInfoWithRoles,
} from "../../middlewares/auth/helpers";
import { createPostWithVote } from "../../repository/post";
import {
  completeSlackMessageImport,
  failSlackMessageImport,
  findSlackMessageImport,
  findUserIdByEmail,
  getSlackSettings,
  startSlackMessageImport,
  type SlackMessageImport,
} from "../../repository/slack";
import { configManager } from "../../utils/logchimpConfig";
import logger from "../../utils/logger";
import { AiRequestError } from "../ai/chatCompletion";
import {
  FeedbackParseError,
  extractFeedback as defaultExtractFeedback,
} from "../ai/extractFeedback";
import { PostService } from "../posts/post.service";
import { SlackClient } from "./client";
import { normalizeSlackText } from "./formatMessage";

export interface ConvertMessageJobData {
  teamId: string;
  channelId: string;
  messageTs: string;
  slackUserId: string;
  text: string;
}

/**
 * An error the user can act on (missing account, missing configuration, ...).
 * Extends `UnrecoverableError` so the job queue doesn't retry it.
 */
export class ConversionError extends UnrecoverableError {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "ConversionError";
    this.userMessage = userMessage;
  }
}

export interface ConvertDeps {
  config: () => ReturnType<typeof configManager.getConfig>;
  slack: () => Pick<SlackClient, "postMessage" | "getUserEmail">;
  getSettings: typeof getSlackSettings;
  findImport: typeof findSlackMessageImport;
  startImport: typeof startSlackMessageImport;
  completeImport: typeof completeSlackMessageImport;
  failImport: typeof failSlackMessageImport;
  findUserIdByEmail: typeof findUserIdByEmail;
  getUserAccess: (userId: string) => Promise<{
    isBlocked: boolean;
    permissions: string[];
  } | null>;
  extractFeedback: typeof defaultExtractFeedback;
  createPost: typeof createPostWithVote;
}

export const defaultDeps: ConvertDeps = {
  config: () => configManager.getConfig(),
  slack: () => {
    const token = configManager.getConfig().slackBotToken;
    if (!token) {
      throw new ConversionError(
        "Slack isn't configured on this LogChimp instance (missing LOGCHIMP_SLACK_BOT_TOKEN).",
      );
    }
    return new SlackClient(token);
  },
  getSettings: getSlackSettings,
  findImport: findSlackMessageImport,
  startImport: startSlackMessageImport,
  completeImport: completeSlackMessageImport,
  failImport: failSlackMessageImport,
  findUserIdByEmail,
  getUserAccess: async (userId) => {
    const user = await getUserInfoWithRoles(userId);
    if (!user) return null;
    return {
      isBlocked: Boolean(user.isBlocked),
      permissions: await computePermissions(user),
    };
  },
  extractFeedback: defaultExtractFeedback,
  createPost: createPostWithVote,
};

function postUrl(deps: ConvertDeps, slug: string): string | null {
  const webUrl = deps.config().webUrl?.replace(/\/+$/, "");
  return webUrl ? `${webUrl}/posts/${slug}` : null;
}

/** Slack link markup, `|` and angle brackets in titles would break it */
function slackLink(url: string | null, label: string): string {
  const safeLabel = label.replace(/[<>|]/g, "");
  return url ? `<${url}|${safeLabel}>` : safeLabel;
}

/** Notifications are best effort, a failed message must never fail the job */
async function notify(
  deps: ConvertDeps,
  channel: string,
  text: string,
): Promise<void> {
  try {
    await deps.slack().postMessage({ channel, text });
  } catch (err) {
    logger.warn({
      code: "SLACK_NOTIFY_FAILED",
      message: `Failed to send Slack message to '${channel}'`,
      err,
    });
  }
}

function postedAs(existing: SlackMessageImport | null) {
  return existing?.status === "completed" && existing.post
    ? existing.post
    : null;
}

/**
 * Turn a Slack message into a LogChimp post:
 * 1. DM the user that processing started (first attempt only)
 * 2. find the LogChimp account of the Slack user (by email)
 * 3. ask the AI provider for a clean title and description
 * 4. create the post
 * 5. DM the user the link and notify the configured channel
 *
 * Safe to retry: a message that already has a post is never converted twice.
 */
export async function convertMessageToPost(
  data: ConvertMessageJobData,
  options: { attempt: number } = { attempt: 0 },
  deps: ConvertDeps = defaultDeps,
): Promise<void> {
  const key = {
    teamId: data.teamId,
    channelId: data.channelId,
    messageTs: data.messageTs,
  };

  const existing = await deps.findImport(key);
  const alreadyPosted = postedAs(existing);
  if (alreadyPosted) {
    await notify(
      deps,
      data.slackUserId,
      `:information_source: This message was already converted into a post: ${slackLink(
        postUrl(deps, alreadyPosted.slug),
        alreadyPosted.title,
      )}`,
    );
    return;
  }

  await deps.startImport({ ...key, slackUserId: data.slackUserId });

  if (options.attempt === 0) {
    await notify(
      deps,
      data.slackUserId,
      ":hourglass_flowing_sand: Converting your message into a LogChimp post…",
    );
  }

  const config = deps.config();
  if (!config.aiBaseUrl || !config.aiModel) {
    throw new ConversionError(
      "The AI provider isn't configured on this LogChimp instance. Ask an admin to set LOGCHIMP_AI_BASE_URL and LOGCHIMP_AI_MODEL.",
    );
  }

  const text = normalizeSlackText(data.text);
  if (!text) {
    throw new ConversionError(
      "That message has no text to turn into a post (attachments and images aren't supported yet).",
    );
  }

  // Post author: the LogChimp account that has the same email as the Slack user
  const email = await deps.slack().getUserEmail(data.slackUserId);
  if (!email) {
    throw new ConversionError(
      "I couldn't read your email from Slack. Ask an admin to grant the app the `users:read.email` permission.",
    );
  }

  const userId = await deps.findUserIdByEmail(email);
  if (!userId) {
    throw new ConversionError(
      `There is no LogChimp account for ${email}. Sign up on LogChimp with your Slack email and try again.`,
    );
  }

  const access = await deps.getUserAccess(userId);
  if (
    !access ||
    access.isBlocked ||
    !access.permissions.includes("post:create")
  ) {
    throw new ConversionError(
      "Your LogChimp account isn't allowed to create posts.",
    );
  }

  const feedback = await deps.extractFeedback({
    text,
    baseUrl: config.aiBaseUrl,
    apiKey: config.aiApiKey,
    model: config.aiModel,
  });

  // same sanitising as the `POST /api/v1/posts` endpoint
  const body = v.parse(createPostRequestBodySchema, {
    title: feedback.title,
    contentMarkdown: feedback.description,
  });
  const postService = new PostService();
  const { title, description } = postService.titleDescriptionOverflow(
    body.title,
    body.contentMarkdown,
  );
  const { slug, slugId } = postService.generateSlug(title);

  const post = await deps.createPost({
    userId,
    title,
    slug,
    slugId,
    contentMarkdown: description || null,
  });
  await deps.completeImport(key, { userId, postId: post.postId });

  const link = slackLink(postUrl(deps, post.slug), post.title);
  await notify(
    deps,
    data.slackUserId,
    `:white_check_mark: Your message is now a LogChimp post: ${link}`,
  );

  try {
    const { notificationChannelId } = await deps.getSettings();
    if (notificationChannelId) {
      await notify(
        deps,
        notificationChannelId,
        `:speech_balloon: <@${data.slackUserId}> created a new LogChimp post: ${link}`,
      );
    }
  } catch (err) {
    logger.warn({
      code: "SLACK_NOTIFY_FAILED",
      message: "Failed to read the Slack notification channel setting",
      err,
    });
  }
}

function describeFailure(err: unknown): string {
  if (err instanceof ConversionError) return err.userMessage;
  if (err instanceof AiRequestError || err instanceof FeedbackParseError) {
    return "The AI provider couldn't process that message. Please try again in a moment.";
  }
  return "Something went wrong on the LogChimp server. Please try again in a moment.";
}

/** Called once a job has permanently failed: record it and tell the user */
export async function reportConversionFailure(
  data: ConvertMessageJobData,
  err: unknown,
  deps: ConvertDeps = defaultDeps,
): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  logger.error({
    code: "SLACK_CONVERT_FAILED",
    message: `Failed to convert Slack message: ${message}`,
    err,
  });

  try {
    await deps.failImport(
      {
        teamId: data.teamId,
        channelId: data.channelId,
        messageTs: data.messageTs,
      },
      message,
    );
  } catch (dbErr) {
    logger.warn({
      code: "SLACK_CONVERT_FAILED",
      message: "Failed to record the failed Slack import",
      err: dbErr,
    });
  }

  await notify(
    deps,
    data.slackUserId,
    `:warning: I couldn't create a LogChimp post from that message. ${describeFailure(err)}`,
  );
}
