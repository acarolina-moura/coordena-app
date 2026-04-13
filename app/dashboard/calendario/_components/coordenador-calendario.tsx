"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Curso {
  id: string;
  nome: string;
}
interface Modulo {
  id: string;
  nome: string;
  curso: Curso;
}
interface Formador {
  id: string;
  user: { nome: string };
}

interface Aula {
  id: string;
  titulo: string;
  dataHora: string;
  duracao: number;
  moduloId: string;
  formadorId: string;
  modulo: Modulo;
  formador: Formador;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const DAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const COLORS = [
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function aulaDateISO(aula: Aula) {
  return new Date(aula.dataHora).toISOString().split("T")[0];
}

function formatTime(aula: Aula) {
  const d = new Date(aula.dataHora);
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function formatDuracao(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

function corModulo(moduloId: string) {
  let h = 0;
  for (let i = 0; i < moduloId.length; i++)
    h = (h * 31 + moduloId.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

// ─── Nova Sessão Dialog ───────────────────────────────────────────────────────

interface NovaSessaoDialogProps {
  modulos: Modulo[];
  formadores: Formador[];
  onCreated: () => void;
}

function NovaSessaoDialog({
  modulos,
  formadores,
  onCreated,
}: NovaSessaoDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    moduloId: "",
    formadorId: "",
    data: "",
    hora: "09:00",
    duracao: "120",
  });
  const [erro, setErro] = useState<string | null>(null);

  // Data mínima = hoje
  const todayISO = toISO(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  // Hora mínima: se a data escolhida for hoje, bloqueia horas passadas
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const minHora = form.data === todayISO ? currentTimeStr : "00:00";

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setErro(null);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  async function handleSubmit() {
    setErro(null);

    if (!form.titulo || !form.moduloId || !form.formadorId || !form.data) {
      setErro("Preenche todos os campos obrigatórios.");
      return;
    }

    // Validação: não permitir datas/horas passadas
    const dataHoraEscolhida = new Date(`${form.data}T${form.hora}:00`);
    if (dataHoraEscolhida <= new Date()) {
      setErro("Não é possível criar sessões em datas ou horários passados.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo,
          dataHora: dataHoraEscolhida.toISOString(),
          duracao: parseInt(form.duracao) || 60,
          moduloId: form.moduloId,
          formadorId: form.formadorId,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setErro(j.error ?? "Erro ao criar sessão");
      } else {
        setOpen(false);
        setForm({
          titulo: "",
          moduloId: "",
          formadorId: "",
          data: "",
          hora: "09:00",
          duracao: "120",
        });
        onCreated();
      }
    } catch {
      setErro("Erro de rede. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4" /> Nova Sessão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Sessão</DialogTitle>
          <DialogDescription>
            Preenche os dados da sessão de formação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label>Título *</Label>
            <Input
              value={form.titulo}
              onChange={set("titulo")}
              placeholder="Ex: Design Gráfico — Sessão 14"
            />
          </div>

          {/* Módulo */}
          <div className="flex flex-col gap-1.5">
            <Label>Módulo *</Label>
            <select
              value={form.moduloId}
              onChange={set("moduloId")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Seleciona um módulo…</option>
              {modulos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} ({m.curso.nome})
                </option>
              ))}
            </select>
          </div>

          {/* Formador */}
          <div className="flex flex-col gap-1.5">
            <Label>Formador *</Label>
            <select
              value={form.formadorId}
              onChange={set("formadorId")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Seleciona um formador…</option>
              {formadores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.user.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.data}
                onChange={set("data")}
                min={todayISO}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Hora de início</Label>
              <Input
                type="time"
                value={form.hora}
                onChange={set("hora")}
                min={minHora}
              />
            </div>
          </div>

          {/* Duração */}
          <div className="flex flex-col gap-1.5">
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              min="15"
              step="15"
              value={form.duracao}
              onChange={set("duracao")}
              placeholder="Ex: 120"
            />
          </div>

          {erro && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />A criar…
              </>
            ) : (
              "Criar Sessão"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoordenadorCalendario() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toISO(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [formadores, setFormadores] = useState<Formador[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const todayISO = toISO(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/aulas").then((r) => r.json()),
      fetch("/api/modulos").then((r) => r.json()),
      fetch("/api/formadores").then((r) => r.json()),
    ])
      .then(([a, m, f]) => {
        setAulas(Array.isArray(a) ? a : []);
        setModulos(Array.isArray(m) ? m : []);
        setFormadores(Array.isArray(f) ? f : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function fetchAulas() {
    const res = await fetch("/api/aulas");
    if (res.ok) setAulas(await res.json());
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await fetch(`/api/aulas/${id}`, { method: "DELETE" });
    await fetchAulas();
    setDeleting(null);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  const prefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const aulasMes = aulas.filter((a) => aulaDateISO(a).startsWith(prefix));
  const aulasDia = aulas.filter((a) => aulaDateISO(a) === selectedDate);
  const diasComAulas = new Set(
    aulasMes.map((a) => parseInt(aulaDateISO(a).split("-")[2])),
  );

  const proximas = aulas
    .filter((a) => aulaDateISO(a) >= todayISO)
    .sort(
      (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    )
    .slice(0, 5);

  const selectedLabel = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-PT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Calendário</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {aulasMes.length} sessão(ões) este mês
          </p>
        </div>
        <NovaSessaoDialog
          modulos={modulos}
          formadores={formadores}
          onCreated={fetchAulas}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[1fr_380px] items-start">
        {/* Calendar grid */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 self-start">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              aria-label="Mês anterior"
              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </button>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              aria-label="Mês seguinte"
              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-400 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = toISO(viewYear, viewMonth, day);
              const isToday = iso === todayISO;
              const isSelected = iso === selectedDate;
              const isPast = iso < todayISO;
              const hasAula = diasComAulas.has(day);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isToday
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold"
                        : isPast
                          ? "text-gray-300 dark:text-gray-600"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  {day}
                  {hasAula && (
                    <span
                      className={cn(
                        "mt-0.5 h-1 w-1 rounded-full",
                        isSelected ? "bg-white/60" : "bg-indigo-400",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Sessões do dia */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 capitalize">
              {selectedLabel ?? "Seleciona um dia"}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {aulasDia.length > 0
                ? `${aulasDia.length} sessão(ões)`
                : "Sem sessões"}
            </p>

            {aulasDia.length > 0 ? (
              <div className="flex flex-col gap-3">
                {aulasDia
                  .sort(
                    (a, b) =>
                      new Date(a.dataHora).getTime() -
                      new Date(b.dataHora).getTime(),
                  )
                  .map((aula) => (
                    <div
                      key={aula.id}
                      className={cn(
                        "rounded-xl border p-4 flex flex-col gap-2",
                        corModulo(aula.moduloId),
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <p className="text-sm font-semibold leading-tight truncate flex-1 min-w-0">
                          {aula.titulo}
                        </p>
                        <button
                          onClick={() => handleDelete(aula.id)}
                          disabled={deleting === aula.id}
                          className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 hover:bg-white/50 transition-all"
                          title="Eliminar sessão"
                        >
                          {deleting === aula.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] font-medium opacity-70 rounded-md bg-white/40 px-2 py-0.5 w-fit max-w-full truncate">
                        {aula.modulo.curso.nome} · {aula.modulo.nome}
                      </div>
                      <div className="flex flex-wrap gap-y-2 gap-x-3 text-xs opacity-80 min-w-0">
                        <span className="flex items-center gap-1 truncate">
                          <Clock className="h-3 w-3 shrink-0" /> {formatTime(aula)} ·{" "}
                          {formatDuracao(aula.duracao)}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Users className="h-3 w-3 shrink-0" />{" "}
                          {aula.formador.user.nome}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">
                  Nenhuma sessão neste dia
                </p>
              </div>
            )}
          </div>

          {/* Próximas sessões */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">
              Próximas Sessões
            </h3>
            {proximas.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Sem sessões futuras
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {proximas.map((aula) => {
                  const [, month, day] = aulaDateISO(aula).split("-");
                  return (
                    <button
                      key={aula.id}
                      onClick={() => setSelectedDate(aulaDateISO(aula))}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-left hover:border-indigo-200 hover:bg-indigo-50/40 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <div className="flex w-10 shrink-0 flex-col items-center rounded-lg bg-indigo-100 py-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                          {MONTHS[parseInt(month) - 1].slice(0, 3)}
                        </span>
                        <span className="text-sm font-bold leading-tight text-indigo-700 dark:text-indigo-400">
                          {day}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {aula.titulo}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatTime(aula)} · {formatDuracao(aula.duracao)} ·{" "}
                          {aula.formador.user.nome}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
