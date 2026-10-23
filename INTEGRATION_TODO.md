# Integração futura — Radar / Loumaria

Esta versão **não acessa a Loumaria nem executa modelos de IA**. Todos os registros, notas e análises são fictícios. Não há credenciais, requisições externas, webhook, SSO, banco corporativo ou sincronização implementados.

Referência fornecida pela Loumar, para revisão futura pela equipe técnica: https://flwchat.readme.io/reference/autentica%C3%A7%C3%A3o. Este projeto não presume o conteúdo, as rotas nem os contratos dessa documentação.

## Validar com a equipe técnica

- [ ] Método real de autenticação Loumaria, escopos, expiração e renovação, armazenamento seguro e ambiente de testes.
- [ ] Contratos documentados para obter conversas, mensagens, usuários/atendentes e avaliações CSAT (não há nomes de endpoints presumidos).
- [ ] Identificadores estáveis das cinco atendentes e regras de atribuição quando uma conversa troca de pessoa.
- [ ] Timestamps, timezone, horário útil, início/fim, mensagens do sistema, pausas e definições de duração/mediana.
- [ ] Escala e disponibilidade de CSAT, identificação da conversa, respostas duplicadas e comentários.
- [ ] Paginação, limites de uso, permissões de leitura, erros e estratégia de retentativa.
- [ ] Disponibilidade do histórico e limites para backfill; não preencher lacunas com mocks.
- [ ] Cadência de sincronização e fechamento semanal em America/Sao_Paulo.
- [ ] Versionamento de snapshots em armazenamento persistente, trilha de auditoria, cutoff, proibição de sobrescrita e publicação de novas edições.
- [ ] Autenticação dos usuários do Radar e autorização **no servidor**: atendente só consulta seu próprio escopo; Júlia consulta a equipe. O seletor atual apenas demonstra os perfis, e todos os dados fictícios são enviados ao navegador.
- [ ] Minimização e anonimização de dados, retenção, consentimentos/obrigações aplicáveis, revisão de acesso e registros de auditoria.
- [ ] Contratos internos de IA, modelo, processamento seguro, revisão humana, custo e limites. Não enviar mensagens reais antes dessa definição.
- [ ] Validar respostas de IA contra schema e mensagens de origem: referências exatas, nenhuma crítica sem evidência e nenhum hábito sem duas conversas distintas.
- [ ] Calibrar rubrica Loumar e índice com a coordenação. A conversão numérica só existe no índice privado experimental, nunca nas competências das atendentes.
- [ ] Definir tratamento de dados ausentes e amostras insuficientes, sem trocar indisponível por zero.
- [ ] Exportações institucionais PDF/XLSX e regras de acesso. Hoje o PDF usa impressão do navegador e as planilhas exportam métricas do recorte visível.
- [ ] Hospedagem, segurança, monitoramento e deploy corporativo em tarefa separada.

## Pontos de extensão existentes

1. Implementar `RadarProvider` em `src/data/providers/loumariaProvider.ts`, com mapeamento validado para os tipos de domínio.
2. Trocar apenas a composição de provider em `src/data/providers/index.ts`. A UI não importa fixtures.
3. Conectar os cinco módulos de `src/ai/` aos contratos aprovados, usando os prompts em `src/prompts/`.
4. Persistir snapshots versionados. Não usar o congelamento de fixtures em memória como substituto de persistência/auditoria.
5. Manter a separação entre `objective`, métricas calculadas em `src/domain/metrics.ts` e `ai`. CSAT não é análise de IA.
6. Manter `AgentDashboard` compartilhado entre Júlia e o perfil individual para evitar versões divergentes dos feedbacks.

Não usar dados reais nesta demonstração antes de implementar autorização, persistência e os contratos acima.
