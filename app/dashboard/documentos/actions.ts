"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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

    await prisma.documento.upsert({
      where: {
        id: formData.get("id") as string || "new-id", // Se tiver id, faz update
      },
      update: {
        fileUrl,
        numero: numero || "",
        dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
        dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
        status: "VALIDO",
      },
      create: {
        tipo,
        numero: numero || "",
        dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
        dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
        status: "VALIDO",
        formandoId: formando.id,
        fileUrl,
      },
    });

    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    console.error("[uploadDocumentoFormando]", error);
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

    // Nota: O formador usa o modelo DocumentoFormador no data layer
    // Aqui usamos upsert para criar ou atualizar
    const existingDoc = await prisma.documentoFormador.findFirst({
        where: { formadorId: formador.id, tipo }
    })

    if (existingDoc) {
        await prisma.documentoFormador.update({
            where: { id: existingDoc.id },
            data: {
                fileUrl,
                dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
                dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
                status: "VALIDO",
            }
        })
    } else {
        await prisma.documentoFormador.create({
            data: {
                id: crypto.randomUUID(),
                tipo,
                numero: "",
                dataEmissao: dataEmissao ? new Date(dataEmissao) : new Date(),
                dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
                status: "VALIDO",
                formadorId: formador.id,
                fileUrl,
            }
        })
    }

    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    console.error("[uploadDocumentoFormador]", error);
    return { error: error instanceof Error ? error.message : "Erro no upload" };
  }
}
