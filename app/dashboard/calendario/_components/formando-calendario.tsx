"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

import { useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sessao {
  id: string;
  titulo: string;
  formador: string;
  data: string; // "YYYY-MM-DD"
  horaInicio: string;
  duracao: string;
  ufcd: string;
  cor: string;
}

const COLORS = [
  "bg-teal-100 text-teal-700 border-teal-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS     = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarioFormandoPage() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(toISO(today.getFullYear(), today.getMonth(), today.getDate()));
  const [minhasSessoes, setMinhasSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessoes() {
      try {
        const res = await fetch("/api/aulas");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((aula: any, index: number) => {
            const dt = new Date(aula.dataHora);
            return {
              id: aula.id,
              titulo: aula.titulo,
              formador: aula.formador.user.nome,
              data: dt.toISOString().split("T")[0],
              horaInicio: dt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
              duracao: `${aula.duracao}min`,
              ufcd: `UFCD-${aula.moduloId.slice(0,4).toUpperCase()}`,
              cor: COLORS[index % COLORS.length]
            };
          });
          setMinhasSessoes(mapped);
        }
      } catch (err) {
        console.error("Erro ao carregar sessões:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessoes();
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const todayISO    = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => viewMonth === 0  ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

  const sessoesMes = minhasSessoes.filter(s =>
    s.data.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)
  );
  const sessoesDia    = minhasSessoes.filter(s => s.data === selected);
  const diasComSessao = new Set(sessoesMes.map(s => parseInt(s.data.split("-")[2])));
  const proximas      = minhasSessoes.filter(s => s.data >= todayISO).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 5);

  const selectedLabel = selected
    ? new Date(selected + "T12:00:00").toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">O Meu Calendário</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{sessoesMes.length} sessões este mês</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Calendar */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{MONTHS[viewMonth]} {viewYear}</h2>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day        = i + 1;
              const iso        = toISO(viewYear, viewMonth, day);
              const isToday    = iso === todayISO;
              const isSelected = iso === selected;
              const hasSessao  = diasComSessao.has(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelected(iso)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl py-2 text-sm font-medium transition-all",
                    isSelected ? "bg-teal-500 text-white shadow-sm"
                    : isToday  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-bold"
                    :            "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {day}
                  {hasSessao && (
                    <span className={cn("mt-0.5 h-1 w-1 rounded-full", isSelected ? "bg-white/60" : "bg-teal-400")} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Sessions for selected day */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 capitalize">{selectedLabel ?? "Seleciona um dia"}</h3>
            <p className="text-xs text-gray-400 mb-4">
              {sessoesDia.length > 0 ? `${sessoesDia.length} sessão(ões)` : "Sem sessões"}
            </p>
            {sessoesDia.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sessoesDia.map(s => (
                  <div key={s.id} className={cn("rounded-xl border p-4 flex flex-col gap-2", s.cor)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{s.titulo}</p>
                      <span className="shrink-0 rounded-lg bg-white/50 px-2 py-0.5 text-[11px] font-medium">{s.ufcd}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs opacity-80">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.horaInicio} · {s.duracao}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{s.formador}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Clock className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Nenhuma sessão neste dia</p>
              </div>
            )}
          </div>

          {/* Próximas */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Próximas Sessões</h3>
            <div className="flex flex-col gap-2">
              {proximas.map(s => {
                const [, month, day] = s.data.split("-");
                return (
                  <button key={s.id} onClick={() => setSelected(s.data)}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-left hover:border-teal-200 hover:bg-teal-50/30 dark:hover:border-teal-800 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    <div className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-teal-100 py-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-teal-500">{MONTHS[parseInt(month) - 1].slice(0, 3)}</span>
                      <span className="text-sm font-bold leading-tight text-teal-700 dark:text-teal-400">{day}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{s.titulo}</span>
                      <span className="text-[11px] text-gray-400">{s.horaInicio} · {s.duracao} · {s.formador}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}