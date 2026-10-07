"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#047857", "#0d9488", "#0284c7", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#65a30d", "#475569", "#0f766e"];

export function ExpensePie({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-500">Belum ada pengeluaran.</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => `Rp${Number(v).toLocaleString("id-ID")}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MemberBar({ data }: { data: { name: string; dibayar: number; target: number }[] }) {
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-500">Belum ada anggota.</p>;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 24 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} angle={-25} dy={8} height={50} />
        <YAxis width={44} tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}rb`} />
        <Tooltip formatter={(v) => `Rp${Number(v).toLocaleString("id-ID")}`} />
        <Bar dataKey="dibayar" name="Dibayar" fill="#047857" radius={[6, 6, 0, 0]} />
        <Bar dataKey="target" name="Target" fill="#a7f3d0" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ul className="mt-2 space-y-1.5 text-sm">
      {data.map((d, i) => (
        <li key={d.name} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-zinc-600">
            <span className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {d.name}
          </span>
          <span className="font-semibold text-zinc-900">Rp{d.value.toLocaleString("id-ID")}</span>
        </li>
      ))}
    </ul>
  );
}
