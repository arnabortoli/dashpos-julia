import type { WeeklySnapshot } from "./types";
export type PeriodMode =
  "week" | "previous" | "four" | "month" | "quarter" | "custom";
export interface PeriodFilter {
  mode: PeriodMode;
  week: string;
  month: string;
  quarter: string;
  start: string;
  end: string;
}
export function selectPeriod(
  snapshots: WeeklySnapshot[],
  filter: PeriodFilter,
): WeeklySnapshot[] {
  const weeks = [...new Set(snapshots.map((s) => s.week))].sort();
  if (filter.mode === "week")
    return snapshots.filter((s) => s.week === filter.week);
  if (filter.mode === "previous") {
    const idx = weeks.indexOf(filter.week);
    return snapshots.filter((s) => s.week === weeks[idx - 1]);
  }
  if (filter.mode === "four") {
    const idx = weeks.indexOf(filter.week);
    const allowed = weeks.slice(Math.max(0, idx - 3), idx + 1);
    return snapshots.filter((s) => allowed.includes(s.week));
  }
  // Semanas são agrupadas pela data de início, nunca rateadas por dia.
  if (filter.mode === "month")
    return snapshots.filter((s) => s.week.startsWith(filter.month));
  if (filter.mode === "quarter") {
    const [year, q] = filter.quarter.split("-Q");
    return snapshots.filter(
      (s) =>
        s.week.startsWith(year) &&
        Math.ceil(Number(s.week.slice(5, 7)) / 3) === Number(q),
    );
  }
  if (!filter.start || !filter.end || filter.start > filter.end) return [];
  return snapshots.filter(
    (s) => s.week >= filter.start && s.weekEnd <= filter.end,
  );
}
