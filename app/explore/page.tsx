import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRightIcon,
  GraduationCapIcon,
  HeartIcon,
  SunIcon,
  UsersIcon,
  ZapIcon,
 DropletIcon, ShieldIcon, BuildingIcon} from "@/components/Icons";

const CATEGORY_CLASS: Record<string, string> = {
  CARE: "tab tab--care",
  BUILD: "tab tab--build",
  INFRASTRUCTURE: "tab tab--infrastructure",
};

function CategoryIcon({ category, tokenSymbol, title }: { category: string; tokenSymbol?: string; title?: string }) {
  const t = (title || "").toLowerCase();
  if (t.includes("water") || t.includes("borehole") || t.includes("well")) return <DropletIcon />;
  if (t.includes("widow") || t.includes("empower") || t.includes("women")) return <HeartIcon />;
  if (t.includes("solar") || t.includes("power") || t.includes("energy") || t.includes("electric")) return <ZapIcon />;
  if (t.includes("school") || t.includes("scholar") || t.includes("education") || t.includes("literacy") || t.includes("book")) return <GraduationCapIcon />;
  if (t.includes("clinic") || t.includes("hospital") || t.includes("medical") || t.includes("surgery") || t.includes("health")) return <ShieldIcon />;
  if (t.includes("build") || t.includes("construct") || t.includes("house") || t.includes("renovat") || t.includes("shelter")) return <BuildingIcon />;
  if (tokenSymbol === "SOLA") return <ZapIcon />;
  if (category === "CARE") return <HeartIcon />;
  if (category === "BUILD") return <GraduationCapIcon />;
  return <SunIcon />;
}

function amount(value: number) {
  return `$${value.toLocaleString()}`;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category?.toUpperCase();

  const projects = await prisma.project.findMany({
    where: category ? { category: category as any } : {},
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { contributions: true } } },
  });

  return (
    <div className="explore-page">
      <section className="page-intro">
        <p className="section-label">The project room</p>
        <h1>Put your attention where it can move something.</h1>
        <p>Browse projects with a clear purpose, a defined target, and progress you can follow.</p>
      </section>

      <nav className="filter-bar" aria-label="Filter projects">
        <Link className={!category ? "filter-link active" : "filter-link"} href="/explore">All projects</Link>
        <Link className={category === "CARE" ? "filter-link active" : "filter-link"} href="/explore?category=care">Care</Link>
        <Link className={category === "BUILD" ? "filter-link active" : "filter-link"} href="/explore?category=build">Build</Link>
        <Link className={category === "INFRASTRUCTURE" ? "filter-link active" : "filter-link"} href="/explore?category=infrastructure">Infrastructure</Link>
      </nav>

      {projects.length === 0 ? (
        <div className="empty-state">
          <h3>No projects in this view</h3>
          <p>Try another collection or come back as new work is published.</p>
        </div>
      ) : (
        <ul className="browse-grid">
          {projects.map((project) => {
            const percent = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));
            return (
              <li key={project.id} className="browse-card">
                <div className="browse-card-top">
                  <span className={`card-icon card-icon--${project.category.toLowerCase()}`}>
                    <CategoryIcon category={project.category} tokenSymbol={project.tokenSymbol} title={project.title} />
                  </span>
                  <span className={CATEGORY_CLASS[project.category]}>{project.category}</span>
                </div>
                <h2><Link href={`/projects/${project.id}`}>{project.title}</Link></h2>
                <p>{project.location}</p>
                <div className="progress"><span className="progress-fill" style={{ width: `${percent}%` }} /></div>
                <div className="browse-card-footer">
                  <span>{amount(project.raisedAmount)} of {amount(project.targetAmount)}</span>
                  <span><UsersIcon /> {project._count.contributions} supporters</span>
                  <Link href={`/projects/${project.id}`} aria-label={`View ${project.title}`}><ArrowUpRightIcon /></Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

