import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMateriaisForFormando, getMateriaisForFormador } from "./actions";
import { ListaMateriaisFormando } from "./_components/lista-materiais-formando";
import { GestaoMateriaisFormador } from "./_components/gestao-materiais-formador";

export default async function MateriaisPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
          Materiais de Apoio
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          {role === "FORMANDO"
            ? "Aceda aos recursos e conteúdos partilhados pelos seus formadores."
            : "Partilhe e gira os recursos didáticos para os seus alunos."}
        </p>
      </header>

      {role === "FORMANDO" && (
        <ListaMateriaisFormando materiais={await getMateriaisForFormando()} />
      )}

      {role === "FORMADOR" && (
        <GestaoMateriaisFormador 
          {...await getMateriaisForFormador()} 
        />
      )}

      {role === "COORDENADOR" && (
        <div className="flex bg-white dark:bg-gray-900 flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 p-20 text-center shadow-sm">
          <div className="h-16 w-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
             <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vista de Coordenador</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
            Como coordenador, poderá visualizar os materiais de todos os cursos em breve. 
            Esta funcionalidade está a ser expandida.
          </p>
        </div>
      )}
    </div>
  );
}
