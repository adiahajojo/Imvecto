const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const milestoneSets = {
  SOLA: [
    { title: "Project verification", status: "VERIFIED", description: "Documents and legitimacy checked." },
    { title: "Funding target reached", status: "PENDING", description: "Waiting on the remaining funding." },
    { title: "Equipment purchase", status: "PENDING", description: "Solar panels and inverters ordered." },
    { title: "Installation", status: "PENDING", description: "Panels installed across all ten schools." },
    { title: "Handover", status: "PENDING", description: "Schools confirm the systems are working." },
  ],
  SURG: [
    { title: "Medical information verified", status: "VERIFIED", description: "Diagnosis and treatment plan confirmed." },
    { title: "Hospital confirmation", status: "VERIFIED", description: "Hospital confirmed the cost and schedule." },
    { title: "Funding target reached", status: "PENDING", description: "Waiting on the remaining funding." },
    { title: "Surgery completed", status: "PENDING", description: "" },
    { title: "Recovery update", status: "PENDING", description: "" },
  ],
  SCHOL: [
    { title: "Applications reviewed", status: "VERIFIED", description: "Candidate students confirmed." },
    { title: "Funding target reached", status: "PENDING", description: "Waiting on the remaining funding." },
    { title: "Tuition paid", status: "PENDING", description: "" },
  ],
  RENOV: [
    { title: "Site survey", status: "PENDING", description: "Assess the extent of the damage." },
    { title: "Funding target reached", status: "PENDING", description: "" },
    { title: "Renovation work", status: "PENDING", description: "" },
    { title: "Handover", status: "PENDING", description: "" },
  ],
};

const projects = [
  {
    title: "Solar power for 10 rural schools",
    description: "Bringing solar power to ten rural schools so classrooms can run lights and computers reliably.",
    category: "BUILD",
    location: "Rivers State",
    targetAmount: 50000,
    raisedAmount: 32000,
    tokenSymbol: "SOLA",
    status: "ACTIVE",
  },
  {
    title: "Surgery support fund",
    description: "Covering surgery costs for patients who cannot afford treatment on their own.",
    category: "CARE",
    location: "Port Harcourt",
    targetAmount: 15000,
    raisedAmount: 8750,
    tokenSymbol: "SURG",
    status: "ACTIVE",
  },
  {
    title: "Scholarship fund",
    description: "Covering tuition and school supplies for students who would otherwise drop out.",
    category: "BUILD",
    location: "Rivers State",
    targetAmount: 20000,
    raisedAmount: 4000,
    tokenSymbol: "SCHOL",
    status: "ACTIVE",
  },
  {
    title: "School renovation project",
    description: "Repairing classrooms, roofing, and toilets at a community primary school.",
    category: "INFRASTRUCTURE",
    location: "Rivers State",
    targetAmount: 30000,
    raisedAmount: 0,
    tokenSymbol: "RENOV",
    status: "PENDING_VERIFICATION",
  },
];

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "demo-org@imvecto.app" },
    update: {},
    create: {
      email: "demo-org@imvecto.app",
      name: "Imvecto Demo Org",
      role: "ORG",
    },
  });

  for (const p of projects) {
    let project = await prisma.project.findFirst({
      where: { tokenSymbol: p.tokenSymbol },
    });

    if (!project) {
      project = await prisma.project.create({
        data: { ...p, ownerId: owner.id },
      });
      console.log("Created project:", p.title);
    } else {
      console.log("Project already exists, skipped creating:", p.title);
    }

    const existingMilestones = await prisma.milestone.count({
      where: { projectId: project.id },
    });

    if (existingMilestones === 0) {
      const set = milestoneSets[p.tokenSymbol] || [];
      for (const m of set) {
        await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: m.title,
            description: m.description,
            status: m.status,
          },
        });
      }
      console.log("Added milestones for:", p.title);
    } else {
      console.log("Milestones already exist, skipped for:", p.title);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
