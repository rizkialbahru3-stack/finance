"use client";

import { useActionState } from "react";
import { saveBudgets, type ActionResult } from "@/lib/actions";
import { SubmitButton, FormError } from "@/components/interactive";

export function BudgetForm({ budgets }: { budgets: { category: string; plannedAmount: number }[] }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(saveBudgets, { ok: true });
  return (
    <form action={formAction}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {budgets.map((b) => (
          <div key={b.category}>
            <input type="hidden" name="category" value={b.category} />
            <label className="label">{b.category}</label>
            <input name="plannedAmount" type="number" min={0} defaultValue={b.plannedAmount} className="input" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <SubmitButton>Simpan Anggaran</SubmitButton>
        <FormError error={state.error} />
        {state.ok && !state.error ? null : null}
      </div>
    </form>
  );
}
