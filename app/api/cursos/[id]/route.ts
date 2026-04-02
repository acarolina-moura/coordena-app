import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verificar dependências e remover o que for necessário ou deixar falhar se houver inscrições
    // Para ser seguro, vamos tentar remover o curso. Se houver inscrições ou módulos, o Prisma lançará erro de FK.
    // No entanto, para uma experiência melhor, podemos apagar os módulos (se for o comportamento desejado) 
    // ou apenas informar o utilizador.
    
    // Vamos apagar as relações Modulo -> FormadorModulo primeiro se existirem módulos
    const modulos = await prisma.modulo.findMany({ where: { cursoId: id } });
    const moduloIds = modulos.map(m => m.id);

    if (moduloIds.length > 0) {
      await prisma.formadorModulo.deleteMany({
        where: { moduloId: { in: moduloIds } }
      });
      await prisma.modulo.deleteMany({
        where: { cursoId: id }
      });
    }

    // 2. Apagar o curso
    await prisma.curso.delete({
      where: { id }
    });

    revalidatePath("/dashboard/cursos");

    return Response.json({ message: "Curso excluído com sucesso" });
  } catch (error) {
    console.error("[CURSO_DELETE]", error);
    return Response.json(
      { error: "Erro ao excluir curso. Verifique se existem formandos inscritos." },
      { status: 500 }
    );
  }
}
