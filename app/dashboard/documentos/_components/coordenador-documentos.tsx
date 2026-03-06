"use client";

import { useState } from "react";
import {
  Search, ChevronUp, ChevronDown, CheckCircle2,
  AlertTriangle, Trash2, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  "válido": { label: "Válido", color: "text-green-600" },
  "expirado": { label: "Expirado", color: "text-red-500" },
  "a expirar": { label: "A expirar", color: "text-amber-500" },
  "em falta": { label: "Em falta", color: "text-gray-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProgressColor(validos: number, total: number) {
  const pct = validos / total;
  if (pct === 1) return "bg-green-500";
  if (pct >= 0.75) return "bg-amber-400";
  return "bg-red-400";
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function AdicionarFormadorDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
          <Plus className="h-4 w-4" /> Adicionar Formador
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Formador</DialogTitle>
          <DialogDescription>Envia um convite por email para um novo formador.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Nome completo</Label>
            <Input placeholder="Ex: João Alves" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="formador@email.com" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Enviar Convite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4">
        <Avatar className="h-12 w-12 border-2 border-gray-100 shrink-0">
          <AvatarImage src={formador.avatar} />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900">{formador.nome}</span>
          <span className="text-xs text-gray-400">{formador.email}</span>
        </div>

        {formador.status === "aceite" && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn("h-full rounded-full", getProgressColor(validos, total))}
                style={{ width: `${(validos / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 w-8 text-right">
              {validos}/{total}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {formador.status === "aceite" && expanded && (
        <div className="border-t border-gray-100 px-6 py-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            {formador.documentos.map((doc) => {
              const cfg = DOC_STATUS_CONFIG[doc.status];
              return (
                <div key={doc.nome} className="flex items-center gap-2">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4 shrink-0",
                      doc.status === "válido" ? "text-green-500" : "text-gray-200"
                    )}
                  />
                  <span className="text-sm text-gray-700 truncate">{doc.nome}</span>
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
      documentos: f.documentos.map((d: any) => ({
        nome: d.nome,
        status: STATUS_MAP[d.status] ?? "em falta",
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
          <h1 className="text-[26px] font-bold text-gray-900">Documentos</h1>
          <p className="mt-0.5 text-sm text-gray-500">Gestão documental dos formadores</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar formadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 text-sm rounded-xl"
            />
          </div>
          <AdicionarFormadorDialog />
        </div>
      </div>

      {/* Lista de formadores */}
      <div className="flex flex-col gap-3">
        {aceites.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum formador encontrado</p>
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Formadores com convite pendente
              </p>
              {pendentes.map((f) => (
                <p key={f.id} className="text-sm text-amber-600 mt-0.5">
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