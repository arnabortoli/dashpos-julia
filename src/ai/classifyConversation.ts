import type { ConversationAnalysis, WeeklySnapshot } from "@/domain/types";
// Integração com modelo de IA será conectada posteriormente.
export function classifyConversation(
  id: string,
  snapshots: WeeklySnapshot[],
): ConversationAnalysis | null {
  return (
    snapshots
      .flatMap((s) => s.ai.conversations)
      .find((a) => a.conversationId === id) ?? null
  );
}
