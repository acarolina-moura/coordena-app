import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 A gerar dados de teste para o dashboard do formando...')

    const password = await bcrypt.hash('123456', 10)

    // 1. Criar ou Atualizar Usuários
    const alunoUser = await prisma.user.upsert({
        where: { email: 'aluno.teste@coordena.pt' },
        update: {},
        create: {
            nome: 'Everton Aluno',
            email: 'aluno.teste@coordena.pt',
            senha: password,
            role: 'FORMANDO',
            formando: { create: {} }
        },
        include: { formando: true }
    })

    const formadorUser = await prisma.user.upsert({
        where: { email: 'professor.marcos@coordena.pt' },
        update: {},
        create: {
            nome: 'Marcos Formador',
            email: 'professor.marcos@coordena.pt',
            senha: password,
            role: 'FORMADOR',
            formador: { create: {} }
        },
        include: { formador: true }
    })

    const formandoId = alunoUser.formando!.id
    const formadorId = formadorUser.formador!.id

    // 2. Criar Curso Master
    const curso = await prisma.curso.create({
        data: {
            nome: 'Curso Master de Desenvolvimento Fullstack',
            descricao: 'Um percurso intensivo pelas tecnologias mais requisitadas do mercado.',
            cargaHoraria: 600,
            status: 'ATIVO',
            dataInicio: new Date('2026-01-15'),
            dataFim: new Date('2026-07-15'),
        }
    })

    // 3. Matricular Aluno
    await prisma.inscricao.create({
        data: {
            formandoId,
            cursoId: curso.id,
            dataInicio: new Date('2026-01-15'),
        }
    })

    // 4. Criar Módulos
    const m1 = await prisma.modulo.create({
        data: {
            nome: 'Web Fundamentals: HTML5 & CSS3',
            ordem: 1,
            cargaHoraria: 40,
            cursoId: curso.id,
        }
    })

    const m2 = await prisma.modulo.create({
        data: {
            nome: 'JavaScript Moderno & ES6+',
            ordem: 2,
            cargaHoraria: 60,
            cursoId: curso.id,
        }
    })

    const m3 = await prisma.modulo.create({
        data: {
            nome: 'React & Ecosystem (Next.js)',
            ordem: 3,
            cargaHoraria: 80,
            cursoId: curso.id,
        }
    })

    // 5. Associar Formador aos Módulos
    await prisma.formadorModulo.createMany({
        data: [
            { formadorId, moduloId: m1.id },
            { formadorId, moduloId: m2.id },
            { formadorId, moduloId: m3.id },
        ]
    })

    // 6. Criar Aulas (Passadas e Futuras)
    const agora = new Date()
    
    // Aula 1: Passada (M1)
    const aula1 = await prisma.aula.create({
        data: {
            titulo: 'Semântica e SEO',
            dataHora: new Date(agora.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
            duracao: 180,
            moduloId: m1.id,
            formadorId
        }
    })

    // Aula 2: Passada (M1)
    const aula2 = await prisma.aula.create({
        data: {
            titulo: 'Flexbox & CSS Grid Avançado',
            dataHora: new Date(agora.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 dias atrás
            duracao: 180,
            moduloId: m1.id,
            formadorId
        }
    })

    // Aula 3: Futura (M2)
    await prisma.aula.create({
        data: {
            titulo: 'Introdução às Funções e Objetos',
            dataHora: new Date(agora.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias no futuro
            duracao: 180,
            moduloId: m2.id,
            formadorId
        }
    })

    // 7. Registar Presenças
    await prisma.presenca.create({
        data: {
            status: 'PRESENTE',
            aulaId: aula1.id,
            formandoId,
            formadorId
        }
    })

    await prisma.presenca.create({
        data: {
            status: 'AUSENTE',
            aulaId: aula2.id,
            formandoId,
            formadorId,
            comentarioFormando: 'Tive uma emergência pessoal.'
        }
    })

    // 8. Trabalhos (Assignments)
    const templateM1 = await prisma.templateAvaliacao.create({
        data: { formadorId, moduloId: m1.id }
    })

    const item1 = await prisma.itemTemplateAvaliacao.create({
        data: {
            nome: 'Landing Page Responsiva',
            descricao: 'Criar uma página completa para um produto fictício.',
            peso: 40,
            ordem: 1,
            templateId: templateM1.id,
            dataLimite: new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000), // Já passou o prazo
        }
    })

    const item2 = await prisma.itemTemplateAvaliacao.create({
        data: {
            nome: 'Dashboard de Finanças',
            descricao: 'Implementar a interface de um dashboard utilizando CSS Grid.',
            peso: 60,
            ordem: 2,
            templateId: templateM1.id,
            dataLimite: new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000), // Prazo no futuro
        }
    })

    // 9. Submissões
    await prisma.submissaoTrabalho.create({
        data: {
            ficheiroUrl: 'https://github.com/aluno/trabalho-css',
            comentario: 'Submissão antecipada. Usei animações GSAP.',
            dataEntrega: new Date(agora.getTime() - 6 * 24 * 60 * 60 * 1000),
            formandoId,
            itemId: item1.id
        }
    })

    // 10. Avaliação do Módulo 1 (Grade)
    await prisma.avaliacao.create({
        data: {
            nota: 18.5,
            descricao: 'Excelente trabalho na landing page.',
            moduloId: m1.id,
            formandoId,
            formadorId
        }
    })

    // 11. Review do Módulo (Simular feedback do aluno)
    await prisma.reviewModulo.create({
        data: {
            nota: 5,
            comentario: 'O instrutor Marcos é fantástico! Adorei a abordagem prática deste módulo.',
            formandoId,
            moduloId: m1.id
        }
    })

    console.log('✨ Seed Finalizado com Sucesso!')
    console.log('Utilizador: aluno.teste@coordena.pt')
    console.log('Senha: 123456')
}

main()
    .catch((e) => {
        console.error('❌ Erro durante o seed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
