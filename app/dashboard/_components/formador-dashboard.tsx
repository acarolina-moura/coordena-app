import { BookOpen, Clock, Mail, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getFormadorStats, getProximasSessoesFormador, SessaoFormador } from '@/app/dashboard/_data/formador'

export async function FormadorDashboard({ userName, userId }: { userName: string; userId: string }) {
  const [stats, sessoes] = await Promise.all([
    getFormadorStats(userId),
    getProximasSessoesFormador(userId),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 19 ? 'Olá' : 'Boa noite'

  const kpis = [
    { label: 'MÓDULOS ATIVOS', value: stats.modulosAtivos, icon: BookOpen, bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
    { label: 'PRÓXIMAS SESSÕES', value: stats.proximasSessoes, icon: Clock, bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    { label: 'CONVITES PENDENTES', value: stats.convitesPendentes, icon: Mail, bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
    { label: 'DOCS EM FALTA', value: 0, icon: AlertTriangle, bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-400' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">
          {greeting}, {userName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-400">Painel do formador</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className={cn('flex items-center justify-between rounded-2xl p-5', kpi.bg)}>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500">{kpi.label}</span>
                <span className="text-4xl font-bold text-gray-900">{kpi.value}</span>
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
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
                <div key={s.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-purple-100 py-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                      {data.toLocaleString('pt-PT', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-tight text-purple-700">
                      {data.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-gray-800">{s.titulo}</span>
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
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Mail className="h-4 w-4 text-amber-400" />
              Convites Pendentes
            </h2>
            <Link href="/dashboard/convites" className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700">
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex h-24 items-center justify-center">
            <p className="text-sm text-gray-400">Sem convites pendentes</p>
          </div>
        </div>
      </div>
    </div>
  )
}