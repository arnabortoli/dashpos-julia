import { test } from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import { MOCK_SNAPSHOTS } from "../src/data/fixtures";
import {
  calculateMetrics,
  managementIndex,
  previousPeriod,
  toneStats,
} from "../src/domain/metrics";
import { selectPeriod, type PeriodFilter } from "../src/domain/period";
import { exportRows, toCsv, toXlsx } from "../src/domain/exporters";
import { detectHabits } from "../src/ai/detectHabits";
import { mockProvider } from "../src/data/providers/mockProvider";
import { MANAGEMENT_INDEX } from "../src/config/managementIndex";
const snapshots = MOCK_SNAPSHOTS;
const filter: PeriodFilter = {
  mode: "week",
  week: "2026-10-19",
  month: "2026-10",
  quarter: "2026-Q4",
  start: "2026-09-28",
  end: "2026-10-25",
};
test("cinco pessoas, oito semanas, 40 snapshots e 480 diálogos completos", () => {
  assert.equal(new Set(snapshots.map((s) => s.agentId)).size, 5);
  assert.equal(new Set(snapshots.map((s) => s.week)).size, 8);
  assert.equal(snapshots.length, 40);
  assert.equal(snapshots.flatMap((s) => s.conversations).length, 480);
  snapshots.forEach((s) => {
    assert.ok(s.objective.totalConversations >= 200);
    assert.equal(
      s.objective.durationsSeconds.length,
      s.objective.totalConversations,
    );
    assert.equal(s.conversations.length, 12);
  });
});
test("snapshots são profundamente congelados; provider não cria nova edição", async () => {
  assert.ok(Object.isFrozen(snapshots));
  assert.ok(
    Object.isFrozen(snapshots[0].ai.weekly!.improvements[0].evidence[0]),
  );
  assert.ok(Object.isFrozen(snapshots[0].objective.ratings));
  assert.throws(() => {
    snapshots[0].objective.totalConversations = 0;
  }, TypeError);
  assert.equal(
    (await mockProvider.load()).snapshots[0].id,
    (await mockProvider.load()).snapshots[0].id,
  );
});
test("todas as evidências apontam para mensagens literais da mesma pessoa e semana", () => {
  for (const s of snapshots) {
    const w = s.ai.weekly!;
    assert.ok(w.strengths.length <= 3 && w.improvements.length <= 3);
    const ev = [
      ...w.assessments.flatMap((a) => a.evidence),
      ...w.strengths.flatMap((i) => i.evidence),
      ...w.improvements.flatMap((i) => i.evidence),
      ...w.habits.flatMap((h) => h.evidence),
    ];
    for (const e of ev) {
      const c = s.conversations.find((c) => c.id === e.conversationId);
      assert.ok(c);
      assert.equal(c.agentId, s.agentId);
      const m = c.messages.find((m) => m.id === e.messageId);
      assert.ok(m);
      assert.equal(m.author, "atendente");
      assert.equal(e.quote, m.text);
    }
    w.assessments
      .filter((a) => ["Atenção", "Precisa evoluir"].includes(a.level))
      .forEach((a) => assert.ok(a.evidence.length));
  }
});
test("hábitos exigem múltiplas conversas; bases e contagens não extrapolam amostras", () => {
  for (const s of snapshots)
    for (const h of detectHabits(s) ?? []) {
      assert.ok(new Set(h.evidence.map((e) => e.conversationId)).size >= 2);
      assert.equal(h.sampleCount, s.conversations.length);
      assert.ok(h.evidence.length <= h.sampleCount);
    }
});
test("nenhuma mensagem ou avaliação da amostra ocorre depois do cutoff", () => {
  for (const s of snapshots)
    for (const c of s.conversations) {
      assert.ok(c.startedAt >= s.week);
      assert.ok(c.endedAt <= s.capturedAt);
      for (const m of c.messages) assert.ok(m.sentAt <= s.capturedAt);
      if (c.csat) {
        assert.ok(
          s.objective.ratings.some(
            (r) => r.conversationId === c.id && r.score === c.csat!.score,
          ),
        );
      }
    }
});
test("médias são ponderadas pelas observações, e mediana usa todo o conjunto", () => {
  const a = structuredClone(snapshots[0]),
    b = structuredClone(snapshots[1]);
  a.objective = {
    totalConversations: 2,
    durationsSeconds: [10, 30],
    ratings: [{ score: 1, conversationId: null }],
  };
  b.objective = {
    totalConversations: 1,
    durationsSeconds: [100],
    ratings: [
      { score: 5, conversationId: null },
      { score: 5, conversationId: null },
      { score: 5, conversationId: null },
    ],
  };
  const m = calculateMetrics([a, b]);
  assert.equal(m.total, 3);
  assert.equal(m.averageSeconds, 140 / 3);
  assert.equal(m.medianSeconds, 30);
  assert.equal(m.csatAverage, 4);
  assert.deepEqual(m.csatDistribution, [1, 0, 0, 0, 3]);
});
test("dados ausentes não são médias zero e não geram índice", () => {
  const m = calculateMetrics([]);
  assert.equal(m.csatAverage, null);
  assert.equal(m.averageSeconds, null);
  assert.equal(m.medianSeconds, null);
  assert.equal(managementIndex([], snapshots), null);
  const a = structuredClone(snapshots.at(-1)!);
  a.objective.ratings = [];
  assert.equal(managementIndex([a], snapshots), null);
});
test("períodos, trimestre e datas inválidas respeitam fronteiras de snapshots", () => {
  assert.equal(selectPeriod(snapshots, filter).length, 5);
  assert.equal(
    selectPeriod(snapshots, { ...filter, mode: "previous" })[0].week,
    "2026-10-12",
  );
  assert.equal(selectPeriod(snapshots, { ...filter, mode: "four" }).length, 20);
  assert.equal(
    selectPeriod(snapshots, { ...filter, mode: "month" }).length,
    15,
  );
  assert.equal(
    selectPeriod(snapshots, { ...filter, mode: "quarter" }).length,
    15,
  );
  assert.equal(
    selectPeriod(snapshots, { ...filter, mode: "custom" }).length,
    20,
  );
  assert.equal(
    selectPeriod(snapshots, {
      ...filter,
      mode: "custom",
      start: "2026-10-20",
      end: "2026-10-19",
    }).length,
    0,
  );
  assert.equal(
    selectPeriod(snapshots, {
      ...filter,
      mode: "custom",
      start: "2026-10-20",
      end: "2026-10-25",
    }).length,
    0,
  );
});
test("comparação anterior exige um recorte completo com tamanho equivalente", () => {
  const selected = selectPeriod(snapshots, { ...filter, mode: "four" }),
    previous = previousPeriod(selected, snapshots);
  assert.equal(previous.length, 20);
  assert.equal(previous[0].week, "2026-08-31");
  assert.equal(
    previousPeriod(
      snapshots.filter((s) => s.week.startsWith("2026-09")),
      snapshots,
    ).length,
    0,
  );
});
test("índice limitado e pesos configuráveis somam 100%; falhas externas não entram", () => {
  assert.ok(
    Math.abs(
      Object.values(MANAGEMENT_INDEX.weights).reduce((a, b) => a + b, 0) - 1,
    ) < 1e-9,
  );
  for (const id of new Set(snapshots.map((s) => s.agentId))) {
    const own = snapshots.filter((s) => s.agentId === id);
    const current = own.slice(-1);
    const score = managementIndex(current, own);
    assert.ok(score);
    assert.ok(score.score >= 0 && score.score <= 100);
    const altered = structuredClone(current);
    altered[0].ai.conversations.forEach((a) => {
      a.sensitive = true;
      a.severity = "Alta";
    });
    altered[0].objective.durationsSeconds =
      altered[0].objective.durationsSeconds.map(() => 99999);
    assert.equal(managementIndex(altered, own)!.score, score.score);
  }
});
test("tom e sensibilidade cobrem somente diálogos analisados, sem resolução presumida", () => {
  for (const s of snapshots) {
    const t = toneStats([s]);
    assert.equal(t.improved + t.stable + t.worsened, t.total);
    assert.ok(t.total <= s.conversations.length);
    assert.ok(
      s.ai.conversations.every((a) =>
        s.conversations.some((c) => c.id === a.conversationId),
      ),
    );
  }
});
test("CSV preserva acentos e escapa aspas; XLSX contém planilha XML e tipos corretos", () => {
  assert.equal(toCsv([['ação;"teste"', 5]]), '\uFEFF"ação;""teste""";"5"');
  const rows = exportRows(snapshots.slice(0, 2));
  assert.equal(rows.length, 3);
  const files = unzipSync(toXlsx(rows));
  assert.ok(files["[Content_Types].xml"]);
  const sheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
  assert.match(sheet, /SIMULAÇÃO/);
  assert.match(sheet, /<c r="F2"><v>/);
  assert.match(sheet, /inlineStr/);
});
