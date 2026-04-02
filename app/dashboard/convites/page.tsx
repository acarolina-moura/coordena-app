<<<<<<< HEAD
import { auth } from "@/auth";
import { getMeusConvites } from "../_data/formando";
import { ConvitesFormando } from "./_components/convites-formando";
import { redirect } from "next/navigation";

export default async function ConvitesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const convites = await getMeusConvites(session.user.id);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Os Meus Convites</h1>
                <p className="text-gray-500 text-sm">Gere as tuas participações em novos cursos e módulos.</p>
            </div>

            <ConvitesFormando initialConvites={convites} />
        </div>
    );
}
=======
// Importar ações do servidor (buscar convites e responder)
import { obterConvites } from "./actions";
// Importar componente cliente interativa
import { ConvitesClient } from "./convites-client";

/**
 * Server Component - Página de Convites
 * Este é um componente do servidor que:
 * 1. Busca os convites do formador autenticado
 * 2. Passa os dados para o componente cliente (ConvitesClient)
 * 3. Trata erros de autenticação/carregamento
 */
export default async function ConvitesPage() {
  try {
    // Buscar convites da base de dados
    const convites = await obterConvites();
    // Renderizar o componente cliente com os dados iniciais
    return <ConvitesClient convitesIniciais={convites} />;
  } catch (error) {
    // Se houver erro (formador não autenticado, etc), mostrar mensagem
    console.error("Erro ao carregar página de convites:", error);
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Convites</h1>
          <p className="mt-0.5 text-sm text-gray-500">Convites para módulos enviados pelo coordenador</p>
        </div>
        {/* Mostrar mensagem de erro */}
        <div className="flex items-center justify-center rounded-2xl border border-gray-300 bg-white py-12">
          <p className="text-red-500">Erro ao carregar convites. Certifique-se de que está autenticado como formador.</p>
        </div>
      </div>
    );
  }
}
>>>>>>> 56238e2b0e5f26a79e4271bffc3fe9ccc15ee8e5
