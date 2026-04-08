import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getFormadorPerfil } from '@/app/dashboard/_data/formador'
import { PerfilClient } from './_component'
import { PerfilFormando } from './_components/perfil-formando'
import { prisma } from '@/lib/prisma'

export default async function PerfilPage() {
  const session = await auth()
  
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user?.id) redirect('/login')

  if (user.role === 'FORMANDO') {
    return (
      <PerfilFormando 
        formando={{
          id: user.id,
          nome: user.nome,
          email: user.email,
        }} 
      />
    )
  }

  const formador = await getFormadorPerfil(user.id)

  // Se formador é null, mostrar dados básicos em vez de redirecionar
  if (!formador) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">O Meu Perfil</h1>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="font-semibold text-blue-700 dark:text-blue-400">Perfil Incompleto</p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Dados básicos:</p>
          <div className="mt-3 space-y-2 text-sm text-blue-600 dark:text-blue-300">
            <p><strong>Nome:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        </div>
      </div>
    )
  }

  return <PerfilClient formador={formador} />
}