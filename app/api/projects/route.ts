import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const project = await prisma.project.create({
    data: {
      title,
      description,
      category,
      location,
      targetAmount: Number(targetAmount),
      tokenSymbol: tokenSymbol.toUpperCase(),
      ownerId: (session.user as any).id,
      status: "PENDING_VERIFICATION",
    },
  });

  return NextResponse.json({ project });
}
