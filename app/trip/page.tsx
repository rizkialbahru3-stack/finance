import { ExternalLink, CalendarDays, MapPin, Users, StickyNote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTrip } from "@/lib/data";
import { MAPS_URL } from "@/lib/constants";
import { formatTanggal } from "@/lib/format";
import { PageHeader, Card } from "@/components/ui";
import { TripEditForm } from "./forms";

export default async function TripPage() {
  const trip = await getTrip();
  if (!trip) return <p>Data trip belum ada.</p>;
  const memberCount = await prisma.member.count({ where: { tripId: trip.id } });

  return (
    <div>
      <PageHeader title="Informasi Trip" subtitle="Detail dan pengaturan perjalanan" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-emerald-900">{trip.name}</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-zinc-700">
            <li className="flex items-center gap-2"><MapPin size={16} className="text-emerald-700" />{trip.destination}</li>
            <li className="flex items-center gap-2">
              <CalendarDays size={16} className="text-emerald-700" />
              {trip.startDate ? formatTanggal(trip.startDate) : "-"} s/d {trip.endDate ? formatTanggal(trip.endDate) : "-"}
            </li>
            <li className="flex items-center gap-2"><Users size={16} className="text-emerald-700" />{memberCount} anggota</li>
            {trip.notes && <li className="flex items-start gap-2"><StickyNote size={16} className="mt-0.5 text-emerald-700" />{trip.notes}</li>}
          </ul>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-4">
            <ExternalLink size={16} /> Buka Google Maps ke Guci
          </a>
        </Card>
        <Card>
          <h2 className="mb-3 text-base font-bold text-zinc-900">Edit Trip</h2>
          <TripEditForm trip={trip} />
        </Card>
      </div>
    </div>
  );
}
