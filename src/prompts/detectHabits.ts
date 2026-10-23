import { ANALYTICAL_POLICY } from "./policy";
export const detectHabitsPrompt = `Analise as mensagens enviadas pela atendente durante a semana.
${ANALYTICAL_POLICY}
Procure tamanho, fragmentação, repetição, excesso de explicação, justificativa excessiva, linguagem robótica, personalização, palavras repetidas (entendo, infelizmente), escrita, pontuação, formalidade, informalidade e encerramento.
Só considere padrão quando houver pelo menos duas conversas distintas com evidências literais; informe numerador e denominador da amostra, sem extrapolar para atendimentos não analisados.
Retorne JSON: {"habitos_positivos":[],"habitos_atencao":[]}. Cada hábito inclui descrição, conversationIds, messageIds, trechos e base analisada.`;
