import { prisma } from '@/lib/prisma'

const DOCS_OBRIGATORIOS = [
    'CV', 'Cartão de Cidadão', 'CCP', 'IBAN',
    'Seguro', 'Registo Criminal', 'Certidão Finanças', 'Certidão Seg. Social',
]

export async function getFormadoresComDocumentos() {
    const formadores = await prisma.formador.findMany({
        include: {
            user: true,
            documentos: true,
        },
        orderBy: { user: { nome: 'asc' } },
    })

    return formadores.map((f: (typeof formadores)[0]) => {
        // Garante que todos os docs obrigatórios aparecem
        const documentos = DOCS_OBRIGATORIOS.map((nomeDoc) => {
            const doc = f.documentos.find((d: any) => d.nome === nomeDoc)
            return {
                nome: nomeDoc,
                status: doc?.status ?? 'EM_FALTA',
                dataValidade: doc?.dataValidade ?? null,
            }
        })

        return {
            id: f.id,
            userId: f.userId,
            nome: f.user.nome,
            email: f.user.email,
            documentos,
        }
    })
}

export async function getDocumentosFormador(userId: string) {
    const formador = await prisma.formador.findUnique({
        where: { userId },
        include: { documentos: true },
    })

    if (!formador) return []

    return DOCS_OBRIGATORIOS.map((nomeDoc) => {
        const doc = formador.documentos.find((d: any) => d.nome === nomeDoc)
        return {
            id: doc?.id ?? null,
            nome: nomeDoc,
            status: doc?.status ?? 'EM_FALTA',
            dataValidade: doc?.dataValidade ?? null,
        }
    })
}

export type FormadorComDocumentos = Awaited<ReturnType<typeof getFormadoresComDocumentos>>[number]
export type DocumentoFormador = Awaited<ReturnType<typeof getDocumentosFormador>>[number]