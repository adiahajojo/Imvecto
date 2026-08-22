"use client";

import { useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { useRouter } from "next/navigation";

type Status =
  | "idle"
  | "preparing-approve"
  | "approving"
  | "preparing-invest"
  | "signing"
  | "confirming"
  | "done"
  | "error";

export function FundProjectForm({
  projectId,
  tokenSymbol,
}: {
  projectId: string;
  tokenSymbol: string;
}) {
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  if (!isConnected) {
    return <p>Connect a wallet above to fund this project.</p>;
  }

  async function sendPreparedTransactions(transactions: any[]) {
    let lastHash = "";
    for (const tx of transactions) {
      lastHash = await sendTransactionAsync({
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value || "0x0"),
        gas: tx.gasLimit ? BigInt(tx.gasLimit) : undefined,
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas
          ? BigInt(tx.maxPriorityFeePerGas)
          : undefined,
      });
    }
    return lastHash;
  }

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // 1. Approve: let the investment contract pull the payment token.
      setStatus("preparing-approve");

      const approveRes = await fetch("/api/brickken/prepare-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          investorAddress: address,
          investmentAmount: amount,
        }),
      });

      const approveRawText = await approveRes.text();
      let approvePrepared: any;
      try {
        approvePrepared = JSON.parse(approveRawText);
      } catch {
        throw new Error(
          `Approve step returned status ${approveRes.status}, non-JSON body: ${approveRawText.slice(0, 300)}`
        );
      }

      if (!approveRes.ok) {
        throw new Error(approvePrepared.error || "Could not prepare the approval.");
      }

      setStatus("approving");
      await sendPreparedTransactions(approvePrepared.transactions);

      // 2. Invest, same as before.
      setStatus("preparing-invest");

      const prepareRes = await fetch("/api/brickken/prepare-invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          investorEmail: email,
          investorAddress: address,
          investmentAmount: amount,
        }),
      });

      const prepared = await prepareRes.json();

      if (!prepareRes.ok) {
        throw new Error(prepared.error || "Could not prepare the transaction.");
      }

      setStatus("signing");
      const lastHash = await sendPreparedTransactions(prepared.transactions);

      setStatus("confirming");

      const confirmRes = await fetch("/api/brickken/confirm-invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          investorEmail: email,
          amount,
          tokenSymbol,
          txId: prepared.txId,
          txHash: lastHash,
        }),
      });

      const confirmed = await confirmRes.json();

      if (!confirmRes.ok) {
        throw new Error(confirmed.error || "Could not confirm the transaction.");
      }

      setStatus("done");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p>Thank you, your contribution is recorded.</p>;
  }

  const busy = status !== "idle" && status !== "error";

  return (
    <form onSubmit={handleFund}>
      <h2>Fund this project</h2>
      <label>
        Your email, Brickken uses this to check investor eligibility
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Amount ({tokenSymbol} payment token)
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      {error && <p>{error}</p>}

      <button type="submit" disabled={busy}>
        {busy ? status : "Fund now"}
      </button>
    </form>
  );
}
