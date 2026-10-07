"use client";

import { useActionState } from "react";
import { createExpense, deleteExpense, type ActionResult } from "@/lib/actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { SubmitButton, DeleteButton, FormError, CollapsibleForm } from "@/components/interactive";

const initial: ActionResult = { ok: true };

export function ExpenseCreatePanel({ members }: { members: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createExpense, initial);
  return (
    <CollapsibleForm buttonLabel="Catat Pengeluaran" title="Tambah Pengeluaran">
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="e-name">Nama Pengeluaran</label>
          <input id="e-name" name="name" className="input" placeholder="Contoh: Sewa villa" required />
        </div>
        <div>
          <label className="label" htmlFor="e-cat">Kategori</label>
          <select id="e-cat" name="category" className="input" defaultValue="Lainnya">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="e-amount">Nominal (Rp)</label>
          <input id="e-amount" name="amount" type="number" min={1} placeholder="250000" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="e-date">Tanggal</label>
          <input id="e-date" name="expenseDate" type="date" defaultValue={toInputDate(new Date())} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="e-paid">Dibayar Oleh</label>
          <select id="e-paid" name="paidByMemberId" className="input" defaultValue="">
            <option value="">Kas kelompok</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="e-notes">Catatan</label>
          <input id="e-notes" name="notes" className="input" placeholder="Opsional" />
        </div>
        <fieldset className="sm:col-span-2 lg:col-span-3">
          <legend className="label">Dibagi ke (kosongkan = semua anggota, dibagi rata)</legend>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <label key={m.id} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 has-checked:border-emerald-600 has-checked:bg-emerald-50 has-checked:text-emerald-800">
                <input type="checkbox" name="shareMemberIds" value={m.id} className="accent-emerald-700" />
                {m.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2 lg:col-span-3">
          <SubmitButton>Simpan Pengeluaran</SubmitButton>
          <div className="mt-2"><FormError error={state.error} /></div>
        </div>
      </form>
    </CollapsibleForm>
  );
}

export function ExpenseDelete({ id }: { id: string }) {
  return <DeleteButton id={id} action={deleteExpense} />;
}
