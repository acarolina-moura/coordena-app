import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Notificacao } from "./types";


export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const notificacoes: Notificacao[] = [];

    // ── Documentos expirados ou a expirar (formadores) ─────────────────────────
    const docsFormadores = await prisma.documento.findMany({
      where: {
        status: { in: ["EXPIRADO", "A_EXPIRAR", "EM_FALTA"] },
        formadorId: { not: null }
      },
      include: { formador: { include: { user: { select: { nome: true } } } } },
      orderBy: { status: "desc" },
      take: 10,
    });

    for (const doc of docsFormadores) {
      const urgente = doc.status === "EXPIRADO";
      const statusLabel =
        doc.status === "EXPIRADO"
          ? "expirou"
          : doc.status === "A_EXPIRAR"
            ? "está a expirar"
            : "está em falta";

      notificacoes.push({
        id: `doc-formador-${doc.id}`,
        tipo: "DOCUMENTO",
        titulo: `${doc.tipo} ${statusLabel}`,
        descricao: doc.formador?.user.nome ?? "Desconhecido",
        href: "/dashboard/documentos",
        urgente,
      });
    }

    // ── Documentos expirados ou a expirar (formandos) ──────────────────────────
    const docsFormandos = await prisma.documento.findMany({
      where: {
        status: { in: ["EXPIRADO", "A_EXPIRAR", "EM_FALTA"] },
        formandoId: { not: null }
      },
      include: { formando: { include: { user: { select: { nome: true } } } } },
      orderBy: { status: "desc" },
      take: 10,
    });

    for (const doc of docsFormandos) {
      const urgente = doc.status === "EXPIRADO";
      const statusLabel =
        doc.status === "EXPIRADO"
          ? "expirou"
          : doc.status === "A_EXPIRAR"
            ? "está a expirar"
            : "está em falta";

      notificacoes.push({
        id: `doc-formando-${doc.id}`,
        tipo: "DOCUMENTO",
        titulo: `${doc.tipo} ${statusLabel}`,
        descricao: doc.formando?.user.nome ?? "Desconhecido",
        href: "/dashboard/formandos",
        urgente,
      });
    }

    // ── Alunos em risco ────────────────────────────────────────────────────────
    const avaliacoesNegativas = await prisma.avaliacao.findMany({
      where: { nota: { lt: 10 } },
      select: { formandoId: true, moduloId: true },
    });

    if (avaliacoesNegativas.length > 0) {
      const porFormando = avaliacoesNegativas.reduce<Record<string, Set<string>>>(
        (acc, av) => {
          if (!acc[av.formandoId]) acc[av.formandoId] = new Set();
          acc[av.formandoId].add(av.moduloId);
          return acc;
        },
        {},
      );

      const idsComMaisNegativas = Object.entries(porFormando)
        .sort(([, a], [, b]) => b.size - a.size)
        .slice(0, 5)
        .map(([id]) => id);

      const formandos = await prisma.formando.findMany({
        where: { id: { in: idsComMaisNegativas } },
        include: { user: { select: { nome: true } } },
      });

      for (const f of formandos) {
        const negativas = porFormando[f.id]?.size ?? 0;
        notificacoes.push({
          id: `risco-${f.id}`,
          tipo: "ALUNO_RISCO",
          titulo: "Aluno em risco",
          descricao: `${f.user.nome} · ${negativas} módulo${negativas !== 1 ? "s" : ""} com negativa`,
          href: "/dashboard/formandos",
          urgente: negativas >= 2,
        });
      }
    }

    notificacoes.sort((a, b) => Number(b.urgente) - Number(a.urgente));

    return NextResponse.json(notificacoes);
  } catch (error) {
    console.error("[GET_NOTIFICACOES]", error);
    return NextResponse.json(
      { error: "Erro ao carregar notificações" },
      { status: 500 }
    );
  }
}
