import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category?.toUpperCase();

  const projects = await prisma.project.findMany({
    where: category ? { category: category as any } : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Explore projects</h1>

      <nav>
        <Link href="/explore">All</Link>
        <Link href="/explore?category=care">Care</Link>
        <Link href="/explore?category=build">Build</Link>
        <Link href="/explore?category=infrastructure">Infrastructure</Link>
      </nav>

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/projects/${project.id}`}>{project.title}</Link>
            <p>{project.category}</p>
            <p>
              {project.raisedAmount} of {project.targetAmount} raised
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
