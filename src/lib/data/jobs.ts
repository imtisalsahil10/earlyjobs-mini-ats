import "server-only";
import { prisma } from "@/lib/prisma";
import { STAGES, TERMINAL_STAGES, type Stage } from "@/lib/stages";

/** Hiring priority, so open requisitions lead regardless of alphabetical status. */
const STATUS_ORDER: Record<string, number> = { OPEN: 0, ON_HOLD: 1, CLOSED: 2 };

export async function listJobs() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      candidates: { select: { stage: true } },
      _count: { select: { candidates: true } },
    },
  });

  jobs.sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
  );

  return jobs.map((job) => {
    const byStage = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<Stage, number>;
    for (const candidate of job.candidates) {
      if (candidate.stage in byStage) byStage[candidate.stage as Stage] += 1;
    }
    const active = STAGES.filter((s) => !TERMINAL_STAGES.includes(s)).reduce(
      (sum, stage) => sum + byStage[stage],
      0,
    );

    return {
      ...job,
      candidates: undefined,
      byStage,
      activeCount: active,
      hiredCount: byStage.HIRED,
      totalCount: job._count.candidates,
    };
  });
}

export type JobListItem = Awaited<ReturnType<typeof listJobs>>[number];
