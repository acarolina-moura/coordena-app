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
    Users,
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
            <div className="space-y-3">
                <div className="grid grid-cols-7 gap-2 mb-4">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(
                        (day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-bold text-slate-600 dark:text-slate-400"
                            >
                                {day}
                            </div>
                        ),
                    )}
                    {[...Array(35)].map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
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
                <div className="space-y-2 pt-2">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        📚 Aula de Programação - 10h00
                    </div>
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
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
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        JD
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            João dos Santos
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Formador de Programação
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Email
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            joao@coordena.pt
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Especialidade
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            Python/Web
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Telefone
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
                            +351 9XX XXX XXX
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            Nacionalidade
                        </p>
                        <p className="font-medium text-slate-900 dark:text-white">
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
            <div className="space-y-3">
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
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">
                                {course.name}
                            </h4>
                            <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    course.status === "Ativo"
                                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                }`}
                            >
                                {course.status}
                            </span>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-400">
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
            <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Ana Silva
                        </h4>
                        <span className="text-lg font-bold text-orange-600">
                            17.5
                        </span>
                    </div>
                    <div className="space-y-1 text-xs">
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
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Carlos Mendes
                        </h4>
                        <span className="text-lg font-bold text-orange-600">
                            15
                        </span>
                    </div>
                    <div className="space-y-1 text-xs">
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
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
                    <div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            15 de Abril
                        </p>
                        <p className="font-bold text-emerald-900 dark:text-emerald-50">
                            Presente
                        </p>
                    </div>
                    <span className="text-2xl">✓</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            14 de Abril
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                            Falta Justificada
                        </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Justificada
                    </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <div>
                        <p className="text-xs text-red-700 dark:text-red-300">
                            12 de Abril
                        </p>
                        <p className="font-bold text-red-900 dark:text-red-50">
                            Falta
                        </p>
                    </div>
                    <span className="text-2xl">✗</span>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                        Taxa de Assiduidade
                    </p>
                    <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
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
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500">
                        Explore o CoordenaApp
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Main Preview */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50">
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeScreen.color} flex items-center justify-center`}
                            >
                                <activeScreen.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                                    {activeScreen.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {activeScreen.description}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                            {activeScreen.preview}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToPrevious}
                            className="rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>

                        {/* Dots Indicator */}
                        <div className="flex gap-2">
                            {DEMO_SCREENS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`transition-all ${
                                        index === activeIndex
                                            ? "w-8 h-2 bg-blue-600"
                                            : "w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                    } rounded-full`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={goToNext}
                            className="rounded-full"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Features List */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {DEMO_SCREENS.map((screen, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`p-3 rounded-lg text-center transition-all ${
                                    index === activeIndex
                                        ? `bg-gradient-to-br ${screen.color} text-white font-bold`
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                <screen.icon className="w-5 h-5 mx-auto mb-1" />
                                <p className="text-xs font-medium">
                                    {screen.title.split(" ")[0]}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            asChild
                            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            <Link href="/register">Começar Agora</Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 border-2 border-slate-300 dark:border-slate-700 font-bold rounded-xl"
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
