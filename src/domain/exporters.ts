import { strToU8, zipSync } from "fflate";
import type { WeeklySnapshot } from "./types";
import { calculateMetrics } from "./metrics";
export function exportRows(snapshots: WeeklySnapshot[]) {
  return [
    [
      "Fonte",
      "Atendente",
      "Semana",
      "Versão",
      "Parcial",
      "Atendimentos [objetivo]",
      "Duração média s [calculado]",
      "Mediana s [calculado]",
      "CSAT médio [calculado]",
      "Avaliações [objetivo]",
      "Sensíveis na amostra [IA]",
      "Base analisada [IA]",
    ],
    ...snapshots.map((s) => {
      const m = calculateMetrics([s]);
      return [
        "SIMULAÇÃO",
        s.agentId,
        s.week,
        s.version,
        s.partial ? "Sim" : "Não",
        m.total,
        m.averageSeconds === null ? "" : Math.round(m.averageSeconds),
        m.medianSeconds ?? "",
        m.csatAverage ?? "",
        m.csatResponses,
        s.ai.conversations.length
          ? s.ai.conversations.filter((a) => a.sensitive).length
          : "Indisponível",
        s.ai.conversations.length,
      ];
    }),
  ];
}
export function toCsv(rows: (string | number)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(";"),
      )
      .join("\r\n")
  );
}
const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
export function toXlsx(rows: (string | number)[][]) {
  const cells = rows
    .map(
      (row, r) =>
        `<row r="${r + 1}">${row
          .map((v, c) => {
            let n = c + 1,
              col = "";
            while (n) {
              n--;
              col = String.fromCharCode(65 + (n % 26)) + col;
              n = Math.floor(n / 26);
            }
            const ref = col + (r + 1);
            return typeof v === "number"
              ? `<c r="${ref}"><v>${v}</v></c>`
              : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;
          })
          .join("")}</row>`,
    )
    .join("");
  const files = {
    "[Content_Types].xml":
      '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":
      '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Radar - Simulação" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels":
      '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${cells}</sheetData><autoFilter ref="A1:L${rows.length}"/></worksheet>`,
  };
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
  );
}
export function downloadReport(
  format: "csv" | "xlsx",
  snapshots: WeeklySnapshot[],
) {
  const rows = exportRows(snapshots),
    content = format === "csv" ? toCsv(rows) : toXlsx(rows);
  const blob = new Blob([content as BlobPart], {
    type:
      format === "csv"
        ? "text/csv;charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `radar-simulacao-${snapshots[0]?.week ?? "vazio"}.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
