import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { CoordenadorDocumentos } from './_components/coordenador-documentos'
import { FormadorDocumentos } from './_components/formador-documentos'
import { getFormadoresComDocumentos, getDocumentosFormador } from '@/app/dashboard/_data/documentos'

export default async function DocumentosPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { role, id } = session.user

  if (role === 'COORDENADOR') {
    const formadores = await getFormadoresComDocumentos()
    return <CoordenadorDocumentos formadores={formadores} />
  }

  if (role === 'FORMADOR') {
    const documentos = await getDocumentosFormador(id)
    return <FormadorDocumentos documentos={documentos} userId={id} />
  }

  redirect('/dashboard')
}