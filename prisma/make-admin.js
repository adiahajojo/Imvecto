const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node prisma/make-admin.js you@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error("No user found with that email. Sign in through the site first, then run this again.");
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("Done. That account is now an admin:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
