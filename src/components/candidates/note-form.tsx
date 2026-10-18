"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addNote, type ActionState } from "@/app/actions";
import { Button, Textarea } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Add note"}
    </Button>
  );
}

export function NoteForm({ candidateId }: { candidateId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(addNote, {
    ok: false,
  });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="candidateId" value={candidateId} />
      <input type="hidden" name="author" value="Priya Nair" />
      <Textarea
        name="body"
        rows={3}
        required
        placeholder="Add interview feedback, a screening summary, or a next step…"
        aria-label="Note"
      />
      {state.errors?.body ? (
        <p className="text-xs text-rose-600">{state.errors.body}</p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
