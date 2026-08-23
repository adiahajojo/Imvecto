// OpenRouter client — unified access to Meta Llama models with automatic
// fallback across free model variants if one is rate-limited or down.

const OPENROUTER_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

const MODEL_FALLBACK_CHAIN = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  name?: string;
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
};

export type ToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

export type LlamaResponse = {
  content: string | null;
  tool_calls?: ToolCall[];
};

export async function callLlama(
  messages: ChatMessage[],
  tools?: ToolDefinition[]
): Promise<LlamaResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  const res = await fetch(OPENROUTER_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages,
      tools,
      tool_choice: tools ? "auto" : undefined,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("OpenRouter error:", JSON.stringify(data, null, 2));
    throw new Error(data?.error?.message || `OpenRouter request failed, status ${res.status}`);
  }

  const choice = data.choices?.[0]?.message;
  if (!choice) {
    throw new Error("OpenRouter returned no message choice.");
  }

  return {
    content: choice.content ?? null,
    tool_calls: choice.tool_calls,
  };
}
