"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { splitEqually } from "@/lib/calculations";
import { PAYMENT_METHODS, EXPENSE_CATEGORIES } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string };

function mustName(v: FormDataEntryValue | null): string {
  const s = String(v ?? "").trim();
  if (!s) throw new Error("Nama tidak boleh kosong.");
  return s;
}

function mustPositiveInt(v: FormDataEntryValue | null, label = "Nominal"): number {
  const n = Number(String(v ?? "").replace(/[^0-9]/g, ""));
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} harus lebih dari 0.`);
  return Math.floor(n);
}

function mustDate(v: FormDataEntryValue | null, label = "Tanggal"): Date {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`${label} wajib diisi.`);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error(`${label} tidak valid.`);
  return d;
}

function mustId(v: FormDataEntryValue | null, label = "Anggota"): string {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`${label} wajib dipilih.`);
  return s;
}

async function getTrip() {
  const trip = await prisma.trip.findFirst({ orderBy: { createdAt: "asc" } });
  if (!trip) throw new Error("Data trip belum ada.");
  return trip;
}

function err(e: unknown): ActionResult {
  return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
}

const REVAL = ["/", "/members", "/payments", "/expenses", "/transactions", "/budget", "/settlement", "/reports", "/trip", "/settings"];
function revalAll() {
  for (const p of REVAL) revalidatePath(p);
}

/* ---------- Anggota ---------- */

export async function createMember(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const name = mustName(form.get("name"));
    const target = mustPositiveInt(form.get("targetContribution"), "Target iuran");
    await prisma.member.create({ data: { tripId: trip.id, name, targetContribution: target } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function updateMember(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID anggota");
    const name = mustName(form.get("name"));
    const target = mustPositiveInt(form.get("targetContribution"), "Target iuran");
    await prisma.member.update({ where: { id }, data: { name, targetContribution: target } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function deleteMember(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID anggota");
    await prisma.member.delete({ where: { id } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/** Ubah target iuran semua anggota sekaligus (pengaturan). */
export async function updateTargetAll(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const target = mustPositiveInt(form.get("targetContribution"), "Target iuran");
    await prisma.member.updateMany({ where: { tripId: trip.id }, data: { targetContribution: target } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/* ---------- Trip ---------- */

export async function updateTrip(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const name = mustName(form.get("name"));
    const destination = mustName(form.get("destination"));
    const startRaw = String(form.get("startDate") ?? "").trim();
    const endRaw = String(form.get("endDate") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim() || null;
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        name,
        destination,
        startDate: startRaw ? new Date(startRaw) : null,
        endDate: endRaw ? new Date(endRaw) : null,
        notes,
      },
    });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/* ---------- Pembayaran ---------- */

export async function createPayment(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const memberId = mustId(form.get("memberId"));
    const amount = mustPositiveInt(form.get("amount"));
    const paymentDate = mustDate(form.get("paymentDate"), "Tanggal pembayaran");
    const method = String(form.get("method") ?? "Cash");
    if (!(PAYMENT_METHODS as readonly string[]).includes(method)) throw new Error("Metode pembayaran tidak valid.");
    const notes = String(form.get("notes") ?? "").trim() || null;
    await prisma.payment.create({ data: { memberId, amount, paymentDate, method, notes } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function deletePayment(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID pembayaran");
    await prisma.payment.delete({ where: { id } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/* ---------- Pengeluaran ---------- */

export async function createExpense(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const name = mustName(form.get("name"));
    const category = String(form.get("category") ?? "Lainnya");
    if (!(EXPENSE_CATEGORIES as readonly string[]).includes(category)) throw new Error("Kategori tidak valid.");
    const amount = mustPositiveInt(form.get("amount"));
    const expenseDate = mustDate(form.get("expenseDate"), "Tanggal pengeluaran");
    const paidByRaw = String(form.get("paidByMemberId") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim() || null;
    const shareIds = form.getAll("shareMemberIds").map(String).filter(Boolean);
    const members = await prisma.member.findMany({ where: { tripId: trip.id }, orderBy: { createdAt: "asc" } });
    if (members.length === 0) throw new Error("Belum ada anggota.");
    const targets = shareIds.length > 0
      ? members.filter((m) => shareIds.includes(m.id))
      : members;
    if (targets.length === 0) throw new Error("Pilih minimal satu anggota untuk pembagian biaya.");
    const parts = splitEqually(amount, targets.length);
    await prisma.expense.create({
      data: {
        tripId: trip.id,
        name,
        category,
        amount,
        expenseDate,
        paidByMemberId: paidByRaw || null,
        notes,
        shares: { create: targets.map((m, i) => ({ memberId: m.id, amount: parts[i] })) },
      },
    });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function deleteExpense(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID pengeluaran");
    await prisma.expense.delete({ where: { id } });
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/* ---------- Anggaran ---------- */

export async function saveBudgets(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const categories = form.getAll("category").map(String);
    const amounts = form.getAll("plannedAmount").map(String);
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const n = Math.max(0, Math.floor(Number(amounts[i]?.replace(/[^0-9]/g, "") || 0)));
      await prisma.budget.upsert({
        where: { tripId_category: { tripId: trip.id, category: cat } },
        update: { plannedAmount: n },
        create: { tripId: trip.id, category: cat, plannedAmount: n },
      });
    }
    revalAll();
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

/* ---------- Itinerary ---------- */

export async function createItinerary(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const trip = await getTrip();
    const date = mustDate(form.get("date"), "Tanggal");
    const activity = mustName(form.get("activity"));
    const time = String(form.get("time") ?? "").trim() || null;
    const location = String(form.get("location") ?? "").trim() || null;
    const notes = String(form.get("notes") ?? "").trim() || null;
    await prisma.itinerary.create({ data: { tripId: trip.id, date, time, activity, location, notes } });
    revalidatePath("/itinerary");
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function updateItinerary(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID itinerary");
    const date = mustDate(form.get("date"), "Tanggal");
    const activity = mustName(form.get("activity"));
    const time = String(form.get("time") ?? "").trim() || null;
    const location = String(form.get("location") ?? "").trim() || null;
    const notes = String(form.get("notes") ?? "").trim() || null;
    await prisma.itinerary.update({ where: { id }, data: { date, time, activity, location, notes } });
    revalidatePath("/itinerary");
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}

export async function deleteItinerary(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const id = mustId(form.get("id"), "ID itinerary");
    await prisma.itinerary.delete({ where: { id } });
    revalidatePath("/itinerary");
    return { ok: true };
  } catch (e) {
    return err(e);
  }
}
