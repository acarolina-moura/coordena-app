"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Clock, Loader, Check, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { obterAulasFormador, obterAlunosComPresenca, guardarPresenca } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sessao {
  id: string;
  titulo: string;
  formador: string;
  data: string; // "YYYY-MM-DD"
  horaInicio: string;
  duracao: string;
  durationMinutes?: number; // duração em minutos
  ufcd: string;
  cor: string;
}

interface AlunoPresenca {
  id: string;
  nome: string;
  status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

// Removido - agora carrega da BD

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function podeMarcarPresenca(horaInicio: string, durationMinutes?: number): { pode: boolean; motivo?: string } {
  const agora = new Date();
  
  const [hInicio, minInicio] = horaInicio.split(":").map(Number);
  const durMinutos = durationMinutes || 0;
  
  const dataInicio = new Date();
  dataInicio.setHours(hInicio, minInicio, 0);
  
  const dataFim = new Date(dataInicio);
  dataFim.setMinutes(dataFim.getMinutes() + durMinutos);
  
  if (agora < dataInicio) {
    return { pode: false, motivo: `Aula começa às ${horaInicio}` };
  }
  if (agora > dataFim) {
    return { pode: false, motivo: `Aula terminou às ${dataFim.getHours().toString().padStart(2, "0")}:${dataFim.getMinutes().toString().padStart(2, "0")}` };
  }
  
  return { pode: true };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormadorCalendarioPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(toISO(today.getFullYear(), today.getMonth(), today.getDate()));
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Presença
  const [aulaAberta, setAulaAberta] = useState<string | null>(null);
  const [alunos, setAlunos] = useState<AlunoPresenca[]>([]);
  const [loadingPresenca, setLoadingPresenca] = useState(false);
  const [presencasAlteradas, setPresencasAlteradas] = useState<Record<string, 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'>>({});
  
  // Assiduidade - Aulas de hoje
  const [aulaHojeAberta, setAulaHojeAberta] = useState<string | null>(null);
  const [alunosHoje, setAlunosHoje] = useState<AlunoPresenca[]>([]);
  const [loadingPresencaHoje, setLoadingPresencaHoje] = useState(false);
  const [presencasHojeAlteradas, setPresencasHojeAlteradas] = useState<Record<string, 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'>>({});

  // Carregar aulas ao montar
  useEffect(() => {
    async function carregarAulas() {
      try {
        setLoading(true);
        const resultado = await obterAulasFormador();
        if (resultado.success && resultado.aulas) {
          setSessoes(resultado.aulas);
        } else {
          console.error('Erro ao carregar aulas:', resultado.error);
        }
      } catch (error) {
        console.error('Erro ao carregar aulas:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarAulas();
  }, []);

  // Carregar alunos de uma aula
  const abrirAula = async (aulaId: string) => {
    try {
      setLoadingPresenca(true);
      setAulaAberta(aulaId);
      setPresencasAlteradas({});
      
      const resultado = await obterAlunosComPresenca(aulaId);
      if (resultado.success && resultado.alunos) {
        setAlunos(resultado.alunos);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoadingPresenca(false);
    }
  };

  const fecharAula = () => {
    setAulaAberta(null);
    setAlunos([]);
    setPresencasAlteradas({});
  };

  const alterarPresenca = (alunoId: string, status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO') => {
    setPresencasAlteradas((prev) => ({
      ...prev,
      [alunoId]: status,
    }));
  };

  const guardarPresencas = async () => {
    try {
      if (!aulaAberta) return;

      for (const [alunoId, status] of Object.entries(presencasAlteradas)) {
        await guardarPresenca(aulaAberta, alunoId, status as 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO');
      }

      // Recarregar alunos
      await abrirAula(aulaAberta);
    } catch (error) {
      console.error('Erro ao guardar presenças:', error);
    }
  };

  // Assiduidade - Aulas de Hoje
  const abrirAulaHoje = async (aulaId: string) => {
    try {
      setLoadingPresencaHoje(true);
      setAulaHojeAberta(aulaId);
      setPresencasHojeAlteradas({});
      
      const resultado = await obterAlunosComPresenca(aulaId);
      if (resultado.success && resultado.alunos) {
        setAlunosHoje(resultado.alunos);
      }
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoadingPresencaHoje(false);
    }
  };

  const fecharAulaHoje = () => {
    setAulaHojeAberta(null);
    setAlunosHoje([]);
    setPresencasHojeAlteradas({});
  };

  const alterarPresencaHoje = (alunoId: string, status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO') => {
    setPresencasHojeAlteradas((prev) => ({
      ...prev,
      [alunoId]: status,
    }));
  };

  const guardarPresencasHoje = async () => {
    try {
      if (!aulaHojeAberta) return;

      for (const [alunoId, status] of Object.entries(presencasHojeAlteradas)) {
        await guardarPresenca(aulaHojeAberta, alunoId, status as 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO');
      }

      // Recarregar alunos
      await abrirAulaHoje(aulaHojeAberta);
    } catch (error) {
      console.error('Erro ao guardar presenças:', error);
    }
  };
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const sessoesDoMes = sessoes.filter((s) => s.data.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`));
  const sessoesDoDia = sessoes.filter((s) => s.data === selectedDate);
  const sessoesHoje = sessoes.filter((s) => s.data === todayISO);

  // Days that have sessions this month
  const diasComSessoes = new Set(sessoesDoMes.map((s) => parseInt(s.data.split("-")[2])));

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-gray-900">Calendário</h1>
              <p className="mt-0.5 text-sm text-gray-500">{sessoesDoMes.length} sessões este mês</p>
            </div>
          </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = toISO(viewYear, viewMonth, day);
              const isToday = iso === todayISO;
              const isSelected = iso === selectedDate;
              const hasSessao = diasComSessoes.has(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isToday
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {day}
                  {hasSessao && (
                    <span className={cn(
                      "mt-0.5 h-1 w-1 rounded-full",
                      isSelected ? "bg-white/60" : "bg-indigo-400"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session list for selected day */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1 capitalize">
              {selectedDateLabel ?? "Seleciona um dia"}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {sessoesDoDia.length > 0 ? `${sessoesDoDia.length} sessão(ões)` : "Sem sessões"}
            </p>

            {sessoesDoDia.length > 0 ? (
              <div className="flex flex-col gap-3">
                {sessoesDoDia.map((sessao) => (
                  <div key={sessao.id} className={cn("rounded-xl border p-4 flex flex-col gap-2", sessao.cor)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight">{sessao.titulo}</p>
                      <span className="shrink-0 rounded-lg bg-white/60 border border-current/10 px-2 py-0.5 text-[11px] font-medium">
                        {sessao.ufcd}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs opacity-80">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {sessao.horaInicio} · {sessao.duracao}
                      </span>
                      <span>{sessao.formador}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Nenhuma sessão neste dia</p>
              </div>
            )}
          </div>

          {/* Próximas sessões (all upcoming) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Próximas Sessões</h3>
            <div className="flex flex-col gap-3">
              {sessoes
                .filter((s) => s.data >= todayISO)
                .sort((a, b) => a.data.localeCompare(b.data))
                .slice(0, 4)
                .map((sessao) => {
                  const [, month, day] = sessao.data.split("-");
                  return (
                    <div
                      key={sessao.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-indigo-100 py-1.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                            {MONTHS[parseInt(month) - 1].slice(0, 3)}
                          </span>
                          <span className="text-sm font-bold leading-tight text-indigo-700">{day}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-xs font-semibold text-gray-800 truncate">{sessao.titulo}</span>
                          <span className="text-[11px] text-gray-400">{sessao.horaInicio} · {sessao.duracao} · {sessao.formador}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Marcar Presença */}
          {aulaAberta && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Registar Presença</h3>
                <Button variant="outline" size="sm" onClick={fecharAula}>Fechar</Button>
              </div>

              {loadingPresenca ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                </div>
              ) : alunos.length > 0 ? (
                <>
                  <div className="flex flex-col gap-3 mb-4 max-h-60 overflow-y-auto">
                    {alunos.map((aluno) => {
                      const statusAtual = presencasAlteradas[aluno.id] ?? aluno.status;
                      const foiAlterado = presencasAlteradas[aluno.id] !== undefined;

                      return (
                        <div key={aluno.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                          <span className="text-sm font-medium text-gray-900">{aluno.nome}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={statusAtual === 'PRESENTE' ? 'default' : 'outline'}
                              className={cn(
                                'gap-1',
                                statusAtual === 'PRESENTE' && 'bg-green-600 hover:bg-green-700 text-white'
                              )}
                              onClick={() => alterarPresenca(aluno.id, 'PRESENTE')}
                            >
                              <Check className="h-3 w-3" />
                              Presente
                            </Button>
                            <Button
                              size="sm"
                              variant={statusAtual === 'AUSENTE' ? 'default' : 'outline'}
                              className={cn(
                                'gap-1',
                                statusAtual === 'AUSENTE' && 'bg-red-600 hover:bg-red-700 text-white'
                              )}
                              onClick={() => alterarPresenca(aluno.id, 'AUSENTE')}
                            >
                              <X className="h-3 w-3" />
                              Ausente
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {Object.keys(presencasAlteradas).length > 0 && (
                    <Button
                      onClick={guardarPresencas}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Guardar Presenças
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 py-4">Nenhum aluno encontrado nesta aula.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aulas Hoje - Marcar Assiduidade */}
      {!loading && sessoesHoje.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">Aulas Hoje - Marcar Assiduidade</h2>
            <p className="text-sm text-gray-500 mt-1">{sessoesHoje.length} aula(s) hoje</p>
          </div>

          {aulaHojeAberta ? (
            <>
              {/* Detalhes da aula e lista de alunos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sessoesHoje.find(s => s.id === aulaHojeAberta)?.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      {sessoesHoje.find(s => s.id === aulaHojeAberta)?.horaInicio} · {sessoesHoje.find(s => s.id === aulaHojeAberta)?.duracao}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={fecharAulaHoje}>Fechar</Button>
                </div>

                <div className="rounded-lg border border-gray-200">
                  {loadingPresencaHoje ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                  ) : alunosHoje.length > 0 ? (
                    <>
                      <div className="divide-y max-h-96 overflow-y-auto">
                        {alunosHoje.map((aluno) => {
                          const statusAtual = presencasHojeAlteradas[aluno.id] ?? aluno.status;

                          return (
                            <div key={aluno.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                              <span className="text-sm font-medium text-gray-900">{aluno.nome}</span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={statusAtual === 'PRESENTE' ? 'default' : 'outline'}
                                  className={cn(
                                    'gap-1',
                                    statusAtual === 'PRESENTE' && 'bg-green-600 hover:bg-green-700 text-white'
                                  )}
                                  onClick={() => alterarPresencaHoje(aluno.id, 'PRESENTE')}
                                >
                                  <Check className="h-3 w-3" />
                                  Presente
                                </Button>
                                <Button
                                  size="sm"
                                  variant={statusAtual === 'AUSENTE' ? 'default' : 'outline'}
                                  className={cn(
                                    'gap-1',
                                    statusAtual === 'AUSENTE' && 'bg-red-600 hover:bg-red-700 text-white'
                                  )}
                                  onClick={() => alterarPresencaHoje(aluno.id, 'AUSENTE')}
                                >
                                  <X className="h-3 w-3" />
                                  Ausente
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {Object.keys(presencasHojeAlteradas).length > 0 && (
                        <div className="border-t p-4 bg-gray-50">
                          <Button
                            onClick={guardarPresencasHoje}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Guardar Presenças
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <p className="text-sm">Nenhum aluno encontrado nesta aula.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {sessoesHoje.map((aula) => {
                const podeMarcar = podeMarcarPresenca(aula.horaInicio, aula.durationMinutes);

                return (
                  <button
                    key={aula.id}
                    onClick={() => podeMarcar.pode && abrirAulaHoje(aula.id)}
                    disabled={!podeMarcar.pode}
                    className={cn(
                      "text-left p-4 rounded-lg border-2 transition-all",
                      podeMarcar.pode
                        ? "border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100 cursor-pointer"
                        : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{aula.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">{aula.horaInicio} · {aula.duracao}</p>
                      </div>
                      {podeMarcar.pode ? (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          Aberto
                        </span>
                      ) : (
                        <div className="text-right">
                          <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium block mb-1">
                            Fechado
                          </span>
                          <p className="text-xs text-gray-500">{podeMarcar.motivo}</p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

        </>
      )}
    </div>
  );
}