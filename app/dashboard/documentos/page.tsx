import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CoordenadorDocumentos } from './_components/coordenador-documentos'
import { FormadorDocumentos } from './_components/formador-documentos'
import { FormandoDocumentos } from './_components/formando-documentos'
import { getFormadoresComDocumentos, getDocumentosFormador, getDocumentosFormando } from '@/app/dashboard/_data/documentos'
import { prisma } from '@/lib/prisma'

export default async function DocumentosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { role, id } = session.user

  if (role === 'COORDENADOR') {
    const formadores = await getFormadoresComDocumentos()
    return <CoordenadorDocumentos formadores={formadores} />
  }

  if (role === 'FORMADOR') {
    // Buscar o formador pelo userId para obter o formadorId
    const formador = await prisma.formador.findUnique({
      where: { userId: id }
    })
    
    if (!formador) redirect('/dashboard')
    
    const documentos = await getDocumentosFormador(formador.id)
    return <FormadorDocumentos documentos={documentos} />
  }

  if (role === 'FORMANDO') {
    const documentos = await getDocumentosFormando(id)
    return <FormandoDocumentos documentos={documentos} userId={id} />
  }

  redirect('/dashboard')
}