import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRightIcon,
  BookIcon,
  BuildingIcon,
  CheckIcon,
  HeartIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/Icons";

const CATEGORY_CLASS: Record<string, string> = {
  CARE: "tab tab--care",
  BUILD: "tab tab--build",
  INFRASTRUCTURE: "tab tab--infrastructure",
};

function CategoryIcon({ category }: { category: string }) {
  if (category === "CARE") return <HeartIcon />;
  if (category === "BUILD") return <BookIcon />;
  return <BuildingIcon />;
}

function amount(value: number) {
  return `$${value.toLocaleString()}`;
}

export default async function HomePage() {
  const [projects, stats, fundedCount, activeCount] = await Promise.all([
    prisma.project.findMany({
      where: { status: { in: ["ACTIVE", "FUNDED", "COMPLETED"] } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { _count: { select: { contributions: true, milestones: true } } },
    }),
    prisma.project.aggregate({ _sum: { raisedAmount: true }, _count: { _all: true } }),
    prisma.project.count({ where: { status: "FUNDED" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
  ]);

  const totalSupporters = projects.reduce((sum, project) => sum + project._count.contributions, 0);
  const featuredProject = projects[0];
  const featuredPercent = featuredProject
    ? Math.min(100, Math.round((featuredProject.raisedAmount / featuredProject.targetAmount) * 100))
    : 0;
  const activity = projects.slice(0, 3).map((project, index) => ({
    label: index === 0 ? "New project launched" : index === 1 ? "Funding is moving" : "Milestone activity recorded",
    title: project.title,
    detail: index === 1 ? `${Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100))}% funded` : project.location,
  }));

  return (
    <div className="fresh-home">
      <section className="fresh-hero">
        <div className="fresh-hero-copy">
          <div className="fresh-kicker"><span /> IMVECTO / PROJECT FUNDING</div>
          <h1>Put money behind <i>meaningful</i> work.</h1>
          <p className="fresh-positioning">Imvecto is a project funding platform for backing useful work and following its progress from contribution to outcome.</p>
          <div className="fresh-actions">
            <Link href="/explore" className="fresh-button fresh-button-light">Explore projects <ArrowUpRightIcon /></Link>
            <Link href="/projects/new" className="fresh-link-light">Submit a project <ArrowUpRightIcon /></Link>
          </div>
          <div className="fresh-proof"><CheckIcon /> Funding, milestones, and updates in one place.</div>
        </div>

        <div className="fresh-hero-art" aria-label="Featured project">
          <div className="fresh-art-top"><span>01 / FIELD NOTE</span><span>FEATURED PROJECT</span></div>
          <div className="fresh-art-line" />
          <div className="fresh-art-index">{featuredProject ? "ACTIVE" : "OPEN"}</div>
          <Link href={featuredProject ? `/projects/${featuredProject.id}` : "/explore"} className="fresh-signal-card">
            <div className="fresh-signal-header"><span>PROJECT SIGNAL</span><span className="fresh-live"><i /> TRACKING</span></div>
            <div className="fresh-signal-icon">{featuredProject ? <CategoryIcon category={featuredProject.category} /> : <SparkIcon />}</div>
            <p className="fresh-signal-label">Featured project</p>
            <h2>{featuredProject?.title || "A new chapter starts here"}</h2>
            <p className="fresh-signal-location">{featuredProject?.location || "Open community"}</p>
            <div className="fresh-signal-progress"><span style={{ width: `${featuredPercent}%` }} /></div>
            <div className="fresh-signal-data"><strong>{featuredPercent}%</strong><span>funded</span><b>{featuredProject?._count.milestones || 0}</b><span>milestones</span></div>
            <span className="fresh-signal-link">View project <ArrowUpRightIcon /></span>
          </Link>
          <div className="fresh-art-caption"><span>FIELD WORK / 2026</span><strong>Support should have a visible shape.</strong></div>
        </div>
      </section>

      <section className="fresh-ticker" aria-label="Platform statistics">
        <div><span>CAPITAL RAISED</span><strong>{amount(stats._sum.raisedAmount || 0)}</strong></div>
        <div><span>BACKERS</span><strong>{totalSupporters}</strong></div>
        <div><span>PROJECTS FUNDED</span><strong>{fundedCount}</strong></div>
        <div><span>ACTIVE PROJECTS</span><strong>{activeCount}</strong></div>
      </section>

      <section className="fresh-projects">
        <div className="fresh-section-heading"><div><span className="fresh-overline">THE PORTFOLIO / 02</span><h2>Choose a direction.</h2></div><p>Projects with a purpose, a target, and a path forward.</p></div>
        {projects.length === 0 ? <div className="empty-state"><h3>The portfolio is opening soon</h3><p>New projects will appear here as they are published.</p></div> : <ul className="fresh-project-grid">
          {projects.slice(0, 3).map((project, index) => {
            const percent = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));
            return <li key={project.id} className={`fresh-project-card fresh-project-card-${index + 1}`}>
              <Link href={`/projects/${project.id}`} className="fresh-card-link">
                <div className="fresh-project-card-head"><span className={`fresh-card-icon fresh-card-icon-${project.category.toLowerCase()}`}><CategoryIcon category={project.category} /></span><span className={CATEGORY_CLASS[project.category]}>{index === 1 ? "FEATURED" : project.category}</span></div>
                <span className="fresh-project-number">0{index + 1}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="fresh-card-bottom"><div className="fresh-card-progress"><span style={{ width: `${percent}%` }} /></div><div><strong>{percent}% funded</strong><span>{amount(project.raisedAmount)} raised of {amount(project.targetAmount)}</span></div><span className="fresh-card-arrow"><ArrowUpRightIcon /></span></div>
                <span className="fresh-card-action">View project <ArrowUpRightIcon /></span>
              </Link>
            </li>;
          })}
        </ul>}
        <Link href="/explore" className="fresh-archive-link">View all projects <ArrowUpRightIcon /></Link>
      </section>

      <section className="fresh-how">
        <div className="fresh-section-heading"><div><span className="fresh-overline">HOW IMVECTO WORKS / 03</span><h2>From interest to outcome.</h2></div><p>A simple path for backing work with clarity.</p></div>
        <ol className="fresh-step-grid"><li><b>01</b><h3>Discover</h3><p>Find projects worth supporting.</p></li><li><b>02</b><h3>Support</h3><p>Contribute directly to a project.</p></li><li><b>03</b><h3>Follow</h3><p>Track funding and milestones.</p></li><li><b>04</b><h3>Verify</h3><p>See what has been delivered.</p></li></ol>
      </section>

      <section className="fresh-trust">
        <div className="fresh-section-heading"><div><span className="fresh-overline">TRANSPARENCY / 04</span><h2>Every contribution has a trail.</h2></div><p>Imvecto keeps the important parts of a project visible as it moves.</p></div>
        <ol className="fresh-trust-grid"><li><b>01</b><strong>Funding</strong><span>Where the money came from.</span></li><li><b>02</b><strong>Allocation</strong><span>Where the money goes.</span></li><li><b>03</b><strong>Milestones</strong><span>What the project promised.</span></li><li><b>04</b><strong>Evidence</strong><span>What has been delivered.</span></li><li><b>05</b><strong>Outcome</strong><span>What changed.</span></li></ol>
      </section>

      {activity.length > 0 && <section className="fresh-activity"><div className="fresh-activity-heading"><span className="fresh-overline">RECENT ACTIVITY / 05</span><h2>Movement worth following.</h2></div><div className="fresh-activity-list">{activity.map((item) => <Link href="/explore" key={`${item.label}-${item.title}`}><span className="fresh-activity-dot" /><span><b>{item.label}</b><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowUpRightIcon /></Link>)}</div></section>}
      <section className="fresh-principles"><div className="fresh-principle-mark"><ShieldIcon /></div><div><span className="fresh-overline">THE IMVECTO STANDARD / 06</span><h2>Good work deserves a clear trail.</h2><p>Transparent, trackable funding from contribution to outcome.</p></div><Link href="/explore" className="fresh-button fresh-button-dark">Explore projects <ArrowUpRightIcon /></Link></section>

      <footer className="fresh-footer"><div className="fresh-footer-brand"><span>IMVECTO</span><p>Fund with intention. Follow with care.</p></div><div><b>Explore</b><Link href="/explore">Projects</Link><Link href="/explore">Categories</Link><Link href="/">How it works</Link></div><div><b>Participate</b><Link href="/projects/new">Start a project</Link><Link href="/dashboard">My activity</Link><Link href="/dashboard">Contributions</Link></div><div><b>Resources</b><span>Documentation</span><span>FAQs</span><span>Community</span></div><div><b>Legal</b><span>Terms</span><span>Privacy</span><span>Risk disclosure</span></div></footer>
    </div>
  );
}
