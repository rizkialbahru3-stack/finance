import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { mapToBudgetCategory, BUDGET_CATEGORIES } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { PageHeader, Card, ProgressBar } from "@/components/ui";
import { BudgetForm } from "./forms";

export default async function BudgetPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const [saved, expenses] = await Promise.all([
    prisma.budget.findMany({ where: { tripId: trip.id } }),
    prisma.expense.findMany({ where: { tripId: trip.id }, select: { category: true, amount: true } }),
  ]);
  const savedMap = new Map(saved.map((b) => [b.category, b.plannedAmount]));
  const realMap = new Map<string, number>();
  for (const e of expenses) {
    const cat = mapToBudgetCategory(e.category);
    realMap.set(cat, (realMap.get(cat) ?? 0) + e.amount);
  }

  const rows = BUDGET_CATEGORIES.map((cat) => {
    const budget = savedMap.get(cat) ?? 0;
    const real = realMap.get(cat) ?? 0;
    return { category: cat, budget, real, diff: budget - real, pct: budget > 0 ? (real / budget) * 100 : 0 };
  });
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalReal = rows.reduce((s, r) => s + r.real, 0);

  return (
    <div>
      <PageHeader
        title="Rencana Anggaran"
        subtitle={`Total budget ${formatRupiah(totalBudget)} • realisasi ${formatRupiah(totalReal)} • sisa ${formatRupiah(totalBudget - totalReal)}`}
      />
      <Card className="mb-4">
        <h2 className="mb-3 text-base font-bold text-zinc-900">Atur Budget per Kategori</h2>
        <BudgetForm budgets={rows.map((r) => ({ category: r.category, plannedAmount: r.budget }))} />
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((r) => (
          <Card key={r.category}>
            <p className="font-bold text-zinc-900">{r.category}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="flex justify-between text-zinc-600"><span>Budget</span><span className="font-semibold text-zinc-900">{formatRupiah(r.budget)}</span></p>
              <p className="flex justify-between text-zinc-600"><span>Realisasi</span><span className="font-semibold text-zinc-900">{formatRupiah(r.real)}</span></p>
              <p className="flex justify-between text-zinc-600">
                <span>Selisih</span>
                <span className={`font-semibold ${r.diff < 0 ? "text-red-600" : "text-emerald-700"}`}>{formatRupiah(r.diff)}</span>
              </p>
            </div>
            <div className="mt-2">
              <ProgressBar value={r.pct} />
              <p className="mt-1 text-right text-xs text-zinc-500">{Math.round(r.pct)}% terpakai</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
