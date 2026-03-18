"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Upload, CalendarDays, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoFormador as DocumentoResult } from "@/app/dashboard/_data/documentos";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "válido" | "a expirar" | "expirado" | "em falta";

interface MeuDocumento {
  id: string | null;
  nome: string;
  status: DocStatus;
  dataValidade: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, DocStatus> = {
  VALIDO: "válido",
  EXPIRADO: "expirado",
  A_EXPIRAR: "a expirar",
  EM_FALTA: "em falta",
}

const DOCS_COM_VALIDADE = ["Cartão de Cidadão"];

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; iconClass: string; textClass: string; bgClass: string }> = {
  "válido": { label: "Válido", icon: CheckCircle2, iconClass: "text-teal-500", textClass: "text-teal-600", bgClass: "bg-teal-50" },
  "a expirar": { label: "A Expirar", icon: Clock, iconClass: "text-amber-500", textClass: "text-amber-600", bgClass: "bg-amber-50" },
  "expirado": { label: "Expirado", icon: AlertTriangle, iconClass: "text-red-500", textClass: "text-red-600", bgClass: "bg-red-50" },
  "em falta": { label: "Em Falta", icon: AlertTriangle, iconClass: "text-gray-400", textClass: "text-gray-500", bgClass: "bg-gray-50" },
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onUpload,
}: {
  doc: MeuDocumento;
  onUpload: (nome: string) => void;
}) {
  const cfg = STATUS_CONFIG[doc.status];
  const Icon = cfg.icon;
  const temValidade = DOCS_COM_VALIDADE.includes(doc.nome);

  const dataValidadeFormatada = doc.dataValidade
    ? new Date(doc.dataValidade).toLocaleDateString("pt-PT")
    : null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-teal-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bgClass)}>
          <Icon className={cn("h-5 w-5", cfg.iconClass)} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-gray-900">{doc.nome}</span>
          <span className={cn("text-sm font-semibold", cfg.textClass)}>{cfg.label}</span>
        </div>
      </div>

      {/* Info extra */}
      <div className="flex flex-col gap-2">
        {dataValidadeFormatada && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Validade: {dataValidadeFormatada}
          </div>
        )}
        <div className="text-[11px] text-gray-400">
          Documento obrigatório para a inscrição.
        </div>
      </div>

      {/* Upload button */}
      <button 
        onClick={() => onUpload(doc.nome)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-colors"
      >
        <Upload className="h-4 w-4" />
        {doc.status === "em falta" ? "Enviar documento" : "Substituir ficheiro"}
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormandoDocumentos({ documentos: documentosIniciais, userId }: { documentos: DocumentoResult[], userId: string }) {
  const [docs, setDocs] = useState<MeuDocumento[]>(
    documentosIniciais.map((d) => ({
      id: d.id,
      nome: d.nome,
      status: STATUS_MAP[d.status] ?? "em falta",
      dataValidade: d.dataValidade, // Já é string ou null
    }))
  )

  function handleUpload(nome: string) {
    // Simulação de upload por agora
    alert(`Funcionalidade de upload para "${nome}" em desenvolvimento. Por agora, os documentos são validados pela secretaria.`);
  }

  const emFalta = docs.filter((d) => d.status === "em falta").length
  const expirados = docs.filter((d) => d.status === "expirado").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Os Meus Documentos</h1>
          <p className="mt-0.5 text-sm text-gray-500">Mantém a tua documentação em dia para evitar suspensões</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
          <FileText className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-bold text-gray-900">{docs.length - emFalta}/{docs.length}</span>
          <span className="text-xs text-gray-400 font-medium">concluídos</span>
        </div>
      </div>

      {/* Alerts */}
      {(emFalta > 0 || expirados > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {expirados > 0 && (
              <><span className="font-semibold">{expirados} documento{expirados > 1 ? "s" : ""} expirado{expirados > 1 ? "s" : ""}</span>. </>
            )}
            {emFalta > 0 && (
              <><span className="font-semibold">{emFalta} documento{emFalta > 1 ? "s" : ""} em falta</span>. Por favor, envia os teus documentos para regularizar a tua situação académica.</>
            )}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <DocCard
            key={doc.nome}
            doc={doc}
            onUpload={handleUpload}
          />
        ))}
      </div>
    </div>
  )
}
