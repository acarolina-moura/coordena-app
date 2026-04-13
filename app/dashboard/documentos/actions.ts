"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

/**
 * Regista um documento na base de dados após upload feito via UploadThing.
 * O ficheiro já foi enviado para o UploadThing — esta função apenas
 * associa o URL retornado ao formando/formador correto.
 */
export async function registarDocumento(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Não autorizado — faz login primeiro");
    }

    const role = session.user.role;
    const fileUrl = formData.get("fileUrl") as string;
    const tipo = formData.get("tipo") as string;
    const _nomeFicheiro = formData.get("nomeFicheiro") as string;
    const _tamanho = parseInt(formData.get("tamanho") as string) || 0;
    const numero = formData.get("numero") as string | undefined;
    const dataEmissao = formData.get("dataEmissao") as string | undefined;
    const dataExpiracao = formData.get("dataExpiracao") as string | undefined;

    if (!fileUrl || !tipo) {
      throw new Error("URL do ficheiro ou tipo em falta");
    }

    if (!fileUrl.startsWith("https://") && !fileUrl.startsWith("/")) {
      throw new Error("URL do ficheiro inválido");
    }

    // ─── FORMANDO ───────────────────────────────────────────────────────
    if (role === "FORMANDO") {
      const formando = await prisma.formando.findUnique({
        where: { userId: session.user.id },
      });
      if (!formando) throw new Error("Formando não encontrado");

      const existente = await prisma.documento.findFirst({
        where: { formandoId: formando.id, tipo },
      });

      if (existente) {
        await prisma.documento.update({
          where: { id: existente.id },
          data: {
            fileUrl,
            numero: numero ?? existente.numero,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
            dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
            status: "VALIDO",
          },
        });
      } else {
        await prisma.documento.create({
          data: {
            tipo,
            numero: numero ?? null,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
            dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
            status: "VALIDO",
            formandoId: formando.id,
            fileUrl,
          },
        });
      }
    }

    // ─── FORMADOR ───────────────────────────────────────────────────────
    else if (role === "FORMADOR") {
      const formador = await prisma.formador.findUnique({
        where: { userId: session.user.id },
      });
      if (!formador) throw new Error("Formador não encontrado");

      const existente = await prisma.documento.findFirst({
        where: { formadorId: formador.id, tipo },
      });

      if (existente) {
        await prisma.documento.update({
          where: { id: existente.id },
          data: {
            fileUrl,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
            dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
            status: "VALIDO",
          },
        });
      } else {
        await prisma.documento.create({
          data: {
            tipo,
            numero: null,
            dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
            dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
            status: "VALIDO",
            formadorId: formador.id,
            fileUrl,
          },
        });
      }
    }

    // ─── ROLE NÃO AUTORIZADA ────────────────────────────────────────────
    else {
      throw new Error("Role não autorizada para upload de documentos");
    }

    revalidatePath("/dashboard/documentos");
    return {
      success: true,
      mensagem: `Documento "${tipo}" registado com sucesso`,
    };
  } catch (error) {
    logError("[registarDocumento]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao registar documento",
    };
  }
}

// ─── Legacy compat: manter função antiga para não quebrar código existente ──

/** @deprecated Usar registarDocumento com UploadThing */
export async function uploadDocumentoFormando(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMANDO") {
      throw new Error("Não autorizado");
    }

    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;
    const numero = formData.get("numero") as string;
    const dataEmissao = formData.get("dataEmissao") as string;
    const dataExpiracao = formData.get("dataExpiracao") as string;

    if (!file || !tipo) throw new Error("Ficheiro ou tipo em falta");

    const userId = session.user.id;
    const formando = await prisma.formando.findUnique({
      where: { userId },
    });

    if (!formando) throw new Error("Formando não encontrado");

    // Simulação: Guardamos o nome do ficheiro como URL
    // Numa app real, usaríamos fs.writeFile ou um bucket S3
    const fileUrl = `/uploads/${Date.now()}-${file.name}`;

    const docId = formData.get("id") as string | null;
    if (docId) {
      await prisma.documento.update({
        where: { id: docId },
        data: {
          fileUrl,
          numero,
          dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          status: "VALIDO",
        },
      });
    } else {
      await prisma.documento.create({
        data: {
          tipo,
          numero,
          dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          status: "VALIDO",
          formandoId: formando.id,
          fileUrl,
        },
      });
    }

    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    logError("[uploadDocumentoFormando]", error);
    return { error: error instanceof Error ? error.message : "Erro no upload" };
  }
}

export async function uploadDocumentoFormador(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMADOR") {
      throw new Error("Não autorizado");
    }

    const file = formData.get("file") as File;
    const tipo = formData.get("tipo") as string;
    const dataEmissao = formData.get("dataEmissao") as string;
    const dataExpiracao = formData.get("dataExpiracao") as string;

    if (!file || !tipo) throw new Error("Ficheiro ou tipo em falta");

    const userId = session.user.id;
    const formador = await prisma.formador.findUnique({
      where: { userId },
    });

    if (!formador) throw new Error("Formador não encontrado");

    const fileUrl = `/uploads/${Date.now()}-${file.name}`;

    // Verifica se já existe documento com este tipo para o formador
    const existente = await prisma.documento.findFirst({
      where: { formadorId: formador.id, tipo },
    });

    if (existente) {
      await prisma.documento.update({
        where: { id: existente.id },
        data: {
          fileUrl,
          numero: "",
          dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          status: "VALIDO",
        },
      });
    } else {
      await prisma.documento.create({
        data: {
          tipo,
          numero: "",
          dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          status: "VALIDO",
          formadorId: formador.id,
          fileUrl,
        },
      });
    }

    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    logError("[uploadDocumentoFormador]", error);
    return { error: error instanceof Error ? error.message : "Erro no upload" };
  }
}
