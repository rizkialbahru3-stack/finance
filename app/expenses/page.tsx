import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { PageHeader, Badge, EmptyState, Card } from "@/components/ui";
import { ExpenseCreatePanel, ExpenseDelete } from "./forms";

export default async function ExpensesPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const members = await prisma.member.findMany({ where: { tripId: trip.id }, orderBy: { createdAt: "asc" } });

  const expenses = await prisma.expense.findMany({
    where: { tripId: trip.id },
    orderBy: { expenseDate: "desc" },
    include: { paidBy: true, shares: { include: { member: true } } },
  });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title="Pengeluaran" subtitle={`Total ${formatRupiah(total)} dari ${expenses.length} pengeluaran`} />
      <ExpenseCreatePanel members={members.map((m) => ({ id: m.id, name: m.name }))} />

      {expenses.length === 0 ? (
        <EmptyState message="Belum ada pengeluaran." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {expenses.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-zinc-900">{e.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatTanggalPendek(e.expenseDate)}
                    {e.paidBy ? ` • dibayar ${e.paidBy.name}` : " • kas kelompok"}
                    {e.notes ? ` • ${e.notes}` : ""}
                  </p>
                </div>
                <Badge tone="teal">{e.category}</Badge>
              </div>
              <p className="mt-2 text-xl font-bold text-zinc-900">{formatRupiah(e.amount)}</p>
              <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
                <p className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">
                  Dibagi ke {e.shares.length} orang (@{formatRupiah(e.shares[0]?.amount ?? 0)})
                </p>
                <p>{e.shares.map((s) => `${s.member.name} ${formatRupiah(s.amount)}`).join(" • ")}</p>
              </div>
              <div className="mt-2 text-right">
                <ExpenseDelete id={e.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
