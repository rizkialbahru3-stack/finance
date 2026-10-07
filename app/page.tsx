import Link from "next/link";
import { Wallet, PiggyBank, Receipt, Scale, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { Card, Badge, ProgressBar, StatCard, EmptyState } from "@/components/ui";
import { ExpensePie, PieLegend, MemberBar } from "@/components/charts";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) {
    return (
      <Card>
        <p className="text-sm text-zinc-600">Data trip belum tersedia. Jalankan seed database terlebih dahulu.</p>
      </Card>
    );
  }
  const { trip, memberStats, summary, recentExpenses, recentPayments, expenseByCategory } = data;

  return (
    <div>
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{trip.name}</h1>
        <p className="mt-1 text-sm text-emerald-100">
          {trip.destination} — Kelola keuangan perjalanan bersama dengan mudah
        </p>
        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
            <span className="text-emerald-100">Progress dana {summary.progress}%</span>
            <span className="font-semibold">
              {formatRupiah(summary.totalTerkumpul)} / {formatRupiah(summary.totalTarget)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${Math.min(100, summary.progress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<PiggyBank size={22} />} label="Total Target Dana" value={formatRupiah(summary.totalTarget)} sub={`${memberStats.length} anggota`} />
        <StatCard icon={<Wallet size={22} />} label="Terkumpul" value={formatRupiah(summary.totalTerkumpul)} sub={`${summary.lunas} lunas • ${summary.belumLunas} belum lunas`} />
        <StatCard icon={<Receipt size={22} />} label="Pengeluaran" value={formatRupiah(summary.totalExpense)} sub="Total belanja kelompok" />
        <StatCard icon={<Scale size={22} />} label="Saldo Saat Ini" value={formatRupiah(summary.saldo)} sub={`Kekurangan iuran ${formatRupiah(summary.kekurangan)}`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <h2 className="mb-1 text-base font-bold text-zinc-900">Grafik Pengeluaran</h2>
          <p className="mb-3 text-xs text-zinc-500">Berdasarkan kategori</p>
          <ExpensePie data={expenseByCategory} />
          <PieLegend data={expenseByCategory} />
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <h2 className="mb-1 text-base font-bold text-zinc-900">Pembayaran Anggota</h2>
          <p className="mb-3 text-xs text-zinc-500">Dibayar vs target per orang</p>
          <MemberBar data={memberStats.map((m) => ({ name: m.name, dibayar: m.totalPaid, target: m.targetContribution }))} />
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Status Iuran Anggota</h2>
            <Link href="/members" className="text-sm font-semibold text-emerald-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {memberStats.length === 0 ? (
            <EmptyState message="Belum ada anggota." />
          ) : (
            <ul className="space-y-3">
              {memberStats.map((m) => (
                <li key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-zinc-800">
                      {m.totalPaid >= m.targetContribution ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={16} className="text-amber-500" />
                      )}
                      {m.name}
                    </span>
                    <span className="text-zinc-600">
                      {formatRupiah(m.totalPaid)} / {formatRupiah(m.targetContribution)}
                    </span>
                  </div>
                  <ProgressBar value={m.targetContribution > 0 ? (m.totalPaid / m.targetContribution) * 100 : 0} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Pengeluaran Terbaru</h2>
              <Link href="/expenses" className="text-sm font-semibold text-emerald-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            {recentExpenses.length === 0 ? (
              <EmptyState message="Belum ada pengeluaran." />
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {recentExpenses.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-800">{e.name}</p>
                      <p className="text-xs text-zinc-500">
                        {formatTanggalPendek(e.expenseDate)} • {e.category}
                        {e.paidBy ? ` • oleh ${e.paidBy.name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-zinc-900">{formatRupiah(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Aktivitas Iuran Terbaru</h2>
              <Link href="/payments" className="text-sm font-semibold text-emerald-700 hover:underline">
                Lihat semua
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <EmptyState message="Belum ada pembayaran." />
            ) : (
              <ul className="divide-y divide-zinc-100 text-sm">
                {recentPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-800">
                        {p.member.name} <span className="font-normal text-zinc-500">membayar</span> {formatRupiah(p.amount)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatTanggalPendek(p.paymentDate)} • {p.method}
                      </p>
                    </div>
                    <Badge tone="green">Masuk</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
        <Users size={16} />
        <span>
          {summary.lunas} anggota lunas, {summary.belumLunas} belum lunas — total kekurangan {formatRupiah(summary.kekurangan)}
        </span>
      </div>
    </div>
  );
}
