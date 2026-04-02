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

  if (!formador) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <h1 className="text-[26px] font-bold text-gray-900">O Meu Perfil</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Erro ao carregar perfil</p>
          <p className="text-sm mt-1">O utilizador ou não existe na base de dados.</p>
        </div>
      </div>
    )
  }

  return <PerfilClient formador={formador} />
}