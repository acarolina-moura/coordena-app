"use client";

import { useState } from "react";
import { Plus, Search, Star, Tag, Users, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormadorStatus = "aceite" | "pendente";

interface Formador {
    id: number;
    nome: string;
    email: string;
    avatar?: string;
    tags: string[];
    status: FormadorStatus;
    favorito: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const formadoresData: Formador[] = [
    {
        id: 1,
        nome: "Ana Rodrigues",
        email: "ana.rodrigues@email.com",
        avatar: "https://i.pravatar.cc/150?img=47",
        tags: ["Design", "Photoshop", "Redes", "TCP/IP"],
        status: "aceite",
        favorito: true,
    },
    {
        id: 2,
        nome: "Pedro Santos",
        email: "pedro.santos@email.com",
        avatar: "https://i.pravatar.cc/150?img=12",
        tags: ["HTML", "CSS", "JavaScript", "SQL"],
        status: "aceite",
        favorito: false,
    },
    {
        id: 3,
        nome: "Maria Fernandes",
        email: "maria.fernandes@email.com",
        avatar: "https://i.pravatar.cc/150?img=45",
        tags: ["Marketing", "SEO", "Redes Sociais", "Google Ads"],
        status: "pendente",
        favorito: true,
    },
];

// ─── Convidar Dialog ──────────────────────────────────────────────────────────

function ConvidarDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <Plus className="h-4 w-4" />
                    Convidar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Convidar Formador</DialogTitle>
                    <DialogDescription>
                        Envia um convite por email para um novo formador.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="nome">Nome completo</Label>
                        <Input id="nome" placeholder="Ex: João Alves" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="formador@email.com"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="areas">Áreas de especialização</Label>
                        <Input
                            id="areas"
                            placeholder="Ex: Design, Fotografia"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        Enviar Convite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Formador Card ────────────────────────────────────────────────────────────

function FormadorCard({
    formador,
    onToggleFavorito,
}: {
    formador: Formador;
    onToggleFavorito: (id: number) => void;
}) {
    const initials = formador.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
            {/* Header — Avatar + Name + Star */}
            <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 border-2 border-gray-100 shrink-0">
                    <AvatarImage src={formador.avatar} alt={formador.nome} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                            {formador.nome}
                        </h3>
                        <button
                            onClick={() => onToggleFavorito(formador.id)}
                            className="shrink-0 transition-transform hover:scale-110"
                            aria-label="Favorito"
                        >
                            <Star
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    formador.favorito
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300 hover:text-amber-300",
                                )}
                            />
                        </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{formador.email}</span>
                    </div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
                {formador.tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Footer — Status + Ver Perfil */}
            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                {formador.status === "aceite" ? (
                    <span className="rounded-full border border-green-200 bg-green-50 px-4 py-1 text-sm font-medium text-green-600">
                        Aceite
                    </span>
                ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-sm font-medium text-amber-600">
                        Pendente
                    </span>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 text-sm"
                >
                    Ver Perfil
                </Button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FormadoresPage() {
    const [search, setSearch] = useState("");
    const [apenasFevoritos, setApenasFavoritos] = useState(false);
    const [formadores, setFormadores] = useState<Formador[]>(formadoresData);

    const toggleFavorito = (id: number) => {
        setFormadores((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, favorito: !f.favorito } : f,
            ),
        );
    };

    const formadoresFiltrados = formadores.filter((f) => {
        const matchSearch =
            f.nome.toLowerCase().includes(search.toLowerCase()) ||
            f.email.toLowerCase().includes(search.toLowerCase()) ||
            f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
        const matchFavorito = apenasFevoritos ? f.favorito : true;
        return matchSearch && matchFavorito;
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900">
                        Formadores
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {formadores.length} formadores registados
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white border-gray-200 text-sm"
                        />
                    </div>

                    {/* Favoritos toggle */}
                    <button
                        onClick={() => setApenasFavoritos(!apenasFevoritos)}
                        className={cn(
                            "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                            apenasFevoritos
                                ? "border-amber-300 bg-amber-50 text-amber-600"
                                : "border-gray-200 bg-white text-gray-600 hover:border-amber-200 hover:text-amber-500",
                        )}
                    >
                        <Star
                            className={cn(
                                "h-4 w-4",
                                apenasFevoritos
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-400",
                            )}
                        />
                        Favoritos
                    </button>

                    <ConvidarDialog />
                    {/* Botão Criar Conta Formador */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                                <Plus className="h-4 w-4" />
                                Criar Conta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Criar Conta de Formador
                                </DialogTitle>
                                <DialogDescription>
                                    Crie uma conta para um formador manualmente.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 py-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="nome-criar">
                                        Nome completo
                                    </Label>
                                    <Input
                                        id="nome-criar"
                                        placeholder="Ex: João Alves"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email-criar">Email</Label>
                                    <Input
                                        id="email-criar"
                                        placeholder="Ex: joao@email.com"
                                    />
                                </div>
                                {/* Adicione outros campos necessários */}
                            </div>
                            <DialogFooter>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={async () => {
                                        const nome =
                                            document.getElementById(
                                                "nome-criar",
                                            ).value;
                                        const email =
                                            document.getElementById(
                                                "email-criar",
                                            ).value;
                                        // Pode adicionar senha fixa ou gerar aleatória
                                        const senha = Math.random()
                                            .toString(36)
                                            .slice(-8);
                                        const role = "FORMADOR";
                                        const res = await fetch(
                                            "/api/auth/register",
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                },
                                                body: JSON.stringify({
                                                    nome,
                                                    email,
                                                    senha,
                                                    role,
                                                }),
                                            },
                                        );
                                        if (res.ok) {
                                            alert("Conta criada com sucesso!");
                                        } else {
                                            const data = await res.json();
                                            alert(
                                                data.error ||
                                                    "Erro ao criar conta.",
                                            );
                                        }
                                    }}
                                >
                                    Criar Conta
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Grid */}
            {formadoresFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {formadoresFiltrados.map((formador) => (
                        <FormadorCard
                            key={formador.id}
                            formador={formador}
                            onToggleFavorito={toggleFavorito}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                    <Users className="h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm font-medium text-gray-500">
                        Nenhum formador encontrado
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Tenta ajustar a pesquisa ou os filtros
                    </p>
                </div>
            )}
        </div>
    );
}
