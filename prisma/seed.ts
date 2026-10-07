import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MEMBER_NAMES = ["Risma", "Andi", "Budi", "Citra", "Dina", "Eko"];
const TARGET = 400_000;

function splitEqually(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const rest = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rest ? 1 : 0));
}

async function main() {
  await prisma.expenseShare.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trip.deleteMany();

  const trip = await prisma.trip.create({
    data: {
      name: "Liburan Guci 2026",
      destination: "Guci, Kabupaten Tegal",
      startDate: new Date("2026-12-19T00:00:00"),
      endDate: new Date("2026-12-20T00:00:00"),
      notes: "Perjalanan wisata kelompok ke Guci. Kumpul di titik kumpul pukul 06.00.",
    },
  });

  const members = await Promise.all(
    MEMBER_NAMES.map((name) =>
      prisma.member.create({
        data: { tripId: trip.id, name, targetContribution: TARGET },
      })
    )
  );
  const byName = Object.fromEntries(members.map((m) => [m.name, m]));

  const payments: { member: string; amount: number; date: string; method: string; notes?: string }[] = [
    { member: "Risma", amount: 200_000, date: "2026-10-01", method: "Transfer" },
    { member: "Risma", amount: 200_000, date: "2026-10-05", method: "Transfer", notes: "Pelunasan" },
    { member: "Andi", amount: 250_000, date: "2026-10-02", method: "Cash" },
    { member: "Budi", amount: 400_000, date: "2026-10-03", method: "Transfer" },
    { member: "Citra", amount: 150_000, date: "2026-10-04", method: "E-wallet" },
    { member: "Dina", amount: 300_000, date: "2026-10-05", method: "Transfer" },
    { member: "Eko", amount: 100_000, date: "2026-10-06", method: "Cash" },
  ];
  for (const p of payments) {
    await prisma.payment.create({
      data: {
        memberId: byName[p.member].id,
        amount: p.amount,
        paymentDate: new Date(p.date),
        method: p.method,
        notes: p.notes,
      },
    });
  }

  const expenses: { name: string; category: string; amount: number; date: string; paidBy: string; notes?: string }[] = [
    { name: "Sewa villa 1 malam", category: "Penginapan", amount: 600_000, date: "2026-10-05", paidBy: "Risma", notes: "DP villa" },
    { name: "Belanja BBQ", category: "Makanan", amount: 250_000, date: "2026-10-06", paidBy: "Andi" },
    { name: "Bensin berangkat", category: "Transportasi", amount: 200_000, date: "2026-10-06", paidBy: "Budi" },
    { name: "Tiket wisata Guci", category: "Tiket wisata", amount: 150_000, date: "2026-10-06", paidBy: "Citra" },
  ];
  for (const e of expenses) {
    const created = await prisma.expense.create({
      data: {
        tripId: trip.id,
        name: e.name,
        category: e.category,
        amount: e.amount,
        expenseDate: new Date(e.date),
        paidByMemberId: byName[e.paidBy].id,
        notes: e.notes,
      },
    });
    const parts = splitEqually(e.amount, members.length);
    await Promise.all(
      members.map((m, i) =>
        prisma.expenseShare.create({
          data: { expenseId: created.id, memberId: m.id, amount: parts[i] },
        })
      )
    );
  }

  const budgets: { category: string; plannedAmount: number }[] = [
    { category: "Transportasi", plannedAmount: 300_000 },
    { category: "Penginapan", plannedAmount: 600_000 },
    { category: "Makanan", plannedAmount: 500_000 },
    { category: "Tiket", plannedAmount: 200_000 },
    { category: "BBQ", plannedAmount: 300_000 },
    { category: "Berenang", plannedAmount: 100_000 },
    { category: "Parkir", plannedAmount: 50_000 },
    { category: "Lainnya", plannedAmount: 100_000 },
  ];
  for (const b of budgets) {
    await prisma.budget.create({ data: { tripId: trip.id, ...b } });
  }

  const itinerary: { date: string; time: string; activity: string; location: string; notes?: string }[] = [
    { date: "2026-12-19", time: "06:00", activity: "Berangkat menuju Guci", location: "Titik kumpul", notes: "Jangan terlambat" },
    { date: "2026-12-19", time: "10:00", activity: "Check-in penginapan", location: "Villa Guci" },
    { date: "2026-12-19", time: "14:00", activity: "Berenang air panas", location: "Pemandian Guci" },
    { date: "2026-12-19", time: "19:00", activity: "BBQ / Grill bersama", location: "Villa Guci" },
    { date: "2026-12-20", time: "07:00", activity: "Sarapan", location: "Villa Guci" },
    { date: "2026-12-20", time: "09:00", activity: "Wisata Guci & beli oleh-oleh", location: "Kawasan wisata Guci" },
    { date: "2026-12-20", time: "12:00", activity: "Makan siang", location: "Rumah makan" },
    { date: "2026-12-20", time: "14:00", activity: "Persiapan pulang", location: "Villa Guci" },
  ];
  for (const item of itinerary) {
    await prisma.itinerary.create({ data: { tripId: trip.id, date: new Date(item.date), ...{ time: item.time, activity: item.activity, location: item.location, notes: item.notes } } });
  }

  console.log("Seed selesai: Liburan Guci 2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
