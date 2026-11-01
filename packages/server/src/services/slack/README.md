# Slack integration: convert a message into a LogChimp post

Click the **⋯ (More actions)** menu on any Slack message → **Create LogChimp post**.
LogChimp cleans the message up with an AI model and creates a post. Progress and
the final link are sent privately to you, in your direct message window with the
LogChimp app, so nothing is posted in the channel you clicked in.

```
Slack ⋯ menu ──► POST /api/v1/integrations/slack/interactions   (verify signature, queue job, 200 OK)
                      │
                      ▼
               BullMQ `slack` queue ──► worker
                      │   1. DM "Converting your message…"
                      │   2. Slack user ► LogChimp user (same email), needs `post:create`
                      │   3. POST {AI base URL}/chat/completions  ► { title, description }
                      │   4. insert post (+ the author's first vote)
                      │   5. DM the link, notify the selected channel
                      ▼
```

## 1. Create the Slack app

Slack → [Your Apps](https://api.slack.com/apps) → **Create New App** → **From a manifest**,
and paste the manifest below (replace the URL with your LogChimp API URL).

```yaml
display_information:
  name: LogChimp
features:
  bot_user:
    display_name: LogChimp
    always_online: false
  app_home:
    messages_tab_enabled: true
    messages_tab_read_only_enabled: true
  shortcuts:
    - name: Create LogChimp post
      type: message
      callback_id: logchimp_create_post
      description: Turn this message into a LogChimp post
oauth_config:
  scopes:
    bot:
      - commands
      - chat:write
      - users:read
      - users:read.email
      - channels:read
      - groups:read
settings:
  interactivity:
    is_enabled: true
    request_url: https://YOUR-LOGCHIMP-API/api/v1/integrations/slack/interactions
  org_deploy_enabled: false
  socket_mode_enabled: false
```

Install the app to your workspace, then copy:

- **Bot User OAuth Token** (`xoxb-…`) from _OAuth & Permissions_
- **Signing Secret** from _Basic Information_

## 2. Configure LogChimp

| Variable                        | Description                                                                 |
| ------------------------------- | --------------------------------------------------------------------------- |
| `LOGCHIMP_SLACK_BOT_TOKEN`      | Bot User OAuth Token                                                        |
| `LOGCHIMP_SLACK_SIGNING_SECRET` | Used to verify that requests really come from Slack                         |
| `LOGCHIMP_AI_BASE_URL`          | OpenAI-compatible base URL **including the version prefix**, e.g. `https://api.openai.com/v1` |
| `LOGCHIMP_AI_API_KEY`           | API key (optional for local servers such as Ollama)                         |
| `LOGCHIMP_AI_MODEL`             | Model name, e.g. `gpt-4o-mini`                                              |

Also available in `logchimp.config.json` as `slack.botToken`, `slack.signingSecret`,
`ai.baseUrl`, `ai.apiKey` and `ai.model`. Run the database migrations, the
integration adds the `slack_settings` and `slack_message_imports` tables.

Any server that implements `POST {base}/chat/completions` works (OpenAI, Azure
OpenAI, Ollama, vLLM, LiteLLM, OpenRouter, …). No vendor SDK is used.

## 3. Choose the notification channel (optional)

Invite the app to a channel (`/invite @LogChimp`), then, as a user with the
`settings:update` permission:

```
GET   /api/v1/integrations/slack/channels   → channels to pick from
PATCH /api/v1/integrations/slack/settings   { "notificationChannelId": "C0123456789" }
GET   /api/v1/integrations/slack/settings
```

Each time a message becomes a post, the channel gets a short message with the
post's title and link, never the original message. Choose an internal channel.
Pass `null` to turn it off. The `PATCH` posts a confirmation message in the
channel, which also checks that the app is allowed to post there.

## Who can create posts

Posts are created as the LogChimp user whose **email matches the Slack user's
email**. That user must exist, not be blocked, and have the `post:create`
permission; otherwise they get a DM explaining what is missing. This keeps
authorship and permissions identical to creating a post in LogChimp.

## Notes

- The same Slack message is never converted twice; clicking again DMs the
  existing post's link.
- Failed conversions are retried (3 attempts with backoff). The user is told
  only once all attempts have failed.
- Message text is sent to the configured AI provider. Use a provider you are
  comfortable sharing Slack content with, or a self-hosted model.
