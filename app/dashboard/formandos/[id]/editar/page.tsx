import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { EditarFormandoClient } from "./_components/editar-formando-client";

export default async function EditarFormandoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "COORDENADOR") {
    redirect("/dashboard");
  }

  const formandoId = params.id;

  if (!formandoId) {
    notFound();
  }

  const formando = await prisma.formando.findUnique({
    where: { id: formandoId },
    include: {
      user: true,
      inscricoes: { include: { curso: true } },
    },
  });

  if (!formando) {
    notFound();
  }

  const cursos = await prisma.curso.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });

  return (
    <EditarFormandoClient
      formando={{
        id: formando.id,
        userId: formando.userId,
        nome: formando.user.nome,
        email: formando.user.email,
        cursoId: formando.inscricoes[0]?.cursoId ?? "",
        cursoNome: formando.inscricoes[0]?.curso.nome ?? "",
      }}
      cursos={cursos}
    />
  );
}
