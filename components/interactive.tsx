"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  ArrowLeftRight,
  PiggyBank,
  Scale,
  Map,
  BarChart3,
  Plane,
  Settings,
  Menu,
  X,
} from "lucide-react";
import type { ActionResult } from "@/lib/actions";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Anggota", icon: Users },
  { href: "/payments", label: "Iuran", icon: Wallet },
  { href: "/expenses", label: "Pengeluaran", icon: Receipt },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Anggaran", icon: PiggyBank },
  { href: "/settlement", label: "Settlement", icon: Scale },
  { href: "/itinerary", label: "Itinerary", icon: Map },
  { href: "/reports", label: "Laporan", icon: BarChart3 },
  { href: "/trip", label: "Trip", icon: Plane },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function SubmitButton({ children, className = "btn btn-primary" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Menyimpan..." : children}
    </button>
  );
}

export function DeleteButton({ id, action, label = "Hapus" }: { id: string; action: (s: ActionResult, f: FormData) => Promise<ActionResult>; label?: string }) {
  const [state, formAction] = useActionState<ActionResult, FormData>(action, { ok: true });
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Yakin ingin menghapus data ini?")) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
        {label}
      </button>
      {state.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

export function CollapsibleForm({
  buttonLabel,
  title,
  children,
  defaultOpen = false,
}: {
  buttonLabel: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-5">
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-primary w-full sm:w-auto">
          + {buttonLabel}
        </button>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">{title}</h2>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary !px-3 !py-1.5">
              Tutup
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>;
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-emerald-700 text-white shadow-sm"
                : "text-zinc-600 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className="flex items-center gap-2 font-bold text-emerald-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">G</span>
          GuciTrip Finance
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-zinc-300 p-2 text-zinc-700"
          aria-label="Menu navigasi"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden items-center gap-2 border-b border-zinc-100 px-4 py-5 lg:flex">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">G</span>
          <div>
            <p className="font-bold leading-tight text-emerald-900">GuciTrip Finance</p>
            <p className="text-xs text-zinc-500">Keuangan perjalanan</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{links}</div>
        <p className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-400">Guci, Kabupaten Tegal</p>
      </aside>
    </>
  );
}
