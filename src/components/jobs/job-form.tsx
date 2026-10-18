"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { createJob, type ActionState } from "@/app/actions";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";

export function JobForm() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({ ok: false });
  const [pending, startTransition] = useTransition();
  const formId = useId();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createJob({ ok: false }, formData);
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
        onClick={() => {
          setState({ ok: false });
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" aria-hidden />
        New role
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
          <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2
                id={`${formId}-heading`}
                className="text-sm font-semibold text-slate-900"
              >
                Open a new role
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={submit} className="px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Title"
                  htmlFor={`${formId}-title-input`}
                  error={errors.title}
                  className="sm:col-span-2"
                >
                  <Input
                    id={`${formId}-title-input`}
                    name="title"
                    placeholder="Senior Frontend Engineer"
                    required
                  />
                </Field>

                <Field
                  label="Department"
                  htmlFor={`${formId}-dept`}
                  error={errors.department}
                >
                  <Input
                    id={`${formId}-dept`}
                    name="department"
                    placeholder="Engineering"
                    required
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
                    placeholder="Bengaluru, IN"
                    required
                  />
                </Field>

                <Field label="Employment type" htmlFor={`${formId}-employment`}>
                  <Select
                    id={`${formId}-employment`}
                    name="employment"
                    defaultValue="Full-time"
                  >
                    {["Full-time", "Contract", "Internship", "Part-time"].map(
                      (type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ),
                    )}
                  </Select>
                </Field>

                <Field label="Status" htmlFor={`${formId}-status`}>
                  <Select id={`${formId}-status`} name="status" defaultValue="OPEN">
                    <option value="OPEN">Open</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="CLOSED">Closed</option>
                  </Select>
                </Field>

                <Field
                  label="Minimum salary"
                  htmlFor={`${formId}-min`}
                  error={errors.minSalary}
                  hint="Annual, in rupees"
                >
                  <Input
                    id={`${formId}-min`}
                    name="minSalary"
                    type="number"
                    min={0}
                    step={50000}
                    placeholder="2400000"
                  />
                </Field>

                <Field
                  label="Maximum salary"
                  htmlFor={`${formId}-max`}
                  error={errors.maxSalary}
                >
                  <Input
                    id={`${formId}-max`}
                    name="maxSalary"
                    type="number"
                    min={0}
                    step={50000}
                    placeholder="3600000"
                  />
                </Field>

                <Field
                  label="Description"
                  htmlFor={`${formId}-description`}
                  error={errors.description}
                  className="sm:col-span-2"
                >
                  <Textarea
                    id={`${formId}-description`}
                    name="description"
                    rows={3}
                    placeholder="What this person will own in their first six months…"
                  />
                </Field>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
