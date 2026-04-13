"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  UserPlus,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  GraduationCap,
  UserCog,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/landing-page/navbar";
import { Footer } from "@/components/landing-page/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [codigoCoordenador, setCodigoCoordenador] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[e.target.name];
      delete next.submit;
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.role;
      return next;
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    }

    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem";
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          role: selectedRole?.toUpperCase(),
          codigoCoordenador: selectedRole === "coordenador" ? codigoCoordenador : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error || "Erro ao criar conta" });
        toast.error(data.error || "Erro ao criar conta");
        return;
      }

      toast.success("Conta criada com sucesso! Redirecionando...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      setErrors({ submit: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-blue-100 selection:text-blue-900 border-none!">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-24 sm:py-32 relative overflow-hidden">
        {/* Background blobs for depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg relative z-10"
        >
          <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-none relative">
            {/* Top Glow */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="flex flex-col items-center gap-5 mb-8 text-center">
              <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <UserPlus className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Junte-se ao Coordena
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  Crie a sua conta e transforme a gestão da sua formação.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 dark:text-slate-300 ml-1">
                  Nome Completo
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="ex: Manuel dos Santos"
                    required
                    className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all text-[15px]"
                    value={formData.nome}
                    onChange={handleChange}
                  />
                </div>
                {errors.nome && <p className="text-red-500 text-xs ml-1">{errors.nome}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 ml-1">
                  E-mail Profissional
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@empresa.com"
                    required
                    className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all text-[15px]"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-slate-700 dark:text-slate-300 ml-1">
                  Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all text-[15px]"
                    value={formData.senha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                {errors.senha && <p className="text-red-500 text-xs ml-1">{errors.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-slate-700 dark:text-slate-300 ml-1">
                  Confirmar Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all text-[15px]"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmarSenha && (
                  <p className="text-red-500 text-xs ml-1">{errors.confirmarSenha}</p>
                )}
              </div>

              {/* Tipo de Utilizador */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 ml-1">
                  Tipo de Utilizador
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                        selectedRole === role.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <role.icon
                        className={`w-5 h-5 ${
                          selectedRole === role.id
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      />
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                        {role.label}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-red-500 text-xs ml-1">{errors.role}</p>}
              </div>

              {/* Código de Coordenador */}
              {selectedRole === "coordenador" && (
                <div className="space-y-2">
                  <Label htmlFor="codigoCoordenador" className="text-slate-700 dark:text-slate-300 ml-1">
                    Código de Coordenador
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                      id="codigoCoordenador"
                      name="codigoCoordenador"
                      type="password"
                      placeholder="Código fornecido pelo administrador"
                      required
                      className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all text-[15px]"
                      value={codigoCoordenador}
                      onChange={(e) => setCodigoCoordenador(e.target.value)}
                    />
                  </div>
                  <p className="text-slate-400 text-xs ml-1">Contacte o administrador para obter o código</p>
                </div>
              )}

              {errors.submit && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
                  {errors.submit}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-13 rounded-2xl font-bold shadow-xl shadow-blue-600/25 transition-all active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Criar Conta Gratuita
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/50 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium">
                Já faz parte da plataforma?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors font-bold underline underline-offset-4 decoration-blue-600/30"
                >
                  Fazer Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
