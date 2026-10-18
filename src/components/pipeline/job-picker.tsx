"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select } from "@/components/ui";

export function JobPicker({
  jobs,
  value,
}: {
  jobs: { id: string; title: string }[];
  value: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Filter pipeline by role"
      value={value}
      disabled={isPending}
      className="w-52"
      onChange={(event) => {
        const next = event.target.value;
        startTransition(() => {
          router.push(next === "ALL" ? "/pipeline" : `/pipeline?jobId=${next}`, {
            scroll: false,
          });
        });
      }}
    >
      <option value="ALL">All roles</option>
      {jobs.map((job) => (
        <option key={job.id} value={job.id}>
          {job.title}
        </option>
      ))}
    </Select>
  );
}
