import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brickkenConfirm } from "@/lib/brickken";

export async function POST(request: Request) {
  const body = await request.json();
  const { projectId, investorEmail, amount, tokenSymbol, txId, txHash } = body;

  if (!projectId || !investorEmail || !amount || !tokenSymbol || !txId || !txHash) {
    return NextResponse.json({ error: "Missing a required field." }, { status: 400 });
  }

  try {
    await brickkenConfirm({ txId, txHash });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }

  const user = await prisma.user.upsert({
    where: { email: investorEmail },
    update: {},
    create: { email: investorEmail, role: "DONOR" },
  });

  const contribution = await prisma.contribution.create({
    data: {
      projectId,
      userId: user.id,
      amount: Number(amount),
      tokenSymbol,
      txHash,
      status: "confirmed",
    },
  });

  await prisma.transaction.create({
    data: {
      projectId,
      userId: user.id,
      txHash,
      method: "newInvest",
      chainId: "aa36a7",
      status: "confirmed",
    },
  });

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { raisedAmount: { increment: Number(amount) } },
  });

  return NextResponse.json({ contribution, project });
}
