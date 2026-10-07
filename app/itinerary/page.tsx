import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { formatTanggal, toInputDate } from "@/lib/format";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { ItineraryCreatePanel, ItineraryRow } from "./forms";

export default async function ItineraryPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;

  const items = await prisma.itinerary.findMany({
    where: { tripId: trip.id },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  const groups = new Map<string, typeof items>();
  for (const it of items) {
    const key = toInputDate(it.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }

  return (
    <div>
      <PageHeader title="Itinerary" subtitle={`Rencana perjalanan ${trip.name}`} />
      <ItineraryCreatePanel defaultDate={trip.startDate ? toInputDate(trip.startDate) : toInputDate(new Date())} />
      {items.length === 0 ? (
        <EmptyState message="Belum ada itinerary. Tambahkan kegiatan pertama." />
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([dateKey, list], gi) => (
            <Card key={dateKey}>
              <h2 className="mb-1 text-base font-bold text-emerald-800">
                Hari {gi + 1} — {formatTanggal(list[0].date)}
              </h2>
              <ul className="divide-y divide-zinc-100">
                {list.map((it) => (
                  <ItineraryRow key={it.id} item={it} />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
