"use client";

import { Clock, BookOpen, CalendarDays, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { MeusCursos } from "../../_data/formando";
import { StatusCurso } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type MeuCurso = MeusCursos[number];
type Modulo = MeuCurso['modulos'][number];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusCurso, string> = {
  ATIVO:     "border-green-300 text-green-700 bg-green-50",
  PAUSADO:   "border-yellow-300 text-yellow-700 bg-yellow-50",
  ENCERRADO: "border-red-300  text-red-700  bg-red-50",
};

function getNotaColor(nota: number | null) {
  if (nota === null) return "text-gray-400";
  if (nota >= 10)    return "text-green-600";
  return "text-red-500";
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Curso Card ───────────────────────────────────────────────────────────────

function CursoCard({ curso }: { curso: MeuCurso }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-lg font-bold text-gray-900">{curso.nome}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{curso.cargaHoraria}h</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{curso.modulos.length} módulos</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(curso.dataInicio)} {curso.dataFim ? `– ${formatDate(curso.dataFim)}` : ""}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={cn("rounded-full border px-3 py-0.5 text-xs font-semibold", STATUS_CONFIG[curso.status])}>
              {curso.status}
            </span>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Overall progress */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Progresso geral</span>
            <span className="font-bold text-teal-600">{curso.progressoGeral}%</span>
          </div>
          <Progress value={curso.progressoGeral} className="h-2 bg-gray-100 [&>*]:bg-teal-400" />
        </div>
      </div>

      {/* Modules */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <p className="mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Módulos</p>
          <div className="flex flex-col gap-3">
            {curso.modulos.map(mod => {
              return (
                <div key={mod.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100">
                    <BookOpen className="h-4 w-4 text-teal-500" />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800 truncate">{mod.nome}</span>
                      <span className={cn("text-sm font-bold shrink-0", getNotaColor(mod.nota))}>
                        {mod.nota !== null ? `${mod.nota}/20` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{mod.codigo}</span>
                      {/* Nota: Formador não está vindo no getMeusCursos atualmente, mas podemos adicionar se necessário */}
                    </div>
                    <Progress
                      value={mod.progresso}
                      className={cn(
                        "h-1.5 bg-gray-100",
                        mod.nota !== null && mod.nota < 10 ? "[&>*]:bg-red-400" : "[&>*]:bg-teal-400"
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormandoCurso({ inicial }: { inicial: MeusCursos }) {
  const [cursos] = useState<MeusCursos>(inicial);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">Os Meus Cursos</h1>
        <p className="mt-0.5 text-sm text-gray-500">{cursos.length} curso{cursos.length !== 1 ? "s" : ""} inscrito{cursos.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="flex flex-col gap-4">
        {cursos.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
            Ainda não estás inscrito em nenhum curso
          </div>
        )}
        {cursos.map(curso => <CursoCard key={curso.id} curso={curso} />)}
      </div>
    </div>
  );
}