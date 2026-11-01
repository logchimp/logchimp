import type { Request, Response } from "express";
import * as v from "valibot";

import error from "../../errorResponse.json";
import {
  getSlackSettings,
  setSlackNotificationChannel,
} from "../../repository/slack";
import { SlackApiError, SlackClient } from "../../services/slack/client";
import type { IAuthenticationMiddlewareUser } from "../../types";
import { configManager } from "../../utils/logchimpConfig";
import logger from "../../utils/logger";

type AuthenticatedRequest<Body = unknown> = Request<unknown, unknown, Body> & {
  user?: IAuthenticationMiddlewareUser;
};

const updateBodySchema = v.object({
  notificationChannelId: v.nullable(
    v.pipe(v.string(), v.trim(), v.regex(/^[CG][A-Z0-9]{8,}$/)),
  ),
});

/** Returns `true` if a response was sent (the caller must stop) */
function rejectUnlessAllowed(
  req: AuthenticatedRequest<unknown>,
  res: Response,
): boolean {
  const permissions = req.user?.permissions ?? [];
  if (!permissions.includes("settings:update")) {
    res.status(403).send({
      message: error.api.roles.notEnoughPermission,
      code: "NOT_ENOUGH_PERMISSION",
    });
    return true;
  }

  const { slackBotToken } = configManager.getConfig();
  if (!slackBotToken) {
    res.status(503).send({
      message: "Slack integration is not configured",
      code: "SLACK_NOT_CONFIGURED",
    });
    return true;
  }

  return false;
}

function slackClient() {
  return new SlackClient(configManager.getConfig().slackBotToken);
}

function handleError(res: Response, err: unknown) {
  if (err instanceof SlackApiError) {
    const code =
      err.code === "channel_not_found" || err.code === "not_in_channel"
        ? "SLACK_CHANNEL_UNAVAILABLE"
        : "SLACK_API_ERROR";

    res.status(code === "SLACK_API_ERROR" ? 502 : 400).send({
      message:
        code === "SLACK_CHANNEL_UNAVAILABLE"
          ? "Channel not found, or the LogChimp app isn't in it. Invite the app to the channel and try again."
          : `Slack responded with an error: ${err.code}`,
      code,
    });
    return;
  }

  logger.error({
    code: "SLACK_SETTINGS_ERROR",
    message: "Slack settings request failed",
    err,
  });
  res.status(500).send({
    message: error.general.serverError,
    code: "SERVER_ERROR",
  });
}

/** `GET /api/v1/integrations/slack/settings` */
export async function getSettings(req: AuthenticatedRequest, res: Response) {
  if (rejectUnlessAllowed(req, res)) return;

  try {
    const { notificationChannelId } = await getSlackSettings();

    let notificationChannel = null;
    if (notificationChannelId) {
      notificationChannel = await slackClient()
        .getChannel(notificationChannelId)
        .catch(() => null);
    }

    res.status(200).send({
      notificationChannelId,
      notificationChannel,
    });
  } catch (err) {
    handleError(res, err);
  }
}

/** `GET /api/v1/integrations/slack/channels` - channels to pick from */
export async function getChannels(req: AuthenticatedRequest, res: Response) {
  if (rejectUnlessAllowed(req, res)) return;

  try {
    res.status(200).send({ channels: await slackClient().listChannels() });
  } catch (err) {
    handleError(res, err);
  }
}

/**
 * `PATCH /api/v1/integrations/slack/settings`
 *
 * Select the channel that receives a notification each time a message is
 * converted into a post (`null` turns it off). A confirmation message is
 * posted to it, which also proves the app is allowed to post there.
 */
export async function updateSettings(
  req: AuthenticatedRequest<{ notificationChannelId: string | null }>,
  res: Response,
) {
  if (rejectUnlessAllowed(req, res)) return;

  const body = v.safeParse(updateBodySchema, req.body);
  if (!body.success) {
    res.status(400).send({
      message: "Invalid body parameters",
      code: "VALIDATION_ERROR",
    });
    return;
  }

  const { notificationChannelId } = body.output;

  try {
    let notificationChannel = null;
    if (notificationChannelId) {
      const slack = slackClient();
      notificationChannel = await slack.getChannel(notificationChannelId);
      await slack.postMessage({
        channel: notificationChannelId,
        text: ":white_check_mark: LogChimp will post here whenever a Slack message is converted into a post.",
      });
    }

    await setSlackNotificationChannel(notificationChannelId);

    res.status(200).send({ notificationChannelId, notificationChannel });
  } catch (err) {
    handleError(res, err);
  }
}
