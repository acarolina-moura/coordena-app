"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BarChart2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { aprovarJustificativa, rejeitarJustificativa, getJustificativasFormando } from "../actions";
import type { JustificativaFormando } from "../../_data/coordenador";

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

export type JustificativaPendente = {
  id: string;
  status: string;
  comentarioFormando: string | null;
  documentoUrl: string | null;
  aula: {
    id: string;
    titulo: string;
    dataHora: string | Date;
    modulo: { nome: string };
  };
  formando: {
    id: string;
    user: { nome: string };
    curso: string | null;
  };
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

// ─── Dialog de Justificativas do Formando ─────────────────────────────────────

function JustificativasDialog({
  formandoNome,
  justificativas,
  onClose,
}: {
  formandoNome: string;
  justificativas: JustificativaFormando[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Justificativas de {formandoNome}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {justificativas.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Nenhuma justificativa submetida.</p>
        ) : (
          <div className="space-y-4">
            {justificativas.map((j) => {
              const docLink = j.documentoUrl
                ? j.documentoUrl.startsWith("/")
                  ? j.documentoUrl
                  : `/uploads/${j.documentoUrl}`
                : null;

              return (
                <div key={j.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{j.aula.titulo}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(j.aula.dataHora).toLocaleDateString("pt-PT")} · {j.aula.modulo.nome}
                      </p>
                    </div>
                    <span className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs font-semibold shrink-0",
                      j.status === "JUSTIFICADO"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-indigo-200 bg-indigo-50 text-indigo-700"
                    )}>
                      {j.status === "JUSTIFICADO" ? "Aprovada" : "Em análise"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {j.comentarioFormando}
                  </p>

                  {docLink && (
                    <a
                      href={docLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Abrir Arquivo
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CoordenadorAssiduidade({
  dados,
  pendentes,
}: {
  dados: AssiduidadeFormando[];
  pendentes: JustificativaPendente[];
}) {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | "RISCO" | "OK">("TODOS");
  const [isPending, startTransition] = useTransition();
  const [justificativas, setJustificativas] = useState<JustificativaFormando[] | null>(null);
  const [formandoNome, setFormandoNome] = useState("");
  const router = useRouter();

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

  async function handleAprovar(id: string) {
    startTransition(async () => {
      const result = await aprovarJustificativa(id);
      if (result.sucesso) {
        toast.success(result.mensagem);
        router.refresh();
      } else {
        toast.error(result.mensagem);
      }
    });
  }

  async function handleRejeitar(id: string) {
    if (!confirm("Tem certeza que deseja rejeitar esta justificativa?")) return;
    startTransition(async () => {
      const result = await rejeitarJustificativa(id);
      if (result.sucesso) {
        toast.success(result.mensagem);
        router.refresh();
      } else {
        toast.error(result.mensagem);
      }
    });
  }

  async function handleVerJustificativas(formandoId: string, nome: string) {
    const justs = await getJustificativasFormando(formandoId);
    setJustificativas(justs as unknown as JustificativaFormando[]);
    setFormandoNome(nome);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Assiduidade
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {dados.length} formandos ·{" "}
            {emRisco > 0
              ? `${emRisco} com assiduidade em risco`
              : "Todos dentro do limite"}
            {pendentes.length > 0 && (
              <span>{` · ${pendentes.length} justificativa${pendentes.length === 1 ? "" : "s"} pendente${pendentes.length === 1 ? "" : "s"}`}</span>
            )}
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

      {/* Pendências de justificativa */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Justificativas pendentes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Veja as solicitações de justificação de falta submetidas pelos
              formadores e aprove ou recuse.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {pendentes.length} pendente{pendentes.length === 1 ? "" : "s"}
          </div>
        </div>

        {pendentes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Não há justificativas pendentes no momento.
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Formando
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Curso
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Aula
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Documento
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Comentário
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map((item) => {
                  const documentoLink = item.documentoUrl
                    ? item.documentoUrl.startsWith("/")
                      ? item.documentoUrl
                      : `/uploads/${item.documentoUrl}`
                    : null;
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/40"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-gray-100">
                        {item.formando.user.nome}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.formando.curso ?? "Sem curso"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        <div className="font-semibold text-slate-900 dark:text-gray-100">
                          {item.aula.titulo}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(item.aula.dataHora).toLocaleDateString(
                            "pt-PT",
                          )}{" "}
                          · {item.aula.modulo.nome}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {documentoLink ? (
                          <a
                            href={documentoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Abrir Arquivo
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">
                            Sem anexo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.comentarioFormando || "—"}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleAprovar(item.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aceitar
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleRejeitar(item.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Recusar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Formando
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Curso
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">
              Presentes
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">
              Ausentes
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center">
              Justif.
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Assiduidade
            </span>
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
                    <button
                      onClick={() => handleVerJustificativas(d.id, d.nome)}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                      title="Ver justificativas"
                    >
                      {d.nome}
                      <Eye className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    </button>
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

      {/* Dialog de Justificativas */}
      {justificativas !== null && (
        <JustificativasDialog
          formandoNome={formandoNome}
          justificativas={justificativas}
          onClose={() => setJustificativas(null)}
        />
      )}
    </div>
  );
}
