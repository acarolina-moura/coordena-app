"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Calendar,
    ClipboardCheck,
    MessageSquare,
    FileText,
    Wallet,
    BookOpen,
    PieChart,
} from "lucide-react";

const features = [
    {
        title: "Gestão de Notas",
        description:
            "Lançamento e cálculo automático de médias por módulo e semestre.",
        icon: BarChart3,
        color: "blue",
    },
    {
        title: "Assiduidade Digital",
        description:
            "Controle de presenças simplificado com relatórios em tempo real.",
        icon: ClipboardCheck,
        color: "emerald",
    },
    {
        title: "Cronograma Dinâmico",
        description:
            "Organização de horários e eventos escolares integrada para toda a equipa.",
        icon: Calendar,
        color: "purple",
    },
    {
        title: "Relatórios Acadêmicos",
        description:
            "Gere PDFs detalhados de desempenho e progresso dos alunos.",
        icon: PieChart,
        color: "blue",
    },
    {
        title: "Trabalhos e Tarefas",
        description:
            "Submissão e correção de trabalhos diretamente na plataforma.",
        icon: FileText,
        color: "emerald",
    },
    {
        title: "Comunicação Interna",
        description:
            "Chat e avisos para manter professores e encarregados informados.",
        icon: MessageSquare,
        color: "purple",
    },
    {
        title: "Biblioteca de Apoio",
        description:
            "Repositório de materiais didáticos e documentos importantes.",
        icon: BookOpen,
        color: "blue",
    },
    {
        title: "Painel Financeiro",
        description:
            "Acompanhamento de mensalidades e pagamentos de forma integrada.",
        icon: Wallet,
        color: "emerald",
    },
];

const colorVariants = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
    emerald:
        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800",
};

const hoverVariants = {
    blue: "hover:border-blue-400 hover:shadow-blue-600/10",
    emerald: "hover:border-emerald-400 hover:shadow-emerald-600/10",
    purple: "hover:border-purple-400 hover:shadow-purple-600/10",
};

export function Features() {
    return (
        <section
            id="funcionalidades"
            className="py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-800/50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col items-center text-center gap-4 sm:gap-6 mb-12 sm:mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm">
                        Funcionalidades
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
                        Tudo o que sua escola <br />
                        precisa em um{" "}
                        <span className="text-blue-600">único lugar</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed px-2">
                        Uma plataforma modular desenhada para simplificar fluxos
                        de trabalho e maximizar a eficiência acadêmica.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className={`p-4 sm:p-5 lg:p-6 bg-white dark:bg-slate-900 border-2 rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all duration-300 group ${hoverVariants[feature.color as keyof typeof hoverVariants]}`}
                        >
                            <div
                                className={`h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 shadow-sm border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${colorVariants[feature.color as keyof typeof colorVariants]}`}
                            >
                                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                            </div>
                            <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2 lg:mb-3 line-clamp-2">
                                {feature.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[10px] sm:text-xs lg:text-sm line-clamp-3">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
