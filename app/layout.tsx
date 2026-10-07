import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/interactive";

export const metadata: Metadata = {
  title: "GuciTrip Finance — Liburan Guci 2026",
  description: "Kelola keuangan perjalanan kelompok ke Guci, Kabupaten Tegal.",
};

// Semua halaman membaca SQLite saat request — jangan prerender statis.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <main className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-6 sm:px-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
