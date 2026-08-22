import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brickkenPrepare, getTokenizerInfo } from "@/lib/brickken";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    projectId,
    investorEmail,
    investorAddress,
    investorName,
    investorSurname,
  } = body;

  if (!projectId || !investorEmail || !investorAddress || !investorName || !investorSurname) {
    return NextResponse.json({ error: "Missing a required field." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const tokenizerInfo = await getTokenizerInfo(project.tokenSymbol);

    const prepared = await brickkenPrepare("whitelist", {
      chainId: "aa36a7",
      signerAddress: tokenizerInfo.companyWalletAddress.trim().toLowerCase(),
      tokenSymbol: project.tokenSymbol,
      userToWhitelist: [
        {
          investorEmail,
          investorAddress: investorAddress.trim().toLowerCase(),
          whitelistStatus: true,
          needKyc: false,
        },
      ],
      newInvestor: {
        name: investorName,
        surname: investorSurname,
        type: "INVESTOR_PERSON",
      },
    });

    return NextResponse.json(prepared);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
