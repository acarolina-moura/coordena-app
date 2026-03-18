"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Upload, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoFormador } from "@/app/dashboard/_data/documentos";

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

const DOCS_COM_VALIDADE = [
  "Cartão de Cidadão", "CCP", "Seguro",
  "Registo Criminal", "Certidão Finanças", "Certidão Seg. Social",
]

const STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ElementType; iconClass: string; textClass: string; bgClass: string }> = {
  "válido": { label: "Válido", icon: CheckCircle2, iconClass: "text-green-500", textClass: "text-green-600", bgClass: "bg-green-50" },
  "a expirar": { label: "A Expirar", icon: Clock, iconClass: "text-amber-500", textClass: "text-amber-600", bgClass: "bg-amber-50" },
  "expirado": { label: "Expirado", icon: AlertTriangle, iconClass: "text-red-500", textClass: "text-red-600", bgClass: "bg-red-50" },
  "em falta": { label: "Em Falta", icon: AlertTriangle, iconClass: "text-gray-400", textClass: "text-gray-500", bgClass: "bg-gray-50" },
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onValidadeChange,
}: {
  doc: MeuDocumento;
  onValidadeChange: (id: string | null, nome: string, value: string) => void;
}) {
  const cfg = STATUS_CONFIG[doc.status];
  const Icon = cfg.icon;
  const temValidade = DOCS_COM_VALIDADE.includes(doc.nome);

  const dataValidadeFormatada = doc.dataValidade
    ? new Date(doc.dataValidade).toLocaleDateString("pt-PT")
    : null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-purple-200 hover:shadow-sm transition-all">
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

      {/* Validade */}
      {dataValidadeFormatada && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarDays className="h-3.5 w-3.5" />
          Validade: {dataValidadeFormatada}
        </div>
      )}

      {/* Input validade */}
      {temValidade && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-600">Data de validade</label>
          <input
            type="date"
            value={doc.dataValidade?.slice(0, 10) ?? ""}
            onChange={(e) => onValidadeChange(doc.id, doc.nome, e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
        </div>
      )}

      {/* Upload */}
      <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors">
        <Upload className="h-4 w-4" />
        {doc.status === "em falta" ? "Fazer upload" : "Substituir ficheiro"}
      </button>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormadorDocumentosProps {
  documentos: DocumentoFormador[];
  userId: string;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function FormadorDocumentos({ documentos: documentosIniciais, userId }: FormadorDocumentosProps) {
  const [docs, setDocs] = useState<MeuDocumento[]>(
    documentosIniciais.map((d) => ({
      id: d.id,
      nome: d.nome,
      status: STATUS_MAP[d.status] ?? "em falta",
      dataValidade: d.dataValidade ? d.dataValidade.toString() : null,
    }))
  )

  function handleValidadeChange(id: string | null, nome: string, value: string) {
    setDocs((prev) =>
      prev.map((d) => (d.nome === nome ? { ...d, dataValidade: value } : d))
    )
  }

  const emFalta = docs.filter((d) => d.status === "em falta").length
  const expirados = docs.filter((d) => d.status === "expirado").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">Os Meus Documentos</h1>
        <p className="mt-0.5 text-sm text-gray-500">Faça upload dos documentos necessários</p>
      </div>

      {/* Alerta */}
      {(emFalta > 0 || expirados > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {expirados > 0 && (
              <><span className="font-semibold">{expirados} documento{expirados > 1 ? "s" : ""} expirado{expirados > 1 ? "s" : ""}</span> — renova o mais rápido possível. </>
            )}
            {emFalta > 0 && (
              <><span className="font-semibold">{emFalta} documento{emFalta > 1 ? "s" : ""} em falta</span> — faz upload para completar o teu perfil.</>
            )}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {docs.map((doc) => (
          <DocCard
            key={doc.nome}
            doc={doc}
            onValidadeChange={handleValidadeChange}
          />
        ))}
      </div>
    </div>
  )
}