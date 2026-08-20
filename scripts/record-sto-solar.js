const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({
    where: { tokenSymbol: "SOLA" },
  });

  if (!project) {
    console.error("Could not find the Solar project.");
    process.exit(1);
  }

  await prisma.transaction.create({
    data: {
      projectId: project.id,
      method: "newSto",
      chainId: "aa36a7",
      txHash: "0xe5482213e9c728210915862a0d29fb752210dd7dad910c96c29896b36175391c",
      status: "confirmed",
    },
  });

  console.log("Recorded. Solar's STO is now linked to a confirmed Sepolia transaction.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
