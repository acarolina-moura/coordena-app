import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = {
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    role: session.user.role as 'COORDENADOR' | 'FORMADOR' | 'FORMANDO',
    avatar: session.user.image ?? undefined,
  }

  return (
    <DashboardShell 
      user={user}
      notificationCount={3}
      sidebar={<AppSidebar user={user} />}
    >
      {children}
    </DashboardShell>
  )
}