import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      milestones: true,
      impactMetrics: true,
      transactions: { orderBy: { createdAt: "asc" } },
      contributions: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const contributorCount = new Set(project.contributions.map((c) => c.userId))
    .size;

  const passport = {
    projectId: project.id,
    title: project.title,
    category: project.category,
    location: project.location,
    status: project.status,
    tokenSymbol: project.tokenSymbol,
    tokenContractAddress: project.brickkenTokenAddress,
    funding: {
      raisedAmount: project.raisedAmount,
      targetAmount: project.targetAmount,
      contributorCount,
    },
    milestones: project.milestones.map((m) => ({
      title: m.title,
      status: m.status,
      description: m.description,
      completedAt: m.completedAt,
      evidenceUrl: m.evidenceUrl,
    })),
    impact: project.impactMetrics.map((metric) => ({
      metricName: metric.metricName,
      currentValue: metric.currentValue,
      targetValue: metric.targetValue,
      unit: metric.unit,
    })),
    onChainRecord: project.transactions.map((tx) => ({
      method: tx.method,
      status: tx.status,
      chainId: tx.chainId,
      txHash: tx.txHash,
    })),
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(passport, {
    headers: {
      "Content-Disposition": `attachment; filename="${project.tokenSymbol}-impact-passport.json"`,
    },
  });
}
