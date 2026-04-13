"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Calendar,
    Clock,
    User,
    Layers,
} from "lucide-react";

interface DemoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEMO_SCREENS = [
    {
        id: "calendario",
        icon: Calendar,
        title: "Calendário",
        description: "Visualize eventos, aulas e cronograma de forma integrada",
        color: "from-blue-500 to-blue-600",
        preview: (
            <div className="space-y-2 sm:space-y-3">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(
                        (day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400"
                            >
                                {day}
                            </div>
                        ),
                    )}
                    {[...Array(35)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-sm font-medium ${
                                i % 7 === 0 || i % 7 === 6
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                    : i % 3 === 0
                                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold"
                                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300"
                            }`}
                        >
                            {(i % 30) + 1}
                        </div>
                    ))}
                </div>
                <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
                    <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] sm:text-xs font-medium">
                        📚 Aula de Programação - 10h00
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-medium">
                        📝 Entrega de Projeto - 15h00
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "perfil",
        icon: User,
        title: "Perfil de Utilizador",
        description: "Gerencie dados pessoais e profissionais",
        color: "from-purple-500 to-purple-600",
        preview: (
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0">
                        JD
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            João dos Santos
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            Formador de Programação
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            Email
                        </p>
                        <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            joao@coordena.pt
                        </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            Especialidade
                        </p>
                        <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white">
                            Python/Web
                        </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            Telefone
                        </p>
                        <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white">
                            +351 9XX XXX
                        </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            Nacionalidade
                        </p>
                        <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-white">
                            Portuguesa
                        </p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "cursos",
        icon: Layers,
        title: "Gestão de Cursos",
        description: "Crie, edite e gerencie cursos e inscrições",
        color: "from-emerald-500 to-emerald-600",
        preview: (
            <div className="space-y-2 sm:space-y-3">
                {[
                    {
                        name: "Python Avançado",
                        students: 28,
                        modules: 6,
                        status: "Ativo",
                    },
                    {
                        name: "Web Development",
                        students: 32,
                        modules: 8,
                        status: "Ativo",
                    },
                    {
                        name: "Data Science",
                        students: 18,
                        modules: 5,
                        status: "Planejado",
                    },
                ].map((course, i) => (
                    <div
                        key={i}
                        className="p-2 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    >
                        <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mr-2">
                                {course.name}
                            </h4>
                            <span
                                className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                                    course.status === "Ativo"
                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                }`}
                            >
                                {course.status}
                            </span>
                        </div>
                        <div className="flex gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            <div>👥 {course.students} Alunos</div>
                            <div>📚 {course.modules} Módulos</div>
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: "notas",
        icon: BookOpen,
        title: "Sistema de Notas",
        description:
            "Registre e consulte avaliações com templates personalizados",
        color: "from-orange-500 to-orange-600",
        preview: (
            <div className="space-y-2 sm:space-y-3">
                <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mr-2">
                            Ana Silva
                        </h4>
                        <span className="text-base sm:text-lg font-bold text-orange-600 shrink-0">
                            17.5
                        </span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                                Teoria (40%)
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                18
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                                Prática (60%)
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                17
                            </span>
                        </div>
                    </div>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate mr-2">
                            Carlos Mendes
                        </h4>
                        <span className="text-base sm:text-lg font-bold text-orange-600 shrink-0">
                            15
                        </span>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                                Teoria (40%)
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                16
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                                Prática (60%)
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">
                                14.5
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "assiduidade",
        icon: Clock,
        title: "Controle de Assiduidade",
        description: "Justifique faltas e visualize relatórios de presenças",
        color: "from-pink-500 to-pink-600",
        preview: (
            <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                    <div>
                        <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300">
                            15 de Abril
                        </p>
                        <p className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-50">
                            Presente
                        </p>
                    </div>
                    <span className="text-xl sm:text-2xl">✓</span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                            14 de Abril
                        </p>
                        <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            Falta Justificada
                        </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Justificada
                    </span>
                </div>
                <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <div>
                        <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">
                            12 de Abril
                        </p>
                        <p className="font-bold text-xs sm:text-sm text-red-900 dark:text-red-50">
                            Falta
                        </p>
                    </div>
                    <span className="text-xl sm:text-2xl">✗</span>
                </div>
                <div className="mt-2 sm:mt-4 p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Taxa de Assiduidade
                    </p>
                    <div className="mt-1.5 sm:mt-2 h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                    </div>
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400">
                        92% de Presença
                    </p>
                </div>
            </div>
        ),
    },
];

export function DemoModal({ open, onOpenChange }: DemoModalProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeScreen = DEMO_SCREENS[activeIndex];

    const goToPrevious = () => {
        setActiveIndex((prev) =>
            prev === 0 ? DEMO_SCREENS.length - 1 : prev - 1,
        );
    };

    const goToNext = () => {
        setActiveIndex((prev) =>
            prev === DEMO_SCREENS.length - 1 ? 0 : prev + 1,
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:w-auto max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500">
                        Explore o CoordenaApp
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    {/* Main Preview */}
                    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${activeScreen.color} flex items-center justify-center shrink-0`}
                            >
                                <activeScreen.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white">
                                    {activeScreen.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                    {activeScreen.description}
                                </p>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                            {activeScreen.preview}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPrevious}
                            className="rounded-full h-10 w-10 sm:h-11 sm:w-11"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>

                        {/* Dots Indicator */}
                        <div className="flex gap-1.5 sm:gap-2">
                            {DEMO_SCREENS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`transition-all min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full ${
                                        index === activeIndex
                                            ? "w-6 sm:w-8 h-2 bg-blue-600"
                                            : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                    }`}
                                    aria-label={`Ir para tela ${index + 1}`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNext}
                            className="rounded-full h-10 w-10 sm:h-11 sm:w-11"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {DEMO_SCREENS.map((screen, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`p-2 sm:p-3 rounded-lg text-center transition-all min-h-[44px] flex flex-col items-center justify-center ${
                                    index === activeIndex
                                        ? `bg-gradient-to-br ${screen.color} text-white font-bold`
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                <screen.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-0.5 sm:mb-1" />
                                <p className="text-[10px] sm:text-xs font-medium leading-tight">
                                    {screen.title.split(" ")[0]}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                        <Button
                            asChild
                            className="flex-1 h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold sm:font-bold text-base sm:text-lg rounded-lg sm:rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <Link href="/register">Começar Agora</Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 sm:h-14 border-2 border-slate-300 dark:border-slate-700 font-bold text-base sm:text-lg rounded-lg sm:rounded-xl"
                            onClick={() => onOpenChange(false)}
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
