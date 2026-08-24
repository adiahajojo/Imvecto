import { NextResponse } from "next/server";
import { callLlama, type ChatMessage } from "@/lib/llama";
import { AGENT_TOOLS, runTool } from "@/lib/agentTools";

const SYSTEM_PROMPT = `You are the Imvecto Impact Agent. You help people discover, understand, and fund impact projects on the Imvecto platform.

Rules:
- You can search for and explain projects, show funding progress, and show impact passports.
- You NEVER execute a funding transaction or touch a wallet yourself. If someone wants to fund a project, use prepare_funding to propose the action — the person will review it and approve it themselves in their wallet.
- Be concise and factual. Cite real numbers from tool results, don't make them up.
- If a tool returns an error, tell the person plainly what went wrong.
- You have no tool for creating or submitting a project. If someone asks how to submit a project, do not invent steps. Simply tell them to use the "Start a project" button in the navigation bar, and mention the form asks for a title, description, category, location, funding target, and token symbol.`;

export async function POST(request: Request) {
  const body = await request.json();
  const { message, history } = body;

  if (!message) {
    return NextResponse.json({ error: "Missing message." }, { status: 400 });
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(history || []),
    { role: "user", content: message },
  ];

  try {
    let response = await callLlama(messages, AGENT_TOOLS);

    // allow a few rounds of tool calls before forcing a final answer
    let rounds = 0;
    while (response.tool_calls && response.tool_calls.length > 0 && rounds < 4) {
      messages.push({
        role: "assistant",
        content: response.content || "",
      });

      for (const call of response.tool_calls) {
        const args = JSON.parse(call.function.arguments || "{}");
        const result = await runTool(call.function.name, args);
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result),
        });
      }

      response = await callLlama(messages, AGENT_TOOLS);
      rounds++;
    }

    return NextResponse.json({
      reply: response.content,
      history: [...messages, { role: "assistant", content: response.content || "" }],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
