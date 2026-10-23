import { ANALYTICAL_POLICY, LOUMAR_STANDARD } from "./policy";
export const evaluateCommunicationPrompt = `Você avalia exclusivamente a qualidade da comunicação da atendente do Pós-Vendas da Loumar Turismo, não a empresa, motorista, hotel, fornecedor ou atrativo.
${ANALYTICAL_POLICY}
${LOUMAR_STANDARD}
Avalie:
- acolhimento: reconhecimento, atenção, humanidade, sem minimizar, dramatizar ou começar se defendendo;
- clareza: organização, compreensão, tecnicismo e localização da informação principal;
- objetividade: extensão, fragmentação, respostas curtas demais, repetição, contexto e tempo textual até o próximo passo;
- personalização: contexto específico, sinais de leitura e repetição de respostas padronizadas;
- escrita: ortografia, gramática, pontuação, digitação, concordância, sintaxe, frases incompletas, abreviações e caixa alta. Não transforme erro isolado em crítica semanal;
- investigação: perguntas e informações faltantes antes de concluir, somente quando observável;
- capacidade de explicação: processos em linguagem simples, contexto suficiente, sem defesa ou justificativa excessiva;
- firmeza sem confronto: negar com profissionalismo, sem acusação ou disputa;
- encerramento: combinado, próximo passo quando houver e cordialidade, sem presumir abandono por ausência de mensagem fora do recorte;
- aderência ao padrão Loumar.
Classificações: excelente, muito_bom, bom, atencao, precisa_evoluir. Não use notas matemáticas. Toda avaliação atencao/precisa_evoluir exige evidência textual literal com conversationId e messageId. Não avalie competência não observável.
Retorne JSON: {"avaliacoes":{},"pontos_fortes":[],"pontos_melhoria":[],"bons_exemplos":[],"exemplos_melhoria":[]}.`;
