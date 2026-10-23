"use client";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  Sparkles,
  ArrowUpRight as ExternalArrow,
  MessageSquareText,
  X,
  Check,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  Conversation,
  ConversationAnalysis,
  Evidence,
  Insight,
  Quality,
  WeeklySnapshot,
} from "@/domain/types";
import {
  duration,
  formatNumber,
  shortDate,
  calculateMetrics,
  consensus,
  topics,
  toneStats,
} from "@/domain/metrics";
import { COMPETENCIES } from "@/domain/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
export type OpenConversation = (id: string) => void;
export function SourceBadge({
  kind,
}: {
  kind: "objective" | "calculated" | "ai";
}) {
  const data = {
    objective: ["Dado objetivo", "dot-objective"],
    calculated: ["Dado calculado", "dot-calculated"],
    ai: ["Análise da IA", "dot-ai"],
  }[kind];
  return (
    <span className={`source ${data[1]}`}>
      {kind === "ai" ? <Sparkles size={11} /> : <span className="source-dot" />}
      {data[0]}
    </span>
  );
}
export function EmptyState({
  title = "Nenhum atendimento neste recorte",
  text = "Escolha outra semana ou amplie o período para consultar os snapshots disponíveis.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty-state">
      <Info size={25} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function MetricCard({
  label,
  value,
  previous,
  current,
  kind,
  unit = "",
  hint,
}: {
  label: string;
  value: string;
  previous?: number | null;
  current?: number | null;
  kind: "objective" | "calculated" | "ai";
  unit?: string;
  hint?: string;
}) {
  const delta =
    previous !== undefined &&
    previous !== null &&
    current !== null &&
    current !== undefined
      ? current - previous
      : null;
  return (
    <article className="metric-card">
      <SourceBadge kind={kind} />
      <h3>{label}</h3>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="metric-foot">
        {delta === null ? (
          <span>{hint ?? "Sem comparação disponível"}</span>
        ) : (
          <>
            <span
              className={`delta ${Math.abs(delta) < 0.001 ? "neutral" : delta > 0 ? "up" : "down"}`}
            >
              {Math.abs(delta) < 0.001 ? (
                <Minus size={13} />
              ) : delta > 0 ? (
                <ArrowUpRight size={13} />
              ) : (
                <ArrowDownRight size={13} />
              )}{" "}
              {unit === " / 5"
                ? formatNumber(Math.abs(delta), 2)
                : label.includes("Tempo") || label === "Mediana"
                  ? duration(Math.abs(delta))
                  : formatNumber(Math.abs(delta))}
            </span>
            <span>vs. período anterior</span>
          </>
        )}
      </div>
    </article>
  );
}
export function MetricsGrid({
  snapshots,
  previous,
}: {
  snapshots: WeeklySnapshot[];
  previous: WeeklySnapshot[];
}) {
  const m = calculateMetrics(snapshots),
    p = calculateMetrics(previous),
    has = previous.length > 0;
  const ai = snapshots.flatMap((s) => s.ai.conversations);
  return (
    <>
      <div className="metrics-grid">
        <MetricCard
          label="Atendimentos"
          value={formatNumber(m.total)}
          current={m.total}
          previous={has ? p.total : null}
          kind={snapshots.length === 1 ? "objective" : "calculated"}
        />
        <MetricCard
          label="Tempo médio"
          value={duration(m.averageSeconds)}
          current={m.averageSeconds}
          previous={has ? p.averageSeconds : null}
          kind="calculated"
        />
        <MetricCard
          label="Mediana"
          value={duration(m.medianSeconds)}
          current={m.medianSeconds}
          previous={has ? p.medianSeconds : null}
          kind="calculated"
        />
        <MetricCard
          label="CSAT médio"
          value={formatNumber(m.csatAverage, 2)}
          unit={m.csatAverage === null ? "" : " / 5"}
          current={m.csatAverage}
          previous={has ? p.csatAverage : null}
          kind="calculated"
          hint="Sem avaliações neste período"
        />
        <MetricCard
          label="Avaliações recebidas"
          value={formatNumber(m.csatResponses)}
          current={m.csatResponses}
          previous={has ? p.csatResponses : null}
          kind={snapshots.length === 1 ? "objective" : "calculated"}
        />
        <MetricCard
          label="Sensíveis na amostra"
          value={
            ai.length
              ? formatNumber(ai.filter((a) => a.sensitive).length)
              : "Indisponível"
          }
          kind="ai"
          hint={
            ai.length
              ? `de ${ai.length} conversas analisadas`
              : "Sem análise disponível"
          }
        />
      </div>
      <p className="metrics-note">
        Totais agregados são calculados a partir dos registros objetivos. As
        comparações indicam variação, sem julgar produtividade ou duração.
        Sensibilidade descreve o assunto; não significa atendimento ruim.
      </p>
    </>
  );
}
export function Panel({
  title,
  subtitle,
  kind,
  children,
  className = "",
  action,
}: {
  title: string;
  subtitle?: string;
  kind?: "objective" | "calculated" | "ai";
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          {kind && <SourceBadge kind={kind} />}
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function QualityIndicator({ level }: { level: Quality | null }) {
  return (
    <span
      className={`quality quality-${level === "Excelente" ? "excellent" : level === "Muito bom" ? "great" : level === "Bom" ? "good" : level === "Atenção" ? "attention" : level === "Precisa evoluir" ? "needs" : "none"}`}
    >
      <span />
      {level ?? "Sem análise"}
    </span>
  );
}
export function TopicChart({
  snapshots,
  previous,
}: {
  snapshots: WeeklySnapshot[];
  previous: WeeklySnapshot[];
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = topics(snapshots),
    prev = topics(previous);
  return (
    <Panel
      title="O que trouxe os clientes até nós?"
      subtitle="Temas identificados no conteúdo das amostras"
      kind="ai"
    >
      {!rows.length ? (
        <EmptyState title="Sem classificação de assuntos" />
      ) : (
        <>
          <div className="topic-list">
            {(expanded ? rows : rows.slice(0, 6)).map((row, i) => {
              const before = prev.find((p) => p.name === row.name);
              return (
                <div className="topic-row" key={row.name}>
                  <div className="topic-label">
                    <span>{row.name}</span>
                    <span>
                      <b>{row.count}</b>
                      <small>{formatNumber(row.percent)}%</small>
                    </span>
                  </div>
                  <div className="topic-track">
                    <div
                      style={{
                        width: `${row.percent}%`,
                        background:
                          i === 0 ? "#173D59" : i === 1 ? "#6C5CE7" : "#A7B7C3",
                      }}
                    />
                  </div>
                  <span className="topic-change">
                    {before
                      ? `${row.percent - before.percent >= 0 ? "+" : ""}${formatNumber(row.percent - before.percent, 1)} p.p. vs. período anterior`
                      : "Sem base anterior para este tema"}
                  </span>
                </div>
              );
            })}
          </div>
          {rows.length > 6 && (
            <button
              className="text-link topic-toggle"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded
                ? "Mostrar principais assuntos"
                : `Ver todos os ${rows.length} assuntos`}{" "}
              <ExternalArrow size={12} />
            </button>
          )}
          <p className="footnote">
            Base: {snapshots.reduce((n, s) => n + s.ai.conversations.length, 0)}{" "}
            conversas com classificação simulada. Um tema principal por
            conversa.
          </p>
        </>
      )}
    </Panel>
  );
}
export function ToneEvolution({ snapshots }: { snapshots: WeeklySnapshot[] }) {
  const s = toneStats(snapshots);
  return (
    <Panel
      title="O tom mudou durante a conversa?"
      subtitle="Evolução textual do cliente nas amostras"
      kind="ai"
    >
      {!s.total ? (
        <EmptyState
          title="Sem conversas inicialmente negativas"
          text="Não há base para esta análise no período selecionado."
        />
      ) : (
        <>
          <div className="tone-head">
            <div className="tone-number">
              {formatNumber(((s.improved + s.stable) / s.total) * 100)}
              <span>%</span>
            </div>
            <p>
              das conversas inicialmente negativas
              <br />
              <strong>melhoraram ou mantiveram o tom</strong>
            </p>
          </div>
          <div
            className="tone-bar"
            aria-label={`${s.improved} melhoraram, ${s.stable} estáveis, ${s.worsened} pioraram`}
          >
            <div
              style={{
                width: `${(s.improved / s.total) * 100}%`,
                background: "#397E70",
              }}
            />
            <div
              style={{
                width: `${(s.stable / s.total) * 100}%`,
                background: "#A8B6C0",
              }}
            />
            <div
              style={{
                width: `${(s.worsened / s.total) * 100}%`,
                background: "#B86A55",
              }}
            />
          </div>
          <div className="tone-legend">
            <span>
              <i style={{ background: "#397E70" }} />
              {s.improved} melhoraram
            </span>
            <span>
              <i style={{ background: "#A8B6C0" }} />
              {s.stable} estáveis
            </span>
            <span>
              <i style={{ background: "#B86A55" }} />
              {s.worsened} pioraram
            </span>
          </div>
          <div className="tone-endpoints">
            {s.final
              .filter((f) => f.count > 0)
              .map((f) => (
                <div key={f.tone}>
                  <span>{f.tone} na saída</span>
                  <b>{f.count}</b>
                </div>
              ))}
          </div>
          <div className="notice">
            <Info size={16} />
            <p>
              Mudança de tom não comprova resolução. Base: {s.total} conversas
              que começaram negativas ou muito negativas.
            </p>
          </div>
        </>
      )}
    </Panel>
  );
}
export function CommunicationQuality({
  snapshots,
  onEvidence,
}: {
  snapshots: WeeklySnapshot[];
  onEvidence?: OpenConversation;
}) {
  return (
    <Panel
      title="Qualidade da comunicação"
      subtitle="Categorias qualitativas; em períodos agregados, a categoria mais frequente (desempate conservador)."
      kind="ai"
    >
      <div className="competency-grid">
        {COMPETENCIES.map((c) => {
          const assessment = [...snapshots]
            .reverse()
            .find((s) =>
              s.ai.weekly?.assessments.some((a) => a.competency === c),
            )
            ?.ai.weekly?.assessments.find((a) => a.competency === c);
          return (
            <div className="competency" key={c}>
              <h3>{c}</h3>
              <QualityIndicator level={consensus(snapshots, c)} />
              {onEvidence && assessment && (
                <button
                  className="text-link"
                  onClick={() =>
                    onEvidence(assessment.evidence[0].conversationId)
                  }
                >
                  Ver evidência <ExternalArrow size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
export function InsightCard({
  insight,
  onOpen,
}: {
  insight: Insight;
  onOpen: OpenConversation;
}) {
  return (
    <article className={`insight-card ${insight.kind}`}>
      <div className="insight-icon">
        {insight.kind === "strength" ? (
          <Check size={17} />
        ) : (
          <ExternalArrow size={17} />
        )}
      </div>
      <div>
        <h3>{insight.title}</h3>
        <p>{insight.text}</p>
        <button
          className="text-link"
          onClick={() => onOpen(insight.evidence[0].conversationId)}
        >
          Ver {insight.evidence.length} exemplos <ExternalArrow size={13} />
        </button>
      </div>
    </article>
  );
}
export function ConversationExample({
  evidence,
  title,
  positive = false,
  onOpen,
}: {
  evidence: Evidence;
  title: string;
  positive?: boolean;
  onOpen: OpenConversation;
}) {
  return (
    <article className={`example-card ${positive ? "positive" : ""}`}>
      <div className="example-top">
        <span className="eyebrow">
          {positive ? "Boa prática" : "Oportunidade de desenvolvimento"}
        </span>
        <span className="conversation-id">#{evidence.conversationId}</span>
      </div>
      <h3>{title}</h3>
      <label>Mensagem original · simulação</label>
      <blockquote>“{evidence.quote}”</blockquote>
      <h4>{positive ? "Por que funcionou?" : "Por que chamou atenção?"}</h4>
      <p>{evidence.explanation}</p>
      {evidence.suggestion && (
        <>
          <h4>Como poderia ficar?</h4>
          <div className="suggestion">“{evidence.suggestion}”</div>
        </>
      )}
      <button
        className="button small"
        onClick={() => onOpen(evidence.conversationId)}
      >
        <MessageSquareText size={15} />
        Ver conversa completa
      </button>
    </article>
  );
}
export function CSATComments({
  snapshots,
  onOpen,
}: {
  snapshots: WeeklySnapshot[];
  onOpen: OpenConversation;
}) {
  const m = calculateMetrics(snapshots);
  const allComments = snapshots
    .flatMap((s) => s.objective.ratings)
    .filter((r) => r.comment);
  const comments = [
    ...allComments.filter((r) => r.score < 5).slice(-2),
    ...allComments.filter((r) => r.score === 5).slice(-2),
  ];
  const latest = [...snapshots].reverse().find((s) => s.ai.weekly)?.ai.weekly;
  return (
    <Panel
      title="A voz de quem foi atendido"
      subtitle="Notas e comentários recebidos · dados simulados"
      kind="objective"
    >
      {!m.csatResponses ? (
        <EmptyState
          title="Sem CSAT neste período"
          text="Não há avaliações recebidas. A IA não estima notas nem preenche esse dado."
        />
      ) : (
        <>
          <div className="csat-layout">
            <div>
              <div className="csat-score">
                {formatNumber(m.csatAverage, 2)}
                <small> / 5</small>
              </div>
              <SourceBadge kind="calculated" />
              <p className="footnote">
                Média de {m.csatResponses} avaliações recebidas
              </p>
              {[5, 4, 3, 2, 1].map((n) => (
                <div className="rating-row" key={n}>
                  <span>{n} ★</span>
                  <div>
                    <i
                      style={{
                        width: `${(m.csatDistribution[n - 1] / m.csatResponses) * 100}%`,
                      }}
                    />
                  </div>
                  <b>{m.csatDistribution[n - 1]}</b>
                </div>
              ))}
            </div>
            <div className="csat-comments">
              {comments.slice(-4).map((r, i) => (
                <div className="comment" key={`${r.conversationId}-${i}`}>
                  <span>
                    {r.score} / 5 <small>· comentário simulado</small>
                  </span>
                  <p>“{r.comment}”</p>
                  {r.conversationId && (
                    <button
                      className="text-link"
                      onClick={() => onOpen(r.conversationId!)}
                    >
                      Ver atendimento <ExternalArrow size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {latest && (
            <div className="csat-analysis">
              <SourceBadge kind="ai" />
              <div>
                <p>
                  <strong>O que elogiaram.</strong> {latest.csatPraise}
                </p>
                <p>
                  <strong>O que observar.</strong> {latest.csatAttention}
                </p>
                <p>
                  {latest.csatAssociation ??
                    "Não há avaliações suficientes nesta semana para gerar esse insight."}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
export function SensitiveConversationList({
  snapshots,
  onOpen,
}: {
  snapshots: WeeklySnapshot[];
  onOpen: OpenConversation;
}) {
  const rows = snapshots.flatMap((s) =>
    s.ai.conversations
      .filter((a) => a.sensitive)
      .map((a) => ({
        a,
        c: s.conversations.find((c) => c.id === a.conversationId),
        agentId: s.agentId,
      })),
  );
  return (
    <Panel
      title="Atendimentos sensíveis"
      subtitle="O tema merece atenção. A classificação não é uma avaliação negativa da atendente."
      kind="ai"
    >
      {!rows.length ? (
        <EmptyState
          title="Nenhum atendimento sensível nas amostras"
          text="Não foram identificadas conversas sensíveis neste recorte. Isso não descreve o universo sem análise."
        />
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Atendimento</th>
                <th>Data</th>
                <th>Assunto</th>
                <th>Classificação textual</th>
                <th>Atendente</th>
                <th>
                  <span className="sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, c, agentId }) => (
                <tr key={a.conversationId}>
                  <td>
                    <button
                      className="text-link"
                      onClick={() => onOpen(a.conversationId)}
                    >
                      #{a.conversationId}
                    </button>
                  </td>
                  <td>{c ? shortDate(c.startedAt) : "—"}</td>
                  <td>{a.topic}</td>
                  <td>
                    <span className="sensitive-tag">
                      {a.sensitivityCategory}
                    </span>
                  </td>
                  <td className="capitalize">{agentId}</td>
                  <td>
                    <button
                      aria-label={`Abrir conversa ${a.conversationId}`}
                      className="icon-button"
                      onClick={() => onOpen(a.conversationId)}
                    >
                      <ExternalArrow size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
export function EvolutionChart({ snapshots }: { snapshots: WeeklySnapshot[] }) {
  const weeks = [...new Set(snapshots.map((s) => s.week))].sort();
  const data = weeks.map((week) => {
    const rows = snapshots.filter((s) => s.week === week),
      m = calculateMetrics(rows),
      habits = rows.flatMap(
        (s) => s.ai.weekly?.habits.filter((h) => h.kind === "attention") ?? [],
      );
    return {
      week: shortDate(week),
      atendimentos: m.total,
      csat: m.csatAverage,
      habito: habits.length
        ? (rows.reduce(
            (n, s) =>
              n +
              (s.ai.weekly?.habits.find((h) => h.kind === "attention")?.evidence
                .length ?? 0),
            0,
          ) /
            rows.reduce((n, s) => n + s.conversations.length, 0)) *
          100
        : null,
      escrita: rows.flatMap(
        (s) =>
          s.ai.weekly?.improvements
            .filter((i) => i.title.includes("revisão"))
            .flatMap((i) => i.evidence) ?? [],
      ).length,
    };
  });
  return (
    <Panel
      title="Evolução que dá para acompanhar"
      subtitle="Volumes observados, médias calculadas e padrões nas amostras em gráficos separados."
      kind="calculated"
    >
      {!data.length ? (
        <EmptyState />
      ) : (
        <>
          <div className="evolution-charts">
            {(
              [
                {
                  key: "atendimentos",
                  label: "Atendimentos por semana",
                  color: "#173D59",
                },
                {
                  key: "csat",
                  label: "CSAT médio · de 1 a 5",
                  color: "#397E70",
                },
                {
                  key: "habito",
                  label: "Hábito de atenção · % das amostras",
                  color: "#6C5CE7",
                },
                {
                  key: "escrita",
                  label: "Ocorrências de escrita nas amostras",
                  color: "#C7782E",
                },
              ] as const
            ).map((chart) => (
              <div className="evolution-chart" key={chart.key}>
                <h3>{chart.label}</h3>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data}
                      margin={{ top: 12, right: 12, bottom: 0, left: -20 }}
                    >
                      <defs>
                        <linearGradient
                          id={`fill-${chart.key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={chart.color}
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor={chart.color}
                            stopOpacity={0.01}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 5"
                        vertical={false}
                        stroke="#E5E8E9"
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: "#6C7880" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={chart.key === "csat" ? [1, 5] : [0, "auto"]}
                        tick={{ fontSize: 11, fill: "#6C7880" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value) => [
                          formatNumber(
                            typeof value === "number" ? value : null,
                            chart.key === "csat" ? 2 : 0,
                          ),
                          chart.label,
                        ]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e1e6e8",
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={chart.key}
                        stroke={chart.color}
                        strokeWidth={2.5}
                        fill={`url(#fill-${chart.key})`}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
          <p className="footnote">
            Os hábitos e ocorrências de escrita têm origem em classificação
            simulada de IA. São contados somente nas 12 amostras por
            pessoa/semana.
          </p>
        </>
      )}
    </Panel>
  );
}
export function ConversationDialog({
  conversation,
  analysis,
  onClose,
}: {
  conversation: Conversation;
  analysis?: ConversationAnalysis;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    return () => {
      node?.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="conversation-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="conversation-title"
    >
      <div className="dialog-header">
        <div>
          <span className="eyebrow">
            Conversa completa da amostra · fictícia
          </span>
          <h2 id="conversation-title">Atendimento #{conversation.id}</h2>
          <p>
            {shortDate(conversation.startedAt)} · {conversation.customer} ·{" "}
            <span className="capitalize">{conversation.agentId}</span>
          </p>
        </div>
        <button
          autoFocus
          className="icon-button"
          aria-label="Fechar conversa"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>
      <div className="dialog-body">
        <SourceBadge kind="objective" />
        <p className="footnote">
          Transcrição simulada. Somente as mensagens abaixo fazem parte deste
          registro.
        </p>
        <div className="messages">
          {conversation.messages.map((m) => (
            <div className={`message ${m.author}`} key={m.id}>
              <span>
                {m.author === "cliente" ? "Cliente" : conversation.agentId} ·{" "}
                {new Date(m.sentAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Sao_Paulo",
                })}
              </span>
              <p>{m.text}</p>
              <small>Referência: {m.id}</small>
            </div>
          ))}
        </div>
        <div className="dialog-csat">
          <SourceBadge kind="objective" />
          <p>
            <strong>CSAT registrado: </strong>
            {conversation.csat
              ? `${conversation.csat.score} / 5`
              : "Sem avaliação recebida"}
          </p>
          {conversation.csat?.comment && <p>“{conversation.csat.comment}”</p>}
        </div>
        {analysis && (
          <div className="dialog-analysis">
            <SourceBadge kind="ai" />
            <h3>
              {analysis.topic} ·{" "}
              {analysis.sensitive
                ? analysis.sensitivityCategory
                : "Sem sinal de sensibilidade"}
            </h3>
            <p>
              Tom: {analysis.initialTone} → {analysis.finalTone} ·{" "}
              {analysis.toneChange}
            </p>
            <p>Gravidade textual: {analysis.severity}</p>
            <p>{analysis.observation}</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
