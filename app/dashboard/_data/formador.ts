import { prisma } from '@/lib/prisma'

export async function getFormadorStats(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: { modulosLecionados: true },
    })

    if (!formador) return { modulosAtivos: 0, proximasSessoes: 0, convitesPendentes: 0, docsEmFalta: 0 }

    const agora = new Date()

    const [proximasSessoes, convitesPendentes, docsEmFalta] = await Promise.all([
        prisma.aula.count({
            where: {
                formadorId: formador.id,
                dataHora: { gte: agora },
            },
        }),
        prisma.convite.count({
            where: {
                formadorId: formador.id,
                status: 'PENDENTE',
            },
        }),
        prisma.documentoFormador.count({
            where: {
                formadorId: formador.id,
                status: 'EM_FALTA',
            },
        }),
    ])

    return {
        modulosAtivos: formador.modulosLecionados.length,
        proximasSessoes,
        convitesPendentes,
        docsEmFalta,
    }
}

export async function getProximasSessoesFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
    })

    if (!formador) return []

    const agora = new Date()

    const aulas = await prisma.aula.findMany({
        where: {
            formadorId: formador.id,
            dataHora: { gte: agora },
        },
        orderBy: { dataHora: 'asc' },
        take: 4,
        include: {
            modulo: { include: { curso: true } },
        },
    })

    return aulas.map((aula: (typeof aulas)[0]) => ({
        id: aula.id,
        titulo: `${aula.modulo.curso.nome} · ${aula.titulo}`,
        dataHora: aula.dataHora,
        duracao: aula.duracao,
    }))
}

export async function getConvitesPendentesFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
    })

    if (!formador) return []

    const convites = await prisma.convite.findMany({
        where: {
            formadorId: formador.id,
            status: 'PENDENTE',
        },
        orderBy: { dataEnvio: 'desc' },
        take: 5,
    })

    return convites.map((convite: (typeof convites)[0]) => ({
        id: convite.id,
        descricao: convite.descricao || 'Convite sem descrição',
        dataEnvio: convite.dataEnvio,
        status: convite.status,
    }))
}

export async function getDocsEmFaltaFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
    })

    if (!formador) return []

    const documentos = await prisma.documentoFormador.findMany({
        where: {
            formadorId: formador.id,
            status: 'EM_FALTA',
        },
        orderBy: { createdAt: 'desc' },
    })

    return documentos.map((doc: (typeof documentos)[0]) => ({
        id: doc.id,
        tipo: doc.tipo,
        status: doc.status,
        dataExpiracao: doc.dataExpiracao,
    }))
}

export async function getFormandosPorModulo(userId: string) {
    // 1. Obter o formador
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: { modulosLecionados: true },
    })

    if (!formador) return []

    // 2. Extrair IDs dos módulos
    const moduloIds = formador.modulosLecionados.map(fm => fm.moduloId)
    
    if (moduloIds.length === 0) return []

    // 3. Obter cursos que contêm esses módulos
    const cursos = await prisma.curso.findMany({
        where: {
            modulos: { some: { id: { in: moduloIds } } }
        },
        include: {
            inscricoes: {
                include: { formando: { include: { user: true } } }
            }
        }
    })

    // 4. Montar lista de formandos únicos
    const formandosSet = new Map()
    
    cursos.forEach(curso => {
        curso.inscricoes.forEach(inscricao => {
            const key = inscricao.formando.id
            if (!formandosSet.has(key)) {
                formandosSet.set(key, {
                    id: inscricao.formando.id,
                    nome: inscricao.formando.user.nome,
                    email: inscricao.formando.user.email,
                    curso: curso.nome,
                })
            }
        })
    })

    return Array.from(formandosSet.values())
}

export async function getModulosDoFormador(userId: string) {
    // 1. Obter o formador
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: { modulosLecionados: true },
    })

    if (!formador) return []

    // 2. Extrair IDs dos módulos
    const moduloIds = formador.modulosLecionados.map(fm => fm.moduloId)
    
    if (moduloIds.length === 0) return []

    // 3. Obter detalhes dos módulos
    const modulos = await prisma.modulo.findMany({
        where: { id: { in: moduloIds } },
        include: {
            curso: true,
            aulas: true,
            _count: {
                select: { aulas: true }
            }
        },
        orderBy: { ordem: 'asc' }
    })

    // 4. Para cada módulo, contar formandos inscritos no curso
    const modulosComDetalhes = await Promise.all(
        modulos.map(async (modulo) => {
            const formandosCount = await prisma.inscricao.count({
                where: { cursoId: modulo.cursoId }
            })

            return {
                id: modulo.id,
                nome: modulo.nome,
                descricao: modulo.descricao,
                ordem: modulo.ordem,
                cargaHoraria: modulo.cargaHoraria,
                curso: modulo.curso.nome,
                aulasAgendadas: modulo._count.aulas,
                formandos: formandosCount,
            }
        })
    )

    return modulosComDetalhes
}

export type SessaoFormador = Awaited<ReturnType<typeof getProximasSessoesFormador>>[number]
export type ConvitePendente = Awaited<ReturnType<typeof getConvitesPendentesFormador>>[number]
export type DocumentoEmFalta = Awaited<ReturnType<typeof getDocsEmFaltaFormador>>[number]
export type FormandoPorModulo = Awaited<ReturnType<typeof getFormandosPorModulo>>[number]
export type ModuloDoFormador = Awaited<ReturnType<typeof getModulosDoFormador>>[number]

export async function getFormadorPerfil(userId: string) {
    let formador = await prisma.formador.findUnique({
        where: { userId },
        include: { user: true },
    })

    // Se não existe, cria um novo
    if (!formador) {
        formador = await prisma.formador.create({
            data: {
                userId,
                especialidade: '',
                competencias: '',
                linkedin: '',
                github: '',
                idioma: '',
                nacionalidade: '',
            },
            include: { user: true },
        })
    }

    if (!formador) return null

    return {
        userId: formador.userId,
        id: formador.id,
        nome: formador.user.nome,
        email: formador.user.email,
        especialidade: formador.especialidade || '',
        competencias: formador.competencias || '',
        linkedin: formador.linkedin || '',
        github: formador.github || '',
        idioma: formador.idioma || '',
        nacionalidade: formador.nacionalidade || '',
    }
}