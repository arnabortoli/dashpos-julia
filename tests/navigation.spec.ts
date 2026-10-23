import { test, expect } from "@playwright/test";
const agents = ["Estefani", "Karol", "Andrea", "Brislaine", "Kerolaine"];
test("panorama, temas, tom, CSAT e diálogos", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Visão Geral do Pós-Vendas." }),
  ).toBeVisible();
  await expect(page.getByText("Demonstração · dados simulados")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "O que trouxe os clientes até nós?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A voz de quem foi atendido" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Ver \d+ exemplos/ })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Transcrição simulada.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("todos os dashboards e seis abas individuais funcionam", async ({
  page,
}) => {
  await page.goto("/");
  for (const agent of agents) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name: agent, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: `O Radar de ${agent}.` }),
    ).toBeVisible();
    await expect(page.getByRole("tab")).toHaveCount(6);
    await page.getByRole("tab", { name: "Meus Atendimentos" }).click();
    await expect(
      page.getByRole("heading", { name: "Meus atendimentos", exact: true }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Minha Comunicação" }).click();
    await expect(
      page.getByRole("heading", { name: "Padrões percebidos nesta semana" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Atendimentos Sensíveis" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Atendimentos sensíveis",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Exemplos" }).click();
    await expect(
      page.getByRole("button", { name: "Ver conversa completa" }).first(),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Minha Evolução" }).click();
    await expect(
      page.getByRole("heading", { name: "Sua jornada por competência" }),
    ).toBeVisible();
  }
});
test("Júlia e atendente recebem exatamente os mesmos feedbacks; perfil individual não tem comparativo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Estefani", exact: true })
    .click();
  const summary = await page.locator(".weekly-story p").innerText(),
    feedback = await page.locator(".insight-card").allTextContents();
  await page.getByLabel("Simular perfil").selectOption("estefani");
  await expect(page.locator(".weekly-story p")).toHaveText(summary);
  expect(await page.locator(".insight-card").allTextContents()).toEqual(
    feedback,
  );
  await expect(page.getByRole("navigation").getByRole("button")).toHaveCount(1);
  await expect(page.getByText("Cada pessoa, uma contribuição")).toHaveCount(0);
  await expect(page.getByText("Índice interno")).toHaveCount(0);
  await page.getByLabel("Simular perfil").selectOption("coordinator");
  await expect(
    page.getByRole("heading", { name: "Visão Geral do Pós-Vendas." }),
  ).toBeVisible();
});
test("mudança de semana, quatro semanas, mês, trimestre e intervalo vazio", async ({
  page,
}) => {
  await page.goto("/");
  const total = await page.locator(".metric-value").first().innerText();
  await page.getByLabel("Voltar uma semana").click();
  expect(await page.locator(".metric-value").first().innerText()).not.toEqual(
    total,
  );
  await page.getByLabel("Tipo de período").selectOption("four");
  await expect(
    page.getByText("240 conversas de amostra", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Tipo de período").selectOption("month");
  await expect(
    page.getByText("180 conversas de amostra", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Tipo de período").selectOption("quarter");
  await expect(
    page.getByText("180 conversas de amostra", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Tipo de período").selectOption("custom");
  await page.getByLabel("Início do intervalo").fill("2027-01-01");
  await page.getByLabel("Fim do intervalo").fill("2027-01-10");
  await expect(
    page.getByRole("heading", { name: "Nenhum atendimento neste recorte" }),
  ).toBeVisible();
});
test("busca, filtro de exemplos e consulta de conversa", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Karol", exact: true })
    .click();
  await page.getByRole("tab", { name: "Meus Atendimentos" }).click();
  await page.getByLabel("Buscar atendimentos").fill("nao-existe");
  await expect(
    page.getByRole("heading", {
      name: "Nenhuma conversa corresponde ao filtro",
    }),
  ).toBeVisible();
  await page.getByLabel("Buscar atendimentos").fill("");
  await page.getByLabel("Filtrar assunto").selectOption("Transportes");
  await expect(page.locator("tbody tr").first()).toBeVisible();
  expect(await page.locator("tbody tr").count()).toBeGreaterThan(0);
  await page.locator("tbody .text-link").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Fechar conversa").click();
  await page.getByRole("tab", { name: "Exemplos" }).click();
  await page.getByLabel("Tipo de exemplo").selectOption("positive");
  await expect(page.locator(".example-card")).toHaveCount(3);
  await page.getByLabel("Tipo de exemplo").selectOption("improvement");
  await expect(page.locator(".example-card")).toHaveCount(4);
});
test("estados sem CSAT, sem análise, sem sensíveis, vazio e erro", async ({
  page,
}) => {
  await page.goto("/");
  const scenario = page.getByLabel("Testar estados da demonstração");
  await scenario.selectOption("no-csat");
  await expect(
    page.getByRole("heading", { name: "Sem CSAT neste período" }),
  ).toBeVisible();
  await expect(
    page.locator(".metric-card").nth(3).locator(".metric-value"),
  ).toHaveText("Indisponível");
  await scenario.selectOption("no-sensitive");
  await expect(
    page.getByRole("heading", {
      name: "Nenhum atendimento sensível nas amostras",
    }),
  ).toBeVisible();
  await scenario.selectOption("no-analysis");
  await expect(
    page.getByText("Sem análise disponível neste período.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator(".metric-card").nth(5).locator(".metric-value"),
  ).toHaveText("Indisponível");
  await scenario.selectOption("empty");
  await expect(
    page.getByRole("heading", { name: "Nenhum atendimento neste recorte" }),
  ).toBeVisible();
  await scenario.selectOption("error");
  await expect(
    page.getByRole("heading", { name: "Falha de carregamento simulada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".metrics-grid")).toBeVisible();
});
test("histórico e fórmula gerencial visíveis só na coordenação", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Equipe", exact: true })
    .click();
  await expect(
    page.getByText("Indicador de apoio à gestão · experimental e privado"),
  ).toBeVisible();
  await expect(page.locator(".comparison-table tbody tr")).toHaveCount(5);
  await page.getByText("Como o índice é calculado?").click();
  await expect(page.getByText("CSAT 25%", { exact: false })).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Histórico", exact: true })
    .click();
  await page.getByLabel("Tipo de período").selectOption("four");
  await expect(
    page.getByRole("heading", { name: "Registro de snapshots" }),
  ).toBeVisible();
  await expect(page.locator(".panel").last().locator("tbody tr")).toHaveCount(
    4,
  );
});
test("CSV e XLSX baixam arquivos reais no escopo da atendente", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Simular perfil").selectOption("andrea");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  const [csv] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "CSV · métricas" }).click(),
  ]);
  expect(csv.suggestedFilename()).toMatch(/\.csv$/);
  const stream = await csv.createReadStream();
  const chunks = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const content = Buffer.concat(chunks).toString("utf8");
  expect(content).toContain("andrea");
  expect(content).not.toContain("estefani");
  expect(content).not.toContain("Índice");
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  const [xlsx] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "XLSX · métricas" }).click(),
  ]);
  const xstream = await xlsx.createReadStream();
  const xc = [];
  for await (const c of xstream!) xc.push(c);
  expect(Buffer.concat(xc).subarray(0, 2).toString()).toEqual("PK");
});
test("desktop, tablet e mobile não têm overflow global; capturas para revisão", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(150);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: testInfo.outputPath(`radar-${width}.png`),
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const agent of agents) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name: agent, exact: true })
      .click();
    await page.screenshot({
      path: testInfo.outputPath(`${agent.toLowerCase()}.png`),
      fullPage: true,
    });
  }
  await page.getByRole("tab", { name: "Minha Evolução" }).click();
  await page.screenshot({
    path: testInfo.outputPath("evolution.png"),
    fullPage: true,
  });
});

