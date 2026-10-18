"use client";

import { useState, useTransition } from "react";
import { moveCandidateStage } from "@/app/actions";
import { STAGES, STAGE_META, type Stage } from "@/lib/stages";
import { cn } from "@/lib/utils";

export function StageControl({
  candidateId,
  stage,
}: {
  candidateId: string;
  stage: string;
}) {
  const [current, setCurrent] = useState(stage);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function move(next: Stage) {
    if (next === current) return;
    const previous = current;
    setCurrent(next);
    setError(null);

    startTransition(async () => {
      const result = await moveCandidateStage({ candidateId, stage: next });
      if (!result.ok) {
        setCurrent(previous);
        setError(result.message ?? "Could not update stage");
      }
    });
  }

  return (
    <div>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Move candidate to stage"
      >
        {STAGES.map((option) => {
          const active = option === current;
          return (
            <button
              key={option}
              type="button"
              onClick={() => move(option)}
              disabled={isPending}
              aria-pressed={active}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors disabled:opacity-60",
                active
                  ? STAGE_META[option].badge
                  : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {STAGE_META[option].label}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
