# Radar de Atendimento · Pós-Vendas Loumar

Aplicação interna de demonstração para desenvolvimento profissional e qualidade de atendimento. Dashboard da Júlia e dashboards reutilizados por Estefani, Karol, Andrea, Brislaine e Kerolaine. **100% dos dados são simulados. Sem integração Loumaria ou IA real.**

## Executar

Requer Node.js 22.9+ (ambiente validado com Node 24) e npm.

```sh
npm ci
npm run dev
```

A aplicação usa a porta 3000. Para a versão otimizada:

```sh
npm run build
npm start
```

Não há variáveis de ambiente, tokens ou serviços externos necessários.

## Verificações

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Os testes de navegador usam Chromium do sistema em `/usr/bin/chromium`; para outro caminho, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Em uma máquina sem navegador, instale Chromium com o mecanismo do sistema ou Playwright e ajuste o caminho. O teste E2E inicia a aplicação de desenvolvimento na porta 3100.

## O que explorar

- Visão geral: métricas com origem identificada, panorama, assuntos, tom, competências, comparativo, destaques, CSAT e sensíveis.
- Equipe: comparativo e fórmula gerencial privada, configurável em `src/config/managementIndex.ts`. Sem ranking para atendentes.
- Cada pessoa: Minha Semana, Meus Atendimentos, Minha Comunicação, Atendimentos Sensíveis, Exemplos e Minha Evolução.
- Seletor de perfil: demonstra o escopo da interface. **Não implementa autenticação nem segurança de dados.** Os mesmos snapshots e componente individual apresentam os mesmos feedbacks para Júlia e para a atendente.
- Filtros: semana atual/anterior, últimas 4 semanas, mês, trimestre e intervalo personalizado. Meses/trimestres agrupam pelo início da semana; intervalo personalizado inclui apenas semanas inteiras contidas no recorte. Não há rateio de agregações por dia.
- Histórico: 8 semanas de 31/08 a 25/10/2026. A última edição é parcial, capturada em 23/10 às 09h de Brasília. Dados fixos e reproduzíveis, sem atualização pelo relógio.
- Amostras: 12 conversas completas por pessoa/semana, 480 no total; mais de 200 atendimentos por pessoa/semana nos agregados. As taxas de padrões/sensibilidade/temas se referem à amostra, não ao volume agregado.
- Exportações: CSV e XLSX reais de métricas por pessoa/semana, restritos ao recorte visível; PDF pela impressão da visão atual no navegador.
- Rodapé: alternância explícita para demonstrar vazio, erro, sem CSAT, sem sensíveis e sem análise. O carregamento inicial tem estado próprio.

## Estrutura

```text
src/app/             Next.js, página servidor, loading/error e estilos
src/components/      dashboards e componentes compartilhados
src/domain/          tipos, cálculos, períodos e exportações
src/config/          pesos e critérios do índice experimental
src/data/providers/  contrato abstrato, mock e adaptador Loumaria pendente
src/data/fixtures.ts  snapshots determinísticos e congelados
src/ai/              interfaces funcionais com resultados simulados
src/prompts/         prompts, política de confiabilidade e padrão Loumar
tests/               testes de domínio e navegação
```

A arquitetura de informação e as decisões de agregação estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). A lista de requisitos para os programadores está em [INTEGRATION_TODO.md](INTEGRATION_TODO.md).

## Limites do protótipo

Nenhum registro real, integração, credencial, autenticação, SSO, webhook, sincronização, envio de mensagem, alteração na Loumaria ou deploy corporativo. Snapshots são fixtures imutáveis em memória e no código versionado; persistência durável, autorização e auditoria precisam ser implementadas antes de qualquer dado real.
