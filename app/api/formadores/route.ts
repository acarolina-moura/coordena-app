import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── GET /api/formadores ──────────────────────────────────────────────────────

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

        return NextResponse.json(formadores);
    } catch (error) {
        console.error("[GET /api/formadores]", error);
        return NextResponse.json(
            { error: "Erro ao carregar formadores" },
            { status: 500 },
        );
    }
}

// ─── POST /api/formadores ─────────────────────────────────────────────────────

export async function POST(req: Request) {
    try {
        const { nome, email } = await req.json();

        if (!nome || !email) {
            return NextResponse.json(
                { error: "Nome e email são obrigatórios" },
                { status: 400 },
            );
        }

        const userExistente = await prisma.user.findUnique({
            where: { email },
        });

        if (userExistente) {
            return NextResponse.json(
                { error: "Email já está em uso" },
                { status: 400 },
            );
        }

        const senhaHash = "123456"; // TODO: substituir por senha gerada + envio por email

        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                role: "FORMADOR",
                formador: { create: {} },
            },
            include: { formador: true },
        });

        return NextResponse.json(
            {
                message: "Formador criado com sucesso",
                formador: {
                    id: user.formador?.id,
                    nome: user.nome,
                    email: user.email,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("[POST /api/formadores]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 },
        );
    }
}
