import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarFormandoPage({
  params,
}: {
  params: { id: string };
}) {
  const formando = await prisma.formando.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!formando) redirect("/dashboard/formandos");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Editar Formando
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Atualize os dados do formando selecionado.
          </p>
        </div>

        <Link
          href={`/dashboard/formandos/${formando.id}`}
          className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Dados do Formando
        </h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Nome
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {formando.user.nome}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Email
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {formando.user.email}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
              Role
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {formando.user.role}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
              ID
            </span>
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
              {formando.id}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ⚠️ Página em desenvolvimento: aqui vamos colocar o formulário de
            edição (nome, email e password).
          </p>
        </div>
      </div>
    </div>
  );
}
