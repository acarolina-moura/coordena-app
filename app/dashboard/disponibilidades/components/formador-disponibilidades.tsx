"use client";

/**
 * COMPONENTE: DisponibilidadesFormador
 * 
 * MODIFICADO: Sistema de seleção de disponibilidades semanal com calendário interativo
 * 
 * FUNCIONALIDADE NOVA:
 * - Calendário do ano inteiro com dropdown de meses
 * - Seleção visual de semanas específicas (2ª-6ª feira, 9:00-17:00)
 * - Guarda disponibilidades por semana do ano (1-53)
 * - Estados: indisponível (cinzento) → Total (roxo) → Parcial (amarelo)
 * 
 * FLUXO:
 * 1. Utilizador seleciona mês via dropdown
 * 2. Aparecem as semanas desse mês com datas formatadas
 * 3. Clica numa semana para carregar suas disponibilidades
 * 4. Marca/desmarca horários (3 estados)
 * 5. Clica "Guardar" para persistir apenas dessa semana
 */

import { useState, useEffect } from "react";
import { Save, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Dias úteis: Segunda a Sexta (sem fim de semana)
const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
// Horários horários de disponibilidade: 9h-17h
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

// Nomes dos meses em português
const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

// Type para slot de horário
type Slot = { hora: number; minuto: number; diaSemana: string; semana?: number; tipo?: string };

/**
 * Info sobre uma semana do ano
 * semana: número (1-53)
 * dataInicio/dataFim: datas da segunda-feira e domingo
 * label: string formatada tipo "30 março - 5 abril"
 */
type SemanaInfo = {
  semana: number;
  dataInicio: Date;
  dataFim: Date;
  label: string;
};

// Gera chave única para cada slot (hora:minuto-dia)
function slotKey(hora: number, minuto: number, dia: string) {
  return `${hora}:${minuto}-${dia}`;
}

// Formata hora para HH:mm
function horaLabel(hora: number, minuto: number) {
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

// Formata data para "DD mês" (ex: "30 março")
function formatarData(data: Date): string {
  const dia = data.getDate();
  const mes = MESES_PT[data.getMonth()];
  return `${dia} ${mes}`;
}

/**
 * NOVO: Calcula todas as semanas do ano (1-53)
 * Cada semana começa na segunda-feira e termina no domingo
 * Retorna array com info de cada semana (datas e label)
 */
function calcularSemanasDoAno(): SemanaInfo[] {
  const semanas: SemanaInfo[] = [];
  const anoAtual = new Date().getFullYear();

  // Encontrar a primeira segunda-feira do ano
  const data = new Date(anoAtual, 0, 1);
  
  // Ajustar para segunda-feira da semana
  const dayOfWeek = data.getDay();
  const diasAteSegunda = (dayOfWeek === 0 ? -6 : 2 - dayOfWeek);
  data.setDate(data.getDate() + diasAteSegunda);

  let semana = 1;
  const anoSeguinte = anoAtual + 1;
  
  // Iterar pelas 52-53 semanas do ano
  while (data.getFullYear() < anoSeguinte || (data.getFullYear() === anoSeguinte && data.getMonth() === 0 && data.getDate() <= 7)) {
    const dataFim = new Date(data);
    dataFim.setDate(dataFim.getDate() + 6); // Domingo (6 dias depois de segunda)

    // Label formatado: "30 março - 5 abril"
    const label = `${formatarData(data)} - ${formatarData(dataFim)}`;

    semanas.push({
      semana,
      dataInicio: new Date(data),
      dataFim: new Date(dataFim),
      label,
    });

    // Avançar para próxima semana
    data.setDate(data.getDate() + 7);
    semana++;
    
    if (semana > 53) break;
  }

  return semanas;
}

/**
 * NOVO: Agrupa as semanas por mês
 * Retorna Map com chave "ano-mes" => Array de semanas desse mês
 * Exemplo: "2026-3" (abril) => [SemanaInfo, SemanaInfo, ...]
 */
function agruparSemanasPorMes(semanas: SemanaInfo[]): Map<string, SemanaInfo[]> {
  const mapa = new Map<string, SemanaInfo[]>();

  semanas.forEach((semana) => {
    const mes = semana.dataInicio.getMonth();
    const ano = semana.dataInicio.getFullYear();
    const chave = `${ano}-${mes}`;

    if (!mapa.has(chave)) {
      mapa.set(chave, []);
    }
    mapa.get(chave)!.push(semana);
  });

  return mapa;
}

// Estados possíveis para um slot: indisponível (null), total (roxo), parcial (amarelo)
type TipoDisponibilidade = null | "TOTAL" | "PARCIAL";

export default function DisponibilidadesFormador({
  userId,
}: {
  userId: string;
}) {
  // Estado: todas as 52-53 semanas do ano calculadas
  const [_todasAsSemanas, setTodasAsSemanas] = useState<SemanaInfo[]>([]);
  
  // Estado: semanas agrupadas por mês (Map de "ano-mes" => [semanas])
  const [semanasAgrupadas, setSemanasAgrupadas] = useState<Map<string, SemanaInfo[]>>(new Map());
  
  // Estado: mês atualmente selecionado no dropdown (formato "ano-mes")
  const [mesSelecionado, setMesSelecionado] = useState<string>("");
  
  // Estado: número da semana do ano atualmente ativa (1-53)
  const [semanaAtiva, setSemanaAtiva] = useState<number | null>(null);
  
  // Estado: slots de disponibilidade da semana ativa
  // Chave: "hora:minuto-dia", Valor: TOTAL | PARCIAL | null
  const [slots, setSlots] = useState<Record<string, TipoDisponibilidade>>({});
  
  // Estados UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // NOVO: Estado para garantir que o componente só renderiza após hidratação
  // Evita erros de "Text content did not match" entre server e client
  const [mounted, setMounted] = useState(false);

  // Estado para drag-and-drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hora: number; minuto: number; dia: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hora: number; minuto: number; dia: string } | null>(null);

  /**
   * NOVO: Inicialização - calcula todas as semanas do ano
   * Seleciona o mês atual por padrão
   */
  useEffect(() => {
    // NOVO: Marca como montado logo para evitar hidratação deficiente
    setMounted(true);
    
    const semanas = calcularSemanasDoAno();
    setTodasAsSemanas(semanas);
    
    // Agrupar as semanas por mês para facilitar navegação
    const agrupadas = agruparSemanasPorMes(semanas);
    setSemanasAgrupadas(agrupadas);
    
    // Selecionar mês atual como padrão no dropdown
    const agora = new Date();
    const chaveAtual = `${agora.getFullYear()}-${agora.getMonth()}`;
    setMesSelecionado(chaveAtual);
    
    // Selecionar primeira semana do mês atual
    const semanasDoMes = agrupadas.get(chaveAtual);
    if (semanasDoMes && semanasDoMes.length > 0) {
      setSemanaAtiva(semanasDoMes[0].semana);
    }
  }, []);

  /**
   * NOVO: Carrega disponibilidades do formador para a semana ativa
   * Faz fetch à API com userId e número da semana (1-53)
   */
  useEffect(() => {
    if (semanaAtiva === null) return;
    
    setLoading(true);
    fetch(`/api/disponibilidades?userId=${userId}&semana=${semanaAtiva}`)
      .then((r) => r.json())
      .then((data: Slot[]) => {
        const mapa: Record<string, TipoDisponibilidade> = {};
        if (Array.isArray(data)) {
          data.forEach((s) => {
            mapa[slotKey(s.hora, s.minuto, s.diaSemana)] = (s.tipo as TipoDisponibilidade) || "TOTAL";
          });
        }
        setSlots(mapa);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, semanaAtiva]);

  /**
   * NOVO: Quando o utilizador muda de mês no dropdown
   * Carrega automaticamente a primeira semana desse mês
   */
  useEffect(() => {
    if (mesSelecionado && semanasAgrupadas.size > 0) {
      const semanasDoMes = semanasAgrupadas.get(mesSelecionado);
      if (semanasDoMes && semanasDoMes.length > 0) {
        // Seleciona a primeira semana do novo mês
        setSemanaAtiva(semanasDoMes[0].semana);
      }
    }
  }, [mesSelecionado, semanasAgrupadas]);

  /**
   * Toggle do estado de um slot
   * Ciclo: indisponível (cinzento) → TOTAL (roxo) → PARCIAL (amarelo) → indisponível
   */
  function toggle(hora: number, minuto: number, dia: string) {
    const key = slotKey(hora, minuto, dia);
    setSlots((prev) => {
      const current = prev[key];
      let next: TipoDisponibilidade;

      // Ciclo de 3 estados
      if (current === null || current === undefined) {
        next = "TOTAL"; // Estava indisponível, marca como Total
      } else if (current === "TOTAL") {
        next = "PARCIAL"; // Era Total, muda para Parcial
      } else {
        next = null; // Era Parcial, volta a indisponível
      }

      return { ...prev, [key]: next };
    });
  }

  /**
   * NOVO: Inicia o drag - marca o slot inicial
   */
  function handleMouseDown(hora: number, minuto: number, dia: string) {
    setIsDragging(true);
    setDragStart({ hora, minuto, dia });
    setDragEnd({ hora, minuto, dia });
  }

  /**
   * NOVO: Durante o drag, atualiza o ponto final
   */
  function handleMouseEnter(hora: number, minuto: number, dia: string) {
    if (!isDragging || !dragStart) return;
    setDragEnd({ hora, minuto, dia });
  }

  /**
   * NOVO: Termina o drag - aplica a ação
   * Se foi clique simples (start === end): faz toggle
   * Se foi drag (start !== end): seleciona todo o range
   *   - Sem tecla: TOTAL (roxo)
   *   - SHIFT: PARCIAL (amarelo)
   *   - CTRL/CMD: null (desseleciona)
   */
  function handleMouseUp(e: React.MouseEvent) {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      return;
    }

    const isSimpleClick =
      dragStart.hora === dragEnd.hora &&
      dragStart.minuto === dragEnd.minuto &&
      dragStart.dia === dragEnd.dia;

    if (isSimpleClick) {
      // Clique simples: faz toggle
      toggle(dragStart.hora, dragStart.minuto, dragStart.dia);
    } else {
      // Drag: seleciona range com base nos modificadores
      const startDiaIndex = DIAS.indexOf(dragStart.dia);
      const endDiaIndex = DIAS.indexOf(dragEnd.dia);
      const startHoraIndex = HORAS.indexOf(dragStart.hora);
      const endHoraIndex = HORAS.indexOf(dragEnd.hora);

      const minDiaIndex = Math.min(startDiaIndex, endDiaIndex);
      const maxDiaIndex = Math.max(startDiaIndex, endDiaIndex);
      const minHoraIndex = Math.min(startHoraIndex, endHoraIndex);
      const maxHoraIndex = Math.max(startHoraIndex, endHoraIndex);

      // Determina o tipo baseado nos modificadores
      let tipo: TipoDisponibilidade = "TOTAL";
      if (e.shiftKey) {
        tipo = "PARCIAL";
      } else if (e.ctrlKey || e.metaKey) {
        tipo = null;
      }

      const newSlots = { ...slots };
      for (let h = minHoraIndex; h <= maxHoraIndex; h++) {
        for (let d = minDiaIndex; d <= maxDiaIndex; d++) {
          for (const minuto of [0, 30]) {
            const hora = HORAS[h];
            const dia = DIAS[d];
            const key = slotKey(hora, minuto, dia);
            newSlots[key] = tipo;
          }
        }
      }
      setSlots(newSlots);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }

  /**
   * NOVO: Listener global para limpar estado quando mouse sai da área
   */
  useEffect(() => {
    function handleMouseUpGlobal() {
      if (isDragging) {
        handleMouseUp();
      }
    }

    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, [isDragging, dragStart, dragEnd, slots]);

  /**
   * NOVO: Guarda as disponibilidades selecionadas para a semana ativa
   * Envia apenas os slots que estão marcados (TOTAL ou PARCIAL)
   * A API apaga os dados antigos da semana antes de guardar os novos
   */
  async function handleSave() {
    setSaving(true);
    try {
      if (semanaAtiva === null) {
        alert("Selecione uma semana");
        setSaving(false);
        return;
      }

      // Converte o estado para lista de slots ativos (ignora indisponíveis)
      const ativos: Slot[] = [];
      for (const [key, tipo] of Object.entries(slots)) {
        if (!tipo) continue; // Pula os indisponíveis (null)
        const [horaMinuto, dia] = key.split("-");
        const [hora, minuto] = horaMinuto.split(":").map(Number);
        // Adiciona o slot ativo com seu tipo (TOTAL ou PARCIAL)
        ativos.push({ hora, minuto, diaSemana: dia, tipo });
      }

      // NOVO: POST para /api/disponibilidades com semana
      // A API apagará os registros antigos da semana antes de inserir os novos
      const res = await fetch("/api/disponibilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          slots: ativos,
          semana: semanaAtiva, // Envia o número da semana (1-53)
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Erro ao guardar disponibilidades.");
      }
    } catch {
      alert("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  const totalSelected = Object.values(slots).filter((t) => t !== null).length;

  // NOVO: Mostrar loading enquanto o componente não está hidratado no cliente
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Disponibilidades
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Clique para ciclar estados · Arrastra: roxo | + SHIFT: amarelo | + CTRL: vazio · {totalSelected} blocos selecionados
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> A guardar…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {saved ? "Guardado!" : "Guardar"}
            </>
          )}
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 overflow-x-auto">
        {/* NOVO: Calendário de Semanas com Dropdown de Meses */}
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              📅 Selecione a Semana
            </label>

            {/* NOVO: Dropdown que lista todos os meses do ano */}
            <div className="flex items-center gap-3 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-80 justify-between rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
                  >
                    <span>
                      {mesSelecionado
                        ? (() => {
                            const [ano, mesStr] = mesSelecionado.split("-");
                            const mes = parseInt(mesStr, 10);
                            const nomeDoMes = MESES_PT[mes];
                            return `${nomeDoMes.charAt(0).toUpperCase() + nomeDoMes.slice(1)} ${ano}`;
                          })()
                        : "Selecionar mês..."}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                {/* NOVO: Lista de meses disponíveis para escolher */}
                <DropdownMenuContent align="start" className="w-80 max-h-80 overflow-y-auto">
                  {Array.from(semanasAgrupadas.keys())
                    .sort()
                    .map((chave) => {
                      const [ano, mesStr] = chave.split("-");
                      const mes = parseInt(mesStr, 10);
                      const nomeDoMes = MESES_PT[mes];
                      const semanasDo = semanasAgrupadas.get(chave) || [];

                      return (
                        <DropdownMenuItem
                          key={chave}
                          onClick={() => setMesSelecionado(chave)}
                          className={cn(
                            "cursor-pointer",
                            mesSelecionado === chave && "bg-purple-100 dark:bg-purple-950",
                          )}
                        >
                          {nomeDoMes.charAt(0).toUpperCase() + nomeDoMes.slice(1)} {ano} ({semanasDo.length} semanas)
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* NOVO: Grid das semanas pertencentes ao mês selecionado */}
            {semanasAgrupadas.get(mesSelecionado) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cada botão representa uma semana do mês */}
                {semanasAgrupadas.get(mesSelecionado)!.map((semana) => (
                  <button
                    key={semana.semana}
                    onClick={() => setSemanaAtiva(semana.semana)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left font-medium text-sm",
                      // Semana ativa fica roxo, outras ficam cinzentas
                      semanaAtiva === semana.semana
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 shadow-md"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700",
                    )}
                  >
                    {/* Mostra datas formatadas: "30 março - 5 abril" */}
                    <div className="font-semibold text-base">{semana.label}</div>
                    {/* Mostra o número da semana do ano (1-53) */}
                    <div className="text-xs mt-1 opacity-75">Semana {semana.semana} do ano</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 mb-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          {/* Cores */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-purple-500" /> Disponibilidade Total
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-amber-500" /> Parcial (Só Online)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-gray-300" /> Indisponível
            </span>
          </div>

          {/* Instruções discretas */}
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            <div>
              <span className="font-medium">Clique:</span> cicla entre os 3 estados
            </div>
            <div>
              <span className="font-medium">Arrastar:</span> roxo | <span className="font-medium">+ SHIFT:</span> amarelo | <span className="font-medium">+ CTRL:</span> vazio
            </div>
          </div>
        </div>

        <table className="w-full min-w-[600px] border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="w-20 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 pb-2">
                Hora
              </th>
              {DIAS.map((dia) => (
                <th
                  key={dia}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 pb-2"
                >
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) =>
              [0, 30].map((minuto) => (
                <tr key={`${hora}-${minuto}`}>
                  <td className="text-sm text-gray-400 dark:text-gray-500 font-medium pr-4 py-1 align-middle">
                    {horaLabel(hora, minuto)}
                  </td>
                  {DIAS.map((dia) => {
                    const key = slotKey(hora, minuto, dia);
                    const tipo = slots[key];
                    
                    let bgColor = "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20";
                    let dotColor = "bg-transparent";
                    
                    if (tipo === "TOTAL") {
                      bgColor = "border-purple-300 dark:border-purple-600 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200";
                      dotColor = "bg-purple-500";
                    } else if (tipo === "PARCIAL") {
                      bgColor = "border-amber-300 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200";
                      dotColor = "bg-amber-500";
                    }
                    
                    return (
                      <td key={dia} className="px-1.5 py-1">
                        <button
                          onMouseDown={() => handleMouseDown(hora, minuto, dia)}
                          onMouseEnter={() => handleMouseEnter(hora, minuto, dia)}
                          onMouseUp={(e) => handleMouseUp(e)}
                          disabled={saving}
                          className={cn(
                            "w-full h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-150 select-none",
                            saving && "opacity-50 cursor-not-allowed",
                            isDragging && "cursor-grabbing",
                            bgColor,
                          )}
                          title={tipo === "TOTAL" ? "Disponibilidade Total\n(ou Arrastar)" : tipo === "PARCIAL" ? "Disponibilidade Parcial\n(ou Arrastar + SHIFT)" : "Indisponível\n(ou Arrastar + CTRL)"}
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full transition-all",
                              tipo ? "scale-110" : "",
                              dotColor,
                            )}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
