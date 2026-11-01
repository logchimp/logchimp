import type { Request, Response } from "express";
import * as v from "valibot";

import error from "../../errorResponse.json";
import { SLACK_CREATE_POST_CALLBACK_ID } from "../../services/slack/constants";
import { verifySlackSignature } from "../../services/slack/signature";
import { configManager } from "../../utils/logchimpConfig";
import logger from "../../utils/logger";
import { slackQueue } from "../../worker/tasks/slack";

const payloadSchema = v.object({
  type: v.string(),
  callback_id: v.optional(v.string()),
  team: v.optional(v.object({ id: v.string() })),
  user: v.optional(v.object({ id: v.string() })),
  channel: v.optional(v.object({ id: v.string() })),
  message: v.optional(
    v.object({
      ts: v.string(),
      text: v.optional(v.string(), ""),
    }),
  ),
});

/**
 * Slack interactivity endpoint. Receives the payload of the
 * "Create LogChimp post" message shortcut (the 3-dots menu on a message).
 *
 * Slack expects a `200` within 3 seconds, so the only work done here is
 * verifying the request and adding a job to the queue.
 */
export async function interactions(req: Request, res: Response) {
  const { slackSigningSecret } = configManager.getConfig();
  if (!slackSigningSecret) {
    res.status(503).send({
      message: "Slack integration is not configured",
      code: "SLACK_NOT_CONFIGURED",
    });
    return;
  }

  // the route uses `express.raw()`, the signature is computed over the raw body
  const rawBody = req.body;
  if (!Buffer.isBuffer(rawBody)) {
    res.status(400).send({
      message: "Invalid request body",
      code: "INVALID_BODY",
    });
    return;
  }

  const isValid = verifySlackSignature({
    signingSecret: slackSigningSecret,
    timestamp: req.header("x-slack-request-timestamp"),
    signature: req.header("x-slack-signature"),
    rawBody,
  });
  if (!isValid) {
    res.status(401).send({
      message: "Invalid Slack request signature",
      code: "INVALID_SLACK_SIGNATURE",
    });
    return;
  }

  let payload: v.InferOutput<typeof payloadSchema>;
  try {
    const rawPayload = new URLSearchParams(rawBody.toString("utf8")).get(
      "payload",
    );
    payload = v.parse(payloadSchema, JSON.parse(rawPayload ?? ""));
  } catch {
    res.status(400).send({
      message: "Invalid Slack payload",
      code: "INVALID_SLACK_PAYLOAD",
    });
    return;
  }

  // Not our shortcut (or not a shortcut at all), nothing to do
  const { team, user, channel, message } = payload;
  if (
    payload.type !== "message_action" ||
    payload.callback_id !== SLACK_CREATE_POST_CALLBACK_ID ||
    !team ||
    !user ||
    !channel ||
    !message
  ) {
    res.status(200).send();
    return;
  }

  try {
    await slackQueue.convertMessageToPost({
      teamId: team.id,
      channelId: channel.id,
      messageTs: message.ts,
      slackUserId: user.id,
      text: message.text,
    });
  } catch (err) {
    logger.error({
      code: "SLACK_ENQUEUE_FAILED",
      message: "Failed to queue Slack message conversion",
      err,
    });
    // Slack shows an error to the user, which is what we want here
    res.status(500).send({
      message: error.general.serverError,
      code: "SERVER_ERROR",
    });
    return;
  }

  res.status(200).send();
}
