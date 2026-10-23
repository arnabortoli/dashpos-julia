# Validação da primeira versão

Executada no ambiente de desenvolvimento em 23/10/2026, com Node.js 24.19.0 e Chromium do sistema.

- Instalação reproduzida com `npm ci`, usando o lockfile sem alterações nas dependências.
- `npm run typecheck`: passou.
- `npm test`: 12 testes passaram, cobrindo dados, evidências literais, recorrência de hábitos, cutoff de snapshots, cálculos ponderados, períodos, índice e formatos de exportação.
- `npm run build`: build otimizada concluída.
- `npm run test:e2e`: 10 testes passaram no Chromium, cobrindo os seis dashboards, todas as abas individuais, igualdade de feedbacks entre os perfis, filtros de período, busca, conversas, estados, índice privado e exportações CSV/XLSX/PDF.
- Revisão visual: panorama, equipe, cinco perfis, histórico, comunicação, lista de atendimentos, sensíveis, exemplos, evolução e conversa em modal.
- Responsividade: sem transbordamento global em larguras de 1440, 1024, 768 e 390 pixels. Tabelas extensas mantêm rolagem própria.

Os testes e a revisão se referem à demonstração com fixtures. Não validam integração Loumaria, modelo de IA, autenticação, autorização corporativa, persistência durável ou publicação em produção, que não fazem parte desta versão.

As capturas e o relatório E2E são gerados em `test-results/` e `playwright-report/`, ignorados pelo Git. Consulte `npm run test:e2e` para reproduzir.
