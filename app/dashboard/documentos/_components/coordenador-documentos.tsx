"use client";

import { useState } from "react";
import {
  Search, ChevronUp, ChevronDown, CheckCircle2,
  AlertTriangle, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { FormadorComDocumentos } from "@/app/dashboard/_data/documentos";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type DocStatus = "válido" | "expirado" | "a expirar" | "em falta";

interface Documento {
  nome: string;
  status: DocStatus;
}

interface FormadorRow {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  status: "aceite" | "pendente";
  documentos: Documento[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const DOCS_OBRIGATORIOS = [
  "CV", "Cartão de Cidadão", "CCP", "IBAN",
  "Seguro", "Registo Criminal", "Certidão Finanças", "Certidão Seg. Social",
];

const STATUS_MAP: Record<string, DocStatus> = {
  VALIDO: "válido",
  EXPIRADO: "expirado",
  A_EXPIRAR: "a expirar",
  EM_FALTA: "em falta",
};

const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; color: string }> = {
  "válido": { label: "Válido", color: "text-green-600 dark:text-green-500" },
  "expirado": { label: "Expirado", color: "text-red-500 dark:text-red-400" },
  "a expirar": { label: "A expirar", color: "text-amber-500 dark:text-amber-400" },
  "em falta": { label: "Em falta", color: "text-gray-400 dark:text-gray-500" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProgressColor(validos: number, total: number) {
  const pct = validos / total;
  if (pct === 1) return "bg-green-500";
  if (pct >= 0.75) return "bg-amber-400";
  return "bg-red-400";
}

function FormadorRowItem({
  formador,
  onRemove,
}: {
  formador: FormadorRow;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const validos = formador.documentos.filter((d) => d.status === "válido").length;
  const total = DOCS_OBRIGATORIOS.length;
  const initials = formador.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-colors">
      <div className="flex items-center gap-4 px-6 py-4">
        <Avatar className="h-12 w-12 border-2 border-gray-100 dark:border-gray-800 shrink-0 transition-colors">
          <AvatarImage src={formador.avatar} />
          <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">{formador.nome}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 transition-colors">{formador.email}</span>
        </div>

        {formador.status === "aceite" && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-32 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", getProgressColor(validos, total))}
                style={{ width: `${(validos / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right transition-colors">
              {validos}/{total}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover formador?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tens a certeza que queres remover <strong>{formador.nome}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(formador.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {formador.status === "aceite" && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {formador.status === "aceite" && expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 transition-colors">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            {formador.documentos.map((doc) => {
              const cfg = DOC_STATUS_CONFIG[doc.status];
              return (
                <div key={doc.nome} className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      doc.status === "válido" ? "text-green-500" : "text-gray-200 dark:text-gray-800"
                    )}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate transition-colors">{doc.nome}</span>
                  <span className={cn("text-xs font-medium shrink-0", cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

interface CoordenadorDocumentosProps {
  formadores: FormadorComDocumentos[];
}

export function CoordenadorDocumentos({ formadores: formadoresIniciais }: CoordenadorDocumentosProps) {
  const [search, setSearch] = useState("");
  const [formadores, setFormadores] = useState<FormadorRow[]>(
    formadoresIniciais.map((f) => ({
      id: f.id,
      nome: f.nome,
      email: f.email,
      status: "aceite" as const,
      documentos: f.documentos.map((d: { nome: string; status: string }) => ({
        nome: d.nome,
        status: (STATUS_MAP[d.status] || "em falta") as DocStatus,
      })),
    }))
  );

  const aceites = formadores.filter(
    (f) => f.status === "aceite" && f.nome.toLowerCase().includes(search.toLowerCase())
  );
  const pendentes = formadores.filter((f) => f.status === "pendente");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 transition-colors">Documentos</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 transition-colors">Gestão documental dos formadores</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar formadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Lista de formadores */}
      <div className="flex flex-col gap-3">
        {aceites.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8 transition-colors">Nenhum formador encontrado</p>
        )}
        {aceites.map((f) => (
          <FormadorRowItem
            key={f.id}
            formador={f}
            onRemove={(id) => setFormadores((prev) => prev.filter((f) => f.id !== id))}
          />
        ))}
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-5 py-4 transition-colors">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Formadores com convite pendente
              </p>
              {pendentes.map((f) => (
                <p key={f.id} className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                  {f.nome} — os documentos só ficam visíveis após aceitarem o convite.
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}