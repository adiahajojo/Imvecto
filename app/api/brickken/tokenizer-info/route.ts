import { NextResponse } from "next/server";
import { getTokenizerInfo } from "@/lib/brickken";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenSymbol = searchParams.get("tokenSymbol");

  if (!tokenSymbol) {
    return NextResponse.json({ error: "Missing tokenSymbol." }, { status: 400 });
  }

  try {
    const info = await getTokenizerInfo(tokenSymbol);
    return NextResponse.json(info);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
