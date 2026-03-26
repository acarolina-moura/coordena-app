import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/disponibilidades?userId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json([], { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json([], { status: 400 });

  const formador = await prisma.formador.findUnique({ where: { userId } });
  if (!formador) return NextResponse.json([]);

  const disponibilidades = await prisma.disponibilidade.findMany({
    where: { formadorId: formador.id, disponivel: true },
    select: { diaSemana: true, hora: true, minuto: true, tipo: true },
  });

  return NextResponse.json(disponibilidades);
}

// POST /api/disponibilidades
// Body: { userId: string, slots: { hora, minuto, diaSemana, tipo }[] }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { userId, slots } = await req.json();
  if (!userId)
    return NextResponse.json({ error: "userId em falta" }, { status: 400 });

  const formador = await prisma.formador.findUnique({ where: { userId } });
  if (!formador)
    return NextResponse.json(
      { error: "Formador não encontrado" },
      { status: 404 },
    );

  // Apaga todas as disponibilidades anteriores e recria
  await prisma.disponibilidade.deleteMany({
    where: { formadorId: formador.id },
  });

  if (Array.isArray(slots) && slots.length > 0) {
    await prisma.disponibilidade.createMany({
      data: slots.map(
        (s: { hora: number; minuto: number; diaSemana: string; tipo?: string }) => ({
          formadorId: formador.id,
          diaSemana: s.diaSemana,
          hora: s.hora,
          minuto: s.minuto,
          disponivel: !!s.tipo, // true se tem tipo (TOTAL ou PARCIAL)
          tipo: s.tipo || null,
        }),
      ),
    });
  }

  return NextResponse.json({ ok: true });
}
