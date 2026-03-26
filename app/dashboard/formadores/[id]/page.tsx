import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Globe,
  Github,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFormadorById,
  type FormadorPerfil,
} from "@/app/dashboard/_data/coordenador";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Status badge ─────────────────────────────────────────────────────────────

function DocBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; Icon: React.ElementType }
  > = {
    VALIDO: {
      label: "Válido",
      cls: "bg-green-50 text-green-600 border-green-200",
      Icon: CheckCircle2,
    },
    A_EXPIRAR: {
      label: "A expirar",
      cls: "bg-orange-50 text-orange-600 border-orange-200",
      Icon: Clock,
    },
    EXPIRADO: {
      label: "Expirado",
      cls: "bg-red-50 text-red-600 border-red-200",
      Icon: XCircle,
    },
    EM_FALTA: {
      label: "Em falta",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
      Icon: AlertTriangle,
    },
  };

  const cfg = map[status] ?? map.EM_FALTA;
  const { label, cls, Icon } = cfg;

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FormadorPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COORDENADOR") redirect("/dashboard");

  const formador: FormadorPerfil | null = await getFormadorById(id);
  if (!formador) notFound();

  const initials = formador.nome
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const competencias: string[] = formador.competencias
    ? formador.competencias
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href="/dashboard/formadores"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar a Formadores
      </Link>

      {/* Header card */}
      <div className="flex items-center gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <Avatar className="h-20 w-20 border-2 border-gray-100 shrink-0">
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formador.nome}</h1>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {formador.email}
            </span>
            {formador.especialidade && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                {formador.especialidade}
              </span>
            )}
            {formador.idioma && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                {formador.idioma}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {formador.linkedin && (
              <a
                href={formador.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                LinkedIn ↗
              </a>
            )}
            {formador.github && (
              <a
                href={formador.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <Github className="h-3.5 w-3.5" /> GitHub ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Módulos Lecionados */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Módulos Lecionados
          </h2>

          {formador.modulos.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Sem módulos atribuídos
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {formador.modulos.map(
                (mod: FormadorPerfil["modulos"][number]) => (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {mod.nome}
                      </span>
                      <span className="text-xs text-gray-400">
                        {mod.curso.nome}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">
                      {mod.cargaHoraria}h
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-6">
          {/* Competências */}
          {competencias.length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                Competências
              </h2>
              <div className="flex flex-wrap gap-2">
                {competencias.map((comp: string) => (
                  <span
                    key={comp}
                    className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <FileText className="h-4 w-4 text-indigo-500" />
              Documentos
            </h2>

            {formador.documentos.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Sem documentos registados
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {formador.documentos.map(
                  (doc: FormadorPerfil["documentos"][number]) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-200">{doc.tipo}</span>
                      <DocBadge status={doc.status} />
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Info adicional */}
          {formador.nacionalidade && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h2 className="mb-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                Informação Adicional
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Nacionalidade</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formador.nacionalidade}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