test("PDF e revisão das telas complementares", async ({ page }, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Equipe", exact: true })
    .click();
  await page.screenshot({
    path: testInfo.outputPath("equipe.png"),
    fullPage: true,
  });
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Histórico", exact: true })
    .click();
  await page.getByLabel("Tipo de período").selectOption("quarter");
  await page.screenshot({
    path: testInfo.outputPath("historico.png"),
    fullPage: true,
  });
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Estefani", exact: true })
    .click();
  await page.getByLabel("Tipo de período").selectOption("week");
  for (const tab of [
    "Meus Atendimentos",
    "Minha Comunicação",
    "Atendimentos Sensíveis",
    "Exemplos",
  ]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await page.screenshot({
      path: testInfo.outputPath(tab.replaceAll(" ", "-") + ".png"),
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Ver conversa completa" })
    .first()
    .click();
  await page.screenshot({ path: testInfo.outputPath("conversa.png") });
  await page.getByLabel("Fechar conversa").click();
  await page.getByRole("tab", { name: "Minha Semana" }).click();
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printRequested = "true";
    };
  });
  await page.getByRole("button", { name: "Exportar", exact: true }).click();
  await page.getByRole("button", { name: "PDF · imprimir esta visão" }).click();
  expect(
    await page.locator("body").getAttribute("data-print-requested"),
  ).toEqual("true");
  const pdf = await page.pdf({
    path: testInfo.outputPath("radar.pdf"),
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.subarray(0, 4).toString()).toEqual("%PDF");
});
