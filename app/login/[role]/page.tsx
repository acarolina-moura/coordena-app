"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap, UserCog, BookOpen,
  Eye, EyeOff, ArrowLeft, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from 'next-auth/react'


// ─── Role Config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  coordenador: {
    label: "Coordenador",
    description: "Acesso à gestão completa da plataforma",
    icon: UserCog,
    gradient: "from-indigo-500 to-indigo-600",
    ring: "focus-visible:ring-indigo-500",
    btn: "bg-indigo-600 hover:bg-indigo-700",
  },
  formador: {
    label: "Formador",
    description: "Acesso às suas turmas e documentos",
    icon: BookOpen,
    gradient: "from-purple-500 to-purple-600",
    ring: "focus-visible:ring-purple-500",
    btn: "bg-purple-600 hover:bg-purple-700",
  },
  formando: {
    label: "Formando",
    description: "Acesso aos seus cursos e calendário",
    icon: GraduationCap,
    gradient: "from-cyan-500 to-teal-500",
    ring: "focus-visible:ring-cyan-500",
    btn: "bg-cyan-600 hover:bg-cyan-700",
  },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginRolePage() {
  const params = useParams();
  const router = useRouter();
  const role = (params?.role as RoleKey) ?? "coordenador";
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.coordenador;
  const Icon = config.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Preenche todos os campos.");
      return;
    }

    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou palavra-passe inválidos.");
    }

    // Sucesso: redireciona para o dashboard
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-auto bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Back */}
        <Link
          href="/login"
          className="absolute left-6 top-6 flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
              config.gradient
            )}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">{config.label}</h1>
              <p className="mt-1 text-sm text-gray-400">{config.description}</p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white p-8 shadow-sm"
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="o.teu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn("rounded-xl border-gray-200 bg-white text-sm", config.ring)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Palavra-passe
                </Label>
                <Link
                  href="/login/recuperar"
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  Esqueceste-a?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn("rounded-xl border-gray-200 bg-white text-sm pr-10", config.ring)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "mt-1 w-full rounded-xl text-white font-semibold h-11 text-sm",
                config.btn
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  A entrar...
                </span>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Coordena · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}