async function main() {
  const { privateKeyToAccount } = await import("viem/accounts");
  const { createWalletClient, createPublicClient, http, parseAbi } = await import("viem");
  const { sepolia } = await import("viem/chains");

  const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    console.error("Set SIGNER_PRIVATE_KEY first, in this terminal session only.");
    process.exit(1);
  }

  const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
  const FAKE_USDT_ADDRESS = "0x28d2b01854d0abec267a3ddcad9163580e6e8604";
  const MINT_ABI = parseAbi(["function mint(address to, uint256 amount)"]);

  // 1000 USDT, 6 decimals
  const AMOUNT = 1000000000n;

  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log("Minting to wallet:", account.address);

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log("Submitting mint transaction...");
  const hash = await walletClient.writeContract({
    address: FAKE_USDT_ADDRESS,
    abi: MINT_ABI,
    functionName: "mint",
    args: [account.address, AMOUNT],
  });

  console.log("Submitted. Tx hash:", hash);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Status:", receipt.status);
  console.log("Done. You should now have 1000 test USDT in this wallet.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
