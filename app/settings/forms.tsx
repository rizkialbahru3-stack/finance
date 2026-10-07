"use client";

import { useActionState } from "react";
import { updateTargetAll, type ActionResult } from "@/lib/actions";
import { SubmitButton, FormError } from "@/components/interactive";

export function TargetForm({ current }: { current: number }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(updateTargetAll, { ok: true });
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label" htmlFor="s-target">Target iuran per anggota (Rp)</label>
        <input id="s-target" name="targetContribution" type="number" min={1} defaultValue={current} className="input sm:w-64" required />
      </div>
      <SubmitButton>Simpan Target</SubmitButton>
      <div className="basis-full"><FormError error={state.error} /></div>
      <p className="text-xs text-zinc-500">Mengubah target akan memperbarui dashboard dan status semua anggota secara otomatis.</p>
    </form>
  );
}
