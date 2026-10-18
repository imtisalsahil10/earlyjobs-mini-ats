import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

/**
 * Next.js may run route handlers from a different CWD than the project root,
 * so relative `file:` URLs are pinned to an absolute path up front.
 */
function resolveLocalFileUrl(url: string) {
  const relative = url.slice("file:".length);
  if (path.isAbsolute(relative)) return url;
  // Only reachable in development; production connects to Turso over HTTP. The
  // ignore keeps Turbopack from tracing the whole project into the bundle.
  return `file:${path.resolve(/* turbopackIgnore: true */ process.cwd(), relative)}`;
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const rawUrl = tursoUrl ?? process.env.DATABASE_URL ?? "file:dev.db";

  const adapter = new PrismaLibSql({
    url: rawUrl.startsWith("file:") ? resolveLocalFileUrl(rawUrl) : rawUrl,
    authToken: tursoUrl ? process.env.TURSO_AUTH_TOKEN : undefined,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
