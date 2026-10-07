export const EXPENSE_CATEGORIES = [
  "Transportasi",
  "Penginapan",
  "Makanan",
  "Tiket wisata",
  "BBQ / Grill",
  "Berenang",
  "Parkir",
  "Oleh-oleh",
  "Belanja",
  "Lainnya",
] as const;

export const BUDGET_CATEGORIES = [
  "Transportasi",
  "Penginapan",
  "Makanan",
  "Tiket",
  "BBQ",
  "Berenang",
  "Parkir",
  "Lainnya",
] as const;

export const PAYMENT_METHODS = ["Cash", "Transfer", "E-wallet"] as const;

/** Petakan kategori expense ke kategori budget untuk realisasi anggaran. */
export function mapToBudgetCategory(expenseCategory: string): string {
  if (expenseCategory === "Tiket wisata") return "Tiket";
  if (expenseCategory === "BBQ / Grill") return "BBQ";
  if (expenseCategory === "Oleh-oleh" || expenseCategory === "Belanja") return "Lainnya";
  if ((BUDGET_CATEGORIES as readonly string[]).includes(expenseCategory)) return expenseCategory;
  return "Lainnya";
}

export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Guci+Tegal+Jawa+Tengah";
