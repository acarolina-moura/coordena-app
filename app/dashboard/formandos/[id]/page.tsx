import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFormandoPerfil } from "@/app/dashboard/_data/coordenador";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function FormandoPerfilPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Checagem do ID
  if (!id) {
    console.warn("ID do formando não fornecido!");
    notFound();
  }

  // Autenticação
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COORDENADOR") redirect("/dashboard");

  // Buscar perfil do formando
  const perfil = await getFormandoPerfil(id);
  if (!perfil) {
    console.warn(`Formando com id ${id} não encontrado.`);
    notFound();
  }

  // Inicials do avatar
  const initials = perfil.nome
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Média, positivas e negativas
  const mediaNota =
    perfil.avaliacoes.length > 0
      ? (
          perfil.avaliacoes.reduce((sum, a) => sum + a.nota, 0) /
          perfil.avaliacoes.length
        ).toFixed(1)
      : null;

  const positivas = perfil.avaliacoes.filter((a) => a.nota >= 10).length;
  const negativas = perfil.avaliacoes.filter((a) => a.nota < 10).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Botão Voltar */}
      <Link
        href="/dashboard/formandos"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar a Formandos
      </Link>

      {/* Header Card */}
      <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-gray-100 shrink-0">
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-2 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {perfil.nome}
            </h1>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {perfil.email}
            </span>

            {mediaNota && (
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-indigo-600">
                    {mediaNota}
                  </span>
                  <span className="text-xs text-gray-400">média</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-semibold">{positivas}</span>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">{negativas}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botão Editar */}
        <Link
          href={`/dashboard/formandos/${id}/editar`}
          className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Cursos */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
          <BookOpen className="h-4 w-4 text-indigo-500" />
          Cursos Inscritos
        </h2>

        {perfil.cursos.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Não está inscrito em nenhum curso
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {perfil.cursos.map((curso) => (
              <div
                key={curso.id}
                className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 p-4"
              >
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {curso.nome}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {curso.cargaHoraria}h
                    {curso.dataInicio && (
                      <>
                        {" · "}Início:{" "}
                        {new Date(curso.dataInicio).toLocaleDateString("pt-PT")}
                      </>
                    )}
                  </p>
                </div>

                {curso.modulos.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {curso.modulos.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {mod.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {mod.cargaHoraria}h
                          </p>
                        </div>

                        {mod.nota !== null ? (
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                              mod.nota >= 10
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700",
                            )}
                          >
                            {mod.nota.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
