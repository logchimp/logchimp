/** Upper bound on the characters sent to the AI provider, to keep cost predictable */
export const MAX_MESSAGE_LENGTH = 6000;

/**
 * Convert Slack's message markup (mrkdwn) into plain text, so the AI
 * provider doesn't have to deal with `<@U123>` style tokens.
 * https://api.slack.com/reference/surfaces/formatting#retrieving-messages
 */
export function normalizeSlackText(text: string): string {
  return (
    text
      // <https://example.com|label> -> label (https://example.com)
      .replace(/<((?:https?|mailto):[^|>]+)\|([^>]+)>/g, "$2 ($1)")
      // <https://example.com> -> https://example.com
      .replace(/<((?:https?|mailto):[^>]+)>/g, "$1")
      // <@U123ABC|name> or <@U123ABC> -> @user
      .replace(/<@[UW][A-Z0-9]+(?:\|[^>]*)?>/g, "@user")
      // <#C123ABC|channel-name> -> #channel-name
      .replace(/<#[CG][A-Z0-9]+\|([^>]+)>/g, "#$1")
      .replace(/<#[CG][A-Z0-9]+>/g, "#channel")
      // <!channel>, <!here>, <!everyone>, <!subteam^S123|@team>
      .replace(/<!subteam\^[A-Z0-9]+\|(@[^>]+)>/g, "$1")
      .replace(/<!(channel|here|everyone)>/g, "@$1")
      // HTML entities Slack escapes
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH)
  );
}
