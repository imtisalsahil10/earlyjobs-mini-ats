import { NextResponse } from "next/server";
import { listCandidates } from "@/lib/data/candidates";
import { parseSkills } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Read-only JSON view of the candidate search, so the same filtering logic the
 * UI uses is available to external consumers.
 *
 * GET /api/candidates?q=react&stage=INTERVIEW&jobId=…&source=…&sort=recent&page=1
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const { candidates, total, page, pageCount } = await listCandidates({
    query: searchParams.get("q") ?? undefined,
    stage: searchParams.get("stage") ?? undefined,
    jobId: searchParams.get("jobId") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
  });

  return NextResponse.json({
    meta: { total, page, pageCount },
    data: candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      title: candidate.title,
      location: candidate.location,
      stage: candidate.stage,
      rating: candidate.rating,
      source: candidate.source,
      skills: parseSkills(candidate.skills),
      appliedAt: candidate.appliedAt,
      job: candidate.job,
      noteCount: candidate._count.notes,
    })),
  });
}
