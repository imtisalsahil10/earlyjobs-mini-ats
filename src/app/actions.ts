"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TERMINAL_STAGES, isStage, type Stage } from "@/lib/stages";
import {
  candidateInputSchema,
  fieldErrors,
  jobInputSchema,
  noteInputSchema,
  stageChangeSchema,
} from "@/lib/validation";

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function refreshViews(candidateId?: string) {
  revalidatePath("/");
  revalidatePath("/candidates");
  revalidatePath("/pipeline");
  revalidatePath("/jobs");
  if (candidateId) revalidatePath(`/candidates/${candidateId}`);
}

function readForm(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, value.toString()]),
  );
}

export async function createCandidate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = candidateInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;

  const duplicate = await prisma.candidate.findFirst({
    where: { email: data.email, jobId: data.jobId },
    select: { id: true },
  });
  if (duplicate) {
    return {
      ok: false,
      errors: { email: "This candidate has already applied to that role" },
    };
  }

  const candidate = await prisma.candidate.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      location: data.location || null,
      title: data.title || null,
      skills: data.skills || "",
      source: data.source,
      stage: data.stage,
      rating: data.rating,
      jobId: data.jobId,
      linkedinUrl: data.linkedinUrl || null,
      resumeUrl: data.resumeUrl || null,
      avatarSeed: data.name.replace(/\s+/g, ""),
      closedAt: TERMINAL_STAGES.includes(data.stage) ? new Date() : null,
      events: { create: { fromStage: null, toStage: data.stage } },
    },
  });

  refreshViews(candidate.id);
  return { ok: true, message: `${data.name} added to the pipeline` };
}

export async function updateCandidate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id")?.toString();
  if (!id) return { ok: false, message: "Missing candidate id" };

  const parsed = candidateInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const existing = await prisma.candidate.findUnique({
    where: { id },
    select: { stage: true },
  });
  if (!existing) return { ok: false, message: "Candidate not found" };

  const data = parsed.data;
  const stageChanged = existing.stage !== data.stage;

  await prisma.candidate.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      location: data.location || null,
      title: data.title || null,
      skills: data.skills || "",
      source: data.source,
      stage: data.stage,
      rating: data.rating,
      jobId: data.jobId,
      linkedinUrl: data.linkedinUrl || null,
      resumeUrl: data.resumeUrl || null,
      ...(stageChanged
        ? {
            closedAt: TERMINAL_STAGES.includes(data.stage) ? new Date() : null,
            events: { create: { fromStage: existing.stage, toStage: data.stage } },
          }
        : {}),
    },
  });

  refreshViews(id);
  return { ok: true, message: "Candidate updated" };
}

export async function moveCandidateStage(input: {
  candidateId: string;
  stage: Stage;
}): Promise<ActionState> {
  const parsed = stageChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid stage change" };

  const { candidateId, stage } = parsed.data;
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    select: { stage: true, name: true },
  });
  if (!candidate) return { ok: false, message: "Candidate not found" };
  if (candidate.stage === stage) return { ok: true };

  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      stage,
      closedAt: TERMINAL_STAGES.includes(stage) ? new Date() : null,
      events: { create: { fromStage: candidate.stage, toStage: stage } },
    },
  });

  refreshViews(candidateId);
  return { ok: true, message: `${candidate.name} moved to ${stage.toLowerCase()}` };
}

export async function addNote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = noteInputSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const { candidateId, body, author } = parsed.data;
  await prisma.note.create({
    data: { candidateId, body, author: author || "Recruiter" },
  });

  refreshViews(candidateId);
  return { ok: true, message: "Note added" };
}

export async function deleteCandidate(candidateId: string): Promise<ActionState> {
  if (!candidateId) return { ok: false, message: "Missing candidate id" };
  await prisma.candidate.delete({ where: { id: candidateId } });
  refreshViews();
  return { ok: true, message: "Candidate removed" };
}

export async function createJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = readForm(formData);
  const parsed = jobInputSchema.safeParse({
    ...raw,
    minSalary: raw.minSalary ? Number(raw.minSalary) : null,
    maxSalary: raw.maxSalary ? Number(raw.maxSalary) : null,
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const data = parsed.data;
  if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
    return { ok: false, errors: { maxSalary: "Maximum must be above the minimum" } };
  }

  await prisma.job.create({
    data: {
      title: data.title,
      department: data.department,
      location: data.location,
      employment: data.employment,
      status: data.status,
      description: data.description || null,
      minSalary: data.minSalary ?? null,
      maxSalary: data.maxSalary ?? null,
    },
  });

  refreshViews();
  return { ok: true, message: `${data.title} created` };
}

export async function setJobStatus(
  jobId: string,
  status: "OPEN" | "ON_HOLD" | "CLOSED",
): Promise<ActionState> {
  await prisma.job.update({ where: { id: jobId }, data: { status } });
  refreshViews();
  return { ok: true, message: "Role updated" };
}

/** Used by the pipeline board to validate drops client-side before calling. */
export async function assertStage(stage: string) {
  return isStage(stage);
}
