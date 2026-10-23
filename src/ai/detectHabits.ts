import type { WeeklySnapshot } from "@/domain/types";
// Integração com modelo de IA será conectada posteriormente.
export function detectHabits(snapshot: WeeklySnapshot) {
  return (
    snapshot.ai.weekly?.habits.filter(
      (h) => new Set(h.evidence.map((e) => e.conversationId)).size >= 2,
    ) ?? null
  );
}
