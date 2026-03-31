"use client";

import { useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Clock, Upload, CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoFormador as DocumentoResult } from "@/app/dashboard/_data/documentos";
import { uploadDocumentoFormador } from "../actions";

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
  "válido": { label: "Válido", icon: CheckCircle2, iconClass: "text-green-500", textClass: "text-green-600 dark:text-green-500", bgClass: "bg-green-50 dark:bg-green-900/20" },
  "a expirar": { label: "A Expirar", icon: Clock, iconClass: "text-amber-500", textClass: "text-amber-600 dark:text-amber-500", bgClass: "bg-amber-50 dark:bg-amber-900/20" },
  "expirado": { label: "Expirado", icon: AlertTriangle, iconClass: "text-red-500", textClass: "text-red-600 dark:text-red-500", bgClass: "bg-red-50 dark:bg-red-900/20" },
  "em falta": { label: "Em Falta", icon: AlertTriangle, iconClass: "text-gray-400", textClass: "text-gray-500 dark:text-gray-400", bgClass: "bg-gray-50 dark:bg-gray-800" },
}

// ─── Document Card ────────────────────────────────────────────────────────────

function DocCard({
  doc,
  onUpload,
  isUploading,
}: {
  doc: MeuDocumento;
  onUpload: (nome: string, file: File, validade: string) => void;
  isUploading: boolean;
}) {
  const cfg = STATUS_CONFIG[doc.status];
  const Icon = cfg.icon;
  const temValidade = DOCS_COM_VALIDADE.includes(doc.nome);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validadeInput, setValidadeInput] = useState(doc.dataValidade?.slice(0, 10) ?? "");

  const dataValidadeFormatada = doc.dataValidade
    ? new Date(doc.dataValidade).toLocaleDateString("pt-PT")
    : null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(doc.nome, file, validadeInput);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bgClass)}>
          <Icon className={cn("h-5 w-5", cfg.iconClass)} />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{doc.nome}</span>
          <span className={cn("text-sm font-semibold", cfg.textClass)}>{cfg.label}</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        {temValidade && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Data de validade</label>
            <input
              type="date"
              value={validadeInput}
              onChange={(e) => setValidadeInput(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>
        )}
        
        {dataValidadeFormatada && !temValidade && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <CalendarDays className="h-3.5 w-3.5" />
            Validade: {dataValidadeFormatada}
          </div>
        )}
      </div>

      {/* Upload button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <button 
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {doc.status === "em falta" ? "Fazer upload" : "Substituir ficheiro"}
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormadorDocumentos({ documentos: documentosIniciais }: { documentos: DocumentoResult[] }) {
  const [docs, setDocs] = useState<MeuDocumento[]>(
    documentosIniciais.map((d) => ({
      id: d.id,
      nome: d.nome,
      status: STATUS_MAP[d.status] ?? "em falta",
      dataValidade: d.dataValidade,
    }))
  )
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  async function handleUpload(nome: string, file: File, validade: string) {
    setUploadingDoc(nome);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", nome);
      formData.append("dataExpiracao", validade);

      const result = await uploadDocumentoFormador(formData);
      
      if (result.error) {
        console.error("Erro no upload:", result.error);
        alert(`Erro no upload: ${result.error}`);
      } else {
        alert(`Documento "${nome}" enviado com sucesso!`);
        
        // Atualizar estado local após sucesso
        setDocs((prev) =>
          prev.map((d) =>
            d.nome === nome
              ? { ...d, status: "válido", dataValidade: validade ? new Date(validade).toISOString() : null }
              : d
          )
        );
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      alert("Ocorreu um erro inesperado ao enviar o ficheiro.");
    } finally {
      setUploadingDoc(null);
    }
  }

  const emFalta = docs.filter((d) => d.status === "em falta").length
  const expirados = docs.filter((d) => d.status === "expirado").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Os Meus Documentos</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Faça upload dos documentos necessários</p>
      </div>

      {/* Alerta */}
      {(emFalta > 0 || expirados > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">
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
            onUpload={handleUpload}
            isUploading={uploadingDoc === doc.nome}
          />
        ))}
      </div>
    </div>
  )
}