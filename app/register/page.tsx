"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    GraduationCap,
    UserCog,
    BookOpen,
    Mail,
    Lock,
    User,
    ArrowRight,
    Eye,
    EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";

export default function RegisterPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const roles = [
        {
            id: "coordenador",
            label: "Coordenador",
            description: "Gerir cursos, formadores e alunos",
            icon: UserCog,
            gradient: "from-indigo-500 to-indigo-600",
        },
        {
            id: "formador",
            label: "Formador",
            description: "Submeter aulas e notas dos alunos",
            icon: BookOpen,
            gradient: "from-purple-500 to-purple-600",
        },
        {
            id: "formando",
            label: "Formando",
            description: "Aceder aos seus cursos e notas",
            icon: GraduationCap,
            gradient: "from-cyan-500 to-teal-500",
        },
    ];

    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId);
        setFormData({ ...formData, role: roleId });
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido";
        }

        if (!formData.password) {
            newErrors.password = "Senha é obrigatória";
        } else if (formData.password.length < 6) {
            newErrors.password = "Senha deve ter no mínimo 6 caracteres";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não correspondem";
        }

        if (!selectedRole) {
            newErrors.role = "Selecione um tipo de utilizador";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: formData.name,
                    email: formData.email,
                    senha: formData.password,
                    role: selectedRole?.toUpperCase(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({
                    submit:
                        data.error || "Erro ao criar conta. Tente novamente.",
                });
                return;
            }

            // Sucesso - redirecionar para login
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (error) {
            console.error("Erro ao registar:", error);
            setErrors({ submit: "Erro ao criar conta. Tente novamente." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                        Coordena<span className="text-blue-600">App</span>
                    </span>
                </Link>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-2xl">
                    {/* Form Container */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg p-8 md:p-12">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                                Criar Conta
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                Junte-se à plataforma de gestão académica
                                CoordenaApp
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Nome Completo
                                </label>
                                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <User className="w-5 h-5 text-slate-500" />
                                    <Input
                                        type="text"
                                        placeholder="ex: João Silva"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-500"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Email
                                </label>
                                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-500"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Senha
                                </label>
                                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <Lock className="w-5 h-5 text-slate-500" />
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Confirmar Senha
                                </label>
                                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <Lock className="w-5 h-5 text-slate-500" />
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="Repita a senha"
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        className="flex-1 bg-transparent border-0 focus:ring-0 focus-visible:ring-0 placeholder:text-slate-500"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                    Tipo de Utilizador
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {roles.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() =>
                                                handleRoleSelect(role.id)
                                            }
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                selectedRole === role.id
                                                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                            }`}
                                        >
                                            <role.icon className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                                                {role.label}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                {role.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                                {errors.role && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-600 dark:text-red-400 text-sm">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? "Criando conta..." : "Criar Conta"}
                                <ArrowRight className="w-4 h-4" />
                            </Button>

                            {/* Login Link */}
                            <div className="text-center">
                                <p className="text-slate-600 dark:text-slate-400">
                                    Já tem conta?{" "}
                                    <Link
                                        href="/login"
                                        className="font-bold text-blue-600 hover:text-blue-700 dark:hover:text-blue-500"
                                    >
                                        Entrar aqui
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Info Text */}
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
                        Ao criar uma conta, você concorda com os nossos{" "}
                        <Link
                            href="#"
                            className="text-blue-600 hover:underline"
                        >
                            Termos de Serviço
                        </Link>{" "}
                        e{" "}
                        <Link
                            href="#"
                            className="text-blue-600 hover:underline"
                        >
                            Política de Privacidade
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
