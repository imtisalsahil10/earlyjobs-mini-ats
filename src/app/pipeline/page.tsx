import { getFilterOptions, getPipeline } from "@/lib/data/candidates";
import { STAGES } from "@/lib/stages";
import { PageHeader } from "@/components/page-header";
import { PipelineBoard, type BoardCandidate } from "@/components/pipeline/board";
import { JobPicker } from "@/components/pipeline/job-picker";
import { CandidateForm } from "@/components/candidates/candidate-form";

export const dynamic = "force-dynamic";

export default async function PipelinePage({ searchParams }: PageProps<"/pipeline">) {
  const resolved = await searchParams;
  const jobId = typeof resolved.jobId === "string" ? resolved.jobId : "ALL";

  const [pipeline, { jobs }] = await Promise.all([
    getPipeline(jobId),
    getFilterOptions(),
  ]);

  // Trim the server payload down to what the board actually renders.
  const columns = Object.fromEntries(
    STAGES.map((stage) => [
      stage,
      pipeline[stage].map<BoardCandidate>((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        stage: candidate.stage,
        rating: candidate.rating,
        title: candidate.title,
        job: candidate.job,
      })),
    ]),
  ) as Record<(typeof STAGES)[number], BoardCandidate[]>;

  const total = STAGES.reduce((sum, stage) => sum + columns[stage].length, 0);

  return (
    <div className="mx-auto max-w-[110rem]">
      <PageHeader
        title="Pipeline"
        description="Drag a candidate between columns to change their stage. Every move is logged."
        action={
          <div className="flex items-center gap-2">
            <JobPicker jobs={jobs} value={jobId} />
            <CandidateForm
              jobs={jobs}
              title="Add a candidate"
              submitLabel="Add candidate"
              trigger={{ label: "Add" }}
            />
          </div>
        }
      />

      <p className="mb-3 text-xs text-slate-500">
        {`${total} candidate${total === 1 ? "" : "s"} on this board`}
      </p>

      <PipelineBoard columns={columns} />
    </div>
  );
}
