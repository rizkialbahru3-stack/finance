export type MemberPayInfo = {
  id: string;
  name: string;
  targetContribution: number;
  totalPaid: number;
};

export type MemberSettleInfo = MemberPayInfo & {
  obligation: number;
  balance: number;
  shortage: number;
};

export function calcMemberPaid(payments: { amount: number }[]): number {
  return payments.reduce((s, p) => s + p.amount, 0);
}

/** Ringkasan dashboard dari data mentah database. */
export function calcSummary(
  members: MemberPayInfo[],
  totalExpense: number
) {
  const totalTarget = members.reduce((s, m) => s + m.targetContribution, 0);
  const totalTerkumpul = members.reduce((s, m) => s + m.totalPaid, 0);
  const saldo = totalTerkumpul - totalExpense;
  const kekurangan = members.reduce(
    (s, m) => s + Math.max(0, m.targetContribution - m.totalPaid),
    0
  );
  const lunas = members.filter((m) => m.totalPaid >= m.targetContribution).length;
  const progress = totalTarget > 0 ? Math.round((totalTerkumpul / totalTarget) * 100) : 0;
  return {
    totalTarget,
    totalTerkumpul,
    totalExpense,
    saldo,
    kekurangan,
    lunas,
    belumLunas: members.length - lunas,
    progress,
  };
}

/** Bagi nominal secara merata; sisa rupiah dibagikan ke anggota awal. */
export function splitEqually(total: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(total / count);
  const rest = total - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < rest ? 1 : 0));
}
