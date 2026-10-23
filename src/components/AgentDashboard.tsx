"use client";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  MessageSquareText,
  Lightbulb,
  Heart,
  History,
  ListFilter,
} from "lucide-react";
import type { Agent, WeeklySnapshot, Evidence } from "@/domain/types";
import { COMPETENCIES, TOPICS } from "@/domain/types";
import {
  calculateMetrics,
  consensus,
  formatNumber,
  previousPeriod,
  shortDate,
} from "@/domain/metrics";
import {
  Panel,
  EmptyState,
  MetricsGrid,
  QualityIndicator,
  TopicChart,
  ToneEvolution,
  CommunicationQuality,
  CSATComments,
  SensitiveConversationList,
  InsightCard,
  ConversationExample,
  EvolutionChart,
  SourceBadge,
  type OpenConversation,
} from "./ui";
export const AGENT_TABS = [
  "Minha Semana",
  "Meus Atendimentos",
  "Minha Comunicação",
  "Atendimentos Sensíveis",
  "Exemplos",
  "Minha Evolução",
] as const;
type Tab = (typeof AGENT_TABS)[number];
export function AgentTabs({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div
      className="agent-tabs"
      role="tablist"
      aria-label="Dashboard individual"
    >
      {AGENT_TABS.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
export default function AgentDashboard({
  agent,
  snapshots,
  history,
  onOpen,
}: {
  agent: Agent;
  snapshots: WeeklySnapshot[];
  history: WeeklySnapshot[];
  onOpen: OpenConversation;
}) {
  const [tab, setTab] = useState<Tab>("Minha Semana");
  const [search, setSearch] = useState(""),
    [topic, setTopic] = useState("all");
  const [exampleKind, setExampleKind] = useState("all");
  const latest = [...snapshots].sort((a, b) => b.week.localeCompare(a.week))[0];
  const weekly = latest?.ai.weekly;
  const previous = previousPeriod(snapshots, history);
  const conversations = snapshots
    .flatMap((s) =>
      s.conversations.map((c) => ({
        c,
        a: s.ai.conversations.find((a) => a.conversationId === c.id),
      })),
    )
    .filter(
      ({ c, a }) =>
        (topic === "all" || a?.topic === topic) &&
        `${c.id} ${c.customer} ${a?.topic ?? ""}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    );
  const examples = snapshots
    .flatMap((s) =>
      s.ai.weekly
        ? [...s.ai.weekly.strengths, ...s.ai.weekly.improvements].flatMap((i) =>
            i.evidence.map((e) => ({
              e,
              title: i.title,
              positive: i.kind === "strength",
              week: s.week,
            })),
          )
        : [],
    )
    .filter(
      (e) =>
        exampleKind === "all" ||
        (exampleKind === "positive" ? e.positive : !e.positive),
    );
  return (
    <>
      <div className="agent-intro">
        <div
          className="avatar large"
          style={{ background: agent.color + "18", color: agent.color }}
        >
          {agent.initials}
        </div>
        <div>
          <h2>Um olhar sobre a sua jornada, {agent.name}.</h2>
          <p>
            Reconhecer o que funciona. Praticar o próximo passo. Evoluir a cada
            semana.
          </p>
        </div>
      </div>
      <AgentTabs value={tab} onChange={setTab} />
      <div role="tabpanel" aria-label={tab} className="tab-content">
        {!snapshots.length ? (
          <EmptyState />
        ) : (
          <>
            {tab === "Minha Semana" && (
              <>
                <MetricsGrid snapshots={snapshots} previous={previous} />
                {weekly ? (
                  <section className="weekly-story">
                    <div className="story-icon">
                      <SparkleIcon />
                    </div>
                    <div>
                      <SourceBadge kind="ai" />
                      <h2>Como foram meus atendimentos esta semana?</h2>
                      <p>{weekly.summary}</p>
                      <small>
                        Snapshot de {shortDate(latest.week)} · 12 conversas de
                        amostra · análise simulada
                        {snapshots.length > 1
                          ? " · resumo da semana mais recente do período"
                          : ""}
                      </small>
                    </div>
                  </section>
                ) : (
                  <Panel
                    title="Como foram meus atendimentos esta semana?"
                    kind="ai"
                  >
                    <EmptyState
                      title="Sem análise disponível"
                      text="As métricas continuam disponíveis; os feedbacks aguardam uma análise com evidências."
                    />
                  </Panel>
                )}
                {weekly && (
                  <div className="two-columns">
                    <Panel
                      title="O que você fez muito bem"
                      subtitle="Comportamentos para continuar praticando"
                      kind="ai"
                    >
                      {weekly.strengths.slice(0, 3).map((i) => (
                        <InsightCard insight={i} key={i.id} onOpen={onOpen} />
                      ))}
                    </Panel>
                    <Panel
                      title="Foco para a próxima semana"
                      subtitle="Poucas mudanças, com intenção"
                      kind="ai"
                    >
                      {weekly.improvements.slice(0, 3).map((i) => (
                        <InsightCard insight={i} key={i.id} onOpen={onOpen} />
                      ))}
                    </Panel>
                  </div>
                )}
                <div className="two-columns">
                  <TopicChart snapshots={snapshots} previous={previous} />
                  <ToneEvolution snapshots={snapshots} />
                </div>
                <CSATComments snapshots={snapshots} onOpen={onOpen} />
              </>
            )}
            {tab === "Meus Atendimentos" && (
              <Panel
                title="Meus atendimentos"
                subtitle={`${snapshots.reduce((n, s) => n + s.conversations.length, 0)} conversas completas de amostra · ${calculateMetrics(snapshots).total} atendimentos no agregado. A lista não representa o universo completo.`}
                kind="objective"
              >
                <div className="table-filters">
                  <label className="search-field">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar ID, cliente ou assunto"
                      aria-label="Buscar atendimentos"
                    />
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    aria-label="Filtrar assunto"
                  >
                    <option value="all">Todos os assuntos</option>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <span>{conversations.length} resultados</span>
                </div>
                {!conversations.length ? (
                  <EmptyState
                    title="Nenhuma conversa corresponde ao filtro"
                    text="Altere a busca ou o assunto para encontrar outros atendimentos."
                  />
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Atendimento</th>
                          <th>Data</th>
                          <th>Assunto · IA</th>
                          <th>CSAT · objetivo</th>
                          <th>Tom · IA</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {conversations.map(({ c, a }) => (
                          <tr key={c.id}>
                            <td>
                              <button
                                className="text-link"
                                onClick={() => onOpen(c.id)}
                              >
                                #{c.id}
                              </button>
                              <small className="cell-secondary">
                                {c.customer}
                              </small>
                            </td>
                            <td>{shortDate(c.startedAt)}</td>
                            <td>
                              {a?.topic ?? "Sem análise"}
                              {a?.sensitive && (
                                <small className="cell-secondary">
                                  Sensível · {a.sensitivityCategory}
                                </small>
                              )}
                            </td>
                            <td>
                              {c.csat ? `${c.csat.score} / 5` : "Não avaliado"}
                            </td>
                            <td>
                              {a
                                ? `${a.initialTone} → ${a.finalTone}`
                                : "Sem análise"}
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={`Abrir conversa ${c.id}`}
                                onClick={() => onOpen(c.id)}
                              >
                                <ArrowUpRight size={17} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}
            {tab === "Minha Comunicação" && (
              <>
                <CommunicationQuality
                  snapshots={snapshots}
                  onEvidence={onOpen}
                />
                <Panel
                  title="Padrões percebidos nesta semana"
                  subtitle="Um comportamento só é chamado de hábito quando há mais de uma evidência. Resumo da última semana selecionada."
                  kind="ai"
                >
                  {!weekly ? (
                    <EmptyState title="Sem análise disponível" />
                  ) : (
                    <div className="habits-grid">
                      {weekly.habits.map((h, i) => (
                        <article className={`habit ${h.kind}`} key={h.title}>
                          <div className="habit-icon">
                            {h.kind === "positive" ? (
                              <Heart size={18} />
                            ) : (
                              <Lightbulb size={18} />
                            )}
                          </div>
                          <h3>{h.title}</h3>
                          <p>
                            Identificado em{" "}
                            <strong>
                              {h.evidence.length} de {h.sampleCount}
                            </strong>{" "}
                            amostras.
                          </p>
                          <button
                            className="text-link"
                            onClick={() => onOpen(h.evidence[0].conversationId)}
                          >
                            Veja na prática <ArrowUpRight size={13} />
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </Panel>
                {weekly &&
                  weekly.improvements.map((i) => (
                    <Panel
                      title={i.title}
                      subtitle={`${i.evidence.length} atendimentos com evidências nesta semana`}
                      kind="ai"
                      key={i.id}
                    >
                      <div className="two-columns examples-inside">
                        {i.evidence.slice(0, 2).map((e) => (
                          <ConversationExample
                            key={e.conversationId}
                            evidence={e}
                            title="Veja na prática"
                            onOpen={onOpen}
                          />
                        ))}
                      </div>
                    </Panel>
                  ))}
                <CommunicationGuide />
              </>
            )}
            {tab === "Atendimentos Sensíveis" && (
              <SensitiveConversationList
                snapshots={snapshots}
                onOpen={onOpen}
              />
            )}
            {tab === "Exemplos" && (
              <Panel
                title="Veja na prática"
                subtitle="Trechos originais, interpretação e alternativas. Todas as conversas são fictícias."
                kind="ai"
                action={
                  <select
                    value={exampleKind}
                    onChange={(e) => setExampleKind(e.target.value)}
                    aria-label="Tipo de exemplo"
                  >
                    <option value="all">Todos os exemplos</option>
                    <option value="positive">Boas práticas</option>
                    <option value="improvement">Oportunidades</option>
                  </select>
                }
              >
                {!examples.length ? (
                  <EmptyState title="Sem exemplos disponíveis" />
                ) : (
                  <div className="two-columns">
                    {examples.map(({ e, title, positive, week }, i) => (
                      <ConversationExample
                        key={`${e.messageId}-${i}`}
                        evidence={e}
                        title={title}
                        positive={positive}
                        onOpen={onOpen}
                      />
                    ))}
                  </div>
                )}
              </Panel>
            )}
            {tab === "Minha Evolução" && (
              <>
                <EvolutionChart
                  snapshots={history.filter(
                    (s) => s.week <= (latest?.week ?? ""),
                  )}
                />
                <Panel
                  title="Sua jornada por competência"
                  subtitle="Histórico qualitativo até a última semana selecionada. Sem notas numéricas."
                  kind="ai"
                >
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Competência</th>
                          {history
                            .filter((s) => s.week <= (latest?.week ?? ""))
                            .map((s) => (
                              <th key={s.week}>{shortDate(s.week)}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {COMPETENCIES.map((c) => (
                          <tr key={c}>
                            <td>{c}</td>
                            {history
                              .filter((s) => s.week <= (latest?.week ?? ""))
                              .map((s) => (
                                <td key={s.week}>
                                  <QualityIndicator level={consensus([s], c)} />
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
function SparkleIcon() {
  return <span aria-hidden="true">✦</span>;
}
const GUIDE = [
  [
    "Desculpe pelo transtorno.",
    "Lamento esse desconforto. / Lamento esse inconveniente.",
  ],
  [
    "Entendo que você não gostou.",
    "Entendo que a experiência não aconteceu como você esperava.",
  ],
  [
    "Entendo sua frustração.",
    "Entendo a sua percepção e o desconforto que isso causou.",
  ],
  [
    "Infelizmente não podemos fazer nada.",
    "Dentro dessa situação, vou te explicar o que está ao nosso alcance.",
  ],
  ["Essa é nossa política.", "Nesse caso, o procedimento previsto é…"],
  [
    "Você não informou.",
    "Não localizei essa informação no histórico do atendimento.",
  ],
  [
    "Você interpretou errado.",
    "Entendo como essa informação pode ter sido interpretada dessa forma.",
  ],
  [
    "Isso não é culpa nossa.",
    "Esse ponto não depende exclusivamente da Loumar. Vou te explicar como funciona.",
  ],
  [
    "Não tem reembolso.",
    "Nesse cenário, não consigo aplicar ou justificar um reembolso.",
  ],
  [
    "Já explicamos várias vezes.",
    "Posso retomar esse ponto com você para deixá-lo mais claro.",
  ],
  [
    "Você está confundindo as coisas.",
    "Acho importante separarmos esses pontos para entendermos melhor o ocorrido.",
  ],
  [
    "Calma. / Fique tranquilo.",
    "Entendo a sua preocupação e vou verificar esse ponto com você.",
  ],
  [
    "Foi só um atraso.",
    "Entendo que essa alteração interferiu na programação de vocês.",
  ],
  [
    "Mas nós avisamos.",
    "Verifiquei que essa informação foi enviada, mas entendo que possa ter passado despercebida.",
  ],
  [
    "Não concordamos com você.",
    "Entendo o seu ponto, mas após analisar o histórico nossa leitura é diferente.",
  ],
  ["Não posso.", "O que consigo fazer por você nesse caso é…"],
];
export function CommunicationGuide() {
  return (
    <details className="panel communication-guide">
      <summary>
        Padrão de comunicação Loumar <span>Referência para praticar</span>
      </summary>
      <p>
        Primeiro acolher, depois esclarecer. Não atribuir sentimentos, não
        dramatizar, não assumir culpa ao acolher e deixar o próximo passo claro
        quando houver. Trocar defesa por esclarecimento e ser firme sem ser
        fria. Preferir desconforto, inconveniente, situação, desencontro ou
        experiência abaixo do esperado.
      </p>
      <div className="guide-grid">
        {GUIDE.map(([avoid, prefer]) => (
          <div key={avoid}>
            <span>Evite</span>
            <p>“{avoid}”</p>
            <span className="prefer">Prefira</span>
            <p>“{prefer}”</p>
          </div>
        ))}
      </div>
    </details>
  );
}
