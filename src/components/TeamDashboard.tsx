"use client";
import {
  ArrowUpRight,
  TrendingUp,
  Heart,
  Focus,
  PenLine,
  Star,
  Compass,
  Sparkles,
} from "lucide-react";
import type { Agent, AgentId, WeeklySnapshot } from "@/domain/types";
import { COMPETENCIES } from "@/domain/types";
import {
  calculateMetrics,
  consensus,
  duration,
  formatNumber,
  managementIndex,
  previousPeriod,
  shortDate,
} from "@/domain/metrics";
import { MANAGEMENT_INDEX } from "@/config/managementIndex";
import {
  Panel,
  SourceBadge,
  EmptyState,
  MetricsGrid,
  TopicChart,
  ToneEvolution,
  CommunicationQuality,
  QualityIndicator,
  EvolutionChart,
  InsightCard,
  SensitiveConversationList,
  CSATComments,
  type OpenConversation,
} from "./ui";
import { generateTeamSummary } from "@/ai/generateTeamSummary";
export function TeamSummary({ snapshots }: { snapshots: WeeklySnapshot[] }) {
  const summary = generateTeamSummary(snapshots);
  return (
    <section className="team-story">
      <div className="story-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
      <div className="story-content">
        <span className="story-eyebrow">
          <Sparkles size={13} /> LEITURA DA SEMANA · ANÁLISE DA IA SIMULADA
        </span>
        <h2>
          Uma equipe que escuta.
          <br />
          Uma semana para evoluir.
        </h2>
        <p>
          {summary?.summary ??
            "Sem análise disponível neste período. Os dados objetivos continuam acessíveis."}
        </p>
        <div className="story-footer">
          <span className="mini-dot" />
          Desenvolvimento profissional, com evidências.
        </div>
      </div>
      <div className="story-side">
        <span>O OLHAR DO RADAR</span>
        <p>
          Reconhecer o que funciona.
          <br />
          Transformar padrões
          <br />
          em aprendizado.
        </p>
        <div className="story-line" />
      </div>
    </section>
  );
}
export function TeamOverview({
  agents,
  snapshots,
  history,
  onAgent,
  onOpen,
}: {
  agents: Agent[];
  snapshots: WeeklySnapshot[];
  history: WeeklySnapshot[];
  onAgent: (id: AgentId) => void;
  onOpen: OpenConversation;
}) {
  const previous = previousPeriod(snapshots, history),
    latestWeek = [...new Set(snapshots.map((s) => s.week))].sort().at(-1),
    latest = snapshots.filter((s) => s.week === latestWeek);
  const summary = generateTeamSummary(latest);
  return (
    <>
      {!snapshots.length ? (
        <EmptyState />
      ) : (
        <>
          <MetricsGrid snapshots={snapshots} previous={previous} />
          <TeamSummary snapshots={latest} />
          {snapshots.length > 5 && (
            <p className="footnote below-story">
              Resumo textual referente à semana mais recente do período; os
              números e gráficos abrangem todo o recorte selecionado.
            </p>
          )}
          <div className="section-heading">
            <div>
              <span className="eyebrow">ESCUTAR PARA ENTENDER</span>
              <h2>O que a semana está nos mostrando</h2>
            </div>
            <span className="sample-chip">
              {snapshots.reduce((n, s) => n + s.conversations.length, 0)}{" "}
              conversas de amostra
            </span>
          </div>
          <div className="two-columns dashboard-charts">
            <TopicChart snapshots={snapshots} previous={previous} />
            <ToneEvolution snapshots={snapshots} />
          </div>
          <CommunicationQuality snapshots={snapshots} />
          <div className="two-columns">
            <Panel
              title="Comportamentos para compartilhar"
              subtitle="Evidências positivas da última semana selecionada"
              kind="ai"
            >
              {latest
                .flatMap(
                  (s) =>
                    s.ai.weekly?.strengths
                      .slice(0, 1)
                      .map((i) => ({
                        ...i,
                        title: `${agents.find((a) => a.id === s.agentId)?.name} · ${i.title}`,
                      })) ?? [],
                )
                .slice(0, 3)
                .map((i) => (
                  <InsightCard insight={i} key={i.id} onOpen={onOpen} />
                ))}
            </Panel>
            <Panel
              title="O que podemos praticar juntas"
              subtitle="Sugestões de treinamento baseadas nas amostras"
              kind="ai"
            >
              {summary ? (
                <>
                  <div className="training-item">
                    <span>01</span>
                    <div>
                      <h3>O próximo passo em primeiro plano</h3>
                      <p>
                        Reescrever respostas de contexto extenso, preservando
                        acolhimento e informação essencial.
                      </p>
                    </div>
                  </div>
                  <div className="training-item">
                    <span>02</span>
                    <div>
                      <h3>Uma revisão antes do envio</h3>
                      <p>
                        Usar as evidências recorrentes de escrita para praticar
                        verbos e acentos sem transformar um erro isolado em
                        crítica.
                      </p>
                    </div>
                  </div>
                  <p className="footnote">
                    Sugestões simuladas para desenvolvimento, sem atribuir
                    falhas operacionais às atendentes.
                  </p>
                </>
              ) : (
                <EmptyState title="Sem análise disponível" />
              )}
            </Panel>
          </div>
          <AgentComparisonTable
            agents={agents}
            snapshots={snapshots}
            history={history}
            onAgent={onAgent}
          />
          <WeeklyHighlights
            agents={agents}
            snapshots={latest}
            history={history}
            onAgent={onAgent}
          />
          <CSATComments snapshots={snapshots} onOpen={onOpen} />
          <SensitiveConversationList snapshots={snapshots} onOpen={onOpen} />
        </>
      )}
    </>
  );
}
export function AgentComparisonTable({
  agents,
  snapshots,
  history,
  onAgent,
  showIndex = false,
}: {
  agents: Agent[];
  snapshots: WeeklySnapshot[];
  history: WeeklySnapshot[];
  onAgent: (id: AgentId) => void;
  showIndex?: boolean;
}) {
  return (
    <Panel
      title="Cada pessoa, uma contribuição"
      subtitle="Comparativo contextual para a coordenação. Volume e tempo não definem qualidade."
      kind="calculated"
    >
      <div className="table-scroll">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Atendente</th>
              <th>Atendimentos</th>
              <th>Tempo médio</th>
              <th>CSAT</th>
              <th>Comunicação · IA</th>
              <th>Principal força · IA</th>
              <th>Principal foco · IA</th>
              {showIndex && <th>Índice interno</th>}
              <th />
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const selected = snapshots.filter((s) => s.agentId === agent.id),
                m = calculateMetrics(selected),
                last = [...selected].sort((a, b) =>
                  b.week.localeCompare(a.week),
                )[0],
                weekly = last?.ai.weekly;
              const strong = weekly?.assessments.find(
                (a) => a.level === "Excelente",
              );
              const index = showIndex
                ? managementIndex(
                    selected,
                    history.filter((s) => s.agentId === agent.id),
                  )
                : null;
              return (
                <tr key={agent.id}>
                  <td>
                    <button
                      className="agent-table-name"
                      onClick={() => onAgent(agent.id)}
                    >
                      <span
                        className="avatar"
                        style={{
                          color: agent.color,
                          background: agent.color + "15",
                        }}
                      >
                        {agent.initials}
                      </span>
                      <strong>{agent.name}</strong>
                    </button>
                  </td>
                  <td>{selected.length ? formatNumber(m.total) : "—"}</td>
                  <td>{duration(m.averageSeconds)}</td>
                  <td>
                    {m.csatAverage === null
                      ? "Sem CSAT"
                      : formatNumber(m.csatAverage, 2)}
                  </td>
                  <td>
                    <QualityIndicator level={consensus(selected, "Clareza")} />
                    <small className="cell-secondary">
                      Clareza · ver demais no perfil
                    </small>
                  </td>
                  <td>{strong?.competency ?? "Sem análise"}</td>
                  <td className="focus-cell">
                    {weekly?.improvements[0]?.title ?? "Sem análise"}
                  </td>
                  {showIndex && (
                    <td>
                      {index ? (
                        <strong>
                          {formatNumber(index.score, 1)}
                          <small> / 100</small>
                        </strong>
                      ) : (
                        <span title="É necessário CSAT, análise e base histórica de comparação.">
                          Base insuficiente
                        </span>
                      )}
                    </td>
                  )}
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Ver dashboard de ${agent.name}`}
                      onClick={() => onAgent(agent.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showIndex && (
        <div className="index-disclaimer">
          <h3>Indicador de apoio à gestão · experimental e privado</h3>
          <p>
            Não é uma verdade absoluta nem um ranking. Não usa reclamações,
            sensibilidade, tempo ou problemas operacionais. Sem CSAT ou
            histórico suficiente, o índice não é calculado.
          </p>
          <details>
            <summary>Como o índice é calculado?</summary>
            <p>
              CSAT {MANAGEMENT_INDEX.weights.csat * 100}% · Comunicação{" "}
              {MANAGEMENT_INDEX.weights.communication * 100}% · Consistência{" "}
              {MANAGEMENT_INDEX.weights.consistency * 100}% · Volume normalizado{" "}
              {MANAGEMENT_INDEX.weights.volume * 100}% · Evolução{" "}
              {MANAGEMENT_INDEX.weights.evolution * 100}%.
            </p>
            <p>
              CSAT: média / 5 × 100. Comunicação: média de categorias
              convertidas em 20, 40, 60, 80 ou 100, somente para este índice.
              Consistência: 100 menos a amplitude das médias semanais de
              comunicação, nas últimas 4 semanas até o recorte. Volume: média
              semanal / meta de {MANAGEMENT_INDEX.volumeTarget}, limitada a
              100%. Evolução: 50 + duas vezes a variação de comunicação frente
              ao período anterior, limitada entre 0 e 100. Pesos em
              src/config/managementIndex.ts.
            </p>
          </details>
        </div>
      )}
    </Panel>
  );
}
function WeeklyHighlights({
  agents,
  snapshots,
  history,
  onAgent,
}: {
  agents: Agent[];
  snapshots: WeeklySnapshot[];
  history: WeeklySnapshot[];
  onAgent: (id: AgentId) => void;
}) {
  const icons = [TrendingUp, Heart, Compass, Focus, PenLine, Star];
  const categories = [
    { title: "Maior evolução", key: "evolution" },
    { title: "Melhor acolhimento", key: "Acolhimento" },
    { title: "Melhor clareza", key: "Clareza" },
    { title: "Melhor objetividade", key: "Objetividade" },
    { title: "Melhor escrita", key: "Escrita" },
    { title: "Melhor CSAT", key: "csat" },
  ];
  const value = (id: AgentId, key: string) => {
    const selected = snapshots.filter((s) => s.agentId === id);
    if (key === "csat") return calculateMetrics(selected).csatAverage ?? -1;
    if (key === "evolution") {
      const prev = previousPeriod(
        selected,
        history.filter((s) => s.agentId === id),
      );
      const score = (rows: WeeklySnapshot[]) =>
        rows.flatMap(
          (s) =>
            s.ai.weekly?.assessments.map((a) =>
              [
                "Precisa evoluir",
                "Atenção",
                "Bom",
                "Muito bom",
                "Excelente",
              ].indexOf(a.level),
            ) ?? [],
        );
      const cur = score(selected),
        before = score(prev);
      return cur.length && before.length
        ? cur.reduce((a, b) => a + b) / cur.length -
            before.reduce((a, b) => a + b) / before.length
        : -999;
    }
    const level = consensus(selected, key as (typeof COMPETENCIES)[number]);
    return level
      ? ["Precisa evoluir", "Atenção", "Bom", "Muito bom", "Excelente"].indexOf(
          level,
        )
      : -1;
  };
  return (
    <Panel
      title="Há muitas formas de fazer a diferença"
      subtitle="Reconhecimentos da última semana selecionada. Empates são compartilhados; não há uma única vencedora."
    >
      <div className="highlights-grid">
        {categories.map((category, i) => {
          const Icon = icons[i],
            values = agents.map((a) => ({
              a,
              value: value(a.id, category.key),
            })),
            max = Math.max(...values.map((v) => v.value));
          return (
            <article className="highlight" key={category.title}>
              <Icon size={21} />
              <SourceBadge
                kind={category.key === "csat" ? "calculated" : "ai"}
              />
              <span>{category.title}</span>
              <div>
                {max < 0 ? (
                  <strong>Base insuficiente</strong>
                ) : (
                  values
                    .filter((v) => Math.abs(v.value - max) < 0.0001)
                    .map(({ a }) => (
                      <button key={a.id} onClick={() => onAgent(a.id)}>
                        {a.name}
                        <ArrowUpRight size={12} />
                      </button>
                    ))
                )}
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
export function HistoryDashboard({
  agents,
  snapshots,
  history,
  onAgent,
}: {
  agents: Agent[];
  snapshots: WeeklySnapshot[];
  history: WeeklySnapshot[];
  onAgent: (id: AgentId) => void;
}) {
  return (
    <>
      <div className="notice history-notice">
        <HistoryIcon />
        <p>
          Cada semana preserva uma edição imutável. Selecione semana, mês,
          trimestre ou intervalo no filtro acima. Os gráficos exibem o recorte
          selecionado, sem estimar dados fora dele.
        </p>
      </div>
      <EvolutionChart snapshots={snapshots} />
      <AgentComparisonTable
        agents={agents}
        snapshots={snapshots}
        history={history}
        onAgent={onAgent}
      />
      <Panel
        title="Registro de snapshots"
        subtitle="Edições preservadas · dados inteiramente simulados"
        kind="objective"
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Semana</th>
                <th>Edições</th>
                <th>Estado</th>
                <th>Capturado em · Brasília</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set(snapshots.map((s) => s.week))]
                .sort()
                .reverse()
                .map((w) => {
                  const rows = snapshots.filter((s) => s.week === w);
                  return (
                    <tr key={w}>
                      <td>
                        {shortDate(w)} a {shortDate(rows[0].weekEnd)}
                      </td>
                      <td>
                        {rows.length} atendentes · v{rows[0].version}
                      </td>
                      <td>
                        <span className="quality quality-good">
                          {rows[0].partial
                            ? "Parcial preservado"
                            : "Semana fechada"}
                        </span>
                      </td>
                      <td>
                        {new Date(rows[0].capturedAt).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function HistoryIcon() {
  return <TrendingUp size={20} />;
}
