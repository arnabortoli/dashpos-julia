"use client";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  History,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpRight,
  CircleHelp,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  FileSpreadsheet,
  FileText,
  Download,
  X,
  ShieldCheck,
} from "lucide-react";
import type {
  AgentId,
  DemoScenario,
  RadarData,
  WeeklySnapshot,
} from "@/domain/types";
import { selectPeriod, type PeriodFilter } from "@/domain/period";
import { shortDate, isoWeek } from "@/domain/metrics";
import { downloadReport } from "@/domain/exporters";
import WeekSelector from "./WeekSelector";
import AgentDashboard from "./AgentDashboard";
import {
  TeamOverview,
  AgentComparisonTable,
  HistoryDashboard,
} from "./TeamDashboard";
import { ConversationDialog, EmptyState, Panel, SourceBadge } from "./ui";
type Navigation = "overview" | "team" | "history" | AgentId;
export default function RadarApp({ data }: { data: RadarData }) {
  const weeks = [...new Set(data.snapshots.map((s) => s.week))].sort();
  const [navigation, setNavigation] = useState<Navigation>("overview");
  const [profile, setProfile] = useState<"coordinator" | AgentId>(
    "coordinator",
  );
  const [period, setPeriod] = useState<PeriodFilter>({
    mode: "week",
    week: weeks.at(-1) ?? "",
    month: "2026-10",
    quarter: "2026-Q4",
    start: "2026-09-28",
    end: "2026-10-25",
  });
  const [opened, setOpened] = useState<string | null>(null),
    [exportOpen, setExportOpen] = useState(false),
    [sidebarOpen, setSidebarOpen] = useState(false),
    [helpOpen, setHelpOpen] = useState(false);
  const [scenario, setScenario] = useState<DemoScenario>("normal"),
    [notice, setNotice] = useState("");
  const all = useMemo(() => {
    let snapshots = structuredClone(data.snapshots);
    if (scenario === "empty") return [];
    if (scenario === "no-csat")
      snapshots = snapshots.map((s) => ({
        ...s,
        objective: { ...s.objective, ratings: [] },
        conversations: s.conversations.map((c) => ({ ...c, csat: null })),
      }));
    if (scenario === "no-sensitive")
      snapshots = snapshots.map((s) => ({
        ...s,
        ai: {
          ...s.ai,
          conversations: s.ai.conversations.map((a) => ({
            ...a,
            sensitive: false,
            sensitivityCategory: null,
          })),
        },
      }));
    if (scenario === "no-analysis")
      snapshots = snapshots.map((s) => ({
        ...s,
        ai: { conversations: [], weekly: null },
      }));
    return snapshots;
  }, [data.snapshots, scenario]);
  // Escopo conceitual de demonstração. Não substitui autorização no servidor.
  const scoped =
    profile === "coordinator" ? all : all.filter((s) => s.agentId === profile);
  const selected = selectPeriod(scoped, period);
  const active = profile === "coordinator" ? navigation : profile;
  const agent = data.agents.find((a) => a.id === active);
  const activeSnapshots = agent
    ? selected.filter((s) => s.agentId === agent.id)
    : selected;
  const allowedConversations = (
    agent ? scoped.filter((s) => s.agentId === agent.id) : scoped
  ).flatMap((s) => s.conversations);
  const conversation = allowedConversations.find((c) => c.id === opened);
  const analysis = scoped
    .flatMap((s) => s.ai.conversations)
    .find((a) => a.conversationId === opened);
  const first = [...new Set(selected.map((s) => s.week))].sort()[0],
    last = [...selected].sort((a, b) => b.week.localeCompare(a.week))[0];
  const title = agent
    ? `O Radar de ${agent.name}`
    : active === "overview"
      ? "Visão Geral do Pós-Vendas"
      : active === "team"
        ? "Juntas, em evolução"
        : "Uma história de evolução";
  function navigate(nav: Navigation) {
    setNavigation(nav);
    setOpened(null);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function switchProfile(value: string) {
    setProfile(value as typeof profile);
    setNavigation(value === "coordinator" ? "overview" : (value as AgentId));
    setOpened(null);
    setNotice("");
  }
  function doExport(format: "csv" | "xlsx") {
    downloadReport(format, activeSnapshots);
    setExportOpen(false);
    setNotice(
      `Arquivo ${format.toUpperCase()} exportado com dados simulados do recorte visível.`,
    );
  }
  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
          className="brand"
          aria-label="Radar de Atendimento, início"
        >
          <span className="brand-mark">
            <Radio size={26} />
          </span>
          <span>
            radar<span className="brand-dot">.</span>
            <small>ATENDIMENTO LOUMAR</small>
          </span>
        </a>
        <div className="workspace-tag">
          <span className="workspace-icon">L</span>
          <div>
            Loumar Turismo<small>Experiência do Cliente</small>
          </div>
          <ChevronDown size={13} />
        </div>
        <p className="nav-label">SEU ESPAÇO DE EVOLUÇÃO</p>
        <nav aria-label="Navegação principal">
          {profile === "coordinator" ? (
            <>
              <NavButton
                icon={<LayoutDashboard size={18} />}
                label="Visão geral"
                active={active === "overview"}
                onClick={() => navigate("overview")}
              />
              <NavButton
                icon={<Users size={18} />}
                label="Equipe"
                active={active === "team"}
                onClick={() => navigate("team")}
              />
              <div className="nav-divider" />
              <p className="nav-label">OLHAR INDIVIDUAL</p>
              {data.agents.map((a) => (
                <NavButton
                  key={a.id}
                  icon={
                    <span
                      className="nav-avatar"
                      style={{ color: a.color, background: a.color + "14" }}
                    >
                      {a.initials}
                    </span>
                  }
                  label={a.name}
                  active={active === a.id}
                  onClick={() => navigate(a.id)}
                />
              ))}
              <div className="nav-divider" />
              <NavButton
                icon={<History size={18} />}
                label="Histórico"
                active={active === "history"}
                onClick={() => navigate("history")}
              />
            </>
          ) : (
            <NavButton
              icon={<LayoutDashboard size={18} />}
              label="Meu dashboard"
              active
              onClick={() => navigate(profile)}
            />
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <span>✦</span>
            <p>
              Boas conversas.
              <br />
              <strong>Melhores experiências.</strong>
            </p>
          </div>
          <button
            className="help-button"
            onClick={() => setHelpOpen((v) => !v)}
          >
            <CircleHelp size={17} />
            Como ler o Radar
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-user">
            <div className="avatar user-avatar">
              {profile === "coordinator"
                ? "JÚ"
                : data.agents.find((a) => a.id === profile)?.initials}
            </div>
            <div>
              <strong>
                {profile === "coordinator"
                  ? "Júlia"
                  : data.agents.find((a) => a.id === profile)?.name}
              </strong>
              <small>
                {profile === "coordinator"
                  ? "Coordenadora de Experiência"
                  : "Atendente · Pós-Vendas"}
              </small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="icon-button mobile-toggle"
              aria-label="Abrir navegação"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <PanelLeftOpen size={20} />
            </button>
            <span>Experiência do Cliente</span>
            <span>/</span>
            <strong>Pós-Vendas</strong>
          </div>
          <div className="topbar-right">
            <span className="demo-pill">
              <span />
              Demonstração · dados simulados
            </span>
            <label className="profile-selector">
              <span className="sr-only">Simular perfil</span>
              <select
                aria-label="Simular perfil"
                value={profile}
                onChange={(e) => switchProfile(e.target.value)}
              >
                <option value="coordinator">Júlia · Coordenadora</option>
                {data.agents.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name} · Atendente
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>
        <main id="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                RADAR DE ATENDIMENTO{" "}
                <span className="heading-separator">/</span>{" "}
                {agent ? "MEU DESENVOLVIMENTO" : "PÓS-VENDAS LOUMAR"}
              </span>
              <h1>
                {title}
                <span className="title-dot">.</span>
              </h1>
              <p>
                {agent
                  ? "Uma visão construtiva, com conversas que dão contexto."
                  : active === "overview"
                    ? "Um olhar atento para a equipe. Um próximo passo para cada pessoa."
                    : active === "team"
                      ? "Contribuições diferentes, um mesmo compromisso com o cliente."
                      : "Snapshots preservados para reconhecer o caminho percorrido."}
              </p>
            </div>
            <div className="export-wrap">
              <button
                className="button"
                aria-expanded={exportOpen}
                onClick={() => setExportOpen((v) => !v)}
                disabled={!activeSnapshots.length}
              >
                <ArrowDownToLine size={16} />
                Exportar
                <ChevronDown size={14} />
              </button>
              {exportOpen && (
                <div className="export-menu">
                  <button onClick={() => doExport("csv")}>
                    <FileSpreadsheet size={16} />
                    CSV · métricas
                  </button>
                  <button onClick={() => doExport("xlsx")}>
                    <FileSpreadsheet size={16} />
                    XLSX · métricas
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setExportOpen(false);
                    }}
                  >
                    <FileText size={16} />
                    PDF · imprimir esta visão
                  </button>
                  <p>Somente o perfil e período visíveis. Dados simulados.</p>
                </div>
              )}
            </div>
          </div>
          <div className="filter-bar">
            <div className="period-description">
              <span className="live-indicator" />
              <div>
                <strong>
                  {first && last
                    ? `${first === last.week ? `Semana ${isoWeek(first)} · ` : ""}${shortDate(first)} a ${shortDate(last.weekEnd)} · 2026`
                    : "Sem snapshots no recorte"}
                </strong>
                <span>
                  {last?.partial
                    ? "Inclui edição parcial preservada até 23/10, 09h · Brasília"
                    : "Snapshots semanais preservados"}
                </span>
              </div>
            </div>
            <WeekSelector weeks={weeks} value={period} onChange={setPeriod} />
          </div>
          {["month", "quarter", "custom"].includes(period.mode) && (
            <p className="period-note">
              {period.mode === "custom"
                ? "Inclui somente semanas inteiras contidas no intervalo."
                : "Semanas agrupadas pela data de início."}{" "}
              O sistema não estima nem divide o volume por dia.{" "}
              {period.mode === "custom" && period.start > period.end
                ? "A data inicial precisa ser anterior à final."
                : ""}
            </p>
          )}
          {profile === "coordinator" && agent && (
            <div className="same-view">
              <ShieldCheck size={16} />
              <span>
                Você está vendo o mesmo dashboard e os mesmos feedbacks
                apresentados a {agent.name}.
              </span>
              <button onClick={() => navigate("team")}>
                Voltar à equipe <ArrowUpRight size={13} />
              </button>
            </div>
          )}
          {helpOpen && (
            <section className="reading-guide">
              <button
                aria-label="Fechar ajuda"
                className="icon-button"
                onClick={() => setHelpOpen(false)}
              >
                <X size={18} />
              </button>
              <h2>Três camadas, três formas de ler</h2>
              <div>
                <p>
                  <SourceBadge kind="objective" /> Registros recebidos do
                  sistema. Aqui, são todos fictícios.
                </p>
                <p>
                  <SourceBadge kind="calculated" /> Contagens, médias e
                  percentuais calculados sobre esses registros.
                </p>
                <p>
                  <SourceBadge kind="ai" /> Interpretações simuladas do texto,
                  com evidências. Não demonstram ações ou resoluções externas.
                </p>
              </div>
              <p>
                A seleção de perfil é uma simulação de interface. Autenticação e
                permissões no servidor serão implementadas antes de dados reais.
              </p>
            </section>
          )}
          {notice && (
            <div className="export-notice" role="status">
              {notice}
              <button
                aria-label="Fechar aviso"
                className="icon-button"
                onClick={() => setNotice("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {scenario === "error" ? (
            <Panel title="Não foi possível carregar os dados">
              <EmptyState
                title="Falha de carregamento simulada"
                text="Os snapshots estão preservados. Você pode tentar novamente sem alterar o histórico."
              />
              <button
                className="button primary"
                onClick={() => setScenario("normal")}
              >
                Tentar novamente
              </button>
            </Panel>
          ) : agent ? (
            <AgentDashboard
              key={agent.id}
              agent={agent}
              snapshots={activeSnapshots}
              history={scoped.filter((s) => s.agentId === agent.id)}
              onOpen={setOpened}
            />
          ) : active === "overview" ? (
            <TeamOverview
              agents={data.agents}
              snapshots={selected}
              history={scoped}
              onAgent={navigate}
              onOpen={setOpened}
            />
          ) : active === "team" ? (
            <>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    CONTRIBUIÇÕES QUE SE COMPLEMENTAM
                  </span>
                  <h2>Conheça o momento de cada pessoa</h2>
                </div>
              </div>
              <div className="agent-profile-grid">
                {data.agents.map((a) => (
                  <button
                    className="agent-profile-card"
                    onClick={() => navigate(a.id)}
                    key={a.id}
                  >
                    <span
                      className="avatar large"
                      style={{ color: a.color, background: a.color + "15" }}
                    >
                      {a.initials}
                    </span>
                    <strong>{a.name}</strong>
                    <small>Ver semana e feedbacks</small>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
              <AgentComparisonTable
                agents={data.agents}
                snapshots={selected}
                history={scoped}
                onAgent={navigate}
                showIndex
              />
            </>
          ) : (
            <HistoryDashboard
              agents={data.agents}
              snapshots={selected}
              history={scoped}
              onAgent={navigate}
            />
          )}
          <footer className="page-footer">
            <div>
              <span className="footer-mark">radar.</span>
              <span>Qualidade se constrói em boas conversas.</span>
            </div>
            <label>
              Testar estados
              <select
                aria-label="Testar estados da demonstração"
                value={scenario}
                onChange={(e) => {
                  setScenario(e.target.value as DemoScenario);
                  setOpened(null);
                  setNotice("");
                }}
              >
                <option value="normal">Demonstração padrão</option>
                <option value="empty">Sem atendimentos</option>
                <option value="no-csat">Sem CSAT</option>
                <option value="no-sensitive">Sem sensíveis</option>
                <option value="no-analysis">Sem análise da IA</option>
                <option value="error">Erro ao carregar</option>
              </select>
            </label>
            <p>
              Dados 100% simulados · 8 semanas · sem conexão com a Loumaria ·
              v0.1
            </p>
          </footer>
        </main>
      </div>
      {conversation && (
        <ConversationDialog
          conversation={conversation}
          analysis={analysis}
          onClose={() => setOpened(null)}
        />
      )}
    </div>
  );
}
function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-button ${active ? "active" : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
      {active && <span className="nav-active-dot" />}
    </button>
  );
}
