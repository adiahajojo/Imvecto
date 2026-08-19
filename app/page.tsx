import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { status: { in: ["ACTIVE", "FUNDED", "COMPLETED"] } },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div>
      <h1>Fund what matters. See what happens.</h1>
      <p>
        Imvecto connects people who want to help with real projects, and
        keeps the whole project visible from the first contribution to the
        final result.
      </p>

      <h2>Projects that need funding</h2>
      {projects.length === 0 && (
        <p>No projects yet. Seed data will appear here once added.</p>
      )}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
            <p>
              {project.raisedAmount} of {project.targetAmount} raised
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
