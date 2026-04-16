import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/documentos/preview/[id]
 * Redireciona para o URL do ficheiro do documento
 * Valida se o utilizador tem permissão para visualizar
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Não autorizado", { status: 401 });
    }

    const documentoId = id;

    // Buscar document
    const documento = await prisma.documento.findUnique({
      where: { id: documentoId },
      include: {
        formador: true,
        formando: true,
      },
    });

    if (!documento) {
      return new Response("Documento não encontrado", { status: 404 });
    }

    // Validar permissão
    const isFormador = documento.formadorId && documento.formador?.userId === session.user.id;
    const isFormando = documento.formandoId && documento.formando?.userId === session.user.id;

    if (!isFormador && !isFormando) {
      return new Response("Acesso negado", { status: 403 });
    }

    // Redirecionar para o URL do ficheiro
    if (documento.fileUrl) {
      return Response.redirect(documento.fileUrl, 307);
    }

    return new Response("Ficheiro não disponível", { status: 404 });
  } catch (error) {
    console.error("[GET /api/documentos/preview] Erro:", error);
    return new Response("Erro ao processar pedido", { status: 500 });
  }
}
