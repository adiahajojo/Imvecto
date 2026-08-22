import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRightIcon,
  CheckIcon,
  FlagIcon,
  GraduationCapIcon,
  ZapIcon,
  MapPinIcon,
  HeartIcon,
  ShieldIcon,
  SunIcon,
  UsersIcon,
} from "@/components/Icons";

const CATEGORY_CLASS: Record<string, string> = {
  CARE: "tab tab--care",
  BUILD: "tab tab--build",
  INFRASTRUCTURE: "tab tab--infrastructure",
};

function CategoryIcon({ category, tokenSymbol }: { category: string; tokenSymbol?: string }) {
  if (tokenSymbol === "SOLA") return <ZapIcon />;
  if (category === "CARE") return <HeartIcon />;
  if (category === "BUILD") return <GraduationCapIcon />;
  return <SunIcon />;
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
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> Imvecto / Project funding</span>
          <h1>Put money behind <em>meaningful</em> work.</h1>
          <p className="hero-lede">Imvecto is a project funding platform for backing useful work and following its progress from contribution to outcome.</p>
          <div className="hero-actions">
            <Link href="/explore" className="btn">Explore projects <ArrowUpRightIcon /></Link>
            <Link href="/projects/new" className="text-link">Submit a project <ArrowUpRightIcon /></Link>
          </div>
          <div className="hero-proof">
            <span className="proof-icon"><CheckIcon /></span>
            Funding, milestones, and updates in one place.
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-panel">
            <div className="visual-pattern" />
            <span className="visual-label">Field note · Featured project</span>
            <Link href={featuredProject ? `/projects/${featuredProject.id}` : "/explore"} className="passport-card">
              <div className="passport-topline">
                <span>Project signal</span>
                <span className="passport-status"><span className="network-dot" /> Tracking</span>
              </div>
              <div className="passport-symbol">{featuredProject ? <CategoryIcon category={featuredProject.category} tokenSymbol={featuredProject.tokenSymbol} /> : <UsersIcon />}</div>
              <p className="passport-kicker">Featured project</p>
              <h2>{featuredProject?.title || "A new chapter starts here"}</h2>
              <p className="passport-location">{featuredProject?.location || "Open community"}</p>
              <div className="passport-bar"><span style={{ width: `${featuredPercent}%` }} /></div>
              <div className="passport-stats">
                <div><strong>{featuredPercent}%</strong><span>funded</span></div>
                <div><strong>{featuredProject?._count.milestones || 0}</strong><span>milestones</span></div>
              </div>
              <span className="passport-link">View project <ArrowUpRightIcon /></span>
            </Link>
            <div className="visual-footer">
              <span className="visual-check"><MapPinIcon /></span>
              <span><strong>Support should have a visible shape.</strong><span>Field work / 2026</span></span>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip" aria-label="Platform statistics">
        <div className="metric"><span>Capital raised</span><strong>{amount(stats._sum.raisedAmount || 0)}</strong></div>
        <div className="metric"><span>Backers</span><strong>{totalSupporters}</strong></div>
        <div className="metric"><span>Projects funded</span><strong>{fundedCount}</strong></div>
        <div className="metric"><span>Active projects</span><strong>{activeCount}</strong></div>
      </section>

      <section className="projects-section">
        <div className="section-heading">
          <div>
            <span className="section-label">The portfolio</span>
            <h2>Choose a direction.</h2>
          </div>
          <p className="section-description">Projects with a purpose, a target, and a path forward.</p>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>The portfolio is opening soon</h3>
            <p>New projects will appear here as they are published.</p>
          </div>
        ) : (
          <ul className="browse-grid home-project-grid">
            {projects.slice(0, 3).map((project) => {
              const percent = Math.min(100, Math.round((project.raisedAmount / project.targetAmount) * 100));
              return (
                <li key={project.id} className="browse-card">
                  <div className="browse-card-top">
                    <span className={`card-icon card-icon--${project.category.toLowerCase()}`}>
                      <CategoryIcon category={project.category} tokenSymbol={project.tokenSymbol} />
                    </span>
                    <span className={CATEGORY_CLASS[project.category]}>{project.category}</span>
                  </div>
                  <h2><Link href={`/projects/${project.id}`}>{project.title}</Link></h2>
                  <p>{project.description}</p>
                  <div className="progress"><span className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  <div className="browse-card-footer">
                    <span>{percent}% funded</span>
                    <span>{amount(project.raisedAmount)} of {amount(project.targetAmount)}</span>
                    <Link href={`/projects/${project.id}`} aria-label={`View ${project.title}`}><ArrowUpRightIcon /></Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/explore" className="text-link home-archive-link">View all projects <ArrowUpRightIcon /></Link>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <div>
            <span className="section-label">How Imvecto works</span>
            <h2>From interest to outcome.</h2>
          </div>
          <p className="section-description">A simple path for backing work with clarity.</p>
        </div>
        <ol className="step-strip">
          <li><b>01</b><h3>Discover</h3><p>Find projects worth supporting.</p></li>
          <li><b>02</b><h3>Support</h3><p>Contribute directly to a project.</p></li>
          <li><b>03</b><h3>Follow</h3><p>Track funding and milestones.</p></li>
          <li><b>04</b><h3>Verify</h3><p>See what has been delivered.</p></li>
        </ol>
      </section>

      <section className="trail-section">
        <div className="section-heading">
          <div>
            <span className="section-label">Transparency</span>
            <h2>Every contribution has a trail.</h2>
          </div>
          <p className="section-description">Imvecto keeps the important parts of a project visible as it moves.</p>
        </div>
        <ol className="trail-strip">
          <li><b>01</b><strong>Funding</strong><span>Where the money came from.</span></li>
          <li><b>02</b><strong>Allocation</strong><span>Where the money goes.</span></li>
          <li><b>03</b><strong>Milestones</strong><span>What the project promised.</span></li>
          <li><b>04</b><strong>Evidence</strong><span>What has been delivered.</span></li>
          <li><b>05</b><strong>Outcome</strong><span>What changed.</span></li>
        </ol>
      </section>

      {activity.length > 0 && (
        <section className="activity-section">
          <div className="activity-heading">
            <span className="section-label">Recent activity</span>
            <h2>Movement worth following.</h2>
          </div>
          <div className="activity-list">
            {activity.map((item) => (
              <Link href="/explore" key={`${item.label}-${item.title}`} className="activity-row">
                <span className="activity-dot" />
                <span><b>{item.label}</b><strong>{item.title}</strong><small>{item.detail}</small></span>
                <ArrowUpRightIcon />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="trust-panel">
        <span className="trust-icon"><ShieldIcon /></span>
        <div className="trust-copy">
          <span className="section-label">The Imvecto standard</span>
          <h2>Good work deserves a clear trail.</h2>
          <p>Transparent, trackable funding from contribution to outcome.</p>
        </div>
        <Link href="/explore" className="trust-link">Explore projects <ArrowUpRightIcon /></Link>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <span>Imvecto</span>
          <p>Fund with intention. Follow with care.</p>
        </div>
        <div>
          <b>Explore</b>
          <Link href="/explore">Projects</Link>
          <Link href="/explore">Categories</Link>
          <Link href="/">How it works</Link>
        </div>
        <div>
          <b>Participate</b>
          <Link href="/projects/new">Start a project</Link>
          <Link href="/dashboard">My activity</Link>
          <Link href="/dashboard">Contributions</Link>
        </div>
        <div>
          <b>Resources</b>
          <span>Documentation</span>
          <span>FAQs</span>
          <span>Community</span>
        </div>
        <div>
          <b>Legal</b>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Risk disclosure</span>
        </div>
      </footer>
    </div>
  );
}

