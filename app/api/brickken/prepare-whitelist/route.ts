import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brickkenPrepare, getTokenizerInfo } from "@/lib/brickken";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

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

  const tokenizerKey = process.env.TOKENIZER_PRIVATE_KEY;
  if (!tokenizerKey) {
    return NextResponse.json(
      { error: "Server is not configured to sign whitelist transactions." },
      { status: 500 }
    );
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

    const account = privateKeyToAccount(tokenizerKey as `0x${string}`);
    const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(rpcUrl),
    });

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    });

    let lastHash = "";
    for (const tx of prepared.transactions) {
      const hash = await walletClient.sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: tx.value ? BigInt(tx.value) : BigInt(0),
        gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas
          ? BigInt(tx.maxPriorityFeePerGas)
          : undefined,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      lastHash = hash;
    }

    return NextResponse.json({ hash: lastHash });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
