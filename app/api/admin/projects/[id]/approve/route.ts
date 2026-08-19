import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json({ project });
}
