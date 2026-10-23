# Arquitetura de informação

- Visão geral: semana da equipe, temas, tom, competências, padrões e destaques.
- Equipe: comparativo contextual e indicador gerencial exclusivo da coordenadora.
- Estefani, Karol, Andrea, Brislaine e Kerolaine: o mesmo componente AgentDashboard usado no perfil individual, recebendo exatamente os mesmos snapshots.
- Individual: Minha Semana, Meus Atendimentos, Minha Comunicação, Atendimentos Sensíveis, Exemplos e Minha Evolução.
- Histórico: seleção temporal e séries da equipe ou de cada atendente.
- Conversa: diálogo completo da amostra, CSAT objetivo e análise separada com referências às mensagens.

## Fluxo de dados

page (servidor) → RadarProvider → snapshots serializáveis → RadarApp → dashboards compartilhados.

Objetivo: observações numéricas/avaliações recebidas e mensagens de fixture. Calculado: duração média/mediana, médias ponderadas, distribuições, percentuais e índice. IA: temas, sensibilidade, tom, competências e feedbacks. Todas as interpretações são fixtures, sem modelo executado.

Snapshots versionados são congelados recursivamente no provider e não têm caminho de atualização na aplicação. As oito semanas são fixas em 2026. O snapshot da semana de 19/10 é parcial até 23/10 às 09h de Brasília; uma versão futura deve criar nova edição, nunca substituir esta. Intervalos selecionam snapshots completos: os totais não são rateados ou estimados por dia. A UI explicita o recorte.

Os registros agregados representam mais de 200 atendimentos por pessoa/semana. Há 12 conversas completas de demonstração por pessoa/semana (480 amostras no total). Análises de conteúdo e taxas de hábitos se referem somente às amostras, jamais ao universo agregado. CSAT e duração vêm de observações sintéticas separadas; não são inferidos por IA.

O seletor de perfil demonstra escopo de interface, não autenticação. Todos os dados são públicos e fictícios neste protótipo. Antes de dados reais, implementar autenticação e autorização no servidor, minimização, retenção e auditoria.
