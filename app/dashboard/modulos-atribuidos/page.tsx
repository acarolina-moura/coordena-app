import { Puzzle, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getModulosAtribuidosFormador } from "@/app/dashboard/_data/formador";
import { prisma } from "@/lib/prisma";

type ModuloStatus = "Ativo" | "Inativo" | "Concluído";

interface ModuloAtribuido {
  id: string;
  nome: string;
  codigo: string;
  curso: string;
  tags: string[];
  formandos: number;
  status: ModuloStatus;
}

// Styling for different module statuses
const STATUS_STYLE: Record<ModuloStatus, string> = {
  Ativo:     "border-green-300 text-green-700 bg-green-50",
  Inativo:   "border-gray-300 text-gray-500 bg-gray-50",
  Concluído: "border-blue-300 text-blue-700 bg-blue-50",
};

/**
 * ModuloCard Component
 * Displays a module card with:
 * - Module icon and status badge
 * - Module name, code, and course
 * - Tags (skills/topics)
 * - Number of students enrolled
 */
function ModuloCard({ modulo }: { modulo: ModuloAtribuido }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-purple-200 hover:shadow-sm transition-all">
      {/* Header: Icon and Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100">
          <Puzzle className="h-6 w-6 text-purple-500" />
        </div>
        <span className={cn("rounded-full border px-3 py-0.5 text-xs font-semibold", STATUS_STYLE[modulo.status])}>
          {modulo.status}
        </span>
      </div>

      {/* Module Information */}
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold text-gray-900">{modulo.nome}</h3>
        <span className="text-sm text-purple-500 font-medium">{modulo.codigo}</span>
        <span className="text-sm text-gray-400">{modulo.curso}</span>
      </div>

      {/* Tags - Skills or Topics */}
      <div className="flex flex-wrap gap-1.5">
        {modulo.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-purple-100 bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer: Number of Students */}
      <div className="flex items-center gap-1.5 border-t border-gray-100 pt-3 text-sm text-gray-500">
        <GraduationCap className="h-4 w-4 text-gray-400" />
        {modulo.formandos} formando{modulo.formandos !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

/**
 * ModulosAtribuidosPage
 * Server component that:
 * 1. Authenticates the user
 * 2. Fetches the trainer's assigned modules from database
 * 3. Displays them in a grid of cards
 */
export default async function ModulosAtribuidosPage() {
  // Get the current authenticated user session
  const session = await auth();
  
  // Redirect to login if no user is authenticated
  if (!session?.user?.email) redirect('/login');

  // Find the user in the database by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  // Redirect to login if user is not found
  if (!user?.id) redirect('/login');

  // Fetch all modules assigned to this trainer from the database
  const modulos = await getModulosAtribuidosFormador(user.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">Módulos Atribuídos</h1>
        <p className="mt-0.5 text-sm text-gray-500">{modulos.length} módulos atribuídos</p>
      </div>

      {/* Grid of Module Cards - Responsive layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modulos.map((m) => (
          <ModuloCard key={m.id} modulo={m} />
        ))}
      </div>
    </div>
  );
}