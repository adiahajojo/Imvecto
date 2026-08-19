import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const EXPLORER_BY_CHAIN: Record<string, string> = {
  aa36a7: "https://sepolia.etherscan.io/tx/",
};

export default async function PassportPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      milestones: true,
      impactMetrics: true,
      transactions: { orderBy: { createdAt: "asc" } },
      contributions: true,
    },
  });

  if (!project) {
    notFound();
  }

  const percent = Math.min(
    100,
    Math.round((project.raisedAmount / project.targetAmount) * 100)
  );

  const contributorCount = new Set(project.contributions.map((c) => c.userId))
    .size;

  return (
    <div>
      <p>
        <Link href={`/projects/${project.id}`}>Back to project</Link>
      </p>

      <h1>Impact Passport</h1>
      <p>{project.title}</p>
      <p>
        {project.category}, {project.location}
      </p>
      <p>Project ID: {project.id}</p>
      <p>Status: {project.status}</p>

      <h2>Funding</h2>
      <p>
        Raised {project.raisedAmount} of {project.targetAmount} ({percent}
        percent)
      </p>
      <p>Contributors: {contributorCount}</p>
      <p>Token symbol: {project.tokenSymbol}</p>
      {project.brickkenTokenAddress && (
        <p>Token contract: {project.brickkenTokenAddress}</p>
      )}

      <h2>Milestones</h2>
      {project.milestones.length === 0 && <p>No milestones recorded yet.</p>}
      <ul>
        {project.milestones.map((m) => (
          <li key={m.id}>
            <strong>{m.title}</strong>, {m.status}
            {m.description && <p>{m.description}</p>}
            {m.evidenceUrl && (
              <p>
                <a href={m.evidenceUrl}>Evidence</a>
              </p>
            )}
          </li>
        ))}
      </ul>

      {project.impactMetrics.length > 0 && (
        <>
          <h2>Impact</h2>
          <ul>
            {project.impactMetrics.map((metric) => (
              <li key={metric.id}>
                {metric.metricName}: {metric.currentValue} of{" "}
                {metric.targetValue} {metric.unit}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>On-chain record</h2>
      <p>
        Every action below happened on the Sepolia test network and can be
        checked independently, this page does not just state that something
        happened, it links to proof.
      </p>
      {project.transactions.length === 0 && (
        <p>No on-chain transactions recorded yet.</p>
      )}
      <ul>
        {project.transactions.map((tx) => {
          const explorerBase = EXPLORER_BY_CHAIN[tx.chainId];
          return (
            <li key={tx.id}>
              {tx.method}, {tx.status}
              {tx.txHash && explorerBase && (
                <p>
                  <a href={`${explorerBase}${tx.txHash}`}>
                    View on Etherscan
                  </a>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p>
        <a href={`/api/projects/${project.id}/passport`} download>
          Download this passport as JSON
        </a>
      </p>
    </div>
  );
}
