export const AGENTS = [
  { id: "estefani", name: "Estefani", initials: "ES", color: "#6C5CE7" },
  { id: "karol", name: "Karol", initials: "KA", color: "#267F85" },
  { id: "andrea", name: "Andrea", initials: "AN", color: "#C37635" },
  { id: "brislaine", name: "Brislaine", initials: "BR", color: "#B56884" },
  { id: "kerolaine", name: "Kerolaine", initials: "KE", color: "#5275A8" },
] as const;
export type AgentId = (typeof AGENTS)[number]["id"];
export type Agent = (typeof AGENTS)[number];
export const COMPETENCIES = [
  "Acolhimento",
  "Clareza",
  "Objetividade",
  "Personalização",
  "Escrita",
  "Investigação",
  "Capacidade de explicação",
  "Firmeza sem confronto",
  "Encerramento",
  "Padrão Loumar",
] as const;
export type Competency = (typeof COMPETENCIES)[number];
export const QUALITY_LEVELS = [
  "Precisa evoluir",
  "Atenção",
  "Bom",
  "Muito bom",
  "Excelente",
] as const;
export type Quality = (typeof QUALITY_LEVELS)[number];
export const TOPICS = [
  "Horários",
  "Transportes",
  "Fronteira",
  "Cancelamento",
  "Reembolso",
  "Ingresso",
  "Hotel",
  "Motorista",
  "Guia",
  "Alteração de passeio",
  "Documentação",
  "Reclamação",
  "Elogio",
  "Financeiro",
  "Outros",
] as const;
export type Topic = (typeof TOPICS)[number];
export type Tone =
  "Muito negativo" | "Negativo" | "Neutro" | "Positivo" | "Muito positivo";
export const TONES: Tone[] = [
  "Muito negativo",
  "Negativo",
  "Neutro",
  "Positivo",
  "Muito positivo",
];
export interface Message {
  id: string;
  author: "cliente" | "atendente";
  text: string;
  sentAt: string;
}
export interface CSATRating {
  conversationId: string | null;
  score: number;
  comment?: string;
}
export interface Conversation {
  id: string;
  agentId: AgentId;
  startedAt: string;
  endedAt: string;
  customer: string;
  messages: Message[];
  csat: CSATRating | null;
}
export interface Evidence {
  conversationId: string;
  messageId: string;
  quote: string;
  explanation: string;
  suggestion?: string;
}
export interface Assessment {
  competency: Competency;
  level: Quality;
  evidence: Evidence[];
}
export interface ConversationAnalysis {
  conversationId: string;
  topic: Topic;
  subtopic: string;
  sensitive: boolean;
  sensitivityCategory: string | null;
  severity: "Baixa" | "Moderada" | "Alta";
  initialTone: Tone;
  finalTone: Tone;
  toneChange: "Melhorou" | "Estável" | "Piorou";
  observation: string;
}
export interface Insight {
  id: string;
  title: string;
  text: string;
  kind: "strength" | "improvement";
  evidence: Evidence[];
}
export interface Habit {
  title: string;
  kind: "positive" | "attention";
  evidence: Evidence[];
  sampleCount: number;
}
export interface WeeklyAIAnalysis {
  summary: string;
  assessments: Assessment[];
  strengths: Insight[];
  improvements: Insight[];
  habits: Habit[];
  csatPraise: string;
  csatAttention: string;
  csatAssociation: string | null;
}
export interface WeeklyRawMetrics {
  totalConversations: number;
  durationsSeconds: number[];
  ratings: CSATRating[];
}
export interface WeeklySnapshot {
  id: string;
  version: number;
  agentId: AgentId;
  week: string;
  weekEnd: string;
  capturedAt: string;
  partial: boolean;
  objective: WeeklyRawMetrics;
  conversations: Conversation[];
  ai: {
    conversations: ConversationAnalysis[];
    weekly: WeeklyAIAnalysis | null;
  };
}
export interface RadarData {
  agents: Agent[];
  snapshots: WeeklySnapshot[];
  source: "mock";
}
export interface RadarProvider {
  load(): Promise<RadarData>;
}
export interface CalculatedMetrics {
  total: number;
  averageSeconds: number | null;
  medianSeconds: number | null;
  csatAverage: number | null;
  csatResponses: number;
  csatDistribution: number[];
}
export type DemoScenario =
  "normal" | "empty" | "no-csat" | "no-sensitive" | "no-analysis" | "error";
