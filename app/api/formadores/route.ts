import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { filtroFormadoresCoordenador, filtroModulosCoordenador, getCoordenadorIdOrNull } from "@/lib/coordenador-utils";

export async function POST(req: Request) {
    try {
        // Verificar autenticação e autorização
        const session = await auth();
        if (!session?.user || session.user.role !== "COORDENADOR") {
            return NextResponse.json(
                { error: "Não autorizado. Apenas coordenadores podem criar formadores." },
                { status: 403 }
            );
        }

        const body = await req.json();

        const nome = body.nome;
        const email = body.email;
        const senha = body.senha || body.password;

        if (!nome || !email || !senha) {
            return NextResponse.json(
                { error: "Nome, email e senha são obrigatórios" },
                { status: 400 },
            );
        }

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return NextResponse.json(
                { error: "Já existe uma conta com este email" },
                { status: 400 },
            );
        }

        // Hash da senha com bcrypt
        const senhaHash = await bcrypt.hash(senha, 10);

        const coordenadorId = await getCoordenadorIdOrNull();

        const novoUser = await prisma.user.create({
            data: {
                nome: nome.trim(),
                email: email.trim(),
                senha: senhaHash,
                role: "FORMADOR",
                formador: {
                    create: {
                        criadoPorCoordenadorId: coordenadorId,
                    },
                },
            },
        });

        revalidatePath("/dashboard/formadores");
        return NextResponse.json(novoUser, { status: 201 });
    } catch (error) {
        console.error("Erro ao criar formador:", error);
        return NextResponse.json(
            { error: "Erro interno ao criar formador" },
            { status: 500 },
        );
    }
}

export async function GET() {
    try {
        // Verificar autenticação
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const formadoresFilter = await filtroFormadoresCoordenador();
        
        const formadores = await prisma.formador.findMany({
            where: formadoresFilter,
            include: {
                user: {
                    select: { id: true, nome: true, email: true },
                },
                modulosLecionados: {
                    where: {
                        modulo: await filtroModulosCoordenador()
                    },
                    include: { modulo: { select: { nome: true } } },
                },
            },
            orderBy: { user: { nome: "asc" } },
        });

        return NextResponse.json(formadores);
    } catch (error) {
        console.error("[GET /api/formadores]", error);
        return NextResponse.json(
            { error: "Erro ao carregar formadores" },
            { status: 500 },
        );
    }
}
