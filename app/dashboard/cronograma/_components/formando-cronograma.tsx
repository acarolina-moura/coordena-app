"use client";

import { useState } from "react";
import { 
    Calendar, 
    Clock, 
    User, 
    ChevronRight, 
    CheckCircle2, 
    Circle,
    BookOpen,
    ArrowRightCircle,
    CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CronogramaCurso } from "../../_data/formando";

interface Props {
    dados: CronogramaCurso;
}

export default function FormandoCronograma({ dados }: Props) {
    const [cursoSelecionado, setCursoSelecionado] = useState(dados[0]?.cursoId || "");
    
    const curso = dados.find(c => c.cursoId === cursoSelecionado) || dados[0];
    const hoje = new Date();

    if (!curso) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <CalendarDays className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Nenhum cronograma disponível</h3>
                <p className="text-sm text-slate-500">Não estás inscrito em nenhum curso com sessões agendadas.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                        <CalendarDays className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-widest">{curso.cursoNome}</span>
                    </div>
                    <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Cronograma do Curso</h1>
                    <p className="text-slate-500 font-medium italic">Acompanha o teu percurso nesta formação</p>
                </div>

                {dados.length > 1 && (
                    <select 
                        value={cursoSelecionado} 
                        onChange={(e) => setCursoSelecionado(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-sm"
                    >
                        {dados.map(c => (
                            <option key={c.cursoId} value={c.cursoId}>{c.cursoNome}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Timeline */}
            <div className="relative flex flex-col gap-12">
                {/* Vertical Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-teal-500/20 via-slate-200 to-slate-200 hidden sm:block" />

                {curso.modulos.map((modulo, mIdx) => {
                    const aulasPassadas = modulo.aulas.filter(a => new Date(a.dataHora) < hoje).length;
                    const progressoModulo = modulo.aulas.length > 0 
                        ? Math.round((aulasPassadas / modulo.aulas.length) * 100) 
                        : 0;
                    const isCompleto = progressoModulo === 100 && modulo.aulas.length > 0;
                    const isAtivo = progressoModulo > 0 && !isCompleto;

                    return (
                        <motion.div 
                            key={modulo.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: mIdx * 0.1 }}
                            className="relative grid grid-cols-1 sm:grid-cols-[44px_1fr] gap-6"
                        >
                            {/* Icon/Step indicator */}
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={cn(
                                    "h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg transition-all border-2",
                                    isCompleto ? "bg-teal-500 border-teal-400 text-white" :
                                    isAtivo ? "bg-white border-teal-500 text-teal-600 ring-4 ring-teal-500/10" :
                                    "bg-white border-slate-200 text-slate-400"
                                )}>
                                    {isCompleto ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-5 h-5" />}
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="flex flex-col gap-6">
                                {/* Module Info */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className={cn(
                                            "text-xl font-black tracking-tight",
                                            isCompleto ? "text-slate-400" : "text-slate-900"
                                        )}>
                                            {modulo.nome}
                                        </h2>
                                        {isAtivo && (
                                            <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                                Em Curso
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-4 items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {modulo.cargaHoraria}h</span>
                                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {modulo.formadorPrincipal}</span>
                                    </div>
                                </div>

                                {/* Sessions List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {modulo.aulas.map((aula, aIdx) => {
                                        const dataAula = new Date(aula.dataHora);
                                        const isPassada = dataAula < hoje;
                                        const isHoje = dataAula.toDateString() === hoje.toDateString();

                                        return (
                                            <div 
                                                key={aula.id}
                                                className={cn(
                                                    "group p-4 rounded-2xl border transition-all flex flex-col gap-3 relative overflow-hidden",
                                                    isHoje ? "bg-teal-50/50 border-teal-200 shadow-sm" :
                                                    isPassada ? "bg-white border-slate-100 opacity-60" :
                                                    "bg-white border-slate-200 hover:border-teal-300 hover:shadow-md"
                                                )}
                                            >
                                                {isHoje && (
                                                    <div className="absolute top-0 right-0 p-1">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-ping" />
                                                    </div>
                                                )}

                                                <div className="flex items-start justify-between">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sessão {aIdx + 1}</span>
                                                        <span className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">
                                                            {aula.titulo}
                                                        </span>
                                                    </div>
                                                    {isPassada ? (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-4 h-4 text-slate-200 shrink-0" />
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {dataAula.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {dataAula.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {modulo.aulas.length === 0 && (
                                        <div className="col-span-full py-6 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-2xl">
                                            Nenhuma sessão agendada para este módulo.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Empty State Summary */}
            <div className="mt-8 p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                 {/* Decorative background circle */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold tracking-tight">Percurso da Formação</h3>
                        <p className="text-slate-400 text-sm max-w-md">
                            Este cronograma é atualizado automaticamente conforme novas sessões são planeadas pela coordenação.
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-teal-400">
                                {curso.modulos.reduce((acc, m) => acc + m.aulas.length, 0)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessões Totais</span>
                        </div>
                        <div className="w-px h-10 bg-slate-800" />
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-teal-400">
                                {curso.modulos.length}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Módulos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
