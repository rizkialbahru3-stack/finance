import { prisma } from "@/lib/prisma";
import { calcSummary } from "@/lib/calculations";

export async function getTrip() {
  return prisma.trip.findFirst({ orderBy: { createdAt: "asc" } });
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const trip = await getTrip();
  if (!trip) return null;

  const members = await prisma.member.findMany({
    where: { tripId: trip.id },
    orderBy: { createdAt: "asc" },
    include: { payments: true, shares: true },
  });

  const memberStats = members.map((m) => {
    const totalPaid = m.payments.reduce((s, p) => s + p.amount, 0);
    const obligation = m.shares.reduce((s, sh) => s + sh.amount, 0);
    return {
      id: m.id,
      name: m.name,
      targetContribution: m.targetContribution,
      totalPaid,
      obligation,
      shortage: Math.max(0, m.targetContribution - totalPaid),
      balance: totalPaid - obligation,
    };
  });

  const totalExpense = (await prisma.expense.aggregate({ where: { tripId: trip.id }, _sum: { amount: true } }))._sum.amount ?? 0;
  const summary = calcSummary(memberStats, totalExpense);

  const recentExpenses = await prisma.expense.findMany({
    where: { tripId: trip.id },
    orderBy: { expenseDate: "desc" },
    take: 5,
    include: { paidBy: true },
  });
  const recentPayments = await prisma.payment.findMany({
    where: { member: { tripId: trip.id } },
    orderBy: { paymentDate: "desc" },
    take: 5,
    include: { member: true },
  });

  const allExpenses = await prisma.expense.findMany({ where: { tripId: trip.id }, select: { category: true, amount: true } });
  const byCategory = new Map<string, number>();
  for (const e of allExpenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  const expenseByCategory = [...byCategory.entries()].map(([name, value]) => ({ name, value }));

  return { trip, memberStats, summary, recentExpenses, recentPayments, expenseByCategory };
}
