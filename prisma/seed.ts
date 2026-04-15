import { PrismaClient, Role, StatusCurso, StatusPresenca, StatusDocumento, StatusConvite } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Limpando base de dados para o seed de cobertura total...')
    
    // Deletar em ordem inversa de dependência rigorosa
    await prisma.notaParcial.deleteMany()
    await prisma.submissaoTrabalho.deleteMany()
    await prisma.itemTemplateAvaliacao.deleteMany()
    await prisma.templateAvaliacao.deleteMany()
    await prisma.reviewModulo.deleteMany()
    await prisma.materialApoio.deleteMany()
    await prisma.presenca.deleteMany()
    await prisma.avaliacao.deleteMany()
    await prisma.inscricao.deleteMany()
    await prisma.convite.deleteMany()
    await prisma.disponibilidade.deleteMany()
    await prisma.documento.deleteMany()
    await prisma.aula.deleteMany()
    await prisma.formadorModulo.deleteMany()
    await prisma.modulo.deleteMany()
    await prisma.curso.deleteMany()
    await prisma.formador.deleteMany()
    await prisma.formando.deleteMany()
    await prisma.coordenador.deleteMany()
    await prisma.verificationToken.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()

    console.log('🌱 Criando utilizadores (Cobrindo todos os Roles: COORDENADOR, FORMADOR, FORMANDO)...')
    const password = await bcrypt.hash('123456', 10)

    // 1. Coordenador Master
    const coordUser = await prisma.user.create({
        data: {
            nome: 'Helena Coordenadora',
            email: 'helena.coord@coordena.pt',
            senha: password,
            role: 'COORDENADOR',
            coordenador: { create: {} }
        },
        include: { coordenador: true }
    })
    const coordId = coordUser.coordenador!.id

    // 2. Formadores (Com especialidades e disponibilidades)
    const formadores = await Promise.all([
        prisma.user.create({
            data: {
                nome: 'Carlos Mendes', email: 'carlos.formador@coordena.pt', senha: password, role: 'FORMADOR',
                formador: { create: { especialidade: 'Backend & Bases de Dados', criadoPorCoordenadorId: coordId } }
            },
            include: { formador: true }
        }),
        prisma.user.create({
            data: {
                nome: 'Marta Rebelo', email: 'marta.formadora@coordena.pt', senha: password, role: 'FORMADOR',
                formador: { create: { especialidade: 'Frontend & UI/UX', criadoPorCoordenadorId: coordId } }
            },
            include: { formador: true }
        })
    ])

    // 3. Formandos (Casos de teste variados)
    const formandos = await Promise.all([
        prisma.user.create({
            data: { nome: 'João Aluno', email: 'joao.aluno@coordena.pt', senha: password, role: 'FORMANDO', formando: { create: {} } },
            include: { formando: true }
        }),
        prisma.user.create({
            data: { nome: 'Sofia Aluna (Faltas e Atrasos)', email: 'sofia.aluna@coordena.pt', senha: password, role: 'FORMANDO', formando: { create: {} } },
            include: { formando: true }
        })
    ])

    console.log('📚 Criando cursos em todos os estados da Enum StatusCurso (ATIVO, PAUSADO, ENCERRADO)...')
    const cursoAtivo = await prisma.curso.create({
        data: { nome: 'Desenvolvimento Fullstack 1050h', cargaHoraria: 1050, status: 'ATIVO', dataInicio: new Date('2026-03-01'), coordenadorId: coordId }
    })
    const cursoPausado = await prisma.curso.create({
        data: { nome: 'Cibersegurança Avançada', cargaHoraria: 300, status: 'PAUSADO', dataInicio: new Date('2026-05-15'), coordenadorId: coordId }
    })
    const cursoEncerrado = await prisma.curso.create({
        data: { nome: 'Introdução ao Algoritmo (2025)', cargaHoraria: 40, status: 'ENCERRADO', dataInicio: new Date('2025-01-01'), dataFim: new Date('2025-02-01'), coordenadorId: coordId }
    })

    console.log('🧩 Estruturando módulos, associações e inscrições...')
    const modulo1 = await prisma.modulo.create({ data: { nome: 'Bases de Dados SQL', ordem: 1, cargaHoraria: 50, cursoId: cursoAtivo.id } })
    const modulo2 = await prisma.modulo.create({ data: { nome: 'React Frameworks', ordem: 2, cargaHoraria: 50, cursoId: cursoAtivo.id } })

    await prisma.formadorModulo.createMany({
        data: [
            { formadorId: formadores[0].formador!.id, moduloId: modulo1.id },
            { formadorId: formadores[1].formador!.id, moduloId: modulo2.id }
        ]
    })

    await prisma.inscricao.createMany({
        data: [
            { formandoId: formandos[0].formando!.id, cursoId: cursoAtivo.id },
            { formandoId: formandos[1].formando!.id, cursoId: cursoAtivo.id }
        ]
    })

    console.log('📅 Gerando histórico de aulas com todos os status de StatusPresenca...')
    const aulas = await Promise.all([
        prisma.aula.create({ data: { titulo: 'Aula 1: Introdução', dataHora: new Date('2026-03-02T19:00:00Z'), duracao: 180, moduloId: modulo1.id, formadorId: formadores[0].formador!.id } }),
        prisma.aula.create({ data: { titulo: 'Aula 2: Normalização', dataHora: new Date('2026-03-04T19:00:00Z'), duracao: 180, moduloId: modulo1.id, formadorId: formadores[0].formador!.id } }),
        prisma.aula.create({ data: { titulo: 'Aula 3: Queries Complexas', dataHora: new Date('2026-03-06T19:00:00Z'), duracao: 180, moduloId: modulo1.id, formadorId: formadores[0].formador!.id } })
    ])

    await prisma.presenca.createMany({
        data: [
            // João: Sempre presente
            { aulaId: aulas[0].id, formandoId: formandos[0].formando!.id, formadorId: formadores[0].formador!.id, status: 'PRESENTE' },
            { aulaId: aulas[1].id, formandoId: formandos[0].formando!.id, formadorId: formadores[0].formador!.id, status: 'PRESENTE' },
            // Sofia: Exemplos de todos os status
            { aulaId: aulas[0].id, formandoId: formandos[1].formando!.id, formadorId: formadores[0].formador!.id, status: 'AUSENTE' },
            { aulaId: aulas[1].id, formandoId: formandos[1].formando!.id, formadorId: formadores[0].formador!.id, status: 'JUSTIFICADO', justificativa: 'Consulta Médica', comentarioFormando: 'Enviei o atestado em anexo.' },
            { aulaId: aulas[2].id, formandoId: formandos[1].formando!.id, formadorId: formadores[0].formador!.id, status: 'PENDENTE' }
        ]
    })

    console.log('📝 Fluxo de Avaliação Completo (Templates, Submissões, Notas Parciais e Finais)...')
    const template = await prisma.templateAvaliacao.create({
        data: { formadorId: formadores[0].formador!.id, moduloId: modulo1.id }
    })

    const itemAval = await prisma.itemTemplateAvaliacao.create({
        data: { templateId: template.id, nome: 'Projeto de Design DB', peso: 100, ordem: 1, dataLimite: new Date('2026-03-25') }
    })

    await prisma.submissaoTrabalho.create({
        data: { itemId: itemAval.id, formandoId: formandos[0].formando!.id, ficheiroUrl: 'https://github.com/joao/db-project', comentario: 'Submissão antecipada.' }
    })

    await prisma.notaParcial.create({
        data: { valor: 19.5, formandoId: formandos[0].formando!.id, itemId: itemAval.id, templateId: template.id }
    })

    await prisma.avaliacao.create({
        data: { nota: 19.5, descricao: 'Projeto brilhante.', moduloId: modulo1.id, formandoId: formandos[0].formando!.id, formadorId: formadores[0].formador!.id }
    })

    console.log('📄 Documentos em todos os status de StatusDocumento (VALIDO, EXPIRADO, A_EXPIRAR, EM_FALTA)...')
    await prisma.documento.createMany({
        data: [
            { tipo: 'Identificação Civil', numero: '987654321', status: 'VALIDO', formandoId: formandos[0].formando!.id },
            { tipo: 'Certificado Habilitações', status: 'EXPIRADO', formandoId: formandos[1].formando!.id, dataExpiracao: new Date('2024-12-31') },
            { tipo: 'Atestado Médico', status: 'A_EXPIRAR', formandoId: formandos[0].formando!.id, dataExpiracao: new Date('2026-05-30') },
            { tipo: 'Comprovativo de Morada', status: 'EM_FALTA', formandoId: formandos[1].formando!.id }
        ]
    })

    console.log('✉️ Convites em todos os status de StatusConvite (PENDENTE, ACEITE, RECUSADO)...')
    await prisma.convite.createMany({
        data: [
            { formadorId: formadores[0].formador!.id, cursoId: cursoAtivo.id, status: 'ACEITE', descricao: 'Convite para lecionar módulo 1' },
            { formandoId: formandos[1].formando!.id, cursoId: cursoPausado.id, status: 'PENDENTE', descricao: 'Convite para novo curso' },
            { formadorId: formadores[1].formador!.id, cursoId: cursoEncerrado.id, status: 'RECUSADO', descricao: 'Recusado por falta de tempo' }
        ]
    })

    console.log('📎 Materiais, Disponibilidades e Reviews extras...')
    await prisma.materialApoio.create({
        data: { titulo: 'Guia de SQL Avançado', fileUrl: 'https://cdn.pt/manual.pdf', moduloId: modulo1.id, formadorId: formadores[0].formador!.id }
    })

    await prisma.disponibilidade.create({
        data: { formadorId: formadores[1].formador!.id, diaSemana: 'Quinta', hora: 14, minuto: 30, tipo: 'Remoto' }
    })

    await prisma.reviewModulo.create({
        data: { nota: 5, comentario: 'Módulo excelente!', formandoId: formandos[0].formando!.id, moduloId: modulo1.id }
    })

    console.log('\n🚀 SEED DE COBERTURA TOTAL EXECUTADO COM SUCESSO! 🚀')
    console.log('Todos os modelos, enums e relações foram populados para testes.')
}

main()
    .catch((e) => { console.error('❌ Erro durante o seed:', e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })