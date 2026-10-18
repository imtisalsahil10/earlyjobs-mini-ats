import "server-only";
import { prisma } from "@/lib/prisma";
import { PIPELINE_STAGES, STAGES, TERMINAL_STAGES, type Stage } from "@/lib/stages";

const DAY_MS = 86_400_000;

function daysBetween(from: Date, to: Date) {
  return Math.max(0, (to.getTime() - from.getTime()) / DAY_MS);
}

export async function getDashboardMetrics() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * DAY_MS);

  const [
    totalCandidates,
    stageGroups,
    openRoles,
    totalRoles,
    hiresLast30,
    hiresPrev30,
    appliedLast30,
    appliedPrev30,
    reachedStageEvents,
    hiredCandidates,
    sourceGroups,
    recentEvents,
    applicationTrendRows,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.groupBy({ by: ["stage"], _count: { _all: true } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.job.count(),
    prisma.candidate.count({
      where: { stage: "HIRED", closedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.candidate.count({
      where: { stage: "HIRED", closedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.candidate.count({ where: { appliedAt: { gte: thirtyDaysAgo } } }),
    prisma.candidate.count({
      where: { appliedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    // One row per (candidate, stage) pair, so counting rows per stage gives
    // "how many candidates ever reached this stage" — the true funnel.
    prisma.stageEvent.findMany({
      distinct: ["candidateId", "toStage"],
      select: { candidateId: true, toStage: true },
    }),
    prisma.candidate.findMany({
      where: { stage: "HIRED", closedAt: { not: null } },
      select: { appliedAt: true, closedAt: true },
    }),
    prisma.candidate.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.stageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        candidate: {
          select: { id: true, name: true, avatarSeed: true, job: { select: { title: true } } },
        },
      },
    }),
    prisma.candidate.findMany({
      where: { appliedAt: { gte: new Date(now.getTime() - 56 * DAY_MS) } },
      select: { appliedAt: true },
    }),
  ]);

  const byStage = Object.fromEntries(STAGES.map((stage) => [stage, 0])) as Record<
    Stage,
    number
  >;
  for (const group of stageGroups) {
    if (group.stage in byStage) byStage[group.stage as Stage] = group._count._all;
  }

  const activeCandidates = STAGES.filter(
    (stage) => !TERMINAL_STAGES.includes(stage),
  ).reduce((sum, stage) => sum + byStage[stage], 0);

  const reachedCounts = Object.fromEntries(
    STAGES.map((stage) => [stage, 0]),
  ) as Record<Stage, number>;
  for (const event of reachedStageEvents) {
    if (event.toStage in reachedCounts) {
      reachedCounts[event.toStage as Stage] += 1;
    }
  }

  const funnel = PIPELINE_STAGES.map((stage, index) => {
    const reached = reachedCounts[stage];
    const previous = index === 0 ? reached : reachedCounts[PIPELINE_STAGES[index - 1]];
    return {
      stage,
      reached,
      // Share of the previous stage that advanced here.
      conversion: previous > 0 ? reached / previous : 0,
      shareOfTop: reachedCounts[PIPELINE_STAGES[0]] > 0
        ? reached / reachedCounts[PIPELINE_STAGES[0]]
        : 0,
    };
  });

  const timeToHireValues = hiredCandidates
    .filter((c) => c.closedAt)
    .map((c) => daysBetween(c.appliedAt, c.closedAt as Date));
  const avgTimeToHire =
    timeToHireValues.length > 0
      ? timeToHireValues.reduce((a, b) => a + b, 0) / timeToHireValues.length
      : 0;

  const offersMade = reachedCounts.OFFER;
  const offerAcceptanceRate = offersMade > 0 ? byStage.HIRED / offersMade : 0;
  const applicantsToHire =
    reachedCounts.APPLIED > 0 ? byStage.HIRED / reachedCounts.APPLIED : 0;

  // Bucket applications into eight trailing weeks, oldest first.
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const end = new Date(now.getTime() - index * 7 * DAY_MS);
    const start = new Date(end.getTime() - 7 * DAY_MS);
    return { start, end, label: `W${8 - index}`, applications: 0 };
  }).reverse();

  for (const row of applicationTrendRows) {
    const bucket = weeks.find(
      (week) => row.appliedAt >= week.start && row.appliedAt < week.end,
    );
    if (bucket) bucket.applications += 1;
  }

  const sources = sourceGroups
    .map((group) => ({ source: group.source, count: group._count._all }))
    .sort((a, b) => b.count - a.count);

  return {
    totals: {
      totalCandidates,
      activeCandidates,
      openRoles,
      totalRoles,
      hiresLast30,
      hiresPrev30,
      appliedLast30,
      appliedPrev30,
      avgTimeToHire,
      offerAcceptanceRate,
      applicantsToHire,
      offersMade,
    },
    byStage,
    funnel,
    sources,
    trend: weeks.map(({ label, applications }) => ({ label, applications })),
    recentEvents,
  };
}

export type DashboardMetrics = Awaited<ReturnType<typeof getDashboardMetrics>>;

/** Percentage change between two periods, or null when there's no baseline. */
export function deltaPercent(current: number, previous: number) {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}
