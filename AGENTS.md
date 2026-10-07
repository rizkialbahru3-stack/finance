# AGENTS.md

GuciTrip Finance — aplikasi web (Indonesia) untuk mengelola keuangan patungan liburan 6 orang ke Guci, Tegal. Next 16.4, React 19, Tailwind 4, Prisma 6 + SQLite, Recharts, lucide-react. Tanpa login; satu trip aktif.

## Commands

- `npm install` lalu `npx prisma migrate dev` lalu `npm run dev` — urutan setup wajib (pertama kali: migrate otomatis menjalankan seed via `tsx prisma/seed.ts`)
- `npm run build` / `npm start` — build produksi; semua route adalah dynamic (`export const dynamic = "force-dynamic"` di `app/layout.tsx`)
- `npm run lint`, `npx tsc --noEmit` — tidak ada test runner / CI
- Seed ulang: `npx prisma db seed` (hapus-isi-ulang: trip, 6 anggota, pembayaran, pengeluaran+share, budget, itinerary)

## Structure

- `prisma/schema.prisma` — model: Trip, Member, Payment, Expense, ExpenseShare, Budget, Itinerary (relasi Cascade, `paidBy` SetNull)
- `prisma/seed.ts` — Trip "Liburan Guci 2026", anggota Risma/Andi/Budi/Citra/Dina/Eko @ Rp400rb, total pay Rp1,6jt / expense Rp1,2jt
- `lib/prisma.ts` — singleton client; `lib/actions.ts` — semua mutasi (server actions + `revalidatePath`, validasi manual bhs Indonesia); `lib/data.ts` — `getDashboardData()`; `lib/calculations.ts` — `calcSummary`, `splitEqually` (sisa rupiah ke anggota awal); `lib/constants.ts` — kategori + `mapToBudgetCategory`; `lib/format.ts` — `formatRupiah`, `formatTanggal`
- `app/` — `page.tsx` dashboard; `members/ payments/ expenses/ transactions/ budget/ settlement/ itinerary/ trip/ reports/ settings/` + `api/export/route.ts` (CSV dengan BOM)
- `components/` — `ui.tsx` (Card, StatCard, Badge, ProgressBar, + class `.card/.input/.btn/.table` di `globals.css`), `interactive.tsx` (Sidebar + 11 nav, SubmitButton, DeleteButton konfirmasi, CollapsibleForm), `charts.tsx` (Recharts, client-only)
- Tiap route punya `forms.tsx` (client, `useActionState`) di samping `page.tsx` (server). Alias `@/*` → root repo.

## Quirks

- `.env` `DATABASE_URL="file:./dev.db"` wajib ada — tanpa itu `prisma migrate/validate` gagal (P1012). `prisma/dev.db` hasil migrate; jangan commit bila tidak diinginkan.
- `next.config.ts` SENGAJA tanpa `cacheComponents` — flag itu merusak build (`dynamic` segment config incompatible + prerender DB gagal). Hanya tersisa Turbopack rule `*.css` → `@tailwindcss/turbopack`; jangan hapus.
- Prisma dipin ke v6 (`prisma@6`, `@prisma/client@6`) — JANGAN upgrade ke v8 (CLI RC tanpa `migrate dev`/`validate`).
- `ExpenseShare` dibuat saat `createExpense`: checkbox kosong = bagi rata ke semua anggota. Hapus expense menghapus shares (Cascade).
- Kategori expense ≠ budget 1:1 — realisasi budget memakai `mapToBudgetCategory` ("Tiket wisata"→"Tiket", "BBQ / Grill"→"BBQ", "Oleh-oleh"/"Belanja"→"Lainnya").
- `next-env.d.ts` generated — jangan edit. Tidak ada `src/` dir.
