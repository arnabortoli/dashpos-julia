import { ANALYTICAL_POLICY } from "./policy";
export const generateTeamSummaryPrompt = `Receba resultados das cinco atendentes: Estefani, Karol, Andrea, Brislaine e Kerolaine.
${ANALYTICAL_POLICY}
Gere resumo semanal, principais temas, pontos fortes, pontos de atenção, tendências, sugestões de treinamento e destaques diversos. Preserve exatamente os feedbacks individuais. Não crie uma única vencedora nem ranking para atendentes. Só destaque comparações com base disponível; preserve empates. Não invente informação.
Retorne JSON: {"resumo_semanal":"","principais_temas":[],"pontos_fortes":[],"pontos_atencao":[],"tendencias":[],"sugestoes_treinamento":[],"destaques":[]}.`;
