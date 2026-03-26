import { BookOpen, Clock, ClipboardList, CalendarDays, GraduationCap, ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  getFormandoStats,
  getCursoFormando,
  getProximasSessoesFormando,
  type CursoFormando,
  type SessaoFormando,
} from '@/app/dashboard/_data/formando'

export async function FormandoDashboard({ userName, userId }: { userName: string; userId: string }) {
  const [stats, curso, sessoes] = await Promise.all([
    getFormandoStats(userId),
    getCursoFormando(userId),
    getProximasSessoesFormando(userId),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Olá' : 'Boa noite'

  const kpis = [
    { label: 'CURSOS INSCRITOS', value: stats.cursosInscritos, icon: BookOpen, bg: 'bg-teal-50 dark:bg-teal-950/50', iconBg: 'bg-teal-100 dark:bg-teal-900/50', iconColor: 'text-teal-500' },
    { label: 'MÓDULOS COMPLETOS', value: `${stats.modulosCompletos}/${stats.totalModulos}`, icon: Clock, bg: 'bg-blue-50 dark:bg-blue-950/50', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-500' },
    { label: 'PRÓXIMAS SESSÕES', value: stats.proximasSessoes, icon: ClipboardList, bg: 'bg-purple-50 dark:bg-purple-950/50', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-500' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Alert for Pending Invitations */}
      {stats.pendingInvitations > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">Tens convites pendentes!</h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Foste convidado para {stats.pendingInvitations} novo(s) curso(s) ou módulo(s).</p>
            </div>
          </div>
          <Link
            href="/dashboard/convites"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-600/20 whitespace-nowrap"
          >
            Ver Convites
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">O teu painel de aprendizagem</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className={cn('flex items-center justify-between rounded-2xl p-5', kpi.bg)}>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">{kpi.label}</span>
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</span>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', kpi.iconBg)}>
                <Icon className={cn('h-6 w-6', kpi.iconColor)} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Curso em progresso */}
      {curso ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <GraduationCap className="h-4 w-4 text-teal-400" />
              O Meu Curso
            </h2>
            <span className="rounded-full border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/50 px-3 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
              {curso.status === 'ATIVO' ? 'Ativo' : curso.status === 'PAUSADO' ? 'Pausado' : 'Encerrado'}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{curso.nome}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> {curso.modulos.length} módulos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(curso.dataInicio).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{curso.progressoGeral}%</span>
                <p className="text-xs text-gray-400 mt-0.5">progresso geral</p>
              </div>
            </div>

            <Progress value={curso.progressoGeral} className="h-2 bg-gray-100 dark:bg-gray-800 [&>*]:bg-teal-400" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {curso.modulos.map((m: any) => (
                <div key={m.id} className="flex flex-col gap-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{m.nome}</span>
                  <Progress
                    value={m.progresso}
                    className={cn(
                      'h-1.5 bg-gray-200 dark:bg-gray-700',
                      m.nota !== null && m.nota < 10 ? '[&>*]:bg-red-400' : '[&>*]:bg-teal-400'
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">{m.progresso}%</span>
                    <span className={cn(
                      'text-[11px] font-bold',
                      m.nota === null ? 'text-gray-400' : m.nota >= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                    )}>
                      {m.nota !== null ? `${m.nota}/20` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-sm text-gray-400">
          Ainda não estás inscrito em nenhum curso
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Próximas Sessões */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <Clock className="h-4 w-4 text-teal-400" />
              Próximas Sessões
            </h2>
            <Link href="/dashboard/calendario" className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {sessoes.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sem sessões agendadas</p>
            )}
            {sessoes.map((s: SessaoFormando) => {
              const data = new Date(s.dataHora)
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-teal-100 dark:bg-teal-900/50 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500">
                      {data.toLocaleString('pt-PT', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-tight text-teal-700 dark:text-teal-400">
                      {data.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{s.titulo}</span>
                    <span className="text-xs text-gray-400">
                      {data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} · {s.duracao}min · {s.formador}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Os Meus Módulos */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <ClipboardList className="h-4 w-4 text-purple-400" />
              Os Meus Módulos
            </h2>
            <Link href="/dashboard/notas" className="flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700">
              Ver notas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {!curso && (
              <p className="text-sm text-gray-400 text-center py-2">Sem módulos disponíveis</p>
            )}
            {curso?.modulos.map((mod: any) => (
              <div key={mod.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{mod.nome}</span>
                  <span className={cn(
                    'text-lg font-bold shrink-0',
                    mod.nota === null ? 'text-gray-400' : mod.nota >= 10 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  )}>
                    {mod.nota !== null ? `${mod.nota}/20` : '—'}
                  </span>
                </div>
                <Progress
                  value={mod.progresso}
                  className={cn(
                    'h-1.5 bg-gray-100 dark:bg-gray-800',
                    mod.nota !== null && mod.nota < 10 ? '[&>*]:bg-red-400' : '[&>*]:bg-teal-400'
                  )}
                />
                <span className="text-[11px] text-gray-400">{mod.progresso}% concluído</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}