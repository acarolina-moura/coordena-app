"use client";

import Link from "next/link";
import {
  GraduationCap,
  UserCog,
  BookOpen,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// ─── Role Cards ───────────────────────────────────────────────────────────────

const roles = [
  {
    id: "coordenador",
    label: "Coordenador",
    description: "Gerir cursos, formadores e alunos com visão 360°",
    icon: UserCog,
    gradient: "from-indigo-500 to-indigo-600",
    href: "/login/coordenador",
  },
  {
    id: "formador",
    label: "Formador",
    description: "Módulos, disponibilidades, notas e documentos",
    icon: BookOpen,
    gradient: "from-purple-500 to-purple-600",
    href: "/login/formador",
  },
  {
    id: "formando",
    label: "Formando",
    description: "Cursos, notas e calendário de sessões",
    icon: GraduationCap,
    gradient: "from-cyan-500 to-teal-500",
    href: "/login/formando",
  },
];

// ─── Feature Items ────────────────────────────────────────────────────────────

const features = [
  {
    icon: BarChart3,
    label: "Dashboard Inteligente",
    description: "Visão completa de cursos, alertas e métricas em tempo real",
  },
  {
    icon: Shield,
    label: "Gestão Documental",
    description: "Controlo de validade e submissão de documentos",
  },
  {
    icon: Zap,
    label: "Automatização",
    description: "Calendário, convites e notas centralizados",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-auto bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950 transition-colors">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl transition-colors" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl transition-colors" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-16">
        {/* Theme Toggle */}
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-6xl font-black tracking-tight text-indigo-700 dark:text-indigo-400">
              Coordena
            </h1>
            <p className="max-w-md text-center text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Gestão inteligente de formação profissional. Cursos, formadores,
              <br />
              formandos e documentos — tudo num só lugar.
            </p>
          </div>
        </div>

        {/* Role Cards */}
        <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="group flex flex-col items-center gap-4 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white dark:border-gray-800 p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                {/* Icon */}
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-md`}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{role.label}</h2>
                  <p className="text-sm leading-relaxed text-gray-400 dark:text-gray-500">
                    {role.description}
                  </p>
                </div>

                {/* Entrar link */}
                <Link
                  href={role.href}
                  className="mt-1 flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:gap-2 transition-all"
                >
                  Entrar <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="flex flex-col items-center gap-3 text-center">
                <Icon className="h-6 w-6 text-indigo-400" strokeWidth={1.5} />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {feature.label}
                  </span>
                  <span className="text-xs leading-relaxed text-gray-400 dark:text-gray-501">
                    {feature.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-20 text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} Coordena · Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}