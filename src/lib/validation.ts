import { z } from "zod";
import { STAGES } from "./stages";

export const candidateInputSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  skills: z.string().trim().max(400).optional().or(z.literal("")),
  source: z.string().trim().min(1, "Pick a source"),
  stage: z.enum(STAGES),
  rating: z.coerce.number().int().min(0).max(5),
  jobId: z.string().trim().min(1, "Pick a role"),
  linkedinUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  resumeUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CandidateInput = z.infer<typeof candidateInputSchema>;

export const stageChangeSchema = z.object({
  candidateId: z.string().min(1),
  stage: z.enum(STAGES),
});

export const noteInputSchema = z.object({
  candidateId: z.string().min(1),
  body: z.string().trim().min(1, "Note cannot be empty").max(2000),
  author: z.string().trim().max(80).optional().or(z.literal("")),
});

export const jobInputSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters"),
  department: z.string().trim().min(1, "Department is required"),
  location: z.string().trim().min(1, "Location is required"),
  employment: z.string().trim().min(1),
  status: z.enum(["OPEN", "ON_HOLD", "CLOSED"]),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  minSalary: z.coerce.number().int().min(0).optional().nullable(),
  maxSalary: z.coerce.number().int().min(0).optional().nullable(),
});

/** Flattens Zod issues into a `{ field: message }` map for form rendering. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
