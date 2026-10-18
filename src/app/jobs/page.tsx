import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { listJobs } from "@/lib/data/jobs";
import { PIPELINE_STAGES, STAGE_META, stageLabel } from "@/lib/stages";
import { formatSalary, cn } from "@/lib/utils";
import { Card, EmptyState, JobStatusBadge } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { JobForm } from "@/components/jobs/job-form";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Roles"
        description="Open requisitions and how their pipelines are tracking."
        action={<JobForm />}
      />

      {jobs.length === 0 ? (
        <Card>
          <EmptyState
            title="No roles yet"
            description="Create a role before adding candidates to the pipeline."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">
                    {job.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {job.department} · {job.location}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </div>

              {job.description ? (
                <p className="mt-3 line-clamp-2 text-xs text-slate-500">
                  {job.description}
                </p>
              ) : null}

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <dt className="text-[11px] text-slate-500">Total</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {job.totalCount}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <dt className="text-[11px] text-slate-500">Active</dt>
                  <dd className="text-sm font-semibold text-slate-900">
                    {job.activeCount}
                  </dd>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-2">
                  <dt className="text-[11px] text-slate-500">Hired</dt>
                  <dd className="text-sm font-semibold text-emerald-600">
                    {job.hiredCount}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-medium text-slate-500">
                  Pipeline spread
                </p>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  {PIPELINE_STAGES.map((stage) => {
                    const count = job.byStage[stage];
                    if (count === 0 || job.totalCount === 0) return null;
                    return (
                      <div
                        key={stage}
                        className={cn("h-full", STAGE_META[stage].bar)}
                        style={{ width: `${(count / job.totalCount) * 100}%` }}
                        title={`${stageLabel(stage)}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-500">
                    {formatSalary(job.minSalary, job.maxSalary)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Opened {format(job.createdAt, "d MMM yyyy")}
                  </p>
                </div>
                <Link
                  href={`/pipeline?jobId=${job.id}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  Pipeline
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
