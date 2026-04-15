"use client";

import { motion } from "motion/react";
import {
    LayoutDashboard,
    Users,
    Zap,
    ShieldCheck,
    GraduationCap,
    Home,
    BookOpen,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutUs() {
    return (
        <section
            id="sobre-nos"
            className="py-16 sm:py-20 bg-white dark:bg-slate-950 overflow-hidden border-t border-slate-100 dark:border-slate-900"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col items-center gap-12 sm:gap-16 lg:gap-20">
                    {/* Text Content - Centered Top */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="flex flex-col items-center text-center gap-8 sm:gap-10 max-w-4xl"
                    >
                        <div className="flex flex-col gap-4 sm:gap-5">
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm">
                                Sobre nós
                            </span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                Transformando a <br />
                                <span className="text-blue-600">
                                    Educação Digital
                                </span>
                            </h2>
                        </div>

                        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium px-2">
                            O CoordenaApp centraliza toda a gestão pedagógica
                            numa plataforma única, robusta e intuitiva.
                            Acreditamos que a produtividade escolar começa com
                            ferramentas que eliminam a burocracia desnecessária.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full pt-2 sm:pt-4">
                            {[
                                {
                                    title: "Dashboard Central",
                                    desc: "Visão 360º de todas as métricas.",
                                    icon: LayoutDashboard,
                                    color: "blue",
                                },
                                {
                                    title: "Foco no Utilizador",
                                    desc: "Feito sob medida para você.",
                                    icon: Users,
                                    color: "purple",
                                },
                                {
                                    title: "Agilidade Máxima",
                                    desc: "Menos burocracia, mais ensino.",
                                    icon: Zap,
                                    color: "emerald",
                                },
                                {
                                    title: "Segurança Total",
                                    desc: "Dados protegidos sempre.",
                                    icon: ShieldCheck,
                                    color: "blue",
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1"
                                >
                                    <div
                                        className={cn(
                                            "h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                                            item.color === "blue" &&
                                                "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
                                            item.color === "purple" &&
                                                "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
                                            item.color === "emerald" &&
                                                "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600",
                                        )}
                                    >
                                        <item.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm lg:text-base tracking-tight">
                                            {item.title}
                                        </h4>
                                        <p className="text-[10px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Mockup Representation - Bottom */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut",
                            delay: 0.2,
                        }}
                        viewport={{ once: true }}
                        className="relative w-full max-w-5xl px-2"
                    >
                        <div className="relative w-full z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden flex min-h-[280px] sm:min-h-[320px] md:min-h-[450px]">
                            {/* Internal Sidebar */}
                            <div className="w-10 sm:w-12 md:w-16 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 sm:py-6 md:py-8 gap-4 sm:gap-6 md:gap-8 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 text-slate-400 dark:text-slate-500">
                                    <div className="text-blue-600">
                                        <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                            </div>

                            {/* Internal Content */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Header Strip */}
                                <div className="h-10 sm:h-12 md:h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-8">
                                    <div className="h-2.5 sm:h-3 w-16 sm:w-20 md:w-24 lg:h-4 lg:w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                                </div>

                                {/* Dashboard Elements */}
                                <div className="p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 flex-1 overflow-hidden">
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                                        <div className="h-16 sm:h-20 md:h-24 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col justify-end gap-1">
                                            <span className="text-[8px] sm:text-[10px] font-black text-blue-600/60 uppercase tracking-wider">
                                                Alunos Ativos
                                            </span>
                                            <span className="text-base sm:text-xl md:text-2xl font-black text-blue-600">
                                                842
                                            </span>
                                        </div>
                                        <div className="h-16 sm:h-20 md:h-24 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col justify-end gap-1">
                                            <span className="text-[8px] sm:text-[10px] font-black text-purple-600/60 uppercase tracking-wider">
                                                Turmas
                                            </span>
                                            <span className="text-base sm:text-xl md:text-2xl font-black text-purple-600">
                                                24
                                            </span>
                                        </div>
                                        <div className="h-16 sm:h-20 md:h-24 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col justify-end gap-1">
                                            <span className="text-[8px] sm:text-[10px] font-black text-emerald-600/60 uppercase tracking-wider">
                                                Média Geral
                                            </span>
                                            <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-600">
                                                8.2
                                            </span>
                                        </div>
                                    </div>

                                    {/* Representative Bar Chart */}
                                    <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 h-28 sm:h-32 md:h-48 flex flex-col gap-2 sm:gap-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Desempenho Semanal
                                            </span>
                                            <div className="flex gap-1.5 sm:gap-2">
                                                <div className="h-1 sm:h-1.5 w-4 sm:w-6 bg-blue-600/40 rounded-full" />
                                                <div className="h-1 sm:h-1.5 w-4 sm:w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex items-end justify-around gap-1 sm:gap-2 md:gap-4">
                                            {[
                                                {
                                                    h1: "60%",
                                                    h2: "40%",
                                                    l: "S",
                                                },
                                                {
                                                    h1: "40%",
                                                    h2: "55%",
                                                    l: "T",
                                                },
                                                {
                                                    h1: "80%",
                                                    h2: "60%",
                                                    l: "Q",
                                                },
                                                {
                                                    h1: "30%",
                                                    h2: "45%",
                                                    l: "Q",
                                                },
                                                {
                                                    h1: "55%",
                                                    h2: "70%",
                                                    l: "S",
                                                },
                                                {
                                                    h1: "45%",
                                                    h2: "40%",
                                                    l: "S",
                                                },
                                                {
                                                    h1: "90%",
                                                    h2: "30%",
                                                    l: "D",
                                                },
                                            ].map((day, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 flex flex-col items-center gap-1 sm:gap-2 h-full justify-end"
                                                >
                                                    <div className="w-full flex items-end gap-0.5 sm:gap-1 px-0.5 h-16 sm:h-20 md:h-28">
                                                        <div
                                                            className="flex-1 bg-blue-600/40 rounded-t-[3px] sm:rounded-t-[4px]"
                                                            style={{
                                                                height: day.h1,
                                                            }}
                                                        />
                                                        <div
                                                            className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-[3px] sm:rounded-t-[4px]"
                                                            style={{
                                                                height: day.h2,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[7px] sm:text-[9px] font-bold text-slate-400">
                                                        {day.l}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
