"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Clock, Upload, CalendarDays, X, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentoFormador as DocumentoResult } from "@/app/dashboard/_data/documentos";
import { registarDocumento, obterDocumentosFormadorAtualizados } from "../actions";
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
  onUploadThing,
}: {
  doc: MeuDocumento;
  onUploadThing?: (docNome: string, dataValidade: string | null) => void;
}) {
  const cfg = STATUS_CONFIG[doc.status];
  const Icon = cfg.icon;
  const temValidade = DOCS_COM_VALIDADE.includes(doc.nome);
  const [validadeInput, setValidadeInput] = useState(doc.dataValidade?.slice(0, 10) ?? "");

  const dataValidadeFormatada = doc.dataValidade
    ? new Date(doc.dataValidade).toLocaleDateString("pt-PT")
    : null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all">
      {/* Header com botão de preview */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", cfg.bgClass)}>
            <Icon className={cn("h-5 w-5", cfg.iconClass)} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">{doc.nome}</span>
            <span className={cn("text-sm font-semibold", cfg.textClass)}>{cfg.label}</span>
          </div>
        </div>
        {doc.id && doc.status !== "em falta" && (
          <a
            href={`/api/documentos/preview/${doc.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            title="Ver documento"
          >
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </a>
        )}
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-3">
        {temValidade && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="data-validade" className="text-xs font-semibold text-gray-600 dark:text-gray-400">Data de validade</label>
            <input
              id="data-validade"
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
      {onUploadThing && (
        <button
          onClick={() => onUploadThing(doc.nome, validadeInput || null)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4" />
          {doc.status === "em falta" ? "Enviar documento" : "Substituir documento"}
        </button>
      )}
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
  const [docUploadThing, setDocUploadThing] = useState<string | null>(null);
  const [docUploadDataValidade, setDocUploadDataValidade] = useState<string | null>(null);

  // Sincronizar com os dados iniciais quando a página atualiza/props mudam
  useEffect(() => {
    setDocs(
      documentosIniciais.map((d) => ({
        id: d.id,
        nome: d.nome,
        status: STATUS_MAP[d.status] ?? "em falta",
        dataValidade: d.dataValidade,
      }))
    );
  }, [documentosIniciais]);

  // Handler para abrir modal de UploadThing
  function handleOpenUploadThing(docNome: string, dataValidade: string | null) {
    setDocUploadThing(docNome);
    setDocUploadDataValidade(dataValidade);
  }

  // Callback quando UploadThing completa o upload
  async function handleUploadThingComplete(url: string, nome: string, tamanho: number) {
    console.log("[uploadComplete] Upload feito:", { url, nome, tamanho, tipo: docUploadThing, data: docUploadDataValidade });
    
    if (!docUploadThing) return;

    try {
      const formData = new FormData();
      formData.append("fileUrl", url);
      formData.append("tipo", docUploadThing);
      formData.append("nomeFicheiro", nome);
      formData.append("tamanho", String(tamanho));
      if (docUploadDataValidade) {
        formData.append("dataExpiracao", docUploadDataValidade);
      }

      console.log("[uploadComplete] Chamando registarDocumento...");
      const result = await registarDocumento(formData);
      console.log("[uploadComplete] Resultado registarDocumento:", result);

      if (result.success) {
        toast.success(result.mensagem ?? "Documento registado!");
        setDocUploadThing(null);
        setDocUploadDataValidade(null);
        
        // Recarregar os documentos atualizados
        console.log("[uploadComplete] Chamando obterDocumentosFormadorAtualizados...");
        const docAtual = await obterDocumentosFormadorAtualizados();
        console.log("[uploadComplete] Resultado obterDocumentosFormadorAtualizados:", docAtual);
        
        if (docAtual.success && docAtual.documentos) {
          console.log("[uploadComplete] Atualizando state com:", docAtual.documentos.length, "documentos");
          setDocs(
            docAtual.documentos.map((d: DocumentoResult) => ({
              id: d.id,
              nome: d.nome,
              status: STATUS_MAP[d.status] ?? "em falta",
              dataValidade: d.dataValidade,
            }))
          );
        } else {
          console.error("[uploadComplete] obterDocumentosFormadorAtualizados falhou:", docAtual);
        }
      } else {
        console.error("[uploadComplete] registarDocumento falhou:", result.error);
        toast.error(result.error ?? "Erro ao registar documento");
      }
    } catch (err) {
      console.error("[uploadComplete] Exception:", err);
      toast.error("Erro ao registar documento na base de dados");
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
            onUploadThing={handleOpenUploadThing}
          />
        ))}
      </div>

      {/* Dialog de UploadThing */}
      {docUploadThing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Enviar: {docUploadThing}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  PDF (máx. 16MB)
                </p>
              </div>
              <button
                onClick={() => setDocUploadThing(null)}
                className="h-11 w-11 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
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
                className="rounded-xl border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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