"use client";

import { useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Clock, Upload, CalendarDays, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoFormador as DocumentoResult } from "@/app/dashboard/_data/documentos";
import { uploadDocumentoFormando, registarDocumento } from "../actions";
import { UploadFormando } from "@/components/upload-formando";
import { toast } from "sonner";

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
  isUploading,
  onUploadThing,
}: {
  doc: MeuDocumento;
  onUpload: (nome: string, file: File, validade: string) => void;
  isUploading: boolean;
  onUploadThing?: (docNome: string) => void;
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
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-teal-200 transition-all hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bgClass)}>
          <Icon className={cn("h-5 w-5", cfg.iconClass)} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{doc.nome}</span>
          <span className={cn("text-sm font-semibold", cfg.textClass)}>{cfg.label}</span>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        {temValidade && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">Data de validade</label>
            <input
              type="date"
              value={validadeInput}
              onChange={(e) => setValidadeInput(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>
        )}

        {dataValidadeFormatada && !temValidade && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CalendarDays className="h-3.5 w-3.5" />
            Validade: {dataValidadeFormatada}
          </div>
        )}
      </div>

      {/* Upload buttons */}
      <div className="flex flex-col gap-2">
        {/* UploadThing */}
        {onUploadThing && (
          <button
            onClick={() => onUploadThing(doc.nome)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Upload className="h-4 w-4" />
            {doc.status === "em falta" ? "Enviar com UploadThing" : "Substituir via UploadThing"}
          </button>
        )}

        {/* Legacy upload */}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-teal-300 hover:text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {doc.status === "em falta" ? "Enviar documento (manual)" : "Substituir ficheiro"}
        </button>
      </div>
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
      dataValidade: d.dataValidade,
    }))
  )
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [docUploadThing, setDocUploadThing] = useState<string | null>(null);

  async function handleUpload(nome: string, file: File, validade: string) {
    setUploadingDoc(nome);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", nome);
      formData.append("dataExpiracao", validade);

      const result = await uploadDocumentoFormando(formData);

      if (result.error) {
        console.error("Erro no upload:", result.error);
        alert(`Erro no upload: ${result.error}`);
      } else {
        alert(`Documento "${nome}" enviado com sucesso!`);

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

  // Handler para abrir modal de UploadThing
  function handleOpenUploadThing(docNome: string) {
    setDocUploadThing(docNome);
  }

  // Callback quando UploadThing completa o upload
  async function handleUploadThingComplete(url: string, nome: string, tamanho: number) {
    if (!docUploadThing) return;

    try {
      const formData = new FormData();
      formData.append("fileUrl", url);
      formData.append("tipo", docUploadThing);
      formData.append("nomeFicheiro", nome);
      formData.append("tamanho", String(tamanho));

      const result = await registarDocumento(formData);

      if (result.success) {
        toast.success(result.mensagem ?? "Documento registado!");
        setDocs((prev) =>
          prev.map((d) =>
            d.nome === docUploadThing
              ? { ...d, status: "válido" }
              : d
          )
        );
      } else {
        toast.error(result.error ?? "Erro ao registar documento");
      }
    } catch (err) {
      console.error("[handleUploadThingComplete]", err);
      toast.error("Erro ao registar documento na base de dados");
    } finally {
      setDocUploadThing(null);
    }
  }

  const emFalta = docs.filter((d) => d.status === "em falta").length
  const expirados = docs.filter((d) => d.status === "expirado").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Os Meus Documentos</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Mantém a tua documentação em dia para evitar suspensões</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 shadow-sm">
          <FileText className="h-4 w-4 text-teal-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{docs.length - emFalta}/{docs.length}</span>
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
            isUploading={uploadingDoc === doc.nome}
            onUploadThing={handleOpenUploadThing}
          />
        ))}
      </div>

      {/* Dialog de UploadThing */}
      {docUploadThing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Enviar: {docUploadThing}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  PDF (máx. 16MB) ou Imagem (máx. 4MB)
                </p>
              </div>
              <button
                onClick={() => setDocUploadThing(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* UploadThing Dropzone */}
            <UploadFormando
              endpoint="documentUploader"
              label={`Documento: ${docUploadThing}`}
              description="Arrasta o ficheiro ou clica para selecionar"
              onUploadComplete={handleUploadThingComplete}
              variant="dropzone"
            />

            {/* Cancel */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setDocUploadThing(null)}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
