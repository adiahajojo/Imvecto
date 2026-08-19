import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FundProjectForm } from "@/components/FundProjectForm";

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
    <div>
      <p>{project.category} - {project.location}</p>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <p>
        <Link href={`/projects/${project.id}/passport`}>
          View Impact Passport
        </Link>
      </p>

      <h2>Funding</h2>
      <p>
        {project.raisedAmount} of {project.targetAmount} raised ({percent}
        percent)
      </p>
      <p>Token symbol: {project.tokenSymbol}</p>
      <p>Status: {project.status}</p>

      <FundProjectForm projectId={project.id} tokenSymbol={project.tokenSymbol} />

      <h2>Milestones</h2>
      {project.milestones.length === 0 && <p>No milestones added yet.</p>}
      <ul>
        {project.milestones.map((m) => (
          <li key={m.id}>
            <strong>{m.title}</strong>, {m.status}
            <p>{m.description}</p>
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
    </div>
  );
}
