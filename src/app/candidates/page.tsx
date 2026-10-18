import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  getFilterOptions,
  listCandidates,
} from "@/lib/data/candidates";
import { parseSkills } from "@/lib/utils";
import {
  Avatar,
  Card,
  EmptyState,
  Rating,
  StageBadge,
} from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";
import { FilterBar } from "@/components/candidates/filter-bar";
import { CandidateForm } from "@/components/candidates/candidate-form";

export const dynamic = "force-dynamic";

function buildPageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  return `/candidates${search.toString() ? `?${search}` : ""}`;
}

export default async function CandidatesPage({
  searchParams,
}: PageProps<"/candidates">) {
  const resolved = await searchParams;
  const filters = {
    query: typeof resolved.q === "string" ? resolved.q : undefined,
    stage: typeof resolved.stage === "string" ? resolved.stage : undefined,
    jobId: typeof resolved.jobId === "string" ? resolved.jobId : undefined,
    source: typeof resolved.source === "string" ? resolved.source : undefined,
    sort: typeof resolved.sort === "string" ? resolved.sort : undefined,
    page: typeof resolved.page === "string" ? Number(resolved.page) : 1,
  };

  const [{ candidates, total, page, pageCount }, { jobs, sources }] =
    await Promise.all([listCandidates(filters), getFilterOptions()]);

  const linkParams = {
    q: filters.query,
    stage: filters.stage,
    jobId: filters.jobId,
    source: filters.source,
    sort: filters.sort,
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Candidates"
        description="Search the talent pool and drill into any applicant."
        action={
          <CandidateForm
            jobs={jobs}
            title="Add a candidate"
            submitLabel="Add candidate"
            trigger={{ label: "Add candidate" }}
          />
        }
      />

      <FilterBar
        jobs={jobs}
        sources={sources}
        sortOptions={Object.entries(SORT_OPTIONS).map(([value, option]) => ({
          value,
          label: option.label,
        }))}
      />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">
            {total === 0
              ? "No candidates match these filters"
              : `Showing ${rangeStart}–${rangeEnd} of ${total} candidate${
                  total === 1 ? "" : "s"
                }`}
          </p>
        </div>

        {candidates.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Try a different search term, or clear the filters to see the full pool."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {candidates.map((candidate) => {
              const skills = parseSkills(candidate.skills);
              return (
                <li key={candidate.id}>
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-slate-50 sm:items-center"
                  >
                    <Avatar name={candidate.name} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="truncate text-sm font-medium text-slate-900">
                          {candidate.name}
                        </span>
                        <StageBadge stage={candidate.stage} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {candidate.title ? `${candidate.title} · ` : ""}
                        {candidate.email}
                      </p>
                      {skills.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {skills.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 4 ? (
                            <span className="px-1 py-0.5 text-[11px] text-slate-400">
                              +{skills.length - 4}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="hidden w-44 shrink-0 md:block">
                      <p className="truncate text-xs font-medium text-slate-700">
                        {candidate.job.title}
                      </p>
                      <p className="text-xs text-slate-400">{candidate.source}</p>
                    </div>

                    <div className="hidden w-24 shrink-0 lg:block">
                      <Rating value={candidate.rating} />
                    </div>

                    <div className="hidden w-28 shrink-0 text-right lg:block">
                      <RelativeTime
                        value={candidate.appliedAt}
                        className="block text-xs text-slate-400"
                      />
                      {candidate._count.notes > 0 ? (
                        <p className="text-[11px] text-slate-400">
                          {`${candidate._count.notes} note${
                            candidate._count.notes === 1 ? "" : "s"
                          }`}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {pageCount > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <span className="text-xs text-slate-500">
              Page {page} of {pageCount}
            </span>
            <div className="flex gap-2">
              <PageLink
                href={buildPageHref(linkParams, page - 1)}
                disabled={page <= 1}
                label="Previous"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </PageLink>
              <PageLink
                href={buildPageHref(linkParams, page + 1)}
                disabled={page >= pageCount}
                label="Next"
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </PageLink>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 ring-1 ring-inset ring-slate-100"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      scroll={false}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
