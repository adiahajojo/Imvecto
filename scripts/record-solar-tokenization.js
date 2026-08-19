const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({
    where: { tokenSymbol: "SOLA" },
  });

  if (!project) {
    console.error("Could not find the Solar project by token symbol SOLA.");
    process.exit(1);
  }

  await prisma.project.update({
    where: { id: project.id },
    data: {
      brickkenTokenAddress: "0x74ac6f1e971ae994cebd4d76db4a178fa11b0113",
    },
  });

  await prisma.transaction.create({
    data: {
      projectId: project.id,
      method: "newTokenization",
      chainId: "aa36a7",
      txHash: "0x2020cae5109b08725d2b719fce7b632c603fa43659917a8492bc68922bfbc337",
      status: "confirmed",
    },
  });

  console.log("Recorded. Solar is now linked to a real Sepolia transaction.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
