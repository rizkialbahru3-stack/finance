import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatRupiah } from "@/lib/format";
import { PageHeader, Card } from "@/components/ui";
import { TargetForm } from "./forms";

export default async function SettingsPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;
  const members = await prisma.member.findMany({ where: { tripId: trip.id }, select: { targetContribution: true } });
  const freq = new Map<number, number>();
  for (const m of members) freq.set(m.targetContribution, (freq.get(m.targetContribution) ?? 0) + 1);
  const mostCommon = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 400000;

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Kelola target iuran dan data trip" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-base font-bold text-zinc-900">Target Iuran per Anggota</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Saat ini {members.length} anggota • total target {formatRupiah(members.reduce((s, m) => s + m.targetContribution, 0))}
          </p>
          <TargetForm current={mostCommon} />
        </Card>
        <Card>
          <h2 className="mb-1 text-base font-bold text-zinc-900">Data Trip</h2>
          <p className="mb-3 text-sm text-zinc-500">Ubah nama, tujuan, tanggal, dan catatan perjalanan.</p>
          <Link href="/trip" className="btn btn-secondary">Kelola di halaman Trip</Link>
        </Card>
      </div>
    </div>
  );
}
