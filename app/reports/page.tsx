import { Download } from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { formatRupiah, formatBalance, formatTanggalPendek } from "@/lib/format";
import { PageHeader, Card, Badge, ProgressBar } from "@/components/ui";
import { ExpensePie, PieLegend, MemberBar } from "@/components/charts";

export default async function ReportsPage() {
  const data = await getDashboardData();
  if (!data) return <p>Data trip belum ada.</p>;
  const { trip, memberStats, summary, expenseByCategory } = data;

  return (
    <div>
      <PageHeader
        title="Laporan"
        subtitle={`Ringkasan keuangan ${trip.name}`}
        action={
          <a href="/api/export" className="btn btn-primary">
            <Download size={16} /> Export CSV
          </a>
        }
      />

      <Card className="mb-4">
        <h2 className="mb-3 text-base font-bold text-zinc-900">Ringkasan Keuangan</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {[
            ["Total Target", formatRupiah(summary.totalTarget)],
            ["Total Pemasukan", formatRupiah(summary.totalTerkumpul)],
            ["Total Pengeluaran", formatRupiah(summary.totalExpense)],
            ["Saldo", formatRupiah(summary.saldo)],
            ["Kekurangan Bayar", formatRupiah(summary.kekurangan)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-1 font-bold text-zinc-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <ProgressBar value={summary.progress} />
          <p className="mt-1 text-xs text-zinc-500">Progress total dana {summary.progress}%</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-base font-bold text-zinc-900">Laporan per Anggota</h2>
          <div className="table-wrap !border-0 !shadow-none">
            <table className="table">
              <thead><tr><th>Nama</th><th>Bayar</th><th>Kewajiban</th><th>Balance</th><th>Status</th></tr></thead>
              <tbody>
                {memberStats.map((m) => (
                  <tr key={m.id}>
                    <td className="font-semibold">{m.name}</td>
                    <td>{formatRupiah(m.totalPaid)}</td>
                    <td>{formatRupiah(m.obligation)}</td>
                    <td className={`font-semibold ${m.balance >= 0 ? "text-emerald-700" : "text-red-600"}`}>{formatBalance(m.balance)}</td>
                    <td>
                      {m.balance > 0 ? <Badge tone="green">Menerima</Badge>
                        : m.balance < 0 ? <Badge tone="red">Kurang</Badge>
                        : <Badge tone="zinc">Impas</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-bold text-zinc-900">Pengeluaran per Kategori</h2>
          <ExpensePie data={expenseByCategory} />
          <PieLegend data={expenseByCategory} />
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-base font-bold text-zinc-900">Grafik Pembayaran Anggota</h2>
        <MemberBar data={memberStats.map((m) => ({ name: m.name, dibayar: m.totalPaid, target: m.targetContribution }))} />
        <p className="mt-2 text-xs text-zinc-500">Periode laporan: {formatTanggalPendek(new Date())} • Tips: gunakan tombol Export CSV lalu cetak ke PDF dari browser bila perlu.</p>
      </Card>
    </div>
  );
}
