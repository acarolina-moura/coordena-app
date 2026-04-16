/**
 * seed.ts — coordena-app
 *
 * Mini-escola de teste com:
 *  - 1 Coordenador · 1 Formador · 1 Formando
 *  - 2 Cursos com módulos + 1 módulo standalone
 *  - Convites (PENDENTE, ACEITE, RECUSADO) para o formador
 *  - Aulas, Presenças, Avaliações, Documentos, MaterialApoio
 *  - TemplateAvaliacao + ItemTemplate + Submissão + NotaParcial
 *  - ReviewModulo · Disponibilidade
 *
 * Executar:
 *   npx prisma db seed
 *
 * package.json:
 *   "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
 */

import {
    PrismaClient,
    StatusPresenca,
    StatusDocumento,
    StatusConvite,
    StatusCurso,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 A iniciar seed...\n");

    // ─────────────────────────────────────────────
    // LIMPAR DADOS ANTERIORES (ordem de dependências)
    // ─────────────────────────────────────────────
    await prisma.notaParcial.deleteMany();
    await prisma.submissaoTrabalho.deleteMany();
    await prisma.itemTemplateAvaliacao.deleteMany();
    await prisma.templateAvaliacao.deleteMany();
    await prisma.reviewModulo.deleteMany();
    await prisma.materialApoio.deleteMany();
    await prisma.presenca.deleteMany();
    await prisma.aula.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.convite.deleteMany();
    await prisma.formadorModulo.deleteMany();
    await prisma.inscricao.deleteMany();
    await prisma.documento.deleteMany();
    await prisma.disponibilidade.deleteMany();
    await prisma.modulo.deleteMany();
    await prisma.curso.deleteMany();
    await prisma.formador.deleteMany();
    await prisma.formando.deleteMany();
    await prisma.coordenador.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    console.log("🗑️  Dados anteriores limpos.\n");

    // ─────────────────────────────────────────────
    // PASSWORDS
    // ─────────────────────────────────────────────
    const senha = await bcrypt.hash("123456", 10);

    // ─────────────────────────────────────────────
    // 1. USERS
    // ─────────────────────────────────────────────
    const userCoordenador = await prisma.user.create({
        data: {
            nome: "Ana Coordenadora",
            email: "coordenador@escola.pt",
            senha,
            role: "COORDENADOR",
            telefone: "+351910000001",
        },
    });

    const userFormador = await prisma.user.create({
        data: {
            nome: "Bruno Formador",
            email: "formador@escola.pt",
            senha,
            role: "FORMADOR",
            telefone: "+351920000002",
        },
    });

    const userFormando = await prisma.user.create({
        data: {
            nome: "Carlos Formando",
            email: "formando@escola.pt",
            senha,
            role: "FORMANDO",
            telefone: "+351930000003",
        },
    });

    console.log("👤 Users criados.");

    // ─────────────────────────────────────────────
    // 2. PERFIS
    // ─────────────────────────────────────────────
    const coordenador = await prisma.coordenador.create({
        data: { userId: userCoordenador.id },
    });

    const formador = await prisma.formador.create({
        data: {
            userId: userFormador.id,
            especialidade: "Desenvolvimento Web",
            competencias: "React, Node.js, TypeScript, Prisma",
            linkedin: "https://linkedin.com/in/brunoformador",
            github: "https://github.com/brunoformador",
            idioma: "Português",
            nacionalidade: "Portuguesa",
            criadoPorCoordenadorId: coordenador.id,
        },
    });

    const formando = await prisma.formando.create({
        data: { userId: userFormando.id },
    });

    console.log("🧑‍💼 Perfis criados.");

    // ─────────────────────────────────────────────
    // 3. DISPONIBILIDADE DO FORMADOR
    // ─────────────────────────────────────────────
    const disponibilidades = [
        { diaSemana: "Segunda", hora: 9, minuto: 0, tipo: "TOTAL" },
        { diaSemana: "Segunda", hora: 14, minuto: 0, tipo: "PARCIAL" },
        { diaSemana: "Quarta", hora: 10, minuto: 0, tipo: "TOTAL" },
        { diaSemana: "Sexta", hora: 9, minuto: 30, tipo: "TOTAL" },
    ];

    for (const d of disponibilidades) {
        await prisma.disponibilidade.create({
            data: { formadorId: formador.id, ...d, disponivel: true },
        });
    }

    console.log("🗓️  Disponibilidades criadas.");

    // ─────────────────────────────────────────────
    // 4. DOCUMENTOS
    // ─────────────────────────────────────────────
    await prisma.documento.create({
        data: {
            tipo: "CC",
            numero: "123456789",
            dataEmissao: new Date("2020-01-15"),
            dataExpiracao: new Date("2030-01-15"),
            status: StatusDocumento.VALIDO,
            formadorId: formador.id,
        },
    });

    await prisma.documento.create({
        data: {
            tipo: "NIF",
            numero: "987654321",
            status: StatusDocumento.VALIDO,
            formandoId: formando.id,
        },
    });

    await prisma.documento.create({
        data: {
            tipo: "Certificado de Habilitações",
            status: StatusDocumento.A_EXPIRAR,
            dataExpiracao: new Date("2025-06-01"),
            formandoId: formando.id,
        },
    });

    console.log("📄 Documentos criados.");

    // ─────────────────────────────────────────────
    // 5. CURSOS
    // ─────────────────────────────────────────────
    const cursoDev = await prisma.curso.create({
        data: {
            nome: "Desenvolvimento Full Stack",
            descricao:
                "Curso completo de desenvolvimento web com tecnologias modernas.",
            status: StatusCurso.ATIVO,
            cargaHoraria: 120,
            dataInicio: new Date("2025-01-06"),
            dataFim: new Date("2025-06-30"),
            coordenadorId: coordenador.id,
        },
    });

    const cursoUX = await prisma.curso.create({
        data: {
            nome: "UX / UI Design Fundamentals",
            descricao:
                "Fundamentos de design de experiência e interface do utilizador.",
            status: StatusCurso.ATIVO,
            cargaHoraria: 60,
            dataInicio: new Date("2025-02-03"),
            dataFim: new Date("2025-05-30"),
            coordenadorId: coordenador.id,
        },
    });

    console.log("📚 Cursos criados.");

    // ─────────────────────────────────────────────
    // 6. MÓDULOS
    // ─────────────────────────────────────────────

    // Curso Full Stack
    const moduloHTML = await prisma.modulo.create({
        data: {
            nome: "HTML & CSS Essencial",
            descricao: "Estrutura e estilo de páginas web.",
            ordem: 1,
            cargaHoraria: 20,
            cursoId: cursoDev.id,
            coordenadorId: coordenador.id,
        },
    });

    const moduloReact = await prisma.modulo.create({
        data: {
            nome: "React Avançado",
            descricao: "Componentes, hooks, context e performance.",
            ordem: 2,
            cargaHoraria: 40,
            cursoId: cursoDev.id,
            coordenadorId: coordenador.id,
        },
    });

    const moduloPrisma = await prisma.modulo.create({
        data: {
            nome: "Backend com Prisma & PostgreSQL",
            descricao: "ORM, migrações, relações e queries complexas.",
            ordem: 3,
            cargaHoraria: 30,
            cursoId: cursoDev.id,
            coordenadorId: coordenador.id,
        },
    });

    // Curso UX
    const moduloUXBasico = await prisma.modulo.create({
        data: {
            nome: "Fundamentos de UX",
            descricao: "Pesquisa de utilizador, personas e jornadas.",
            ordem: 1,
            cargaHoraria: 15,
            cursoId: cursoUX.id,
            coordenadorId: coordenador.id,
        },
    });

    // Módulo standalone (sem curso associado)
    const moduloGit = await prisma.modulo.create({
        data: {
            nome: "Git & GitHub para Equipas",
            descricao:
                "Branching, PRs, code review e CI/CD básico. Não associado a nenhum curso.",
            ordem: 1,
            cargaHoraria: 10,
            coordenadorId: coordenador.id,
            // cursoId: null — standalone intencional
        },
    });

    console.log("📦 Módulos criados (4 em cursos + 1 standalone).");

    // ─────────────────────────────────────────────
    // 7. INSCRIÇÃO DO FORMANDO
    // ─────────────────────────────────────────────
    await prisma.inscricao.create({
        data: { formandoId: formando.id, cursoId: cursoDev.id },
    });

    await prisma.inscricao.create({
        data: { formandoId: formando.id, cursoId: cursoUX.id },
    });

    console.log("✅ Inscrições criadas.");

    // ─────────────────────────────────────────────
    // 8. CONVITES
    // ─────────────────────────────────────────────

    // Convite ACEITE → formador leciona moduloHTML
    const conviteHTML = await prisma.convite.create({
        data: {
            formadorId: formador.id,
            moduloId: moduloHTML.id,
            cursoId: cursoDev.id,
            status: StatusConvite.ACEITE,
            descricao:
                "Convidamos-te para lecionar HTML & CSS no curso Full Stack.",
            dataResposta: new Date(),
        },
    });

    // Convite ACEITE → formador leciona moduloReact
    await prisma.convite.create({
        data: {
            formadorId: formador.id,
            moduloId: moduloReact.id,
            cursoId: cursoDev.id,
            status: StatusConvite.ACEITE,
            descricao: "Convidamos-te para lecionar React Avançado.",
            dataResposta: new Date(),
        },
    });

    // Convite PENDENTE → formador ainda não respondeu
    await prisma.convite.create({
        data: {
            formadorId: formador.id,
            moduloId: moduloPrisma.id,
            cursoId: cursoDev.id,
            status: StatusConvite.PENDENTE,
            descricao: "Precisamos de ti para o módulo de Backend com Prisma.",
        },
    });

    // Convite RECUSADO
    await prisma.convite.create({
        data: {
            formadorId: formador.id,
            moduloId: moduloGit.id,
            status: StatusConvite.RECUSADO,
            descricao: "Convite para módulo standalone de Git.",
            dataResposta: new Date(),
        },
    });

    // Convite para formando (ao curso UX)
    await prisma.convite.create({
        data: {
            formandoId: formando.id,
            cursoId: cursoUX.id,
            status: StatusConvite.ACEITE,
            descricao: "Bem-vindo ao curso UX/UI Design Fundamentals!",
            dataResposta: new Date(),
        },
    });

    console.log("📨 Convites criados (aceite, pendente, recusado).");

    // ─────────────────────────────────────────────
    // 9. FORMADOR ↔ MÓDULO (convites aceites)
    // ─────────────────────────────────────────────
    await prisma.formadorModulo.create({
        data: { formadorId: formador.id, moduloId: moduloHTML.id },
    });

    await prisma.formadorModulo.create({
        data: { formadorId: formador.id, moduloId: moduloReact.id },
    });

    console.log("🔗 FormadorModulo criados.");

    // ─────────────────────────────────────────────
    // 10. AULAS (com datas futuras)
    // ─────────────────────────────────────────────
    const agora = new Date();

    // Aula 1: 2 dias no futuro
    const data1 = new Date(agora);
    data1.setDate(data1.getDate() + 2);
    data1.setHours(9, 0, 0, 0);

    const aula1 = await prisma.aula.create({
        data: {
            titulo: "Introdução ao HTML5",
            dataHora: data1,
            duracao: 90,
            moduloId: moduloHTML.id,
            formadorId: formador.id,
        },
    });

    // Aula 2: 4 dias no futuro
    const data2 = new Date(agora);
    data2.setDate(data2.getDate() + 4);
    data2.setHours(9, 0, 0, 0);

    const aula2 = await prisma.aula.create({
        data: {
            titulo: "CSS Grid e Flexbox",
            dataHora: data2,
            duracao: 90,
            moduloId: moduloHTML.id,
            formadorId: formador.id,
        },
    });

    // Aula 3: 7 dias no futuro
    const data3 = new Date(agora);
    data3.setDate(data3.getDate() + 7);
    data3.setHours(14, 0, 0, 0);

    const aula3 = await prisma.aula.create({
        data: {
            titulo: "Introdução ao React",
            dataHora: data3,
            duracao: 120,
            moduloId: moduloReact.id,
            formadorId: formador.id,
        },
    });

    console.log("🏫 Aulas criadas.");

    // ─────────────────────────────────────────────
    // 11. PRESENÇAS
    // ─────────────────────────────────────────────
    await prisma.presenca.create({
        data: {
            aulaId: aula1.id,
            formandoId: formando.id,
            formadorId: formador.id,
            status: StatusPresenca.PRESENTE,
        },
    });

    await prisma.presenca.create({
        data: {
            aulaId: aula2.id,
            formandoId: formando.id,
            formadorId: formador.id,
            status: StatusPresenca.AUSENTE,
            justificativa: "Doença",
            comentarioFormando: "Estive doente nesse dia.",
        },
    });

    await prisma.presenca.create({
        data: {
            aulaId: aula3.id,
            formandoId: formando.id,
            formadorId: formador.id,
            status: StatusPresenca.JUSTIFICADO,
            justificativa: "Consulta médica",
        },
    });

    console.log("📋 Presenças criadas.");

    // ─────────────────────────────────────────────
    // 12. AVALIAÇÕES SIMPLES
    // ─────────────────────────────────────────────
    await prisma.avaliacao.create({
        data: {
            descricao: "Teste final de HTML & CSS",
            nota: 18.5,
            moduloId: moduloHTML.id,
            formandoId: formando.id,
            formadorId: formador.id,
        },
    });

    await prisma.avaliacao.create({
        data: {
            descricao: "Projeto prático React",
            nota: 16.0,
            moduloId: moduloReact.id,
            formandoId: formando.id,
            formadorId: formador.id,
        },
    });

    console.log("🏅 Avaliações criadas.");

    // ─────────────────────────────────────────────
    // 13. TEMPLATE DE AVALIAÇÃO + ITENS
    // ─────────────────────────────────────────────
    const template = await prisma.templateAvaliacao.create({
        data: {
            formadorId: formador.id,
            moduloId: moduloReact.id,
        },
    });

    const itemTeste = await prisma.itemTemplateAvaliacao.create({
        data: {
            templateId: template.id,
            nome: "Teste escrito",
            descricao: "Avaliação teórica sobre hooks e context.",
            peso: 0.4,
            ordem: 1,
            dataLimite: new Date("2025-03-01"),
        },
    });

    const itemProjeto = await prisma.itemTemplateAvaliacao.create({
        data: {
            templateId: template.id,
            nome: "Projeto Final",
            descricao: "Aplicação React com autenticação e routing.",
            peso: 0.6,
            ordem: 2,
            dataLimite: new Date("2025-04-01"),
        },
    });

    console.log("📝 Template de avaliação criado.");

    // ─────────────────────────────────────────────
    // 14. SUBMISSÕES DE TRABALHO
    // ─────────────────────────────────────────────
    await prisma.submissaoTrabalho.create({
        data: {
            itemId: itemProjeto.id,
            formandoId: formando.id,
            ficheiroUrl: "https://exemplo.pt/uploads/projeto-react-carlos.zip",
            comentario: "Entreguei o projeto com autenticação JWT e dashboard.",
        },
    });

    console.log("📤 Submissão criada.");

    // ─────────────────────────────────────────────
    // 15. NOTAS PARCIAIS
    // ─────────────────────────────────────────────
    await prisma.notaParcial.create({
        data: {
            valor: 17.0,
            formandoId: formando.id,
            itemId: itemTeste.id,
            templateId: template.id,
        },
    });

    await prisma.notaParcial.create({
        data: {
            valor: 19.0,
            formandoId: formando.id,
            itemId: itemProjeto.id,
            templateId: template.id,
        },
    });

    console.log("🔢 Notas parciais criadas.");

    // ─────────────────────────────────────────────
    // 16. REVIEWS DE MÓDULO
    // ─────────────────────────────────────────────
    await prisma.reviewModulo.create({
        data: {
            nota: 5,
            comentario:
                "Excelente módulo! Conteúdo muito bem estruturado e prático.",
            formandoId: formando.id,
            moduloId: moduloHTML.id,
        },
    });

    await prisma.reviewModulo.create({
        data: {
            nota: 4,
            comentario:
                "Bom ritmo, mas o projeto final poderia ter mais suporte.",
            formandoId: formando.id,
            moduloId: moduloReact.id,
        },
    });

    console.log("⭐ Reviews de módulo criadas.");

    // ─────────────────────────────────────────────
    // 17. MATERIAIS DE APOIO
    // ─────────────────────────────────────────────
    await prisma.materialApoio.create({
        data: {
            titulo: "Guia Completo HTML5 & CSS3",
            descricao: "PDF com todos os conceitos abordados nas aulas.",
            fileUrl: "https://exemplo.pt/materiais/html-css-guia.pdf",
            tipo: "PDF",
            moduloId: moduloHTML.id,
            formadorId: formador.id,
        },
    });

    await prisma.materialApoio.create({
        data: {
            titulo: "Slides React Avançado",
            descricao: "Apresentação usada nas aulas de React.",
            fileUrl: "https://exemplo.pt/materiais/react-slides.pptx",
            tipo: "PPTX",
            moduloId: moduloReact.id,
            formadorId: formador.id,
        },
    });

    await prisma.materialApoio.create({
        data: {
            titulo: "Exercícios Práticos Flexbox",
            descricao: "Ficheiro com exercícios para praticar CSS Flexbox.",
            fileUrl: "https://exemplo.pt/materiais/flexbox-exercicios.zip",
            tipo: "ZIP",
            moduloId: moduloHTML.id,
            formadorId: formador.id,
        },
    });

    console.log("📎 Materiais de apoio criados.\n");

    // ─────────────────────────────────────────────
    // RESUMO
    // ─────────────────────────────────────────────
    console.log("═══════════════════════════════════════");
    console.log("✅  Seed concluído com sucesso!");
    console.log("═══════════════════════════════════════");
    console.log("\n📌 Credenciais de acesso (senha: senha123)\n");
    console.log("  COORDENADOR → coordenador@escola.pt");
    console.log("  FORMADOR    → formador@escola.pt");
    console.log("  FORMANDO    → formando@escola.pt");
    console.log("\n📌 Convites criados:");
    console.log("  ✅ ACEITE    → HTML & CSS Essencial");
    console.log("  ✅ ACEITE    → React Avançado");
    console.log("  ⏳ PENDENTE  → Backend com Prisma");
    console.log("  ❌ RECUSADO  → Git & GitHub (standalone)");
    console.log("  ✅ ACEITE    → Convite formando ao curso UX\n");
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
