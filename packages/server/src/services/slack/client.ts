const SLACK_API_URL = "https://slack.com/api";

export class SlackApiError extends Error {
  readonly method: string;
  /** Slack error code, e.g. `channel_not_found` */
  readonly code: string;

  constructor(method: string, code: string) {
    super(`Slack API '${method}' failed: ${code}`);
    this.name = "SlackApiError";
    this.method = method;
    this.code = code;
  }
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface SlackResponse {
  ok: boolean;
  error?: string;
  response_metadata?: { next_cursor?: string };
  [key: string]: unknown;
}

/**
 * Thin wrapper over the Slack Web API with `fetch`, only the methods
 * LogChimp needs.
 */
export class SlackClient {
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;

  constructor(token: string, fetchImpl: typeof fetch = fetch) {
    this.token = token;
    this.fetchImpl = fetchImpl;
  }

  private async call(
    method: string,
    body: URLSearchParams | Record<string, unknown>,
  ): Promise<SlackResponse> {
    const isJson = !(body instanceof URLSearchParams);

    const response = await this.fetchImpl(`${SLACK_API_URL}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": isJson
          ? "application/json; charset=utf-8"
          : "application/x-www-form-urlencoded",
      },
      body: isJson ? JSON.stringify(body) : body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new SlackApiError(method, `http_${response.status}`);
    }

    const data = (await response.json()) as SlackResponse;
    if (!data.ok) {
      throw new SlackApiError(method, data.error ?? "unknown_error");
    }

    return data;
  }

  /**
   * Post a message. Passing a Slack user ID as `channel` sends it to the
   * user's direct message conversation with the app.
   */
  async postMessage(options: { channel: string; text: string }) {
    await this.call("chat.postMessage", {
      channel: options.channel,
      text: options.text,
      unfurl_links: false,
      unfurl_media: false,
    });
  }

  /** Email of a Slack user (needs the `users:read.email` scope) */
  async getUserEmail(userId: string): Promise<string | null> {
    const data = await this.call(
      "users.info",
      new URLSearchParams({ user: userId }),
    );
    const user = data.user as { profile?: { email?: string } } | undefined;
    return user?.profile?.email?.trim().toLowerCase() || null;
  }

  async getChannel(channelId: string): Promise<SlackChannel> {
    const data = await this.call(
      "conversations.info",
      new URLSearchParams({ channel: channelId }),
    );
    const channel = data.channel as {
      id: string;
      name?: string;
      is_private?: boolean;
    };

    return {
      id: channel.id,
      name: channel.name ?? channel.id,
      isPrivate: channel.is_private === true,
    };
  }

  /** Public and private channels the app can see (first 1000) */
  async listChannels(): Promise<SlackChannel[]> {
    const channels: SlackChannel[] = [];
    let cursor = "";

    for (let page = 0; page < 5; page++) {
      const params = new URLSearchParams({
        types: "public_channel,private_channel",
        exclude_archived: "true",
        limit: "200",
      });
      if (cursor) params.set("cursor", cursor);

      const data = await this.call("conversations.list", params);
      for (const channel of (data.channels as Array<{
        id: string;
        name: string;
        is_private?: boolean;
      }>) ?? []) {
        channels.push({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private === true,
        });
      }

      cursor = data.response_metadata?.next_cursor ?? "";
      if (!cursor) break;
    }

    return channels;
  }
}
