import { BookOpen, Clock, Mail, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getFormadorStats, getProximasSessoesFormador, getConvitesPendentesFormador, SessaoFormador, ConvitePendente } from '@/app/dashboard/_data/formador'

export async function FormadorDashboard({ userName, userId }: { userName: string; userId: string }) {
  const [stats, sessoes, convites] = await Promise.all([
    getFormadorStats(userId),
    getProximasSessoesFormador(userId),
    getConvitesPendentesFormador(userId),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Olá' : 'Boa noite'

  const kpis = [
    { label: 'MÓDULOS ATIVOS', value: stats.modulosAtivos, icon: BookOpen, bg: 'bg-purple-50 dark:bg-purple-950/50', iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-500' },
    { label: 'CURSO', value: stats.cursoNome || 'N/A', icon: Briefcase, bg: 'bg-green-50 dark:bg-green-950/50', iconBg: 'bg-green-100 dark:bg-green-900/50', iconColor: 'text-green-500' },
    { label: 'PRÓXIMAS SESSÕES', value: stats.proximasSessoes, icon: Clock, bg: 'bg-blue-50 dark:bg-blue-950/50', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-500' },
    { label: 'CONVITES PENDENTES', value: stats.convitesPendentes, icon: Mail, bg: 'bg-amber-50 dark:bg-amber-950/50', iconBg: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-500' }
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">Painel do formador</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className={cn('flex items-center justify-between rounded-2xl p-5', kpi.bg)}>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400">{kpi.label}</span>
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</span>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', kpi.iconBg)}>
                <Icon className={cn('h-6 w-6', kpi.iconColor)} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Próximas Sessões */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
            <Clock className="h-4 w-4 text-purple-400" />
            Próximas Sessões
          </h2>
          <div className="flex flex-col gap-3">
            {sessoes.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sem sessões agendadas</p>
            )}
            {sessoes.map((s: SessaoFormador) => {
              const data = new Date(s.dataHora)
              return (
                <div key={s.id} className="flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-purple-100 dark:bg-purple-900/50 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                      {data.toLocaleString('pt-PT', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-tight text-purple-700 dark:text-purple-400">
                      {data.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.titulo}</span>
                    <span className="text-xs text-gray-400">
                      {data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} · {s.duracao}min
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Convites Pendentes */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
              <Mail className="h-4 w-4 text-amber-400" />
              Convites Pendentes
            </h2>
            <Link href="/dashboard/convites" className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {convites.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Sem convites pendentes</p>
            )}
            {convites.map((c: ConvitePendente) => {
              const data = new Date(c.dataEnvio)
              return (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.descricao}</span>
                    <span className="text-xs text-gray-400">
                      {data.toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                    Pendente
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}