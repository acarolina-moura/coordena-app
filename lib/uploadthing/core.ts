import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const f = createUploadthing();

// Middleware: verifica autenticação e retorna info do utilizador
const middleware = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Não autorizado — faz login primeiro");
  }

  // Retorna dados disponíveis para onUploadComplete via ctx
  return {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    role: session.user.role,
  };
};

// Handlers pós-upload: registam metadados e retornam info ao cliente
const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>;
  file: {
    key: string;
    name: string;
    url: string;
    size: number;
    type: string;
  };
}) => {
  console.log("[UploadThing] Upload completo:", {
    userId: metadata.userId,
    url: file.url,
    name: file.name,
    type: file.type,
  });

  // Registrar no DB para audit trail
  await prisma.documento.create({
    data: {
      tipo: `UPLOAD_${file.type || "UNKNOWN"}`,
      fileUrl: file.url,
      status: "VALIDO",
      // Não associar a ninguém aqui — será feito pelo caller
    },
  }).catch(() => {}); // Silencioso — não falhar o upload se o log falhar

  return {
    uploadedBy: metadata.userId,
    url: file.url,
    name: file.name,
    type: file.type,
    size: file.size,
  };
};

// ─── FileRouter ───────────────────────────────────────────────────────────────

export const nossaAppFileRouter = {
  // Rota 1: Imagens (avatar, foto de perfil, comprovativos visuais)
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

  // Rota 2: Documentos PDF (BI, certificados, justificações, trabalhos)
  documentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),

  // Rota 3: Ficheiros genéricos (ZIP, DOC, DOCX, XLS — materiais de apoio, trabalhos)
  fileUploader: f({
    blob: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type NossaAppFileRouter = typeof nossaAppFileRouter;
