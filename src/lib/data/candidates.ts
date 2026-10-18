import "server-only";
import { prisma } from "@/lib/prisma";
import { isStage, STAGES, type Stage } from "@/lib/stages";
import type { Prisma } from "@/generated/prisma/client";

export const SORT_OPTIONS = {
  recent: { label: "Newest first", orderBy: { appliedAt: "desc" } },
  oldest: { label: "Oldest first", orderBy: { appliedAt: "asc" } },
  name: { label: "Name A–Z", orderBy: { name: "asc" } },
  rating: { label: "Highest rated", orderBy: { rating: "desc" } },
  updated: { label: "Recently updated", orderBy: { updatedAt: "desc" } },
} as const satisfies Record<
  string,
  { label: string; orderBy: Prisma.CandidateOrderByWithRelationInput }
>;

export type SortKey = keyof typeof SORT_OPTIONS;

export const PAGE_SIZE = 12;

export type CandidateFilters = {
  query?: string;
  stage?: string;
  jobId?: string;
  source?: string;
  sort?: string;
  page?: number;
};

function buildWhere({
  query,
  stage,
  jobId,
  source,
}: CandidateFilters): Prisma.CandidateWhereInput {
  const where: Prisma.CandidateWhereInput = {};

  const term = query?.trim();
  if (term) {
    // SQLite's LIKE is already case-insensitive for ASCII, which `contains` maps to.
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
      { skills: { contains: term } },
      { title: { contains: term } },
      { location: { contains: term } },
      { job: { title: { contains: term } } },
    ];
  }

  if (stage && stage !== "ALL" && isStage(stage)) where.stage = stage;
  if (jobId && jobId !== "ALL") where.jobId = jobId;
  if (source && source !== "ALL") where.source = source;

  return where;
}

export async function listCandidates(filters: CandidateFilters) {
  const sortKey: SortKey =
    filters.sort && filters.sort in SORT_OPTIONS ? (filters.sort as SortKey) : "recent";
  const page = Math.max(1, filters.page ?? 1);
  const where = buildWhere(filters);

  const [total, candidates] = await Promise.all([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where,
      orderBy: SORT_OPTIONS[sortKey].orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        job: { select: { id: true, title: true, department: true } },
        _count: { select: { notes: true } },
      },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    candidates,
    total,
    page: Math.min(page, pageCount),
    pageCount,
    sortKey,
  };
}

export type CandidateListItem = Awaited<
  ReturnType<typeof listCandidates>
>["candidates"][number];

export async function getCandidate(id: string) {
  return prisma.candidate.findUnique({
    where: { id },
    include: {
      job: true,
      events: { orderBy: { createdAt: "desc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
}

export type CandidateDetail = NonNullable<Awaited<ReturnType<typeof getCandidate>>>;

/** Candidates grouped into pipeline columns for the Kanban board. */
export async function getPipeline(jobId?: string) {
  const where: Prisma.CandidateWhereInput =
    jobId && jobId !== "ALL" ? { jobId } : {};

  const candidates = await prisma.candidate.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { job: { select: { id: true, title: true } } },
  });

  const columns = Object.fromEntries(
    STAGES.map((stage) => [stage, [] as typeof candidates]),
  ) as Record<Stage, typeof candidates>;

  for (const candidate of candidates) {
    if (isStage(candidate.stage)) columns[candidate.stage].push(candidate);
  }

  return columns;
}

export type PipelineCard = Awaited<ReturnType<typeof getPipeline>>[Stage][number];

export async function getFilterOptions() {
  const [jobs, sources] = await Promise.all([
    prisma.job.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, status: true },
    }),
    prisma.candidate.findMany({
      distinct: ["source"],
      orderBy: { source: "asc" },
      select: { source: true },
    }),
  ]);

  return { jobs, sources: sources.map((row) => row.source) };
}
