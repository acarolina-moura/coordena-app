import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFormadorPerfil } from "@/app/dashboard/_data/formador";
import { PerfilClient } from "./_component";
import { PerfilFormando } from "./_components/perfil-formando";
import { prisma } from "@/lib/prisma";
import { User, Mail, ShieldCheck, Phone } from "lucide-react";
import { EditCoordenadorPerfil } from "./_components/edit-coordenador-perfil";
import { AvatarUploader } from "@/components/avatar-uploader";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.id) redirect("/login");

  // 1. Se for FORMANDO (MANTIDO INTACTO)
  if (user.role === "FORMANDO") {
    return (
      <PerfilFormando
        formando={{
          id: user.id,
          nome: user.nome,
          email: user.email,
          image: user.image,
        }}
      />
    );
  }

  // 2. ✅ NOVA FUNCIONALIDADE: Se for COORDENADOR
  if (user.role === "COORDENADOR") {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            O Meu Perfil
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Faça a gestão dos seus dados e credenciais.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <AvatarUploader
              currentImageUrl={user.image ?? undefined}
              userName={user.nome}
              size="lg"
            />

            <div className="flex flex-1 flex-col gap-6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm min-h-[120px]">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Nome Completo
                  </span>
                  <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {user.nome}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm min-h-[120px]">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Endereço de Email
                  </span>
                  <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100 break-all">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm min-h-[120px]">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Telefone
                  </span>
                  <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {user.telefone || "Não definido"}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-green-50 dark:bg-green-950 px-4 py-3 border border-green-100 dark:border-green-900 w-fit">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      Cargo de Acesso
                    </span>
                    <span className="text-xs text-green-600/80 dark:text-green-500">
                      Coordenador
                    </span>
                  </div>
                </div>
                <EditCoordenadorPerfil user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Se for FORMADOR (MANTIDO INTACTO)
  const formador = await getFormadorPerfil(user.id);

  if (!formador) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
          O Meu Perfil
        </h1>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="font-semibold text-blue-700 dark:text-blue-400">
            Perfil Incompleto
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
            Dados básicos:
          </p>
          <div className="mt-3 space-y-2 text-sm text-blue-600 dark:text-blue-300">
            <p>
              <strong>Nome:</strong> {user.nome}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PerfilClient formador={formador} />;
}
