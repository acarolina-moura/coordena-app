import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/disponibilidades?userId=xxx&semana=1
 * 
 * MODIFICADO: Agora aceita parâmetro 'semana' para filtrar por semana do ano
 * Retorna as disponibilidades de um formador para uma semana específica
 * 
 * Query params:
 * - userId: ID do utilizador (obrigatório)
 * - semana: número da semana do ano (1-53) - defaut: 1
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  // NOVO: Extrair parâmetro de semana. Defaut é semana 1 se não especificado
  const semana = parseInt(req.nextUrl.searchParams.get("semana") || "1", 10);
  
  if (!userId) return NextResponse.json([], { status: 400 });

  const formador = await prisma.formador.findUnique({ where: { userId } });
  if (!formador) return NextResponse.json([]);

  // MODIFICADO: Agora filtra também por semana do ano
  const disponibilidades = await prisma.disponibilidade.findMany({
    where: { formadorId: formador.id, disponivel: true, semana },
    // NOVO: Incluir campo 'semana' na resposta
    select: { diaSemana: true, hora: true, minuto: true, tipo: true, semana: true },
  });

  return NextResponse.json(disponibilidades);
}

/**
 * POST /api/disponibilidades
 * 
 * MODIFICADO: Agora guarda disponibilidades por semana específica
 * Ao guardar, elimina APENAS as disponibilidades da semana selecionada (não todas)
 * 
 * Body esperado:
 * {
 *   userId: string,
 *   slots: { hora, minuto, diaSemana, tipo }[],
 *   semana: number (1-53) - número da semana do ano
 * }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // MODIFICADO: Extrair 'semana' do body (defaut é semana 1)
  const { userId, slots, semana = 1 } = await req.json();
  
  if (!userId)
    return NextResponse.json({ error: "userId em falta" }, { status: 400 });

  const formador = await prisma.formador.findUnique({ where: { userId } });
  if (!formador)
    return NextResponse.json(
      { error: "Formador não encontrado" },
      { status: 404 },
    );

  // MODIFICADO: Apaga APENAS as disponibilidades da semana específica enviada
  // Isto permite que o formador edite diferentes semanas sem perder dados de outras semanas
  await prisma.disponibilidade.deleteMany({
    where: { formadorId: formador.id, semana },
  });

  if (Array.isArray(slots) && slots.length > 0) {
    await prisma.disponibilidade.createMany({
      data: slots.map(
        (s: { hora: number; minuto: number; diaSemana: string; tipo?: string }) => ({
          formadorId: formador.id,
          diaSemana: s.diaSemana,
          hora: s.hora,
          minuto: s.minuto,
          // NOVO: Guardar o número da semana do ano
          semana,
          // Campo disponível é true se tem tipo (TOTAL ou PARCIAL)
          disponivel: !!s.tipo,
          // Tipo pode ser "TOTAL" ou "PARCIAL"
          tipo: s.tipo || null,
        }),
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
