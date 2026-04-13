"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    Circle,
    BookOpen,
    CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CronogramaCurso } from "../../_data/formando";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props {
    dados: CronogramaCurso;
}

export default function FormandoCronograma({ dados }: Props) {
    const [cursoSelecionado, setCursoSelecionado] = useState(dados[0]?.cursoId || "");
    const [openModules, setOpenModules] = useState<string[]>([]);

    const curso = dados.find(c => c.cursoId === cursoSelecionado) || dados[0];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!curso) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                <CalendarDays className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nenhum cronograma disponível</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Não estás inscrito em nenhum curso com sessões agendadas.</p>
            </div>
        );
    }

    const totalSessoes = curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0);

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-teal-600 dark:text-teal-500 mb-1">
                        <CalendarDays className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest">{curso.cursoNome}</span>
                    </div>
                    <h1 className="text-[28px] font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">Cronograma do Curso</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Acompanha o teu percurso nesta formação</p>
                </div>

                {dados.length > 1 && (
                    <select
                        value={cursoSelecionado}
                        onChange={(e) => setCursoSelecionado(e.target.value)}
                        aria-label="Selecionar curso"
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                    >
                        {dados.map(c => (
                            <option key={c.cursoId} value={c.cursoId}>{c.cursoNome}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Summary Bar */}
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 px-5 py-3">
                    <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-500" />
                    <div>
                        <p className="text-2xl font-black text-teal-700 dark:text-teal-400">{curso.modulos.length}</p>
                        <p className="text-[10px] font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest">Módulos</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-5 py-3">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-500" />
                    <div>
                        <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400">{totalSessoes}</p>
                        <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Sessões</p>
                    </div>
                </div>
            </div>

            {/* Accordion de Módulos */}
            <Accordion
                type="multiple"
                value={openModules}
                onValueChange={setOpenModules}
                className="flex flex-col gap-3"
            >
                {curso.modulos.map((modulo, mIdx) => {
                    const aulasPassadas = modulo.aulas.filter(a => {
                        const d = new Date(a.dataHora);
                        d.setHours(0, 0, 0, 0);
                        return d < hoje;
                    }).length;
                    const progressoModulo = modulo.aulas.length > 0
                        ? Math.round((aulasPassadas / modulo.aulas.length) * 100)
                        : 0;
                    const isCompleto = progressoModulo === 100 && modulo.aulas.length > 0;
                    const isAtivo = progressoModulo > 0 && !isCompleto;

                    return (
                        <motion.div
                            key={modulo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: mIdx * 0.05 }}
                        >
                            <AccordionItem
                                value={modulo.id}
                                className={cn(
                                    "rounded-2xl border transition-all",
                                    isCompleto
                                        ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                                        : isAtivo
                                            ? "border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900"
                                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                                )}
                            >
                                <AccordionTrigger className="px-5 py-4 [&>svg]:text-gray-400 hover:no-underline">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left flex-1 min-w-0">
                                        {/* Icon */}
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border-2",
                                            isCompleto ? "bg-teal-500 border-teal-400 text-white" :
                                            isAtivo ? "bg-white dark:bg-gray-800 border-teal-500 text-teal-600" :
                                            "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                                        )}>
                                            {isCompleto ? <CheckCircle2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(
                                                    "text-base font-black truncate",
                                                    isCompleto ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
                                                )}>
                                                    {modulo.nome}
                                                </h3>
                                                {isAtivo && (
                                                    <span className="bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                                                        Em Curso
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {modulo.cargaHoraria}h</span>
                                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {modulo.formadorPrincipal}</span>
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {modulo.aulas.length} sessões</span>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-24">
                                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">{progressoModulo}%</span>
                                            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        isCompleto ? "bg-teal-500" : isAtivo ? "bg-teal-400" : "bg-gray-300 dark:bg-gray-700"
                                                    )}
                                                    style={{ width: `${progressoModulo}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent>
                                    <div className="px-5 pb-4">
                                        {/* Divider */}
                                        <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />

                                        {modulo.aulas.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {modulo.aulas.map((aula, aIdx) => {
                                                    const dataAula = new Date(aula.dataHora);
                                                    dataAula.setHours(0, 0, 0, 0);
                                                    const isPassada = dataAula < hoje;
                                                    const isHoje = dataAula.getTime() === hoje.getTime();

                                                    return (
                                                        <div
                                                            key={aula.id}
                                                            className={cn(
                                                                "group p-4 rounded-xl border transition-all flex flex-col gap-3 relative overflow-hidden",
                                                                isHoje
                                                                    ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 shadow-sm"
                                                                    : isPassada
                                                                        ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md"
                                                            )}
                                                        >
                                                            {isHoje && (
                                                                <div className="absolute top-2 right-2">
                                                                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                                                                </div>
                                                            )}

                                                            <div className="flex items-start justify-between">
                                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Sessão {aIdx + 1}</span>
                                                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                                                        {aula.titulo}
                                                                    </span>
                                                                </div>
                                                                {isPassada ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />
                                                                ) : (
                                                                    <Circle className="w-4 h-4 text-gray-200 dark:text-gray-700 shrink-0 ml-2" />
                                                                )}
                                                            </div>

                                                            <div className="flex items-center justify-between mt-auto">
                                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {dataAula.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(aula.dataHora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 italic border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                                Nenhuma sessão agendada para este módulo.
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </motion.div>
                    );
                })}
            </Accordion>

            {/* Footer Summary */}
            <div className="mt-4 p-6 rounded-2xl bg-gray-900 dark:bg-gray-800 text-white relative overflow-hidden shadow-lg">
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 dark:text-gray-400">Percurso da Formação</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                            Cronograma atualizado automaticamente conforme novas sessões são planeadas.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                            <p className="text-xl font-black text-teal-400">{totalSessoes}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sessões</p>
                        </div>
                        <div className="w-px h-8 bg-gray-800" />
                        <div className="text-right">
                            <p className="text-xl font-black text-teal-400">{curso.modulos.length}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Módulos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
