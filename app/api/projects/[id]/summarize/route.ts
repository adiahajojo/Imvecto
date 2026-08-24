import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLlama } from "@/lib/llama";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      milestones: true,
      contributions: { select: { id: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const percentFunded =
    project.targetAmount > 0
      ? Math.round((project.raisedAmount / project.targetAmount) * 100)
      : 0;

  const milestoneSummary =
    project.milestones.map((m) => `- ${m.title}: ${m.status}`).join("\n") ||
    "No milestones recorded yet.";

  const prompt = `You are summarizing an impact-funding project for a potential donor. Be concise, factual, and encouraging without exaggerating.

Project: ${project.title}
Category: ${project.category}
Location: ${project.location}
Status: ${project.status}
Funding: $${project.raisedAmount} raised of $${project.targetAmount} target (${percentFunded}%)
Contributors: ${project.contributions.length}
Description: ${project.description}

Milestones:
${milestoneSummary}

Write:
1. A 2-3 sentence plain-language summary of the project and its current progress.
2. One short risk or watch-out note if funding is stalled, milestones are overdue, or contributor count is very low — otherwise say "No significant risks noted."

Respond in this exact format:
SUMMARY: <summary>
RISK: <risk note>`;

  try {
    const response = await callLlama([{ role: "user", content: prompt }]);
    const text = response.content || "";

    const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?:\nRISK:|$)/);
    const riskMatch = text.match(/RISK:\s*([\s\S]*)/);

    return NextResponse.json({
      summary: summaryMatch ? summaryMatch[1].trim() : text.trim(),
      risk: riskMatch ? riskMatch[1].trim() : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
