"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createCandidate, updateCandidate, type ActionState } from "@/app/actions";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { STAGES, stageLabel } from "@/lib/stages";

const SOURCES = [
  "Careers Page",
  "LinkedIn",
  "Referral",
  "Naukri",
  "Agency",
  "Campus Drive",
  "Other",
];

export type CandidateFormValues = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  title?: string | null;
  skills?: string;
  source?: string;
  stage?: string;
  rating?: number;
  jobId?: string;
  linkedinUrl?: string | null;
  resumeUrl?: string | null;
};

export function CandidateForm({
  jobs,
  initial,
  trigger,
  title,
  submitLabel,
}: {
  jobs: { id: string; title: string }[];
  initial?: CandidateFormValues;
  trigger?: { label: string; variant?: "primary" | "secondary" };
  title: string;
  submitLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({ ok: false });
  const [pending, startTransition] = useTransition();

  const isEdit = Boolean(initial?.id);
  const action = isEdit ? updateCandidate : createCandidate;

  const formId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action({ ok: false }, formData);
      if (result.ok) {
        setState({ ok: false });
        setOpen(false);
      } else {
        setState(result);
      }
    });
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const errors = state.errors ?? {};

  return (
    <>
      <Button
        variant={trigger?.variant ?? "primary"}
        size={trigger ? "md" : "sm"}
        onClick={() => {
          setState({ ok: false });
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" aria-hidden />
        {trigger?.label ?? "Add candidate"}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-heading`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2
                id={`${formId}-heading`}
                className="text-sm font-semibold text-slate-900"
              >
                {title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={submit} className="px-5 py-5">
              {initial?.id ? (
                <input type="hidden" name="id" value={initial.id} />
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  htmlFor={`${formId}-name`}
                  error={errors.name}
                >
                  <Input
                    id={`${formId}-name`}
                    name="name"
                    defaultValue={initial?.name ?? ""}
                    placeholder="Ananya Sharma"
                    required
                  />
                </Field>

                <Field label="Email" htmlFor={`${formId}-email`} error={errors.email}>
                  <Input
                    id={`${formId}-email`}
                    name="email"
                    type="email"
                    defaultValue={initial?.email ?? ""}
                    placeholder="ananya@example.com"
                    required
                  />
                </Field>

                <Field label="Phone" htmlFor={`${formId}-phone`} error={errors.phone}>
                  <Input
                    id={`${formId}-phone`}
                    name="phone"
                    defaultValue={initial?.phone ?? ""}
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <Field
                  label="Location"
                  htmlFor={`${formId}-location`}
                  error={errors.location}
                >
                  <Input
                    id={`${formId}-location`}
                    name="location"
                    defaultValue={initial?.location ?? ""}
                    placeholder="Bengaluru, IN"
                  />
                </Field>

                <Field
                  label="Current title"
                  htmlFor={`${formId}-title`}
                  error={errors.title}
                >
                  <Input
                    id={`${formId}-title`}
                    name="title"
                    defaultValue={initial?.title ?? ""}
                    placeholder="Senior Software Engineer"
                  />
                </Field>

                <Field label="Applying for" htmlFor={`${formId}-job`} error={errors.jobId}>
                  <Select
                    id={`${formId}-job`}
                    name="jobId"
                    defaultValue={initial?.jobId ?? jobs[0]?.id ?? ""}
                    required
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Stage" htmlFor={`${formId}-stage`} error={errors.stage}>
                  <Select
                    id={`${formId}-stage`}
                    name="stage"
                    defaultValue={initial?.stage ?? "APPLIED"}
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stageLabel(stage)}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Source" htmlFor={`${formId}-source`} error={errors.source}>
                  <Select
                    id={`${formId}-source`}
                    name="source"
                    defaultValue={initial?.source ?? "Careers Page"}
                  >
                    {SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Rating"
                  htmlFor={`${formId}-rating`}
                  error={errors.rating}
                  hint="0 = not yet rated"
                >
                  <Select
                    id={`${formId}-rating`}
                    name="rating"
                    defaultValue={String(initial?.rating ?? 0)}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? "Not rated" : `${value} / 5`}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="LinkedIn URL"
                  htmlFor={`${formId}-linkedin`}
                  error={errors.linkedinUrl}
                >
                  <Input
                    id={`${formId}-linkedin`}
                    name="linkedinUrl"
                    defaultValue={initial?.linkedinUrl ?? ""}
                    placeholder="https://linkedin.com/in/…"
                  />
                </Field>

                <Field
                  label="Resume URL"
                  htmlFor={`${formId}-resume`}
                  error={errors.resumeUrl}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`${formId}-resume`}
                    name="resumeUrl"
                    defaultValue={initial?.resumeUrl ?? ""}
                    placeholder="https://…/resume.pdf"
                  />
                </Field>

                <Field
                  label="Skills"
                  htmlFor={`${formId}-skills`}
                  error={errors.skills}
                  hint="Comma separated — these are searchable"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id={`${formId}-skills`}
                    name="skills"
                    rows={2}
                    defaultValue={initial?.skills ?? ""}
                    placeholder="TypeScript, React, PostgreSQL"
                  />
                </Field>
              </div>

              {state.message && !state.ok ? (
                <p className="mt-4 text-xs text-rose-600">{state.message}</p>
              ) : null}

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
