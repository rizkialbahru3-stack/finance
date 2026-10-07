import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { PageHeader, Badge, EmptyState } from "@/components/ui";

type Tx = {
  id: string;
  kind: "in" | "out";
  date: Date;
  desc: string;
  person: string;
  amount: number;
  category: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; q?: string }>;
}) {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;
  const { jenis = "semua", q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const [payments, expenses] = await Promise.all([
    prisma.payment.findMany({
      where: { member: { tripId: trip.id } },
      orderBy: { paymentDate: "desc" },
      include: { member: true },
    }),
    prisma.expense.findMany({
      where: { tripId: trip.id },
      orderBy: { expenseDate: "desc" },
      include: { paidBy: true },
    }),
  ]);

  let txs: Tx[] = [
    ...payments.map((p): Tx => ({
      id: p.id,
      kind: "in",
      date: p.paymentDate,
      desc: p.notes ? `Iuran — ${p.notes}` : "Iuran anggota",
      person: p.member.name,
      amount: p.amount,
      category: p.method,
    })),
    ...expenses.map((e): Tx => ({
      id: e.id,
      kind: "out",
      date: e.expenseDate,
      desc: e.name,
      person: e.paidBy?.name ?? "Kas kelompok",
      amount: e.amount,
      category: e.category,
    })),
  ];
  txs.sort((a, b) => b.date.getTime() - a.date.getTime());
  if (jenis === "masuk") txs = txs.filter((t) => t.kind === "in");
  if (jenis === "keluar") txs = txs.filter((t) => t.kind === "out");
  if (query) {
    txs = txs.filter((t) =>
      `${t.desc} ${t.person} ${t.category}`.toLowerCase().includes(query)
    );
  }

  const tabs = [
    { key: "semua", label: "Semua" },
    { key: "masuk", label: "Pemasukan" },
    { key: "keluar", label: "Pengeluaran" },
  ];

  return (
    <div>
      <PageHeader title="Transaksi" subtitle={`${txs.length} transaksi`} />
      <form method="GET" className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari deskripsi, anggota, kategori..."
          className="input sm:max-w-sm"
        />
        <input type="hidden" name="jenis" value={jenis} />
        <button type="submit" className="btn btn-secondary sm:w-auto">Cari</button>
      </form>
      <div className="mb-4 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/transactions?jenis=${t.key}${query ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              jenis === t.key ? "bg-emerald-700 text-white" : "bg-white text-zinc-600 border border-zinc-300"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {txs.length === 0 ? (
        <EmptyState message="Tidak ada transaksi yang cocok." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Deskripsi</th>
                <th>Anggota</th>
                <th>Kategori</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={`${t.kind}-${t.id}`}>
                  <td>{formatTanggalPendek(t.date)}</td>
                  <td>{t.kind === "in" ? <Badge tone="green">Pemasukan</Badge> : <Badge tone="red">Pengeluaran</Badge>}</td>
                  <td className="font-medium">{t.desc}</td>
                  <td>{t.person}</td>
                  <td className="text-zinc-500">{t.category}</td>
                  <td className={`font-bold ${t.kind === "in" ? "text-emerald-700" : "text-zinc-900"}`}>
                    {t.kind === "in" ? "+" : "-"}{formatRupiah(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
