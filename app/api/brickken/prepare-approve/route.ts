import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brickkenPrepare } from "@/lib/brickken";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, investorAddress, investmentAmount } = body;

  if (!projectId || !investorAddress || !investmentAmount) {
    return NextResponse.json({ error: "Missing a required field." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const prepared = await brickkenPrepare("approve", {
      chainId: "aa36a7",
      tokenSymbol: project.tokenSymbol,
      paymentTokenSymbol: "USDT",
      investorAddress,
      investmentAmount: String(investmentAmount),
      executionMode: "client-broadcast",
    });

    return NextResponse.json(prepared);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
