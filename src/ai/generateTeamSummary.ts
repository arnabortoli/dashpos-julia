import type { WeeklySnapshot } from "@/domain/types";
// Integração com modelo de IA será conectada posteriormente.
// Resposta editorial simulada, habilitada somente quando há análises no recorte.
export function generateTeamSummary(snapshots: WeeklySnapshot[]) {
  if (!snapshots.some((s) => s.ai.weekly)) return null;
  return {
    summary:
      "Nas amostras da semana, o acolhimento e as perguntas antes de concluir são pontos para compartilhar. As oportunidades aparecem na apresentação do próximo passo e na revisão da escrita. O foco é como conduzimos a conversa — sem atribuir à equipe os problemas relatados pelos clientes.",
    training: [
      "Praticar a apresentação do próximo passo",
      "Revisar verbos e acentos nas respostas",
    ],
    source: "mock" as const,
  };
}
