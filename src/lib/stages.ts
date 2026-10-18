export const STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

export type Stage = (typeof STAGES)[number];

/** Stages a candidate passes through on the way to a hire, in order. */
export const PIPELINE_STAGES: Stage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
];

/** Stages that end a candidate's journey. */
export const TERMINAL_STAGES: Stage[] = ["HIRED", "REJECTED"];

type StageMeta = {
  label: string;
  /** Tailwind classes for badges and column accents. */
  badge: string;
  dot: string;
  bar: string;
  hex: string;
};

export const STAGE_META: Record<Stage, StageMeta> = {
  APPLIED: {
    label: "Applied",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
    hex: "#94a3b8",
  },
  SCREENING: {
    label: "Screening",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
    bar: "bg-sky-500",
    hex: "#0ea5e9",
  },
  INTERVIEW: {
    label: "Interview",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
    hex: "#8b5cf6",
  },
  OFFER: {
    label: "Offer",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    hex: "#f59e0b",
  },
  HIRED: {
    label: "Hired",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    hex: "#10b981",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    hex: "#f43f5e",
  },
};

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}

export function stageLabel(stage: string) {
  return isStage(stage) ? STAGE_META[stage].label : stage;
}
