import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Link2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { getCandidate } from "@/lib/data/candidates";
import { prisma } from "@/lib/prisma";
import { parseSkills } from "@/lib/utils";
import { stageLabel } from "@/lib/stages";
import {
  Avatar,
  Card,
  CardHeader,
  EmptyState,
  Rating,
  StageBadge,
} from "@/components/ui";
import { RelativeTime } from "@/components/relative-time";
import { StageControl } from "@/components/candidates/stage-control";
import { NoteForm } from "@/components/candidates/note-form";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { DeleteCandidate } from "@/components/candidates/delete-candidate";

export const dynamic = "force-dynamic";

function DetailRow({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
      <span className="truncate">{children}</span>
    </div>
  );
}

export default async function CandidateDetailPage({
  params,
}: PageProps<"/candidates/[id]">) {
  const { id } = await params;
  const [candidate, jobs] = await Promise.all([
    getCandidate(id),
    prisma.job.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);

  if (!candidate) notFound();

  const skills = parseSkills(candidate.skills);
  const daysInPipeline = Math.round(
    ((candidate.closedAt ?? new Date()).getTime() - candidate.appliedAt.getTime()) /
      86_400_000,
  );

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/candidates"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to candidates
      </Link>

      <Card className="mb-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar name={candidate.name} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                {candidate.name}
              </h1>
              <StageBadge stage={candidate.stage} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {candidate.title ?? "No current title on file"}
            </p>

            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              <DetailRow icon={Mail}>
                <a href={`mailto:${candidate.email}`} className="hover:underline">
                  {candidate.email}
                </a>
              </DetailRow>
              {candidate.phone ? (
                <DetailRow icon={Phone}>{candidate.phone}</DetailRow>
              ) : null}
              {candidate.location ? (
                <DetailRow icon={MapPin}>{candidate.location}</DetailRow>
              ) : null}
              {candidate.linkedinUrl ? (
                <DetailRow icon={Link2}>
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    LinkedIn profile
                  </a>
                </DetailRow>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <Rating value={candidate.rating} />
            <div className="flex flex-wrap gap-2">
              {candidate.resumeUrl ? (
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                >
                  Resume
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
              <CandidateForm
                jobs={jobs}
                title="Edit candidate"
                submitLabel="Save changes"
                trigger={{ label: "Edit", variant: "secondary" }}
                initial={{
                  id: candidate.id,
                  name: candidate.name,
                  email: candidate.email,
                  phone: candidate.phone,
                  location: candidate.location,
                  title: candidate.title,
                  skills: candidate.skills,
                  source: candidate.source,
                  stage: candidate.stage,
                  rating: candidate.rating,
                  jobId: candidate.jobId,
                  linkedinUrl: candidate.linkedinUrl,
                  resumeUrl: candidate.resumeUrl,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Hiring stage"
              description="Changing the stage writes an entry to the timeline."
            />
            <div className="px-5 py-4">
              <StageControl candidateId={candidate.id} stage={candidate.stage} />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Notes"
              description={`${candidate.notes.length} note${
                candidate.notes.length === 1 ? "" : "s"
              } from the hiring team`}
            />
            <div className="border-b border-slate-100 px-5 py-4">
              <NoteForm candidateId={candidate.id} />
            </div>
            {candidate.notes.length === 0 ? (
              <EmptyState
                title="No notes yet"
                description="Capture screening feedback so the rest of the panel has context."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {candidate.notes.map((note) => (
                  <li key={note.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-900">
                        {note.author}
                      </span>
                      <RelativeTime
                        value={note.createdAt}
                        className="text-xs text-slate-400"
                      />
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{note.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Application" />
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Role</dt>
                <dd className="truncate text-right font-medium text-slate-900">
                  {candidate.job.title}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium text-slate-900">
                  {candidate.job.department}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Source</dt>
                <dd className="font-medium text-slate-900">{candidate.source}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">Applied</dt>
                <dd className="font-medium text-slate-900">
                  {format(candidate.appliedAt, "d MMM yyyy")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 px-5 py-3">
                <dt className="text-slate-500">
                  {candidate.closedAt ? "Days to close" : "Days in pipeline"}
                </dt>
                <dd className="font-medium text-slate-900">{daysInPipeline}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Skills" />
            <div className="px-5 py-4">
              {skills.length === 0 ? (
                <p className="text-xs text-slate-400">No skills recorded.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Timeline"
              description="Newest first"
            />
            <ol className="px-5 py-4">
              {candidate.events.map((event, index) => (
                <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < candidate.events.length - 1 ? (
                    <span
                      className="absolute left-[3px] top-3 h-full w-px bg-slate-200"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full bg-slate-300" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900">
                      {event.fromStage
                        ? `${stageLabel(event.fromStage)} → ${stageLabel(event.toStage)}`
                        : `Entered as ${stageLabel(event.toStage).toLowerCase()}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {format(event.createdAt, "d MMM yyyy, h:mm a")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="flex justify-end">
            <DeleteCandidate candidateId={candidate.id} name={candidate.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
