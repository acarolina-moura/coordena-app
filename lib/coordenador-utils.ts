import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

/**
 * Obtém o coordenador logado a partir da sessão atual.
 * Se não houver sessão ou o usuário não for um coordenador, redireciona para login.
 * 
 * @returns O objeto coordenador com seu ID e userId
 */
export async function getCoordenadorLogado() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'COORDENADOR') {
    throw new Error('Acesso não autorizado. Apenas coordenadores podem acessar esta funcionalidade.')
  }

  const coordenadorId = session.user.coordenadorId

  if (!coordenadorId) {
    // Se o coordenadorId não está no token, buscar no banco
    const coordenador = await prisma.coordenador.findUnique({
      where: { userId: session.user.id },
      select: { id: true, userId: true }
    })

    if (!coordenador) {
      throw new Error('Coordenador não encontrado. Entre em contato com o suporte.')
    }

    return coordenador
  }

  const coordenador = await prisma.coordenador.findUnique({
    where: { id: coordenadorId },
    select: { id: true, userId: true }
  })

  if (!coordenador) {
    throw new Error('Coordenador não encontrado. Entre em contato com o suporte.')
  }

  return coordenador
}

/**
 * Verifica se o usuário logado é um coordenador e retorna seu ID.
 * Útil para uso em API routes.
 * 
 * @returns O ID do coordenador logado ou null se não for coordenador
 */
export async function getCoordenadorIdOrNull(): Promise<string | null> {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'COORDENADOR') {
    return null
  }

  if (session.user.coordenadorId) {
    return session.user.coordenadorId
  }

  const coordenador = await prisma.coordenador.findUnique({
    where: { userId: session.user.id },
    select: { id: true }
  })

  return coordenador?.id || null
}

/**
 * Verifica se um curso pertence ao coordenador logado.
 * 
 * @param cursoId - ID do curso a verificar
 * @param coordenadorId - ID do coordenador (opcional, usa o logado se não fornecido)
 * @returns true se o curso pertence ao coordenador
 */
export async function cursoPertenceAoCoordenador(
  cursoId: string,
  coordenadorId?: string
): Promise<boolean> {
  const cid = coordenadorId || await getCoordenadorIdOrNull()
  
  if (!cid) return false

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId },
    select: { coordenadorId: true }
  })

  return curso?.coordenadorId === cid
}

/**
 * Aplica filtro de multi-tenancy em queries de cursos.
 * Retorna apenas os cursos do coordenador logado.
 * 
 * @param where - Filtros adicionais opcionais
 * @returns Objeto where filtrado por coordenador
 */
export async function filtroCursosCoordenador(where: Record<string, any> = {}) {
  const coordenadorId = await getCoordenadorIdOrNull()
  
  if (!coordenadorId) {
    // Se não é coordenador, retorna filtro que não encontra nada
    return { ...where, coordenadorId: null }
  }

  return { ...where, coordenadorId }
}

/**
 * Aplica filtro de multi-tenancy em queries de inscrições.
 * Retorna apenas inscrições de alunos nos cursos do coordenador logado.
 * 
 * @param where - Filtros adicionais opcionais
 * @returns Objeto where filtrado por cursos do coordenador
 */
export async function filtroInscricoesCoordenador(where: Record<string, any> = {}) {
  const coordenadorId = await getCoordenadorIdOrNull()
  
  if (!coordenadorId) {
    return { ...where, curso: { coordenadorId: null } }
  }

  return { ...where, curso: { coordenadorId } }
}

/**
 * Aplica filtro de multi-tenancy em queries de módulos.
 * Retorna apenas módulos de cursos do coordenador logado.
 * 
 * @param where - Filtros adicionais opcionais
 * @returns Objeto where filtrado por cursos do coordenador
 */
export async function filtroModulosCoordenador(where: Record<string, any> = {}) {
  const coordenadorId = await getCoordenadorIdOrNull()
  
  if (!coordenadorId) {
    return { ...where, curso: { coordenadorId: null } }
  }

  return { ...where, curso: { coordenadorId } }
}

/**
 * Aplica filtro de multi-tenancy em queries de formadores.
 * Retorna apenas formadores atribuídos a módulos dos cursos do coordenador logado.
 * 
 * @param where - Filtros adicionais opcionais
 * @returns Objeto where filtrado por cursos do coordenador
 */
export async function filtroFormadoresCoordenador(where: Record<string, any> = {}) {
  const coordenadorId = await getCoordenadorIdOrNull()
  
  if (!coordenadorId) {
    return { ...where, modulosLecionados: { some: { modulo: { curso: { coordenadorId: null } } } } }
  }

  return { ...where, modulosLecionados: { some: { modulo: { curso: { coordenadorId } } } } }
}

/**
 * Aplica filtro de multi-tenancy em queries de formandos.
 * Retorna apenas formandos inscritos em cursos do coordenador logado.
 * 
 * @param where - Filtros adicionais opcionais
 * @returns Objeto where filtrado por cursos do coordenador
 */
export async function filtroFormandosCoordenador(where: Record<string, any> = {}) {
  const coordenadorId = await getCoordenadorIdOrNull()
  
  if (!coordenadorId) {
    return { ...where, inscricoes: { some: { curso: { coordenadorId: null } } } }
  }

  return { ...where, inscricoes: { some: { curso: { coordenadorId } } } }
}
