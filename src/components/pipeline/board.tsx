"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { moveCandidateStage } from "@/app/actions";
import { STAGES, STAGE_META, isStage, type Stage } from "@/lib/stages";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";

export type BoardCandidate = {
  id: string;
  name: string;
  stage: string;
  rating: number;
  title: string | null;
  job: { id: string; title: string };
};

type Columns = Record<Stage, BoardCandidate[]>;

/**
 * Arrow keys jump a whole column instead of dnd-kit's default 25px nudge, which
 * would never clear a column boundary.
 */
const columnCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates, context },
) => {
  const direction =
    event.code === "ArrowRight" ? 1 : event.code === "ArrowLeft" ? -1 : 0;
  if (!direction) return;

  const { droppableRects, collisionRect } = context;
  if (!collisionRect) return;
  event.preventDefault();

  const centerX = collisionRect.left + collisionRect.width / 2;
  const currentIndex = STAGES.findIndex((stage) => {
    const rect = droppableRects.get(stage);
    return rect ? centerX >= rect.left && centerX <= rect.left + rect.width : false;
  });

  const target = STAGES[(currentIndex === -1 ? 0 : currentIndex) + direction];
  const targetRect = target ? droppableRects.get(target) : undefined;
  if (!targetRect) return;

  return {
    x: targetRect.left + (targetRect.width - collisionRect.width) / 2,
    y: currentCoordinates.y,
  };
};

function CandidateCard({
  candidate,
  dragging,
}: {
  candidate: BoardCandidate;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-sm",
        dragging && "rotate-1 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2">
        <Avatar name={candidate.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">
            {candidate.name}
          </p>
          <p className="truncate text-xs text-slate-500">{candidate.job.title}</p>
        </div>
        <GripVertical className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
      </div>
      {candidate.rating > 0 ? (
        <p className="mt-2 text-[11px] text-amber-600">
          {"★".repeat(candidate.rating)}
          <span className="text-slate-300">{"★".repeat(5 - candidate.rating)}</span>
        </p>
      ) : null}
    </div>
  );
}

function DraggableCard({ candidate }: { candidate: BoardCandidate }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: candidate.id,
    data: { stage: candidate.stage },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab touch-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      aria-label={`${candidate.name}, ${candidate.stage.toLowerCase()}. Press space to pick up.`}
    >
      <CandidateCard candidate={candidate} />
      <Link
        href={`/candidates/${candidate.id}`}
        className="sr-only focus:not-sr-only focus:block focus:py-1 focus:text-xs focus:underline"
      >
        Open {candidate.name}
      </Link>
    </div>
  );
}

function Column({
  stage,
  candidates,
}: {
  stage: Stage;
  candidates: BoardCandidate[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = STAGE_META[stage];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-slate-100/70">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
          <span className="text-xs font-semibold text-slate-700">{meta.label}</span>
        </div>
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
          {candidates.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "thin-scroll flex max-h-[calc(100vh-15rem)] min-h-28 flex-1 flex-col gap-2 overflow-y-auto rounded-lg px-2 pb-3 transition-colors",
          isOver && "bg-slate-200/80 ring-2 ring-inset ring-slate-300",
        )}
      >
        {candidates.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">
            Drop candidates here
          </p>
        ) : (
          candidates.map((candidate) => (
            <DraggableCard key={candidate.id} candidate={candidate} />
          ))
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ columns }: { columns: Columns }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  // Move the card immediately, then let the server action confirm.
  const [optimisticColumns, applyOptimisticMove] = useOptimistic(
    columns,
    (current: Columns, move: { candidateId: string; to: Stage }) => {
      const next = Object.fromEntries(
        STAGES.map((stage) => [stage, [...current[stage]]]),
      ) as Columns;

      for (const stage of STAGES) {
        const index = next[stage].findIndex((c) => c.id === move.candidateId);
        if (index === -1) continue;
        const [card] = next[stage].splice(index, 1);
        next[move.to].unshift({ ...card, stage: move.to });
        break;
      }

      return next;
    },
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnCoordinateGetter }),
  );

  const activeCandidate = activeId
    ? STAGES.flatMap((stage) => optimisticColumns[stage]).find(
        (candidate) => candidate.id === activeId,
      )
    : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const target = String(over.id);
    if (!isStage(target)) return;

    const from = String(active.data.current?.stage ?? "");
    if (from === target) return;

    const candidateId = String(active.id);
    const name =
      STAGES.flatMap((stage) => optimisticColumns[stage]).find(
        (candidate) => candidate.id === candidateId,
      )?.name ?? "Candidate";

    startTransition(async () => {
      applyOptimisticMove({ candidateId, to: target });
      const result = await moveCandidateStage({ candidateId, stage: target });
      setToast(
        result.ok
          ? `${name} moved to ${STAGE_META[target].label}`
          : result.message ?? "Could not move candidate",
      );
      setTimeout(() => setToast(null), 2600);
    });
  }

  return (
    <>
      <DndContext
        // Pins dnd-kit's generated ARIA ids so SSR and hydration agree.
        id="pipeline-board"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="thin-scroll flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              candidates={optimisticColumns[stage]}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCandidate ? (
            <div className="w-72">
              <CandidateCard candidate={activeCandidate} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div aria-live="polite" className="sr-only">
        {toast}
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </>
  );
}
