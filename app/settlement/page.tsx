import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah, formatBalance } from "@/lib/format";
import { PageHeader, Badge, Card, EmptyState } from "@/components/ui";

export default async function SettlementPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const members = await prisma.member.findMany({
    where: { tripId: trip.id },
    orderBy: { createdAt: "asc" },
    include: { payments: true, shares: true },
  });

  const rows = members.map((m) => {
    const paid = m.payments.reduce((s, p) => s + p.amount, 0);
    const obligation = m.shares.reduce((s, sh) => s + sh.amount, 0);
    const balance = paid - obligation;
    return { id: m.id, name: m.name, paid, obligation, balance };
  });

  // Saran pelunasan: yang minus membayar ke yang plus (greedy)
  const creditors = rows.filter((r) => r.balance > 0).map((r) => ({ ...r })).sort((a, b) => b.balance - a.balance);
  const debtors = rows.filter((r) => r.balance < 0).map((r) => ({ ...r, debt: -r.balance })).sort((a, b) => b.debt - a.debt);
  const suggestions: { from: string; to: string; amount: number }[] = [];
  let ci = 0;
  for (const d of debtors) {
    let remaining = d.debt;
    while (remaining > 0 && ci < creditors.length) {
      const c = creditors[ci];
      const pay = Math.min(remaining, c.balance);
      if (pay <= 0) { ci++; continue; }
      suggestions.push({ from: d.name, to: c.name, amount: pay });
      remaining -= pay;
      c.balance -= pay;
      if (c.balance <= 0) ci++;
    }
  }

  return (
    <div>
      <PageHeader title="Settlement" subtitle="Net balance = total dibayar − total kewajiban" />
      {rows.length === 0 ? (
        <EmptyState message="Belum ada anggota." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
              <Card key={r.id}>
                <p className="font-bold text-zinc-900">{r.name}</p>
                <div className="mt-2 space-y-1 text-sm text-zinc-600">
                  <p className="flex justify-between"><span>Dibayar</span><span className="font-semibold text-zinc-900">{formatRupiah(r.paid)}</span></p>
                  <p className="flex justify-between"><span>Kewajiban</span><span className="font-semibold text-zinc-900">{formatRupiah(r.obligation)}</span></p>
                  <p className="flex justify-between"><span>Balance</span><span className={`font-bold ${r.balance >= 0 ? "text-emerald-700" : "text-red-600"}`}>{formatBalance(r.balance)}</span></p>
                </div>
                <div className="mt-3">
                  {r.balance > 0 ? (
                    <Badge tone="green">Berhak menerima {formatRupiah(r.balance)}</Badge>
                  ) : r.balance < 0 ? (
                    <Badge tone="red">Kurang {formatRupiah(-r.balance)}</Badge>
                  ) : (
                    <Badge tone="zinc">Pas / impas</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <h2 className="mb-2 text-base font-bold text-zinc-900">Saran Pelunasan</h2>
            {suggestions.length === 0 ? (
              <p className="text-sm text-zinc-500">Semua sudah impas — tidak ada yang perlu membayar.</p>
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {suggestions.map((s, i) => (
                  <li key={i} className="py-2">
                    <span className="font-semibold text-zinc-900">{s.from}</span>
                    <span className="text-zinc-500"> membayar ke </span>
                    <span className="font-semibold text-zinc-900">{s.to}</span>
                    <span className="text-zinc-500"> sebesar </span>
                    <span className="font-bold text-emerald-700">{formatRupiah(s.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
