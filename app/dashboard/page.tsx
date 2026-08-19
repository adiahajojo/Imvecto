import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      contributions: { include: { project: true } },
      projects: true,
    },
  });

  return (
    <div>
      <h1>My activity</h1>

      <h2>Projects I have supported</h2>
      <ul>
        {user?.contributions.map((c) => (
          <li key={c.id}>
            {c.project.title}, {c.amount} {c.tokenSymbol}
          </li>
        ))}
        {user?.contributions.length === 0 && <li>Nothing yet.</li>}
      </ul>

      <h2>Projects I own</h2>
      <ul>
        {user?.projects.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
        {user?.projects.length === 0 && <li>None yet.</li>}
      </ul>
    </div>
  );
}
