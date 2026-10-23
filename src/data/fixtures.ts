import {
  AGENTS,
  COMPETENCIES,
  TONES,
  type AgentId,
  type Conversation,
  type ConversationAnalysis,
  type Evidence,
  type Insight,
  type Quality,
  type WeeklySnapshot,
} from "@/domain/types";
import { deepFreeze } from "@/domain/metrics";
const DAY = 86400000;
const firstWeek = Date.parse("2026-08-31T12:00:00Z");
const profiles = [
  {
    strength: "Acolhimento",
    focus: "Objetividade",
    title: "Apresente o próximo passo mais cedo",
    text: "Em parte das amostras, o próximo passo aparece depois de um contexto extenso.",
    original:
      "Lamento esse desconforto. Para contextualizar, cada serviço tem as informações registradas em campos diferentes do comprovante. Há dados sobre a contratação e também as condições específicas do serviço. A confirmação enviada reúne essas informações para consulta e pode ser necessário comparar mais de um campo do documento. Para identificarmos o seu comprovante, pode me informar o número da reserva?",
    suggestion:
      "Lamento esse desconforto. Pode me informar o número da reserva? Assim consigo identificar as informações do seu comprovante nesta conversa.",
  },
  {
    strength: "Clareza",
    focus: "Encerramento",
    title: "Deixe o combinado explícito no encerramento",
    text: "Nas amostras indicadas, a última resposta não retoma o próximo passo informado.",
    original:
      "Você encontra as informações do serviço no campo “descrição” do comprovante. Se não localizar, me envie o número da reserva para identificarmos a informação. Certo, qualquer coisa estamos aqui.",
    suggestion:
      "Confira o campo “descrição” no comprovante. Se a informação não estiver lá, me envie o número da reserva aqui para continuarmos a conferência.",
  },
  {
    strength: "Investigação",
    focus: "Capacidade de explicação",
    title: "Traduza o procedimento para a linguagem do cliente",
    text: "Algumas respostas usam termos de processo sem explicar o que eles significam.",
    original:
      "Nesse caso, o procedimento previsto é a conferência do voucher e a validação do receptivo conforme a janela operacional do serviço. Pode me enviar o número da reserva para prosseguirmos com essa conferência?",
    suggestion:
      "Vou conferir as informações do seu passeio. Pode me enviar o número da reserva? Com ele, podemos comparar o horário informado no comprovante.",
  },
  {
    strength: "Objetividade",
    focus: "Personalização",
    title: "Use o contexto antes da resposta padrão",
    text: "As amostras repetem uma abertura genérica e deixam de retomar a dúvida específica.",
    original:
      "Olá! A Loumar agradece seu contato. Sua mensagem é muito importante. Estamos à disposição para ajudar. Por gentileza, informe os dados necessários para atendimento.",
    suggestion:
      "Você comentou que há dois horários no comprovante. Pode me enviar o número da reserva e dizer em quais campos esses horários aparecem?",
  },
  {
    strength: "Escrita",
    focus: "Firmeza sem confronto",
    title: "Esclareça sem colocar a cliente na defensiva",
    text: "Nas amostras citadas, a resposta aponta a responsabilidade do cliente antes de esclarecer a informação.",
    original:
      "Mas nós avisamos o horário no comprovante. Você não informou qual era a reserva. Essa é nossa política. Preciso desse dado para conferir.",
    suggestion:
      "Não localizei o número da reserva neste histórico. Pode enviá-lo aqui? Vou conferir o horário do comprovante com você.",
  },
];
const contexts = [
  {
    topic: "Transportes",
    customer:
      "No comprovante há dois horários e não sei qual usar no embarque. Isso atrapalhou minha programação.",
    sensitive: null,
  },
  {
    topic: "Reembolso",
    customer:
      "Quero solicitar reembolso. Me senti enganada com as informações e preciso de uma explicação por escrito.",
    sensitive: "Cliente dizendo que foi enganado",
  },
  {
    topic: "Fronteira",
    customer:
      "A fila da fronteira está enorme. Estou preocupada com o horário do meu voo. O que consta na minha reserva?",
    sensitive: "Risco de perda de voo",
  },
  {
    topic: "Horários",
    customer:
      "Você consegue me explicar onde vejo o horário de saída do passeio?",
    sensitive: null,
  },
  {
    topic: "Ingresso",
    customer:
      "Meu ingresso tem um código que não encontrei no e-mail. Como posso identificar?",
    sensitive: null,
  },
  {
    topic: "Hotel",
    customer:
      "O quarto está diferente do que eu esperava. Quero entender o que foi registrado na reserva.",
    sensitive: null,
  },
  {
    topic: "Alteração de passeio",
    customer:
      "Gostaria de verificar a possibilidade de mudar a data do passeio. Que informação preciso enviar?",
    sensitive: null,
  },
  {
    topic: "Documentação",
    customer:
      "Onde encontro a lista de documentos para o passeio da fronteira?",
    sensitive: null,
  },
  {
    topic: "Cancelamento",
    customer:
      "Preciso entender as condições de cancelamento antes de decidir. Pode me explicar o comprovante?",
    sensitive: null,
  },
  {
    topic: "Guia",
    customer:
      "Pode me ajudar a identificar no voucher a informação sobre o guia?",
    sensitive: null,
  },
  {
    topic: "Motorista",
    customer:
      "O motorista ainda não chegou. Estou irritada com a espera e quero registrar esse relato.",
    sensitive: "Cliente muito irritado",
  },
  {
    topic: "Elogio",
    customer:
      "Quero agradecer pela clareza das informações. Encontrei tudo no comprovante.",
    sensitive: null,
  },
] as const;
function snapshot(ai: number, w: number): WeeklySnapshot {
  const agent = AGENTS[ai],
    profile = profiles[ai];
  const week = new Date(firstWeek + w * 7 * DAY).toISOString().slice(0, 10);
  const weekEnd = new Date(firstWeek + (w * 7 + 6) * DAY)
    .toISOString()
    .slice(0, 10);
  const total = 224 + ai * 9 + ((w * 13 + ai * 7) % 55);
  const focusCount = 5 - Math.floor(w / 2),
    writingCount = w < 4 ? 3 : 2;
  const conversations: Conversation[] = [],
    analyses: ConversationAnalysis[] = [];
  for (let j = 0; j < 12; j++) {
    const id = `R-${w + 36}${ai + 1}${String(j + 1).padStart(2, "0")}`;
    const topicPool = [
      0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 2, 2, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 3,
      0, 1, 2, 4, 5, 0, 6,
    ];
    const context =
      contexts[topicPool[(j * 3 + ai * 7 + w * 5) % topicPool.length]];
    const start = new Date(
      firstWeek +
        (w * 7 + (j % (w === 7 ? 4 : 5))) * DAY +
        ((j * 29 + ai * 47) % 240) * 60000,
    );
    const original =
      j < focusCount
        ? profile.original
        : j >= 5 && j < 5 + writingCount
          ? "Vou verifica o horario que esta no seu comprovante. Pode envia o numero da reserva pra mim? Assim consigo confere a informação com você."
          : `Entendo a sua preocupação. Você pode me informar o número da reserva e qual informação do comprovante deseja conferir? Assim podemos olhar esse ponto juntos.`;
    const end = new Date(start.getTime() + (720 + j * 41) * 1000);
    const firstText =
      context.topic === "Elogio"
        ? context.customer
        : (j % 5 === 2
            ? "Estou muito irritada com essa situação. "
            : j % 5 !== 1
              ? "Estou insatisfeita e preciso de esclarecimentos. "
              : "") + context.customer;
    const texts = [
      firstText,
      original,
      context.topic === "Elogio"
        ? "Obrigada, gostei do atendimento e das orientações."
        : j % 5 === 0
          ? "Obrigada por explicar. Vou separar o número da reserva para enviar aqui."
          : j % 5 === 1
            ? "Certo. Ainda tenho uma dúvida sobre o comprovante; vou enviar o número."
            : j % 5 === 4
              ? "A explicação não ajudou. Continuo sem entender e estou ainda mais irritada. Vou enviar o número, mas quero registrar minha insatisfação."
              : "Ainda estou insatisfeita com a situação. Vou enviar os dados para continuar a conversa.",
      j < focusCount
        ? "Fico no aguardo dos dados para continuarmos a conferência neste atendimento."
        : "Combinado: envie o número da reserva nesta conversa e indique o campo que deseja conferir. Assim retomamos a análise desse ponto.",
    ];
    const score = j < focusCount ? 3 + (j % 2) : 5;
    conversations.push({
      id,
      agentId: agent.id,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      customer: `Cliente simulado ${j + 1}`,
      messages: texts.map((text, m) => ({
        id: `${id}-m${m + 1}`,
        author: m % 2 ? "atendente" : "cliente",
        text,
        sentAt: new Date(start.getTime() + m * 180000).toISOString(),
      })),
      csat:
        j % 4 === 0
          ? null
          : {
              conversationId: id,
              score,
              comment:
                score === 5
                  ? "A atendente foi atenciosa e explicou o que eu precisava enviar."
                  : "Precisei reler a explicação para entender o próximo passo.",
            },
    });
    const initial =
      context.topic === "Elogio"
        ? "Positivo"
        : j % 5 === 1
          ? "Neutro"
          : j % 5 === 2
            ? "Muito negativo"
            : "Negativo";
    const final =
      context.topic === "Elogio"
        ? "Positivo"
        : j % 5 === 0
          ? "Positivo"
          : j % 5 === 1
            ? "Neutro"
            : j % 5 === 4
              ? "Muito negativo"
              : "Negativo";
    analyses.push({
      conversationId: id,
      topic: context.topic,
      subtopic: "Conferência de informações no comprovante",
      sensitive: context.sensitive !== null || initial === "Muito negativo",
      sensitivityCategory:
        context.sensitive ??
        (initial === "Muito negativo" ? "Cliente muito irritado" : null),
      severity:
        context.sensitive || initial === "Muito negativo"
          ? "Moderada"
          : "Baixa",
      initialTone: initial,
      finalTone: final,
      toneChange:
        TONES.indexOf(final) > TONES.indexOf(initial)
          ? "Melhorou"
          : TONES.indexOf(final) < TONES.indexOf(initial)
            ? "Piorou"
            : "Estável",
      observation:
        "A classificação considera apenas o texto registrado. Não há comprovação de ação ou resolução fora desta conversa.",
    });
  }
  const evidence = (
    indices: number[],
    explanation: string,
    suggestion?: string,
  ): Evidence[] =>
    indices.map((j) => ({
      conversationId: conversations[j].id,
      messageId: conversations[j].messages[1].id,
      quote: conversations[j].messages[1].text,
      explanation,
      suggestion,
    }));
  const focusEvidence = evidence(
    Array.from({ length: focusCount }, (_, j) => j),
    profile.text,
    profile.suggestion,
  );
  const writingEvidence = evidence(
    Array.from({ length: writingCount }, (_, j) => 5 + j),
    "A forma verbal e a ausência de acentos se repetem nas mensagens da amostra.",
    "Vou verificar o horário do seu comprovante. Pode me enviar o número da reserva para conferirmos a informação juntos?",
  );
  const positiveEvidence = evidence(
    [9, 10, 11],
    "A mensagem reconhece a preocupação e solicita uma informação específica antes de concluir.",
  );
  const strengths: Insight[] = [
    {
      id: `${agent.id}-${week}-s1`,
      title: `Continue usando ${profile.strength.toLocaleLowerCase("pt-BR")}`,
      text: "A conversa reconhece a preocupação e pede o dado que falta antes de avançar. Esse cuidado aparece em três amostras.",
      kind: "strength",
      evidence: positiveEvidence,
    },
  ];
  const improvements: Insight[] = [
    {
      id: `${agent.id}-${week}-i1`,
      title: profile.title,
      text: profile.text,
      kind: "improvement",
      evidence: focusEvidence,
    },
    {
      id: `${agent.id}-${week}-i2`,
      title: "Reserve uma revisão breve antes de enviar",
      text: "As formas verbais sem revisão aparecem em mais de uma conversa. Confira verbos e acentos antes do envio.",
      kind: "improvement",
      evidence: writingEvidence,
    },
  ];
  const ratings = conversations.flatMap((c) => (c.csat ? [c.csat] : []));
  const responseCount = 48 + ((w * 5 + ai * 3) % 24);
  while (ratings.length < responseCount) {
    const n = ratings.length;
    ratings.push({
      conversationId: null,
      score: n % 19 === 0 ? 2 : n % 13 === 0 ? 3 : n % 7 === 0 ? 4 : 5,
    });
  }
  return {
    id: `${agent.id}-${week}-v1`,
    version: 1,
    agentId: agent.id,
    week,
    weekEnd,
    capturedAt:
      w === 7
        ? "2026-10-23T12:00:00Z"
        : new Date(firstWeek + (w + 1) * 7 * DAY).toISOString(),
    partial: w === 7,
    objective: {
      totalConversations: total,
      durationsSeconds: [
        ...conversations.map(
          (c) => (Date.parse(c.endedAt) - Date.parse(c.startedAt)) / 1000,
        ),
        ...Array.from(
          { length: total - conversations.length },
          (_, j) => 420 + ((j * 73 + ai * 107 + w * 31) % 1800),
        ),
      ],
      ratings,
    },
    conversations,
    ai: {
      conversations: analyses,
      weekly: {
        summary: `${agent.name} demonstrou ${profile.strength.toLocaleLowerCase("pt-BR")} nas amostras desta semana: pediu o dado que faltava e manteve o diálogo aberto. Para praticar na próxima semana: ${profile.title.toLocaleLowerCase("pt-BR")}. Esse ponto aparece em ${focusCount} das 12 conversas analisadas, com exemplos para praticar.`,
        assessments: COMPETENCIES.map((competency, k) => ({
          competency,
          level: (competency === profile.focus
            ? w < 3
              ? "Atenção"
              : w < 6
                ? "Bom"
                : "Muito bom"
            : competency === "Escrita" && ai !== 4
              ? "Atenção"
              : competency === profile.strength
                ? "Excelente"
                : (k + ai) % 3 === 0
                  ? "Bom"
                  : "Muito bom") as Quality,
          evidence:
            competency === profile.focus
              ? focusEvidence
              : competency === "Escrita" && ai !== 4
                ? writingEvidence
                : positiveEvidence,
        })),
        strengths,
        improvements,
        habits: [
          {
            title: profile.title,
            kind: "attention",
            evidence: focusEvidence,
            sampleCount: 12,
          },
          {
            title: "Revisão de verbos e acentos",
            kind: "attention",
            evidence: writingEvidence,
            sampleCount: 12,
          },
          {
            title: "Perguntar antes de concluir",
            kind: "positive",
            evidence: positiveEvidence,
            sampleCount: 12,
          },
        ],
        csatPraise:
          "Nos comentários com nota 5, aparecem atenção e clareza sobre o dado a enviar.",
        csatAttention:
          "Nos comentários com nota 3 ou 4, aparece a necessidade de reler a explicação.",
        csatAssociation:
          "Nas amostras comentadas com nota 5, há perguntas específicas e um próximo passo explícito. É uma associação descritiva deste recorte, sem evidência de causalidade.",
      },
    },
  };
}
export const MOCK_SNAPSHOTS = deepFreeze(
  Array.from({ length: 8 }, (_, w) =>
    AGENTS.map((_, ai) => snapshot(ai, w)),
  ).flat(),
);
export const MOCK_AGENTS = AGENTS;
