"use client";

import { useState } from "react";
import {
  Search,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssiduidadeFormando = {
  id: string;
  nome: string;
  curso: string;
  total: number;
  presentes: number;
  ausentes: number;
  justificados: number;
};

// ─── Barra de progresso de assiduidade ───────────────────────────────────────

function BarraAssiduidade({
  presentes,
  total,
}: {
  presentes: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((presentes / total) * 100);
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            "h-2 rounded-full transition-all",
            pct >= 75
              ? "bg-green-500"
              : pct >= 50
                ? "bg-orange-400"
                : "bg-red-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "text-xs font-bold w-9 text-right",
          pct >= 75
            ? "text-green-600"
            : pct >= 50
              ? "text-orange-500"
              : "text-red-600",
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoordenadorAssiduidade({
  dados,
}: {
  dados: AssiduidadeFormando[];
}) {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | "RISCO" | "OK">("TODOS");

  const filtrados = dados.filter((d) => {
    const pct = d.total === 0 ? 100 : Math.round((d.presentes / d.total) * 100);
    const matchSearch =
      d.nome.toLowerCase().includes(search.toLowerCase()) ||
      d.curso.toLowerCase().includes(search.toLowerCase());
    const matchFiltro =
      filtro === "TODOS" ||
      (filtro === "RISCO" && pct < 75) ||
      (filtro === "OK" && pct >= 75);
    return matchSearch && matchFiltro;
  });

  const emRisco = dados.filter(
    (d) => d.total > 0 && Math.round((d.presentes / d.total) * 100) < 75,
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Assiduidade</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {dados.length} formandos ·{" "}
            {emRisco > 0
              ? `${emRisco} com assiduidade em risco`
              : "Todos dentro do limite"}
          </p>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pesquisar formando..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(["TODOS", "RISCO", "OK"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-xl border px-4 py-1.5 text-xs font-medium transition-all",
              filtro === f
                ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300",
            )}
          >
            {f === "TODOS"
              ? "Todos"
              : f === "RISCO"
                ? "⚠ Em risco (<75%)"
                : "✓ Dentro do limite"}
          </button>
        ))}
      </div>

      {/* Tabela */}
      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center flex flex-col items-center justify-center">
          <BarChart2 className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Nenhum formando encontrado</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_160px_80px_80px_80px_140px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Formando</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Curso</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Presentes</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Ausentes</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">Justif.</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Assiduidade</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
            {filtrados.map((d) => {
              const pct =
                d.total === 0 ? 100 : Math.round((d.presentes / d.total) * 100);
              const initials = d.nome
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={d.id}
                  className="grid grid-cols-[1fr_160px_80px_80px_80px_140px] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* Nome */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {d.nome}
                    </span>
                    {pct < 75 && d.total > 0 && (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    )}
                  </div>

                  {/* Curso */}
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {d.curso}
                  </span>

                  {/* Presentes */}
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {d.presentes}
                  </div>

                  {/* Ausentes */}
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-red-500">
                    <XCircle className="h-3.5 w-3.5" />
                    {d.ausentes}
                  </div>

                  {/* Justificados */}
                  <div className="flex items-center justify-center gap-1 text-sm font-semibold text-orange-500">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {d.justificados}
                  </div>

                  {/* Barra */}
                  <BarraAssiduidade presentes={d.presentes} total={d.total} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
