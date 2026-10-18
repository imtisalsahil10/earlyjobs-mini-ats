import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: `file:${path.resolve(process.cwd(), "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = process.argv[2] ?? "Omar Verma";

  const candidate = await prisma.candidate.findFirst({
    where: { name },
    include: { events: { orderBy: { createdAt: "asc" } }, notes: true },
  });

  if (!candidate) {
    console.log(`No candidate named ${name}`);
    return;
  }

  console.log(`${candidate.name} — stage: ${candidate.stage}`);
  console.log(
    `events: ${candidate.events
      .map((e) => `${e.fromStage ?? "new"}->${e.toStage}`)
      .join(", ")}`,
  );
  console.log(`notes: ${candidate.notes.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
