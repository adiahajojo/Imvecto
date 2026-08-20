import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FundProjectForm } from "@/components/FundProjectForm";
import { ArrowUpRightIcon, CheckIcon } from "@/components/Icons";

function amount(value: number) {
  return `$${value.toLocaleString()}`;
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { milestones: true, impactMetrics: true },
  });

  if (!project) {
    notFound();
  }

  const percent = Math.min(
    100,
    Math.round((project.raisedAmount / project.targetAmount) * 100)
  );

  return (
    <div className="project-page">
      <section className="detail-head">
        <div>
          <Link href="/explore" className="back-link">Back to project room</Link>
          <p className="detail-kicker"><span className={`tab tab--${project.category.toLowerCase()}`}>{project.category}</span>{project.location}</p>
          <h1>{project.title}</h1>
          <p className="detail-description">{project.description}</p>
          <div className="detail-actions">
            <Link href={`/projects/${project.id}/passport`} className="btn">Open project passport <ArrowUpRightIcon /></Link>
            <span className="token-pill">{project.tokenSymbol}</span>
          </div>
        </div>

        <aside className="funding-panel">
          <p className="funding-panel-label">Funding progress</p>
          <p className="funding-amount">{amount(project.raisedAmount)} <span>raised</span></p>
          <div className="progress"><span className="progress-fill" style={{ width: `${percent}%` }} /></div>
          <div className="funding-meta"><span>{percent}% supported</span><span>Goal {amount(project.targetAmount)}</span></div>
          <FundProjectForm projectId={project.id} tokenSymbol={project.tokenSymbol} />
        </aside>
      </section>

      <div className="detail-grid">
        <section className="detail-section">
          <p className="section-label">The path forward</p>
          <h2>Milestones</h2>
          {project.milestones.length === 0 && <p>No milestones added yet.</p>}
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="milestone-row">
              <span className={milestone.status === "PENDING" ? "stamp stamp--pending" : "stamp"}>{milestone.status === "COMPLETED" || milestone.status === "VERIFIED" ? <CheckIcon /> : `0${index + 1}`}</span>
              <div className="milestone-text"><strong>{milestone.title}</strong><p>{milestone.description}</p></div>
            </div>
          ))}
        </section>
        <aside>
          <div className="side-note">
            <p className="section-label">Project signal</p>
            <h3>Progress you can place in context.</h3>
            <p>Each contribution supports a stated target. Project updates gather here as the work moves forward.</p>
            <p><strong>Status:</strong> {project.status}</p>
          </div>
          {project.impactMetrics.length > 0 && (
            <div className="detail-section">
              <p className="section-label">Measures</p>
              <h2>Impact</h2>
              {project.impactMetrics.map((metric) => <p key={metric.id}><strong>{metric.metricName}</strong><br />{metric.currentValue} of {metric.targetValue} {metric.unit}</p>)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
