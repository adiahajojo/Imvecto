import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

async function suggestAlternativeSymbols(taken: string): Promise<string[]> {
  const base = taken.slice(0, 4).padEnd(3, "X");
  const candidates = new Set<string>();

  // try swapping the last letter through the alphabet first
  for (const letter of ALPHABET) {
    const candidate = base.slice(0, -1) + letter;
    if (candidate !== taken) candidates.add(candidate);
    if (candidates.size >= 8) break;
  }

  const existing = await prisma.project.findMany({
    where: { tokenSymbol: { in: Array.from(candidates) } },
    select: { tokenSymbol: true },
  });
  const takenSet = new Set(existing.map((p) => p.tokenSymbol));

  return Array.from(candidates)
    .filter((c) => !takenSet.has(c))
    .slice(0, 3);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "You need to sign in first." }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, category, location, targetAmount, tokenSymbol } = body;

  if (!title || !description || !category || !location || !targetAmount || !tokenSymbol) {
    return NextResponse.json({ error: "Missing a required field." }, { status: 400 });
  }

  const normalizedSymbol = tokenSymbol.toUpperCase();

  const existingProject = await prisma.project.findUnique({
    where: { tokenSymbol: normalizedSymbol },
  });

  if (existingProject) {
    const alternatives = await suggestAlternativeSymbols(normalizedSymbol);
    return NextResponse.json(
      {
        error: `Token symbol "${normalizedSymbol}" is already in use by another project.`,
        alternatives,
      },
      { status: 409 }
    );
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      category,
      location,
      targetAmount: Number(targetAmount),
      tokenSymbol: normalizedSymbol,
      ownerId: (session.user as any).id,
      status: "PENDING_VERIFICATION",
    },
  });

  return NextResponse.json({ project });
}
