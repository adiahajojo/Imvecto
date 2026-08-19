import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApproveButton } from "@/components/ApproveButton";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if ((session.user as any).role !== "ADMIN") {
    return <p>This page is for admins only.</p>;
  }

  const pending = await prisma.project.findMany({
    where: { status: "PENDING_VERIFICATION" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1>Verify projects</h1>
      {pending.length === 0 && <p>Nothing waiting on verification.</p>}
      <ul>
        {pending.map((project) => (
          <li key={project.id}>
            <strong>{project.title}</strong>, {project.category},{" "}
            {project.location}
            <p>{project.description}</p>
            <p>
              Target: {project.targetAmount}, token: {project.tokenSymbol}
            </p>
            <ApproveButton projectId={project.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
