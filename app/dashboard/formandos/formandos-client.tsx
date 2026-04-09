"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, GraduationCap, AlertTriangle, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import type { FormandoComDetalhes } from "@/app/dashboard/_data/coordenador";

// ─── Formando Card ────────────────────────────────────────────────────────────

function FormandoCard({
  formando,
  onDelete,
  deleting,
}: {
  formando: FormandoComDetalhes;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const initials = useMemo(() => {
    return formando.nome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [formando.nome]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all h-full">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border-2 border-gray-100 shrink-0">
          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
              {formando.nome}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <span className="truncate">{formando.curso}</span>
          </div>

          <p className="text-xs text-gray-400 truncate mt-1">
            {formando.email}
          </p>
        </div>
      </div>

      {/* Progresso / Negativas */}
      <div className="flex flex-col gap-3 py-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Progresso</span>

          <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${formando.progresso}%` }}
            />
          </div>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-10 text-right">
            {formando.progresso}%
          </span>
        </div>

        {formando.negativos > 0 && (
          <div className="flex items-center gap-1.5 w-fit rounded-lg bg-red-50 dark:bg-red-950 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {formando.negativos} Faltas / Negativas
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
        <span
          className={cn(
            "rounded-full border px-4 py-1 text-sm font-medium",
            formando.status === "ATIVO"
              ? "border-green-200 bg-green-50 dark:bg-green-950 text-green-600"
              : formando.status === "CONCLUÍDO"
                ? "border-blue-200 bg-blue-50 dark:bg-blue-950 text-blue-600"
                : "border-gray-200 bg-gray-50 dark:bg-gray-800 text-gray-500",
          )}
        >
          {formando.status}
        </span>

        <div className="flex gap-2">
          {/* Ver Perfil */}
          <Link
            href={`/dashboard/formandos/${formando.id}`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full border border-gray-200 dark:border-gray-700 px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
          >
            Ver Perfil
          </Link>

          {/* Editar */}
          <Link
            href={`/dashboard/formandos/${formando.id}/editar`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Editar
          </Link>

          {/* Excluir */}
          <Button
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(formando.id);
            }}
            className="rounded-full px-4 py-1.5 text-sm font-medium"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormandosClient({
  formandos: initialFormandos,
}: {
  formandos: FormandoComDetalhes[];
}) {
  const [formandos, setFormandos] =
    useState<FormandoComDetalhes[]>(initialFormandos);

  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return formandos.filter((f) => {
      const matchSearch =
        f.nome.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase()) ||
        f.curso.toLowerCase().includes(search.toLowerCase());

      const matchStatus = filtroStatus === "TODOS" || f.status === filtroStatus;

      return matchSearch && matchStatus;
    });
  }, [formandos, search, filtroStatus]);

  const statusOptions = ["TODOS", "ATIVO", "INATIVO", "CONCLUÍDO"];

  async function handleDelete(formandoId: string) {
    const ok = confirm(
      "Tem certeza que deseja excluir este formando?\n\nEsta ação é irreversível.",
    );

    if (!ok) return;

    try {
      setDeletingId(formandoId);

      const res = await fetch(`/api/formandos/${formandoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(
          `Erro ao excluir formando: ${data?.error ?? "Erro desconhecido"}`,
        );
        return;
      }

      // Remove from local state
      setFormandos((prev) => prev.filter((f) => f.id !== formandoId));
      alert("Formando excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir formando:", err);
      alert("Erro inesperado ao excluir formando. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Formandos
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {formandos.length} formandos registados
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Novo Formando */}
          <Link href="/dashboard/formandos/novo">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2">
              Novo Formando
            </Button>
          </Link>

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

      {/* Grid */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((formando) => (
            <FormandoCard
              key={formando.id}
              formando={formando}
              deleting={deletingId === formando.id}
              onDelete={handleDelete}
            />
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
