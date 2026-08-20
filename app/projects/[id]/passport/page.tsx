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
    <div className="passport-page">
      <section className="page-intro">
        <Link href={`/projects/${project.id}`} className="back-link">Back to project</Link>
        <p className="section-label">Project record</p>
        <h1>Impact Passport</h1>
        <p>{project.title} · {project.category} · {project.location}</p>
      </section>

      <div className="passport-spread">
        <section className="passport-left">
          <p className="section-label">At a glance</p>
          <h2>Funding and identity</h2>
          <p><strong>Raised</strong><br />{project.raisedAmount} of {project.targetAmount} ({percent} percent)</p>
          <p><strong>Contributors</strong><br />{contributorCount}</p>
          <p><strong>Token</strong><br />{project.tokenSymbol}</p>
          <p><strong>Status</strong><br />{project.status}</p>
          {project.brickkenTokenAddress && <p><strong>Token contract</strong><br />{project.brickkenTokenAddress}</p>}
          <a href={`/api/projects/${project.id}/passport`} download className="btn">Download record</a>
        </section>

        <section className="passport-right">
          <p className="section-label">Evidence trail</p>
          <h2>Milestones</h2>
          {project.milestones.length === 0 && <p>No milestones recorded yet.</p>}
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="milestone-row">
              <span className={milestone.status === "PENDING" ? "stamp stamp--pending" : "stamp"}>{String(index + 1).padStart(2, "0")}</span>
              <div className="milestone-text"><strong>{milestone.title}</strong><p>{milestone.description}</p>{milestone.evidenceUrl && <p><a href={milestone.evidenceUrl}>Open evidence</a></p>}</div>
            </div>
          ))}

          {project.impactMetrics.length > 0 && <div className="detail-section"><p className="section-label">Measures</p><h2>Impact</h2>{project.impactMetrics.map((metric) => <p key={metric.id}><strong>{metric.metricName}</strong><br />{metric.currentValue} of {metric.targetValue} {metric.unit}</p>)}</div>}
        </section>
      </div>

      <section className="detail-section">
        <p className="section-label">Network record</p>
        <h2>Onchain activity</h2>
        <p>Activity is linked to the Sepolia test network so each entry can be checked independently.</p>
        {project.transactions.length === 0 && <p>No network transactions recorded yet.</p>}
        {project.transactions.map((transaction) => {
          const explorerBase = EXPLORER_BY_CHAIN[transaction.chainId];
          return <div key={transaction.id} className="receipt"><span className="receipt-status">{transaction.status}</span><strong>{transaction.method}</strong>{transaction.txHash && explorerBase && <a href={`${explorerBase}${transaction.txHash}`} className="passport-link">View on Etherscan</a>}</div>;
        })}
      </section>
    </div>
  );
}
