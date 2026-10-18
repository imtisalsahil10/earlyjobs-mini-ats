import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { getDashboardMetrics, deltaPercent } from "@/lib/data/metrics";
import { PIPELINE_STAGES, STAGES, STAGE_META, stageLabel } from "@/lib/stages";
import { Avatar, Card, CardHeader, EmptyState, StageBadge } from "@/components/ui";
import { PageHeader } from "@/components/page-header";
import { RelativeTime } from "@/components/relative-time";
import {
  ApplicationsTrendChart,
  StageDistributionChart,
} from "@/components/dashboard/charts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sublabel,
  delta,
}: {
  label: string;
  value: string;
  sublabel?: string;
  delta?: number | null;
}) {
  const hasDelta =
    typeof delta === "number" && Number.isFinite(delta) && Math.abs(delta) >= 0.5;
  const positive = hasDelta && delta > 0;

  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </span>
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3 w-3" aria-hidden />
            )}
            {Math.abs(delta).toFixed(0)}%
          </span>
        ) : null}
      </div>
      {sublabel ? (
        <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
      ) : null}
    </Card>
  );
}

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const { totals, byStage, funnel, sources, trend, recentEvents } = metrics;

  const topSourceCount = sources[0]?.count ?? 0;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Hiring dashboard"
        description="Funnel health, pipeline velocity, and where candidates are coming from."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active candidates"
          value={String(totals.activeCandidates)}
          sublabel={`${totals.totalCandidates} total in the system`}
        />
        <StatCard
          label="Applications (30d)"
          value={String(totals.appliedLast30)}
          delta={deltaPercent(totals.appliedLast30, totals.appliedPrev30)}
          sublabel="vs. previous 30 days"
        />
        <StatCard
          label="Hires (30d)"
          value={String(totals.hiresLast30)}
          delta={deltaPercent(totals.hiresLast30, totals.hiresPrev30)}
          sublabel={`${totals.openRoles} of ${totals.totalRoles} roles open`}
        />
        <StatCard
          label="Avg. time to hire"
          value={
            totals.avgTimeToHire > 0 ? `${totals.avgTimeToHire.toFixed(0)} days` : "—"
          }
          sublabel="Application to offer accepted"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Hiring funnel"
            description="How many candidates have ever reached each stage, and stage-to-stage conversion."
          />
          <div className="space-y-4 px-5 py-5">
            {funnel.map((step, index) => (
              <div key={step.stage}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-700">
                    {stageLabel(step.stage)}
                  </span>
                  <span className="flex items-center gap-2 text-slate-500">
                    <span className="font-medium text-slate-900">{step.reached}</span>
                    {index > 0 ? (
                      <span className="tabular-nums">
                        {(step.conversion * 100).toFixed(0)}% from{" "}
                        {stageLabel(PIPELINE_STAGES[index - 1]).toLowerCase()}
                      </span>
                    ) : (
                      <span>top of funnel</span>
                    )}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", STAGE_META[step.stage].bar)}
                    style={{ width: `${Math.max(step.shareOfTop * 100, 1.5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
            <div className="bg-white px-5 py-3">
              <p className="text-xs text-slate-500">Offer acceptance</p>
              <p className="text-sm font-semibold text-slate-900">
                {(totals.offerAcceptanceRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-white px-5 py-3">
              <p className="text-xs text-slate-500">Applicant → hire</p>
              <p className="text-sm font-semibold text-slate-900">
                {(totals.applicantsToHire * 100).toFixed(1)}%
              </p>
            </div>
            <div className="col-span-2 bg-white px-5 py-3 sm:col-span-1">
              <p className="text-xs text-slate-500">Offers extended</p>
              <p className="text-sm font-semibold text-slate-900">
                {totals.offersMade}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Candidates by stage"
            description="Where everyone sits right now."
          />
          <StageDistributionChart
            data={STAGES.map((stage) => ({ stage, count: byStage[stage] }))}
          />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Applications over time"
            description="Trailing eight weeks, W8 is the current week."
          />
          <ApplicationsTrendChart data={trend} />
        </Card>

        <Card>
          <CardHeader title="Top sources" description="Where candidates come from." />
          <div className="space-y-3 px-5 py-5">
            {sources.length === 0 ? (
              <EmptyState title="No candidates yet" />
            ) : (
              sources.map((source) => (
                <div key={source.source}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{source.source}</span>
                    <span className="font-medium text-slate-900">{source.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{
                        width: `${
                          topSourceCount > 0
                            ? (source.count / topSourceCount) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Recent pipeline activity"
          description="Every stage change is recorded as an audit event."
          action={
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Open pipeline
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          }
        />
        {recentEvents.length === 0 ? (
          <EmptyState title="No activity yet" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentEvents.map((event) => (
              <li key={event.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={event.candidate.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-900">
                    <Link
                      href={`/candidates/${event.candidate.id}`}
                      className="font-medium hover:underline"
                    >
                      {event.candidate.name}
                    </Link>{" "}
                    <span className="text-slate-500">
                      {event.fromStage
                        ? `moved from ${stageLabel(event.fromStage).toLowerCase()}`
                        : "entered the pipeline"}
                    </span>
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {event.candidate.job.title}
                  </p>
                </div>
                <StageBadge stage={event.toStage} />
                <RelativeTime
                  value={event.createdAt}
                  className="hidden w-28 shrink-0 text-right text-xs text-slate-400 sm:block"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
