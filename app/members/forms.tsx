"use client";

import { useActionState, useState } from "react";
import { createMember, updateMember, deleteMember, type ActionResult } from "@/lib/actions";
import { SubmitButton, DeleteButton, FormError, CollapsibleForm } from "@/components/interactive";

const initial: ActionResult = { ok: true };

export function MemberCreatePanel({ defaultTarget }: { defaultTarget: number }) {
  const [state, formAction] = useActionState(createMember, initial);
  return (
    <CollapsibleForm buttonLabel="Tambah Anggota" title="Tambah Anggota Baru">
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="m-name">Nama</label>
          <input id="m-name" name="name" className="input" placeholder="Nama anggota" required />
        </div>
        <div>
          <label className="label" htmlFor="m-target">Target Iuran (Rp)</label>
          <input id="m-target" name="targetContribution" type="number" min={1} defaultValue={defaultTarget} className="input" required />
        </div>
        <div className="flex items-end gap-2">
          <SubmitButton>Simpan</SubmitButton>
        </div>
        <div className="sm:col-span-3">
          <FormError error={state.error} />
          {state.ok && !state.error && null}
        </div>
      </form>
    </CollapsibleForm>
  );
}

export function MemberEditInline({ id, name, target }: { id: string; name: string; target: number }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateMember, initial);
  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-emerald-700 hover:underline">
          Edit
        </button>
        <DeleteButton id={id} action={deleteMember} />
      </div>
    );
  }
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <input name="name" defaultValue={name} className="input !w-32" required aria-label="Nama" />
      <input name="targetContribution" type="number" min={1} defaultValue={target} className="input !w-32" required aria-label="Target iuran" />
      <SubmitButton className="btn btn-primary !px-3 !py-1.5">Simpan</SubmitButton>
      <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary !px-3 !py-1.5">
        Batal
      </button>
      <FormError error={state.error} />
    </form>
  );
}
