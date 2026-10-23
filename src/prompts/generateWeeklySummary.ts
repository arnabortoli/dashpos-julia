import { ANALYTICAL_POLICY } from "./policy";
export const generateWeeklySummaryPrompt = `Receba métricas objetivas, cálculos, análises, CSAT recebido, comentários, hábitos e histórico anterior da atendente.
${ANALYTICAL_POLICY}
Gere panorama curto e específico, até 3 pontos fortes, até 3 oportunidades, evolução e no máximo 3 focos para a próxima semana. Cada foco deve ligar às evidências verificadas. Use linguagem humana, construtiva e sem texto corporativo genérico. Explicite tamanho da amostra e lacunas.
Retorne JSON: {"panorama":"","pontos_fortes":[],"oportunidades":[],"evolucao":"","focos_proxima_semana":[]}.`;
