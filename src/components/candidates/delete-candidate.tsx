"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteCandidate } from "@/app/actions";
import { Button } from "@/components/ui";

export function DeleteCandidate({
  candidateId,
  name,
}: {
  candidateId: string;
  name: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Remove
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Remove {name}?</span>
      <Button
        variant="danger"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteCandidate(candidateId);
            router.push("/candidates");
          })
        }
      >
        {isPending ? "Removing…" : "Confirm"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
