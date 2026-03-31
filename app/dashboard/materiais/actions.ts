"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getMateriaisForFormando() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMANDO") {
      throw new Error("Não autorizado");
    }

    const userId = session.user.id;
    const formando = await prisma.formando.findUnique({
      where: { userId },
      include: {
        inscricoes: {
          include: {
            curso: {
              include: {
                modulos: {
                  include: {
                    materiais: {
                      include: {
                        formador: {
                          include: {
                            user: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!formando) return [];

    const materiais = formando.inscricoes.flatMap((ins) =>
      ins.curso.modulos.flatMap((mod) =>
        mod.materiais.map((mat) => ({
          ...mat,
          moduloNome: mod.nome,
          cursoNome: ins.curso.nome,
          formadorNome: mat.formador.user.nome,
        }))
      )
    );

    return materiais;
  } catch (error) {
    console.error("[getMateriaisForFormando]", error);
    return [];
  }
}

export async function getMateriaisForFormador() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMADOR") {
      throw new Error("Não autorizado");
    }

    const userId = session.user.id;
    const formador = await prisma.formador.findUnique({
      where: { userId },
      include: {
        materiaisApoio: {
          include: {
            modulo: true,
          },
        },
        modulosLecionados: {
          include: {
            modulo: true,
          },
        },
      },
    });

    if (!formador) return { materiais: [], modulos: [] };

    return {
      materiais: formador.materiaisApoio.map((mat) => ({
        ...mat,
        moduloNome: mat.modulo.nome,
      })),
      modulos: formador.modulosLecionados.map((ml) => ({
        id: ml.modulo.id,
        nome: ml.modulo.nome,
      })),
    };
  } catch (error) {
    console.error("[getMateriaisForFormador]", error);
    return { materiais: [], modulos: [] };
  }
}

export async function uploadMaterialApoio(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMADOR") {
      throw new Error("Não autorizado");
    }

    const userId = session.user.id;
    const formador = await prisma.formador.findUnique({
      where: { userId },
    });

    if (!formador) throw new Error("Formador não encontrado");

    const file = formData.get("file") as File;
    const titulo = formData.get("titulo") as string;
    const descricao = formData.get("descricao") as string;
    const moduloId = formData.get("moduloId") as string;

    if (!file || !titulo || !moduloId) {
      throw new Error("Campos obrigatórios em falta");
    }

    const fileUrl = `/uploads/${Date.now()}-${file.name}`;
    const tipo = file.name.split(".").pop()?.toUpperCase() || "FILE";

    await prisma.materialApoio.create({
      data: {
        titulo,
        descricao,
        fileUrl,
        tipo,
        moduloId,
        formadorId: formador.id,
      },
    });

    revalidatePath("/dashboard/materiais");
    return { success: true };
  } catch (error) {
    console.error("[uploadMaterialApoio]", error);
    return { error: error instanceof Error ? error.message : "Erro no upload" };
  }
}

export async function deleteMaterialApoio(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "FORMADOR") {
      throw new Error("Não autorizado");
    }

    const userId = session.user.id;
    const formador = await prisma.formador.findUnique({ where: { userId } });

    if (!formador) throw new Error("Formador não encontrado");

    const material = await prisma.materialApoio.findUnique({
      where: { id },
    });

    if (!material || material.formadorId !== formador.id) {
      throw new Error("Material não encontrado ou não autorizado");
    }

    await prisma.materialApoio.delete({
      where: { id },
    });

    revalidatePath("/dashboard/materiais");
    return { success: true };
  } catch (error) {
    console.error("[deleteMaterialApoio]", error);
    return { error: error instanceof Error ? error.message : "Erro ao eliminar" };
  }
}
