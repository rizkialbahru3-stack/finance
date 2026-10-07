import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah, formatTanggalPendek } from "@/lib/format";
import { PageHeader, Badge, EmptyState, Card } from "@/components/ui";
import { PaymentCreatePanel, PaymentDelete } from "./forms";

export default async function PaymentsPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const members = await prisma.member.findMany({
    where: { tripId: trip.id },
    orderBy: { createdAt: "asc" },
    include: { payments: true },
  });

  const payments = await prisma.payment.findMany({
    where: { member: { tripId: trip.id } },
    orderBy: { paymentDate: "desc" },
    include: { member: true },
  });

  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <PageHeader title="Iuran / Pemasukan" subtitle={`Total terkumpul ${formatRupiah(total)} dari ${payments.length} pembayaran`} />
      <PaymentCreatePanel members={members.map((m) => ({ id: m.id, name: m.name }))} />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {members.map((m) => {
          const paid = m.payments.reduce((s, p) => s + p.amount, 0);
          return (
            <Card key={m.id} className="!p-4">
              <p className="truncate text-sm font-bold text-zinc-900">{m.name}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{formatRupiah(paid)}</p>
              <p className="text-xs text-zinc-500">dari {formatRupiah(m.targetContribution)}</p>
            </Card>
          );
        })}
      </div>

      {payments.length === 0 ? (
        <EmptyState message="Belum ada pembayaran. Catat iuran pertama kelompok." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Anggota</th>
                <th>Nominal</th>
                <th>Tanggal</th>
                <th>Metode</th>
                <th>Catatan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold">{p.member.name}</td>
                  <td className="font-semibold text-emerald-700">+{formatRupiah(p.amount)}</td>
                  <td>{formatTanggalPendek(p.paymentDate)}</td>
                  <td><Badge tone="blue">{p.method}</Badge></td>
                  <td className="text-zinc-500">{p.notes ?? "-"}</td>
                  <td><PaymentDelete id={p.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
