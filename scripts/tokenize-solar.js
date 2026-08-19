async function main() {
  const { privateKeyToAccount } = await import("viem/accounts");

  const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
  const API_KEY = process.env.BRICKKEN_API_KEY;

  if (!PRIVATE_KEY) {
    console.error("Set SIGNER_PRIVATE_KEY first, in this terminal session only.");
    process.exit(1);
  }
  if (!API_KEY) {
    console.error("Set BRICKKEN_API_KEY first, in this terminal session only.");
    process.exit(1);
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  console.log("Signing with wallet:", account.address);

  console.log("\nStep 1: preparing the transaction with Brickken...");
  const prepareRes = await fetch("https://api.sandbox.brickken.com/prepare-transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify({
      method: "newTokenization",
      chainId: "aa36a7",
      signerAddress: account.address,
      tokenizerEmail: "adiahajojo@gmail.com",
      name: "Solar School Project",
      tokenSymbol: "SOLA",
      tokenType: "RWA_TOKEN",
      supplyCap: "100000",
    }),
  });

  const prepared = await prepareRes.json();

  if (!prepareRes.ok) {
    console.error("Prepare failed:", prepared);
    process.exit(1);
  }

  console.log("Prepared. txId:", prepared.txId);

  if (prepared.transactions.length > 1) {
    console.log(
      "Note: more than one transaction came back, this script only signs the first. Tell me if this happens."
    );
  }

  const tx = prepared.transactions[0];

  console.log("\nStep 2: signing locally, this never leaves your machine...");
  const signed = await account.signTransaction({
    to: tx.to,
    data: tx.data,
    value: BigInt(tx.value || "0x0"),
    nonce: tx.nonce,
    chainId: tx.chainId,
    type: "eip1559",
    maxFeePerGas: BigInt(tx.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
    gas: BigInt(tx.gasLimit),
  });

  console.log("Signed.");

  console.log("\nStep 3: submitting the signed transaction to Brickken...");
  const sendRes = await fetch("https://api.sandbox.brickken.com/send-transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify({
      txId: prepared.txId,
      signedTransactions: signed,
    }),
  });

  const sent = await sendRes.json();

  if (!sendRes.ok) {
    console.error("Send failed:", sent);
    process.exit(1);
  }

  console.log("Sent. Response:", sent);

  console.log("\nStep 4: checking status, polling every 4 seconds...");
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 4000));

    const statusRes = await fetch(
      `https://api.sandbox.brickken.com/get-transaction-status?txId=${prepared.txId}`,
      { headers: { "x-api-key": API_KEY } }
    );
    const status = await statusRes.json();
    console.log(`Check ${i + 1}:`, status);

    if (status.status && status.status !== "pending") {
      console.log("\nDone.");
      break;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
