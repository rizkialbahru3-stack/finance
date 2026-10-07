import { prisma } from "@/lib/prisma";
import { toInputDate } from "@/lib/format";

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const trip = await prisma.trip.findFirst({ orderBy: { createdAt: "asc" } });
  if (!trip) return new Response("Trip belum ada", { status: 404 });

  const [members, payments, expenses, shares] = await Promise.all([
    prisma.member.findMany({ where: { tripId: trip.id }, orderBy: { createdAt: "asc" }, include: { payments: true } }),
    prisma.payment.findMany({ where: { member: { tripId: trip.id } }, orderBy: { paymentDate: "asc" }, include: { member: true } }),
    prisma.expense.findMany({ where: { tripId: trip.id }, orderBy: { expenseDate: "asc" }, include: { paidBy: true } }),
    prisma.expenseShare.findMany({ where: { expense: { tripId: trip.id } }, include: { member: true, expense: true } }),
  ]);

  const totalIn = payments.reduce((s, p) => s + p.amount, 0);
  const totalOut = expenses.reduce((s, e) => s + e.amount, 0);
  const paidBy = new Map<string, number>();
  const obligBy = new Map<string, number>();
  for (const m of members) {
    paidBy.set(m.id, m.payments.reduce((s, p) => s + p.amount, 0));
    obligBy.set(m.id, 0);
  }
  for (const sh of shares) obligBy.set(sh.memberId, (obligBy.get(sh.memberId) ?? 0) + sh.amount);

  const L: string[][] = [];
  L.push(["LAPORAN KEUANGAN", trip.name]);
  L.push(["Tujuan", trip.destination]);
  L.push(["Tanggal export", toInputDate(new Date())]);
  L.push([]);
  L.push(["RINGKASAN"]);
  L.push(["Total target", String(members.reduce((s, m) => s + m.targetContribution, 0))]);
  L.push(["Total pemasukan", String(totalIn)]);
  L.push(["Total pengeluaran", String(totalOut)]);
  L.push(["Saldo", String(totalIn - totalOut)]);
  L.push([]);
  L.push(["ANGGOTA", "Target", "Dibayar", "Kekurangan", "Kewajiban", "Balance"]);
  for (const m of members) {
    const paid = paidBy.get(m.id) ?? 0;
    const oblig = obligBy.get(m.id) ?? 0;
    L.push([m.name, String(m.targetContribution), String(paid), String(Math.max(0, m.targetContribution - paid)), String(oblig), String(paid - oblig)]);
  }
  L.push([]);
  L.push(["PEMBAYARAN", "Anggota", "Nominal", "Tanggal", "Metode", "Catatan"]);
  for (const p of payments) {
    L.push([p.member.name, String(p.amount), toInputDate(p.paymentDate), p.method, p.notes ?? ""]);
  }
  L.push([]);
  L.push(["PENGELUARAN", "Nama", "Kategori", "Nominal", "Tanggal", "Dibayar oleh", "Catatan", "Dibagi ke"]);
  for (const e of expenses) {
    const who = shares.filter((s) => s.expenseId === e.id).map((s) => `${s.member.name}:${s.amount}`).join("; ");
    L.push([e.name, e.category, String(e.amount), toInputDate(e.expenseDate), e.paidBy?.name ?? "Kas", e.notes ?? "", who]);
  }

  const csv = "﻿" + L.map((r) => r.map(csvCell).join(",")).join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-gucitrip.csv"`,
    },
  });
}
