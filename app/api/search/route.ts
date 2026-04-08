import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ResultadoPesquisa = {
  id: string;
  tipo: "curso" | "formador" | "formando" | "modulo";
  titulo: string;
  subtitulo: string;
  href: string;
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json([], { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const resultados: ResultadoPesquisa[] = [];

  // Apenas o coordenador pesquisa tudo
  if (session.user.role === "COORDENADOR") {
    const [cursos, formadores, formandos, modulos] = await Promise.all([
      prisma.curso.findMany({
        where: { nome: { contains: q, mode: "insensitive" } },
        select: { id: true, nome: true, status: true },
        take: 4,
      }),
      prisma.formador.findMany({
        where: { user: { nome: { contains: q, mode: "insensitive" } } },
        include: { user: { select: { nome: true, email: true } } },
        take: 4,
      }),
      prisma.formando.findMany({
        where: { user: { nome: { contains: q, mode: "insensitive" } } },
        include: {
          user: { select: { nome: true, email: true } },
          inscricoes: {
            include: { curso: { select: { nome: true } } },
            take: 1,
          },
        },
        take: 4,
      }),
      prisma.modulo.findMany({
        where: { nome: { contains: q, mode: "insensitive" } },
        include: { curso: { select: { nome: true } } },
        take: 4,
      }),
    ]);

    cursos.forEach((c) =>
      resultados.push({
        id: c.id,
        tipo: "curso",
        titulo: c.nome,
        subtitulo: c.status,
        href: "/dashboard/cursos",
      }),
    );

    formadores.forEach((f) =>
      resultados.push({
        id: f.id,
        tipo: "formador",
        titulo: f.user.nome,
        subtitulo: f.user.email,
        href: `/dashboard/formadores/${f.id}`,
      }),
    );

    formandos.forEach((f) =>
      resultados.push({
        id: f.id,
        tipo: "formando",
        titulo: f.user.nome,
        subtitulo: f.inscricoes[0]?.curso.nome ?? f.user.email,
        href: `/dashboard/formandos/${f.id}`,
      }),
    );

    modulos.forEach((m) =>
      resultados.push({
        id: m.id,
        tipo: "modulo",
        titulo: m.nome,
        subtitulo: m.curso.nome,
        href: "/dashboard/modulos",
      }),
    );
  }

  return NextResponse.json(resultados);
}
