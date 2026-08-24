import { createWalletClient, createPublicClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // must be 0x-prefixed
const TOKEN_ADDRESS = "0x28d2b01854d0abec267a3ddcad9163580e6e8604";
const TO_ADDRESS = "0xA30fE1CE2bdcb1c752EdA9bEe83E012b4a72DEB3";
const AMOUNT = 1000000000n; // 1000 USDT, 6 decimals

if (!RPC_URL || !PRIVATE_KEY) {
  console.error("Set SEPOLIA_RPC_URL and PRIVATE_KEY env vars first.");
  process.exit(1);
}

const abi = parseAbi(["function mint(address to, uint256 amount)"]);
const account = privateKeyToAccount(PRIVATE_KEY);

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(RPC_URL),
});

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const hash = await walletClient.writeContract({
  address: TOKEN_ADDRESS,
  abi,
  functionName: "mint",
  args: [TO_ADDRESS, AMOUNT],
});

console.log("tx sent:", hash);
const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log("confirmed in block:", receipt.blockNumber, "status:", receipt.status);
