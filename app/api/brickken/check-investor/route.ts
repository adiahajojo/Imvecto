import { NextResponse } from "next/server";
import { BRICKKEN_BASE_URL } from "@/lib/brickken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenSymbol = searchParams.get("tokenSymbol");
  const investorEmail = searchParams.get("investorEmail");

  if (!tokenSymbol || !investorEmail) {
    return NextResponse.json({ error: "Missing tokenSymbol or investorEmail." }, { status: 400 });
  }

  const res = await fetch(
    `${BRICKKEN_BASE_URL}/get-balance-whitelist?tokenSymbol=${tokenSymbol}&investorEmail=${encodeURIComponent(investorEmail)}`,
    { headers: { "x-api-key": process.env.BRICKKEN_API_KEY as string } }
  );

  const data = await res.json();
  const exists = res.ok && !String(data?.message || "").includes("Investor not found");

  return NextResponse.json({ exists, raw: data });
}
