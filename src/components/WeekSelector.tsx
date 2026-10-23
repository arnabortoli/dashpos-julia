"use client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { weekLabel } from "@/domain/metrics";
import type { PeriodFilter } from "@/domain/period";
export default function WeekSelector({
  weeks,
  value,
  onChange,
}: {
  weeks: string[];
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}) {
  const idx = weeks.indexOf(value.week);
  return (
    <div className="period-controls">
      <div className="period-main">
        <CalendarDays size={16} />
        <select
          aria-label="Tipo de período"
          value={value.mode}
          onChange={(e) =>
            onChange({ ...value, mode: e.target.value as PeriodFilter["mode"] })
          }
        >
          <option value="week">Semana</option>
          <option value="previous">Semana anterior</option>
          <option value="four">Últimas 4 semanas</option>
          <option value="month">Mês</option>
          <option value="quarter">Trimestre</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>
      {["week", "previous", "four"].includes(value.mode) && (
        <div className="week-stepper">
          <button
            className="icon-button"
            disabled={idx <= 0}
            onClick={() => onChange({ ...value, week: weeks[idx - 1] })}
            aria-label="Voltar uma semana"
          >
            <ChevronLeft size={16} />
          </button>
          <select
            aria-label="Semana de referência"
            value={value.week}
            onChange={(e) => onChange({ ...value, week: e.target.value })}
          >
            {[...weeks].reverse().map((w, i) => (
              <option key={w} value={w}>
                {weekLabel(w)}
                {i === 0 ? " · atual" : ""}
              </option>
            ))}
          </select>
          <button
            className="icon-button"
            disabled={idx >= weeks.length - 1}
            onClick={() => onChange({ ...value, week: weeks[idx + 1] })}
            aria-label="Avançar uma semana"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      {value.mode === "month" && (
        <input
          type="month"
          aria-label="Mês"
          value={value.month}
          onChange={(e) => onChange({ ...value, month: e.target.value })}
        />
      )}{" "}
      {value.mode === "quarter" && (
        <select
          aria-label="Trimestre"
          value={value.quarter}
          onChange={(e) => onChange({ ...value, quarter: e.target.value })}
        >
          {["2026-Q3", "2026-Q4"].map((q) => (
            <option key={q} value={q}>
              {q.replace("-Q", " · trimestre ")}
            </option>
          ))}
        </select>
      )}
      {value.mode === "custom" && (
        <div className="custom-dates">
          <label>
            De
            <input
              aria-label="Início do intervalo"
              type="date"
              value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
            />
          </label>
          <label>
            Até
            <input
              aria-label="Fim do intervalo"
              type="date"
              value={value.end}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
