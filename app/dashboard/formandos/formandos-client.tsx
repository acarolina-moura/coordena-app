"use client";

import { useState } from "react";
import { Search, GraduationCap, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormandoComDetalhes } from "@/app/dashboard/_data/coordenador";

// ─── Formando Card ────────────────────────────────────────────────────────────

function FormandoCard({ formando }: { formando: FormandoComDetalhes }) {
  const initials = formando.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all">
      <Avatar className="h-11 w-11 border-2 border-gray-100 shrink-0">
        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formando.nome}
        </span>
        <span className="truncate text-xs text-gray-400">{formando.curso}</span>
      </div>

      {/* Progresso */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-gray-400">{formando.progresso}%</span>
        <div className="h-1.5 w-20 rounded-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-1.5 rounded-full bg-indigo-500"
            style={{ width: `${formando.progresso}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <span
        className={cn(
          "shrink-0 rounded-full border px-3 py-0.5 text-xs font-medium",
          formando.status === "ATIVO"
            ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 text-green-600 dark:text-green-400"
            : formando.status === "CONCLUÍDO"
              ? "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 text-blue-600 dark:text-blue-400"
              : "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 text-gray-500 dark:text-gray-400",
        )}
      >
        {formando.status}
      </span>

      {/* Negativos */}
      {formando.negativos > 0 && (
        <span className="shrink-0 flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          {formando.negativos}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormandosClient({
  formandos: initialFormandos,
}: {
  formandos: FormandoComDetalhes[];
}) {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  const filtrados = initialFormandos.filter((f) => {
    const matchSearch =
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.curso.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "TODOS" || f.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const statusOptions = ["TODOS", "ATIVO", "INATIVO", "CONCLUÍDO"];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Formandos</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {initialFormandos.length} formandos registados
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200"
            />
          </div>

          {/* Filtro status */}
          <div className="flex gap-1.5">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  filtroStatus === s
                    ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      {filtrados.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtrados.map((formando) => (
            <FormandoCard key={formando.id} formando={formando} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
          <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || filtroStatus !== "TODOS"
              ? "Nenhum formando encontrado"
              : "Ainda não há formandos registados"}
          </p>
        </div>
      )}
    </div>
  );
}
