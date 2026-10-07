"use client";

import { useActionState } from "react";
import { updateTrip, type ActionResult } from "@/lib/actions";
import { toInputDate } from "@/lib/format";
import { SubmitButton, FormError } from "@/components/interactive";

export type TripData = {
  name: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
};

export function TripEditForm({ trip }: { trip: TripData }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(updateTrip, { ok: true });
  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Nama Trip</label>
        <input name="name" defaultValue={trip.name} className="input" required />
      </div>
      <div>
        <label className="label">Tujuan</label>
        <input name="destination" defaultValue={trip.destination} className="input" required />
      </div>
      <div>
        <label className="label">Tanggal Berangkat</label>
        <input name="startDate" type="date" defaultValue={trip.startDate ? toInputDate(trip.startDate) : ""} className="input" />
      </div>
      <div>
        <label className="label">Tanggal Pulang</label>
        <input name="endDate" type="date" defaultValue={trip.endDate ? toInputDate(trip.endDate) : ""} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Catatan Perjalanan</label>
        <textarea name="notes" defaultValue={trip.notes ?? ""} rows={3} className="input" />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton>Simpan Perubahan</SubmitButton>
        <FormError error={state.error} />
      </div>
    </form>
  );
}
