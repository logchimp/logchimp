import { v4 as uuidv4 } from "uuid";
import database from "../database";

const SETTINGS_ID = "default";

export type SlackImportStatus = "processing" | "completed" | "failed";

export interface SlackMessageKey {
  teamId: string;
  channelId: string;
  messageTs: string;
}

export interface SlackMessageImport {
  id: string;
  status: SlackImportStatus;
  post: { postId: string; title: string; slug: string } | null;
}

export async function getSlackSettings(): Promise<{
  notificationChannelId: string | null;
}> {
  const row = await database("slack_settings")
    .select("notification_channel_id")
    .where({ id: SETTINGS_ID })
    .first();

  return { notificationChannelId: row?.notification_channel_id ?? null };
}

export async function setSlackNotificationChannel(channelId: string | null) {
  await database("slack_settings")
    .insert({
      id: SETTINGS_ID,
      notification_channel_id: channelId,
    })
    .onConflict("id")
    .merge({
      notification_channel_id: channelId,
      updated_at: database.fn.now(),
    });
}

export async function findSlackMessageImport(
  key: SlackMessageKey,
): Promise<SlackMessageImport | null> {
  const row = await database("slack_message_imports as i")
    .leftJoin("posts as p", "p.postId", "i.post_id")
    .select("i.id", "i.status", "p.postId", "p.title", "p.slug")
    .where({
      "i.team_id": key.teamId,
      "i.channel_id": key.channelId,
      "i.message_ts": key.messageTs,
    })
    .first();

  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    post: row.postId
      ? { postId: row.postId, title: row.title, slug: row.slug }
      : null,
  };
}

/** Create the import row, or reset it to `processing` when retrying */
export async function startSlackMessageImport(
  key: SlackMessageKey & { slackUserId: string },
) {
  await database("slack_message_imports")
    .insert({
      id: uuidv4(),
      team_id: key.teamId,
      channel_id: key.channelId,
      message_ts: key.messageTs,
      slack_user_id: key.slackUserId,
      status: "processing",
    })
    .onConflict(["team_id", "channel_id", "message_ts"])
    .merge({
      slack_user_id: key.slackUserId,
      status: "processing",
      post_id: null,
      error: null,
      updated_at: database.fn.now(),
    });
}

export async function completeSlackMessageImport(
  key: SlackMessageKey,
  result: { userId: string; postId: string },
) {
  await database("slack_message_imports")
    .where({
      team_id: key.teamId,
      channel_id: key.channelId,
      message_ts: key.messageTs,
    })
    .update({
      status: "completed",
      user_id: result.userId,
      post_id: result.postId,
      error: null,
      updated_at: database.fn.now(),
    });
}

export async function failSlackMessageImport(
  key: SlackMessageKey,
  error: string,
) {
  await database("slack_message_imports")
    .where({
      team_id: key.teamId,
      channel_id: key.channelId,
      message_ts: key.messageTs,
    })
    .update({
      status: "failed",
      error: error.slice(0, 1000),
      updated_at: database.fn.now(),
    });
}

export async function findUserIdByEmail(email: string): Promise<string | null> {
  const row = await database("users")
    .select("userId")
    .whereRaw('LOWER("email") = ?', [email.toLowerCase()])
    .first();

  return row?.userId ?? null;
}
