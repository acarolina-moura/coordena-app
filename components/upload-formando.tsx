"use client";

import { useState } from "react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing/components";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Endpoint = "imageUploader" | "documentUploader" | "fileUploader";

interface UploadThingFile {
  ufsUrl?: string;
  url?: string;
  name?: string;
  size?: number;
}

interface UploadFormandoProps {
  /** Tipo de upload a usar */
  endpoint: Endpoint;
  /** Label exibida no título */
  label: string;
  /** Descrição curta */
  description?: string;
  /** Callback quando o upload completa — recebe o URL do ficheiro */
  onUploadComplete: (url: string, name: string, size: number) => void;
  /** Variante: botão simples ou dropzone */
  variant?: "button" | "dropzone";
  /** Desabilita o upload */
  disabled?: boolean;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function UploadFormando({
  endpoint,
  label,
  description,
  onUploadComplete,
  variant = "dropzone",
  disabled = false,
}: UploadFormandoProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleClientUploaded(res: UploadThingFile[]) {
    if (!res || res.length === 0) return;

    const file = res[0];
    const url = file.ufsUrl ?? file.url ?? "";
    const name = file.name ?? "ficheiro";
    const size = file.size ?? 0;

    if (!url) return;

    setSuccess(name);
    setError(null);
    setUploading(false);
    setProgress(100);

    onUploadComplete(url, name, size);

    // Reset após 3s
    setTimeout(() => {
      setSuccess(null);
      setProgress(0);
    }, 3000);
  }

  function handleUploadError(err: Error) {
    console.error("[UploadFormando] Erro:", err);
    setError(err.message ?? "Erro ao enviar ficheiro");
    setSuccess(null);
    setUploading(false);
    setProgress(0);
    toast.error("Falha no upload", { description: err.message });
  }

  function handleUploadBegin() {
    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
  }

  function handleUploadProgress(pct: number) {
    setProgress(pct);
  }

  const isDisabled = disabled || uploading;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-teal-500" />
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {label}
          </h4>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      </div>

      {/* Estado: Sucesso */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 dark:text-emerald-400 font-medium truncate">
            Enviado: {success}
          </span>
        </div>
      )}

      {/* Estado: Erro */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-3 py-2 text-sm">
          <XCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-red-700 dark:text-red-400 font-medium">
            {error}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-xs text-red-500 hover:text-red-700"
            onClick={() => setError(null)}
          >
            Fechar
          </Button>
        </div>
      )}

      {/* Estado: Progresso */}
      {uploading && progress > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 text-center">
            {progress}% — a enviar...
          </span>
        </div>
      )}

      {/* Upload UI */}
      {!success && (
        <div className={cn(isDisabled && "opacity-50 pointer-events-none")}>
          {variant === "dropzone" ? (
            <UploadDropzone
              endpoint={endpoint}
              onClientUploadComplete={handleClientUploaded}
              onUploadError={handleUploadError}
              onUploadBegin={handleUploadBegin}
              onUploadProgress={(p) => handleUploadProgress(p as unknown as number)}
              className="ut-label:text-sm ut-label:font-medium ut-label:text-gray-500 ut-button:bg-teal-600 ut-button:hover:bg-teal-700"
              appearance={{
                allowedContent: "hidden",
              }}
              content={{
                allowedContent:
                  endpoint === "imageUploader"
                    ? "Imagens: JPG, PNG, WebP (máx. 4MB)"
                    : endpoint === "documentUploader"
                      ? "PDF (máx. 16MB)"
                      : "PDF, ZIP, DOC, XLS (máx. 32MB)",
              }}
            />
          ) : (
            <UploadButton
              endpoint={endpoint}
              onClientUploadComplete={handleClientUploaded}
              onUploadError={handleUploadError}
              onUploadBegin={handleUploadBegin}
              onUploadProgress={(p) => handleUploadProgress(p as unknown as number)}
              className="ut-button:bg-teal-600 hover:bg-teal-700 ut-button:font-semibold ut-button:rounded-xl ut-button:px-4 ut-button:py-2"
              content={{
                button({ ready }) {
                  if (uploading) return "A enviar...";
                  return ready ? (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> Enviar {label}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> A preparar...
                    </span>
                  );
                },
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
