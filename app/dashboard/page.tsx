import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CoordenadorDashboard } from '@/app/dashboard/_components/coordenador-dashboard'
import { FormadorDashboard } from '@/app/dashboard/_components/formador-dashboard'
import { FormandoDashboard } from '@/app/dashboard/_components/formando-dashboard'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { name, role } = session.user

  if (role === 'COORDENADOR') return <CoordenadorDashboard userName={name ?? ''} />
  if (role === 'FORMADOR') return <FormadorDashboard userName={name ?? ''} userId={session.user.id} />
  if (role === 'FORMANDO') return <FormandoDashboard userName={name ?? ''} userId={session.user.id} />

  redirect('/login')
}