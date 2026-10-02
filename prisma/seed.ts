import { PrismaClient } from "@prisma/client";
import { MATCHUPS } from "../lib/matchups";

const prisma = new PrismaClient();

async function main() {
  for (const m of MATCHUPS) {
    await prisma.matchup.upsert({
      where: { order: m.order },
      update: {
        question: m.question,
        audio: m.audio,
        leftName: m.left.name,
        leftGif: m.left.gif,
        rightName: m.right.name,
        rightGif: m.right.gif,
      },
      create: {
        order: m.order,
        question: m.question,
        audio: m.audio,
        leftName: m.left.name,
        leftGif: m.left.gif,
        rightName: m.right.name,
        rightGif: m.right.gif,
      },
    });
  }
  console.log(`Seeded ${MATCHUPS.length} matchup(s) — votes untouched.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
