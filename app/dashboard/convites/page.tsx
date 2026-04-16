import { auth } from "@/auth";
import { ConvitesFormando } from "./_components/convites-formando";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Mail, Plus, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConviteForm } from "./_components/convite-form";
import { criarConvite } from "./actions";

// ─── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────
export default async function ConvitesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { formador: true, formando: true },
  });
  const _role = session.user.role || "FORMANDO";

  // Se for FORMANDO, carrega os convites
  if (!user) redirect("/login");

  // =======================================================================
  // 1. SE FOR FORMANDO
  // =======================================================================
  if (user.role === "FORMANDO" && user.formando) {
    const convitesFormando = await prisma.convite.findMany({
      where: { formandoId: user.formando.id },
      include: { curso: true },
    });

    const mappedConvitesFormando = convitesFormando.map((c: any) => ({
      ...c,
      cursoNome: c.curso?.nome ?? null,
      moduloNome: null,
      Curso: c.curso,
    }));

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Os Meus Convites
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Gere as tuas inscrições em novos cursos.
          </p>
        </div>
        <ConvitesFormando initialConvites={mappedConvitesFormando} />
      </div>
    );
  }

  // =======================================================================
  // 2. SE FOR FORMADOR
  // =======================================================================
  if (user.role === "FORMADOR" && user.formador) {
    const convitesFormador = await prisma.convite.findMany({
      where: { 
        formadorId: user.formador.id,
        cursoId: { not: null }
      },
      include: { modulo: true, curso: true },
      orderBy: { dataEnvio: "desc" },
    });

    const mappedParaClient = convitesFormador.map((c: any) => ({
      id: c.id,
      modulo: c.modulo?.nome || "Módulo Geral",
      codigo: c.modulo?.id.substring(0, 8).toUpperCase() || "---",
      curso: c.curso?.nome || "Curso Indefinido",
      coordenador: "Coordenador",
      dataEnvio: c.dataEnvio.toLocaleDateString(),
      status: c.status.toLowerCase() as "pendente" | "aceite" | "recusado",
    }));

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Os Meus Convites
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Convites para lecionar módulos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mappedParaClient.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Mail className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">
                Nenhum convite recebido ainda.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mappedParaClient.map((convite: any) => (
                <div
                  key={convite.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold dark:text-gray-200">
                      {convite.curso}
                    </span>
                    <span className="text-xs text-gray-500">
                      {convite.coordenador}
                    </span>
                    <span className="text-xs italic text-gray-400 mt-1">
                      &ldquo;{convite.descricao}&rdquo;
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        convite.status === "pendente" &&
                          "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
                        convite.status === "aceite" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        convite.status === "recusado" &&
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                      )}
                    >
                      {convite.status === "pendente" && (
                        <Clock className="inline h-3 w-3 mr-1" />
                      )}
                      {convite.status === "aceite" && (
                        <CheckCircle2 className="inline h-3 w-3 mr-1" />
                      )}
                      {convite.status === "recusado" && (
                        <XCircle className="inline h-3 w-3 mr-1" />
                      )}
                      {convite.status === "pendente"
                        ? "Pendente"
                        : convite.status === "aceite"
                          ? "Aceite"
                          : "Recusado"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {convite.dataEnvio}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =======================================================================
  // 3. SE FOR COORDENADOR
  // =======================================================================
  if (user.role === "COORDENADOR") {
    // Buscar o coordenador logado
    const coordenador = await prisma.coordenador.findUnique({
      where: { userId: user.id },
    });

    // Filtrar apenas convites dos cursos do coordenador
    const convitesAll = coordenador
      ? await prisma.convite.findMany({
          where: {
            curso: {
              coordenadorId: coordenador.id,
            },
          },
          include: { formador: { include: { user: true } }, curso: true },
          orderBy: { dataEnvio: "desc" },
        })
      : [];

    // Buscar apenas formadores que têm módulos nos cursos do coordenador
    const formadores = coordenador
      ? await prisma.formador.findMany({
          where: {
            modulosLecionados: {
              some: {
                modulo: {
                  curso: {
                    coordenadorId: coordenador.id,
                  },
                },
              },
            },
          },
          include: { user: true },
        })
      : [];

    // Buscar apenas cursos do coordenador
    const cursos = coordenador
      ? await prisma.curso.findMany({
          where: { coordenadorId: coordenador.id },
        })
      : [];

    // Buscar módulos dos cursos do coordenador
    const modulos = coordenador
      ? await prisma.modulo.findMany({
          where: {
            curso: {
              coordenadorId: coordenador.id,
            },
          },
          include: {
            curso: true,
            formadores: {
              include: {
                formador: {
                  include: { user: true },
                },
              },
            },
          },
        })
      : [];

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
              Gestão de Convites
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Envie convites para formadores ingressarem nos cursos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Novo Convite */}
          <div className="lg:col-span-1">
            <ConviteForm
              formadores={formadores}
              modulos={modulos}
              cursos={cursos}
            />
          </div>

          {/* Lista de Convites do Coordenador */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-bold mb-4 dark:text-gray-100">
                Histórico de Convites Emitidos
              </h2>

              {convitesAll.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Mail className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Nenhum convite enviado ainda.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {convitesAll.map((convite: any) => (
                    <div
                      key={convite.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold dark:text-gray-200">
                          {convite.formador?.user.nome || "Utilizador Removido"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Curso: {convite.curso?.nome || "N/A"}
                        </span>
                        <span className="text-xs italic text-gray-400 mt-1">
                          &ldquo;{convite.descricao}&rdquo;
                        </span>
                      </div>

                      <span
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium w-fit",
                          convite.status === "PENDENTE"
                            ? "border-amber-200 bg-amber-50 dark:bg-amber-950 text-amber-600"
                            : convite.status === "ACEITE"
                              ? "border-green-200 bg-green-50 dark:bg-green-950 text-green-600"
                              : "border-red-200 bg-red-50 dark:bg-red-950 text-red-600",
                        )}
                      >
                        {convite.status === "PENDENTE" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {convite.status === "ACEITE" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {convite.status === "RECUSADO" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {convite.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback se não bater em nenhuma role (Segurança)
  return <div>Perfil inválido ou sem permissões.</div>;
}
