import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah } from "@/lib/format";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { MemberCreatePanel, MemberEditInline } from "./forms";

export default async function MembersPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const members = await prisma.member.findMany({
    where: { tripId: trip.id },
    orderBy: { createdAt: "asc" },
    include: { payments: true },
  });

  const rows = members.map((m, i) => {
    const paid = m.payments.reduce((s, p) => s + p.amount, 0);
    return { no: i + 1, ...m, paid, shortage: Math.max(0, m.targetContribution - paid), lunas: paid >= m.targetContribution };
  });

  return (
    <div>
      <PageHeader title="Anggota" subtitle={`${rows.length} anggota • target per orang dapat diubah di Pengaturan`} />
      <MemberCreatePanel defaultTarget={rows[0]?.targetContribution ?? 400000} />

      {rows.length === 0 ? (
        <EmptyState message="Belum ada anggota. Tambahkan anggota pertama." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Target Iuran</th>
                <th>Total Dibayar</th>
                <th>Kekurangan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td>{m.no}</td>
                  <td className="font-semibold">{m.name}</td>
                  <td>{formatRupiah(m.targetContribution)}</td>
                  <td>{formatRupiah(m.paid)}</td>
                  <td>{formatRupiah(m.shortage)}</td>
                  <td>{m.lunas ? <Badge tone="green">Lunas</Badge> : <Badge tone="amber">Belum Lunas</Badge>}</td>
                  <td>
                    <MemberEditInline id={m.id} name={m.name} target={m.targetContribution} />
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
