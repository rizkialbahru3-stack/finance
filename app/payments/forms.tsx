"use client";

import { useActionState } from "react";
import { createPayment, deletePayment, type ActionResult } from "@/lib/actions";
import { PAYMENT_METHODS } from "@/lib/constants";
import { toInputDate } from "@/lib/format";
import { SubmitButton, DeleteButton, FormError, CollapsibleForm } from "@/components/interactive";

const initial: ActionResult = { ok: true };

export function PaymentCreatePanel({ members }: { members: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createPayment, initial);
  return (
    <CollapsibleForm buttonLabel="Catat Pembayaran" title="Tambah Pembayaran / Iuran">
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="p-member">Anggota</label>
          <select id="p-member" name="memberId" className="input" required defaultValue="">
            <option value="" disabled>Pilih anggota</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="p-amount">Nominal (Rp)</label>
          <input id="p-amount" name="amount" type="number" min={1} placeholder="200000" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="p-date">Tanggal Pembayaran</label>
          <input id="p-date" name="paymentDate" type="date" defaultValue={toInputDate(new Date())} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="p-method">Metode</label>
          <select id="p-method" name="method" className="input" defaultValue="Transfer">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="p-notes">Catatan</label>
          <input id="p-notes" name="notes" className="input" placeholder="Contoh: iuran tahap 1" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <SubmitButton>Simpan Pembayaran</SubmitButton>
          <div className="mt-2"><FormError error={state.error} /></div>
        </div>
      </form>
    </CollapsibleForm>
  );
}

export function PaymentDelete({ id }: { id: string }) {
  return <DeleteButton id={id} action={deletePayment} />;
}
