"use client";

import { useActionState, useState } from "react";
import { createItinerary, updateItinerary, deleteItinerary, type ActionResult } from "@/lib/actions";
import { toInputDate } from "@/lib/format";
import { SubmitButton, DeleteButton, FormError, CollapsibleForm } from "@/components/interactive";

const initial: ActionResult = { ok: true };

export type ItItem = {
  id: string;
  date: Date;
  time: string | null;
  activity: string;
  location: string | null;
  notes: string | null;
};

export function ItineraryCreatePanel({ defaultDate }: { defaultDate: string }) {
  const [state, formAction] = useActionState(createItinerary, initial);
  return (
    <CollapsibleForm buttonLabel="Tambah Kegiatan" title="Tambah Itinerary">
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">Tanggal</label>
          <input name="date" type="date" defaultValue={defaultDate} className="input" required />
        </div>
        <div>
          <label className="label">Jam</label>
          <input name="time" placeholder="06:00" className="input" />
        </div>
        <div>
          <label className="label">Kegiatan</label>
          <input name="activity" placeholder="Contoh: Berenang" className="input" required />
        </div>
        <div>
          <label className="label">Lokasi</label>
          <input name="location" placeholder="Contoh: Pemandian Guci" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Catatan</label>
          <input name="notes" placeholder="Opsional" className="input" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <SubmitButton>Simpan</SubmitButton>
          <div className="mt-2"><FormError error={state.error} /></div>
        </div>
      </form>
    </CollapsibleForm>
  );
}

export function ItineraryRow({ item }: { item: ItItem }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateItinerary, initial);
  return (
    <li className="flex items-start gap-3 py-3">
      <span className="mt-0.5 w-14 shrink-0 rounded-lg bg-emerald-700/10 px-2 py-1 text-center text-xs font-bold text-emerald-800">
        {item.time ?? "-"}
      </span>
      <div className="min-w-0 flex-1">
        {!editing ? (
          <>
            <p className="font-semibold text-zinc-900">{item.activity}</p>
            <p className="text-xs text-zinc-500">
              {[item.location, item.notes].filter(Boolean).join(" • ") || "-"}
            </p>
          </>
        ) : (
          <form action={formAction} className="grid grid-cols-2 gap-2">
            <input type="hidden" name="id" value={item.id} />
            <input name="date" type="date" defaultValue={toInputDate(item.date)} className="input" required />
            <input name="time" defaultValue={item.time ?? ""} placeholder="Jam" className="input" />
            <input name="activity" defaultValue={item.activity} className="input col-span-2" required />
            <input name="location" defaultValue={item.location ?? ""} placeholder="Lokasi" className="input" />
            <input name="notes" defaultValue={item.notes ?? ""} placeholder="Catatan" className="input" />
            <div className="col-span-2 flex items-center gap-2">
              <SubmitButton className="btn btn-primary !px-3 !py-1.5">Simpan</SubmitButton>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary !px-3 !py-1.5">Batal</button>
            </div>
            <div className="col-span-2"><FormError error={state.error} /></div>
          </form>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 items-center gap-3">
          <button type="button" onClick={() => setEditing(true)} className="text-sm font-medium text-emerald-700 hover:underline">
            Edit
          </button>
          <DeleteButton id={item.id} action={deleteItinerary} />
        </div>
      )}
    </li>
  );
}
