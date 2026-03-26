"use client";

import { useState } from "react";
import {
  Plus, Search, CalendarDays, Clock, Puzzle, GraduationCap, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

type CursoStatus = "Ativo" | "Em Preparação" | "Concluído" | "Inativo";

interface Modulo {
  nome: string;
  codigo: string;
  tags: string[];
}

interface Curso {
  id: number;
  nome: string;
  status: CursoStatus;
  dataInicio: string;
  dataFim: string;
  cargaHoraria: number;
  modulos: Modulo[];
  formandos: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const cursosData: Curso[] = [
  {
    id: 1,
    nome: "Técnico de Multimédia",
    status: "Ativo",
    dataInicio: "15 set 2025",
    dataFim: "30 jun 2026",
    cargaHoraria: 1200,
    formandos: 4,
    modulos: [
      { nome: "Design Gráfico",      codigo: "UFCD-0145", tags: ["Design", "Photoshop", "Illustrator"] },
      { nome: "Desenvolvimento Web",  codigo: "UFCD-0577", tags: ["HTML", "CSS", "JavaScript"] },
      { nome: "Marketing Digital",   codigo: "UFCD-9214", tags: ["Marketing", "SEO", "Redes Sociais"] },
    ],
  },
  {
    id: 2,
    nome: "Técnico de Informática",
    status: "Ativo",
    dataInicio: "01 out 2025",
    dataFim: "15 jul 2026",
    cargaHoraria: 1100,
    formandos: 2,
    modulos: [
      { nome: "Redes de Computadores", codigo: "UFCD-0773", tags: ["Redes", "TCP/IP", "Cisco"] },
      { nome: "Bases de Dados",        codigo: "UFCD-0787", tags: ["SQL", "MySQL", "MongoDB"] },
    ],
  },
  {
    id: 3,
    nome: "Gestão de Empresas",
    status: "Em Preparação",
    dataInicio: "10 jan 2026",
    dataFim: "30 set 2026",
    cargaHoraria: 900,
    formandos: 0,
    modulos: [
      { nome: "Contabilidade Geral", codigo: "UFCD-0567", tags: ["Contabilidade", "Finanças"] },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CursoStatus, string> = {
  "Ativo":         "border-green-300 text-green-700 bg-green-50",
  "Em Preparação": "border-amber-300 text-amber-700 bg-amber-50",
  "Concluído":     "border-blue-300 text-blue-700 bg-blue-50",
  "Inativo":       "border-gray-300 text-gray-500 bg-gray-50",
};

// ─── Detalhes Dialog ──────────────────────────────────────────────────────────

function DetalhesDialog({ curso, onClose }: { curso: Curso; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 [&>button]:hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-lg font-bold text-gray-900">
              {curso.nome}
            </DialogTitle>
            <span className={cn(
              "rounded-full border px-3 py-0.5 text-xs font-semibold",
              STATUS_CONFIG[curso.status]
            )}>
              {curso.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 pb-5">
          {[
            { value: `${curso.cargaHoraria}h`, label: "Carga Horária" },
            { value: curso.modulos.length,      label: "Módulos" },
            { value: curso.formandos,            label: "Formandos" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 py-4 gap-1">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Módulos */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Módulos</h3>
          <div className="flex flex-col gap-2">
            {curso.modulos.map((mod) => (
              <div
                key={mod.codigo}
                className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-gray-800">{mod.nome}</span>
                  <span className="text-xs text-indigo-500">{mod.codigo}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-indigo-100 bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Curso Row ────────────────────────────────────────────────────────────────

function CursoRow({ curso, onVerDetalhes }: { curso: Curso; onVerDetalhes: () => void }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all">
      
      <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{curso.nome}</h3>
            <span className={cn(
              "shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold",
              STATUS_CONFIG[curso.status]
            )}>
              {curso.status}
            </span>
          </div>

          <div className="flex gap-5 text-sm text-gray-500 dark:text-gray-400 shrink-0">
            
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {curso.dataInicio} – {curso.dataFim}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {curso.cargaHoraria}h
            </span>
            <span className="flex items-center gap-1.5">
              <Puzzle className="h-4 w-4 text-gray-400" />
              {curso.modulos.length} módulo{curso.modulos.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              {curso.formandos} formando{curso.formandos !== 1 ? "s" : ""}
            </span>
          </div>
      </div>
      
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onVerDetalhes}
            className="shrink-0 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 text-sm px-4"
          >
            Ver Detalhes
          </Button>
        </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CursosPage() {
  const [search, setSearch] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

  const filtrados = cursosData.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Cursos</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{cursosData.length} cursos registados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtrados.map((curso) => (
          <CursoRow key={curso.id} curso={curso} onVerDetalhes={() => setSelectedCurso(curso)} />
        ))}
        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
            <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">Nenhum curso encontrado</p>
          </div>
        )}
      </div>

      {selectedCurso && (
        <DetalhesDialog curso={selectedCurso} onClose={() => setSelectedCurso(null)} />
      )}
    </div>
  );
}