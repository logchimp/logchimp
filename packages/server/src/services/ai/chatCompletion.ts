export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  /** Base URL including the version prefix, e.g. `https://api.openai.com/v1` */
  baseUrl: string;
  apiKey?: string;
  model: string;
  messages: ChatMessage[];
  /** Ask the provider for a JSON object (`response_format: json_object`) */
  jsonMode?: boolean;
  timeoutMs?: number;
  /** Overridable for tests */
  fetchImpl?: typeof fetch;
}

export class AiRequestError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AiRequestError";
    this.status = status;
  }
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

/**
 * Minimal client for the OpenAI-compatible `POST {baseUrl}/chat/completions`
 * endpoint. Plain `fetch`, no vendor SDK, so it works with OpenAI, Azure
 * OpenAI, Ollama, vLLM, LiteLLM, OpenRouter, ...
 *
 * @returns the text content of the first choice
 */
export async function createChatCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  jsonMode = true,
  timeoutMs = 30_000,
  fetchImpl = fetch,
}: ChatCompletionOptions): Promise<string> {
  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new AiRequestError(
      `AI request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!response.ok) {
    const body = (await response.text().catch(() => "")).slice(0, 300);
    throw new AiRequestError(
      `AI provider responded with ${response.status}${body ? `: ${body}` : ""}`,
      response.status,
    );
  }

  let data: ChatCompletionResponse;
  try {
    data = (await response.json()) as ChatCompletionResponse;
  } catch {
    throw new AiRequestError("AI provider returned a non-JSON response");
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new AiRequestError("AI provider returned an empty response");
  }

  return content;
}
