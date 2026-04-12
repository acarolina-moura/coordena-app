"use client";

import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing/components";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { updateAvatar } from "@/app/dashboard/upload-actions";

interface AvatarUploaderProps {
  /** URL atual da imagem de perfil */
  currentImageUrl?: string;
  /** Nome do utilizador para o fallback */
  userName: string;
  /** Callback quando o avatar é atualizado */
  onUpdated?: () => void;
  /** Tamanho do avatar */
  size?: "sm" | "md" | "lg";
  /** Classe adicional para o container */
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-28 w-28",
};

const SIZE_TEXT = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function AvatarUploader({
  currentImageUrl,
  userName,
  onUpdated,
  size = "md",
  className,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayUrl = optimisticUrl || currentImageUrl;

  async function handleUploadComplete(res: any[]) {
    if (!res?.length) return;
    const url = res[0]?.ufsUrl ?? res[0]?.url;
    if (!url) return;

    setUploading(true);
    setOptimisticUrl(url); // Preview imediato

    const result = await updateAvatar(url);
    setUploading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Avatar atualizado!");
      onUpdated?.();
      setTimeout(() => setSuccess(false), 2000);
    } else {
      toast.error(result.error ?? "Erro ao atualizar avatar");
      setOptimisticUrl(null);
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Avatar */}
      <div
        className={cn(
          "rounded-full border-4 border-indigo-50 bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm",
          SIZE_CLASSES[size]
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "font-bold text-indigo-600",
              SIZE_TEXT[size]
            )}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Overlay de upload */}
      <div
        className={cn(
          "absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer",
          uploading && "opacity-100 pointer-events-none"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : success ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={() => {
              setUploading(false);
              setOptimisticUrl(null);
              toast.error("Falha ao enviar imagem");
            }}
            onUploadBegin={() => setUploading(true)}
            className="ut-button:p-0 ut-button:bg-transparent ut-button:hover:bg-transparent ut-button:border-none"
            content={{
              button() {
                return (
                  <Camera className="h-5 w-5 text-white hover:text-indigo-200 transition-colors" />
                );
              },
            }}
          />
        )}
      </div>

      {/* Badge de sucesso */}
      {success && (
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
        </div>
      )}
    </div>
  );
}
