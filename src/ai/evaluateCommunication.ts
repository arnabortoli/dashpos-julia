import type { WeeklySnapshot } from "@/domain/types";
// Integração com modelo de IA será conectada posteriormente.
export function evaluateCommunication(snapshot: WeeklySnapshot) {
  return snapshot.ai.weekly?.assessments ?? null;
}
