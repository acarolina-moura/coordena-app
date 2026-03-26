import Link from "next/link";
import {
  BookOpen,
  Users,
  GraduationCap,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCoordenadorStats,
  getProximasSessoes,
  getFormandosEmRisco,
  getDocumentosEmFalta,
  type ProximaSessao,
  type DocumentoEmFalta,
} from "@/app/dashboard/_data/coordenador";

export async function CoordenadorDashboard({ userName }: { userName: string }) {
  const [stats, sessoes, formandosRisco, documentosEmFalta] = await Promise.all(
    [
      getCoordenadorStats(),
      getProximasSessoes(),
      getFormandosEmRisco(),
      getDocumentosEmFalta(),
    ],
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 19 ? "Boa tarde" : "Boa noite";

  const kpis = [
    {
      label: "CURSOS ATIVOS",
      value: stats.cursos,
      icon: BookOpen,
      bg: "bg-blue-50 dark:bg-blue-950/50",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-500",
    },
    {
      label: "FORMADORES",
      value: stats.formadores,
      icon: Users,
      bg: "bg-purple-50 dark:bg-purple-950/50",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      iconColor: "text-purple-500",
    },
    {
      label: "FORMANDOS",
      value: stats.formandos,
      icon: GraduationCap,
      bg: "bg-green-50 dark:bg-green-950/50",
      iconBg: "bg-green-100 dark:bg-green-900/50",
      iconColor: "text-green-500",
    },
    {
      label: "EM RISCO",
      value: formandosRisco.length,
      icon: AlertTriangle,
      bg: "bg-yellow-50 dark:bg-yellow-950/50",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 dark:text-gray-100">
          {greeting}, {userName.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aqui está o resumo da sua formação
        </p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={cn(
                "flex items-center justify-between rounded-2xl p-5",
                kpi.bg,
              )}
            >
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">
                  {kpi.label}
                </span>
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {kpi.value}
                </span>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  kpi.iconBg,
                )}
              >
                <Icon className={cn("h-6 w-6", kpi.iconColor)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        {/* ── Próximas Sessões ──────────────────────────────────────── */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <Clock className="h-4 w-4 text-indigo-500" /> Próximas Sessões
            </h2>
            <Link
              href="/calendario"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              Ver calendário <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {sessoes.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Sem sessões agendadas
              </p>
            ) : (
              sessoes.map((sessao: ProximaSessao) => {
                const data = new Date(sessao.dataHora);
                return (
                  <div
                    key={sessao.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/40 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/20"
                  >
                    {/* Date badge */}
                    <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50 py-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                        {data.toLocaleString("pt-PT", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold leading-tight text-indigo-700 dark:text-indigo-400">
                        {data.getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {sessao.titulo}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {sessao.formador}
                        {" · "}
                        {data.toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {sessao.duracao} min
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* ── Alunos em Risco ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Alunos em
                Risco
              </h2>
              {formandosRisco.length > 0 && (
                <Link
                  href="/formandos"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  Ver todos
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {formandosRisco.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Nenhum aluno em risco 🎉
                </p>
              ) : (
                formandosRisco.map((aluno) => (
                  <div
                    key={aluno.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {aluno.nome}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        {aluno.curso}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1 text-xs font-bold",
                        aluno.negativas >= 2
                          ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                          : "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
                      )}
                    >
                      {aluno.negativas} neg.
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Documentos em Falta / Expirados ──────────────────────── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                <FileWarning className="h-4 w-4 text-amber-500" /> Documentos em
                Falta
              </h2>
              {documentosEmFalta.length > 0 && (
                <Link
                  href="/documentos"
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  Ver todos
                </Link>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {documentosEmFalta.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  Todos os documentos em ordem ✅
                </p>
              ) : (
                documentosEmFalta.map((doc: DocumentoEmFalta) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {doc.tipo}
                      </span>
                      <span className="truncate text-xs text-gray-400">
                        {doc.formadorNome}
                      </span>
                    </div>
                    <DocStatusBadge status={doc.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DocStatusBadge({ status }: { status: DocumentoEmFalta["status"] }) {
  const map = {
    EM_FALTA: { label: "Em falta", cls: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
    EXPIRADO: { label: "Expirado", cls: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" },
    A_EXPIRAR: { label: "A expirar", cls: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400" },
  } as const;

  const { label, cls } = map[status];
  return (
    <span
      className={cn("shrink-0 rounded-lg px-3 py-1 text-xs font-bold", cls)}
    >
      {label}
    </span>
  );
}
