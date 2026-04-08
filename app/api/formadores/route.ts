import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // ✅ CORREÇÃO: Aceitar "senha" ou "password" para não falhar
        const nome = body.nome;
        const email = body.email;
        const senha = body.senha || body.password;

        // A tua validação que estava a ser ativada por engano
        if (!nome || !email || !senha) {
            return Response.json(
                { error: "Nome, email e senha são obrigatórios" },
                { status: 400 },
            );
        }

        // Verificar se já existe um formador com este email
        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return Response.json(
                { error: "Já existe uma conta com este email" },
                { status: 400 },
            );
        }

        // Criar o Utilizador e o Formador na Base de Dados
        const novoUser = await prisma.user.create({
            data: {
                nome: nome.trim(),
                email: email.trim(),
                senha: senha, // Guarda a senha
                role: "FORMADOR",
                formador: {
                    create: {}, // Cria um perfil vazio de formador na tabela Formador
                },
            },
        });

        revalidatePath("/dashboard/formadores");
        return Response.json(novoUser, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar formador:", error);
        return Response.json(
            { error: "Erro interno ao criar formador" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        const formadores = await prisma.formador.findMany({
            include: {
                user: {
                    select: { id: true, nome: true, email: true },
                },
                modulosLecionados: {
                    include: { modulo: { select: { nome: true } } },
                },
            },
            orderBy: { user: { nome: "asc" } },
        });

        return Response.json(formadores);
    } catch (error) {
        console.error("[GET /api/formadores]", error);
        return Response.json(
            { error: "Erro ao carregar formadores" },
            { status: 500 },
        );
    }
}
