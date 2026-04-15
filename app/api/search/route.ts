import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResultadoPesquisa } from "./types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json([], { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const resultados: ResultadoPesquisa[] = [];

  // Coordenador pesquisa tudo
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
        subtitulo: m.curso?.nome || "Módulo Independente",
        href: "/dashboard/modulos",
      }),
    );
  }

  // Formador pesquisa os seus módulos, cursos e formandos
  if (session.user.role === "FORMADOR") {
    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });
    if (formador) {
      const [modulos, cursos] = await Promise.all([
        prisma.modulo.findMany({
          where: {
            nome: { contains: q, mode: "insensitive" },
            formadores: { some: { formadorId: formador.id } },
          },
          include: { curso: { select: { nome: true } } },
          take: 6,
        }),
        prisma.curso.findMany({
          where: {
            nome: { contains: q, mode: "insensitive" },
            modulos: {
              some: { formadores: { some: { formadorId: formador.id } } },
            },
          },
          select: { id: true, nome: true },
          take: 4,
        }),
      ]);

      modulos.forEach((m) =>
        resultados.push({
          id: m.id,
          tipo: "modulo",
          titulo: m.nome,
          subtitulo: m.curso?.nome || "Módulo Independente",
          href: "/dashboard/modulos-atribuidos",
        }),
      );

      cursos.forEach((c) =>
        resultados.push({
          id: c.id,
          tipo: "curso",
          titulo: c.nome,
          subtitulo: "Meu curso",
          href: "/dashboard/meus-cursos",
        }),
      );
    }
  }

  // Formando pesquisa os seus cursos e módulos
  if (session.user.role === "FORMANDO") {
    const formando = await prisma.formando.findUnique({
      where: { userId: session.user.id },
      include: {
        inscricoes: {
          include: {
            curso: {
              include: {
                modulos: { select: { id: true, nome: true } },
              },
            },
          },
        },
      },
    });
    if (formando) {
      const cursos = formando.inscricoes
        .map((ins) => ins.curso)
        .filter((c) => c.nome.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 4);

      const modulos = formando.inscricoes
        .flatMap((ins) => ins.curso.modulos)
        .filter((m) => m.nome.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 6);

      cursos.forEach((c) =>
        resultados.push({
          id: c.id,
          tipo: "curso",
          titulo: c.nome,
          subtitulo: "Meu curso",
          href: "/dashboard/meus-cursos-formando",
        }),
      );

      modulos.forEach((m) =>
        resultados.push({
          id: m.id,
          tipo: "modulo",
          titulo: m.nome,
          subtitulo: "Meu módulo",
          href: "/dashboard/cronograma",
        }),
      );
    }
  }

  return NextResponse.json(resultados);
}
