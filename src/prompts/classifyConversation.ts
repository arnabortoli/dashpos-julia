import { ANALYTICAL_POLICY } from "./policy";
export const classifyConversationPrompt = `Você é um analista de atendimento do Pós-Vendas da Loumar Turismo.
${ANALYTICAL_POLICY}
Classifique tema principal (horários, transportes, fronteira, cancelamento, reembolso, ingresso, hotel, motorista, guia, alteração de passeio, documentação, reclamação, elogio, financeiro, outros), subtema, sensibilidade, gravidade textual, tom inicial, tom final e mudança de tom.
Sensibilidade: cliente muito irritado, ameaça jurídica, Reclame Aqui, acidente, discriminação, comportamento grave, pedido relevante de reembolso, cliente dizendo que foi enganado, chargeback, segurança, perda de voo, risco reputacional. Sensível não significa atendimento ruim.
Retorne JSON:
{"tema_principal":"","subtema":"","sensivel":false,"categoria_sensibilidade":null,"gravidade_conversa":"baixa","tom_inicial_cliente":"neutro","tom_final_cliente":"neutro","mudanca_tom":"estavel","observacoes":""}.
Tons permitidos: muito_negativo, negativo, neutro, positivo, muito_positivo. Mudança: melhorou, estavel, piorou. Gravidade: baixa, moderada, alta.`;
