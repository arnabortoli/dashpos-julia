import { MANAGEMENT_INDEX as CONFIG } from "@/config/managementIndex";
import {
  COMPETENCIES,
  QUALITY_LEVELS,
  TONES,
  type CalculatedMetrics,
  type Competency,
  type Quality,
  type WeeklySnapshot,
} from "./types";
export function calculateMetrics(
  snapshots: WeeklySnapshot[],
): CalculatedMetrics {
  const durations = snapshots
    .flatMap((s) => s.objective.durationsSeconds)
    .sort((a, b) => a - b);
  const ratings = snapshots.flatMap((s) => s.objective.ratings);
  const middle = Math.floor(durations.length / 2);
  return {
    total: snapshots.reduce((n, s) => n + s.objective.totalConversations, 0),
    averageSeconds: durations.length
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : null,
    medianSeconds: durations.length
      ? durations.length % 2
        ? durations[middle]
        : (durations[middle - 1] + durations[middle]) / 2
      : null,
    csatAverage: ratings.length
      ? ratings.reduce((n, r) => n + r.score, 0) / ratings.length
      : null,
    csatResponses: ratings.length,
    csatDistribution: [1, 2, 3, 4, 5].map(
      (score) => ratings.filter((r) => r.score === score).length,
    ),
  };
}
export const formatNumber = (n: number | null, digits = 0) =>
  n === null
    ? "Indisponível"
    : n.toLocaleString("pt-BR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
export function duration(seconds: number | null) {
  if (seconds === null) return "Indisponível";
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}
export function shortDate(date: string) {
  return new Date(date.slice(0, 10) + "T12:00:00Z")
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: "America/Sao_Paulo",
    })
    .replace(".", "");
}
export function weekLabel(week: string) {
  return `${shortDate(week)} — ${shortDate(new Date(new Date(week + "T12:00:00Z").getTime() + 6 * 86400000).toISOString())}`;
}
export function previousPeriod(
  selected: WeeklySnapshot[],
  all: WeeklySnapshot[],
) {
  const weeks = [...new Set(selected.map((s) => s.week))].sort();
  if (!weeks.length) return [];
  const first = new Date(weeks[0] + "T00:00:00Z").getTime(),
    span = weeks.length * 7 * 86400000;
  const ids = new Set(selected.map((s) => s.agentId));
  const result = all.filter(
    (s) =>
      ids.has(s.agentId) &&
      new Date(s.week + "T00:00:00Z").getTime() >= first - span &&
      s.week < weeks[0],
  );
  return result.length === weeks.length * ids.size ? result : [];
}
export function topics(snapshots: WeeklySnapshot[]) {
  const all = snapshots.flatMap((s) => s.ai.conversations);
  const counts = new Map<string, number>();
  all.forEach((a) => counts.set(a.topic, (counts.get(a.topic) ?? 0) + 1));
  return [...counts]
    .map(([name, count]) => ({
      name,
      count,
      percent: all.length ? (count / all.length) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
export function consensus(
  snapshots: WeeklySnapshot[],
  competency: Competency,
): Quality | null {
  const levels = snapshots.flatMap(
    (s) =>
      s.ai.weekly?.assessments
        .filter((a) => a.competency === competency)
        .map((a) => a.level) ?? [],
  );
  if (!levels.length) return null;
  // Moda das categorias; desempate conservador. Não é uma nota da atendente.
  return [...QUALITY_LEVELS].sort(
    (a, b) =>
      levels.filter((l) => l === b).length -
        levels.filter((l) => l === a).length ||
      QUALITY_LEVELS.indexOf(a) - QUALITY_LEVELS.indexOf(b),
  )[0];
}
export function toneStats(snapshots: WeeklySnapshot[]) {
  const negatives = snapshots
    .flatMap((s) => s.ai.conversations)
    .filter((a) => TONES.indexOf(a.initialTone) < 2);
  return {
    total: negatives.length,
    improved: negatives.filter((a) => a.toneChange === "Melhorou").length,
    stable: negatives.filter((a) => a.toneChange === "Estável").length,
    worsened: negatives.filter((a) => a.toneChange === "Piorou").length,
    final: TONES.map((tone) => ({
      tone,
      count: negatives.filter((a) => a.finalTone === tone).length,
    })),
  };
}
export function managementIndex(
  selected: WeeklySnapshot[],
  history: WeeklySnapshot[],
) {
  const metric = calculateMetrics(selected);
  const qualities = selected.flatMap(
    (s) =>
      s.ai.weekly?.assessments.map((a) => CONFIG.qualityValues[a.level]) ?? [],
  );
  const weeks = new Set(selected.map((s) => s.week)).size;
  if (!selected.length || metric.csatAverage === null || !qualities.length)
    return null;
  const communication = qualities.reduce((a, b) => a + b, 0) / qualities.length;
  const latestWeek = [...selected]
    .map((s) => s.week)
    .sort()
    .at(-1)!;
  const agentIds = new Set(selected.map((s) => s.agentId));
  const recent = history
    .filter((s) => agentIds.has(s.agentId) && s.week <= latestWeek)
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-4);
  const weekly = recent
    .filter((s) => s.ai.weekly)
    .map(
      (s) =>
        s.ai.weekly!.assessments.reduce(
          (n, a) => n + CONFIG.qualityValues[a.level],
          0,
        ) / COMPETENCIES.length,
    );
  // Consistência: 100 menos a amplitude entre médias semanais disponíveis.
  const consistency =
    weekly.length > 1
      ? 100 - (Math.max(...weekly) - Math.min(...weekly))
      : null;
  const previous = previousPeriod(selected, history);
  const prevQuality = previous.flatMap(
    (s) =>
      s.ai.weekly?.assessments.map((a) => CONFIG.qualityValues[a.level]) ?? [],
  );
  const evolution = prevQuality.length
    ? Math.max(
        0,
        Math.min(
          100,
          50 +
            2 *
              (communication -
                prevQuality.reduce((a, b) => a + b, 0) / prevQuality.length),
        ),
      )
    : null;
  // Sem série suficiente, omitir o índice em vez de inventar consistência/evolução.
  if (consistency === null || evolution === null) return null;
  const parts = {
    csat: (metric.csatAverage / 5) * 100,
    communication,
    consistency,
    volume: Math.min(100, (metric.total / weeks / CONFIG.volumeTarget) * 100),
    evolution,
  };
  const score = Object.entries(parts).reduce(
    (n, [key, val]) => n + val * CONFIG.weights[key as keyof typeof parts],
    0,
  );
  return { score, parts };
}
export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

/** Número ISO da semana, calculado em UTC para não variar com o navegador. */
export function isoWeek(date: string) {
  const day = new Date(date + "T12:00:00Z");
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.ceil(((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
