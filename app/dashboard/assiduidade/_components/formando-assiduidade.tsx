"use client";

import React from "react";
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    XCircle,
    Activity,
    UserCheck,
    RotateCcw,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { MinhasPresencas } from "../../_data/formando";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface FormandoAssiduidadeProps {
    presencas: MinhasPresencas;
}

// ---------------------------------------------------------------------------
// Sub-componentes auxiliares
// ---------------------------------------------------------------------------
function BadgeEstado({ estado }: { estado: string }) {
    if (estado === "PRESENTE")
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Presente
            </div>
        );
    if (estado === "JUSTIFICADO")
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" /> Justificada
            </div>
        );
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700">
            <XCircle className="w-3.5 h-3.5" /> Falta
        </div>
    );
}

function KPI({ label, value, icon: Icon, bg, iconBg, iconColor }: any) {
    return (
        <div className={cn('flex items-center justify-between rounded-2xl p-5', bg)}>
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 uppercase">{label}</span>
                <span className="text-4xl font-bold text-gray-900">{value}</span>
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function FormandoAssiduidade({ presencas }: FormandoAssiduidadeProps) {
    const LIMITE_RISCO = 75; // % mínima exigida
    const totalAulas = presencas.length;
    const totalPresencas = presencas.filter((p) => p.status === "PRESENTE").length;
    const totalFaltas = presencas.filter((p) => p.status === "AUSENTE").length;
    const totalJustificadas = presencas.filter((p) => p.status === "JUSTIFICADO").length;

    const percentagem = totalAulas > 0
        ? Math.round(((totalPresencas + totalJustificadas) / totalAulas) * 100)
        : 0;

    const emRisco = percentagem < LIMITE_RISCO;

    // Agrupar por mês para o resumo (simplificado)
    const resumoMensal = Array.from(new Set(presencas.map(p => {
        const d = new Date(p.dataHora);
        return d.toLocaleString('pt-PT', { month: 'short' });
    }))).slice(0, 4).map(mes => {
        const mesDocs = presencas.filter(p => new Date(p.dataHora).toLocaleString('pt-PT', { month: 'short' }) === mes);
        return {
            mes,
            presencas: mesDocs.filter(p => p.status === "PRESENTE").length,
            faltas: mesDocs.filter(p => p.status === "AUSENTE").length
        };
    }).reverse();

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-[26px] font-bold text-gray-900">
                    Minha Assiduidade
                </h1>
                <p className="mt-1 text-sm text-gray-400">Acompanha o teu registo de presenças e faltas</p>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <KPI
                    label="TAXA GLOBAL"
                    value={`${percentagem}%`}
                    icon={Activity}
                    bg="bg-teal-50"
                    iconBg="bg-teal-100"
                    iconColor="text-teal-500"
                />
                <KPI
                    label="PRESENÇAS"
                    value={totalPresencas}
                    icon={UserCheck}
                    bg="bg-blue-50"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-500"
                />
                <KPI
                    label="FALTAS"
                    value={totalFaltas}
                    icon={XCircle}
                    bg="bg-rose-50"
                    iconBg="bg-rose-100"
                    iconColor="text-rose-500"
                />
                <KPI
                    label="JUSTIFICADAS"
                    value={totalJustificadas}
                    icon={RotateCcw}
                    bg="bg-amber-50"
                    iconBg="bg-amber-100"
                    iconColor="text-amber-500"
                />
            </div>

            {/* Alerta de risco (Se houver) */}
            {emRisco && totalAulas > 0 && (
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-start gap-4 rounded-2xl bg-amber-50 border border-amber-100 p-5"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">Atenção à Assiduidade</h4>
                        <p className="mt-0.5 text-sm text-amber-700 leading-relaxed">
                            A sua taxa atual de {percentagem}% está próxima do limite mínimo permitido ({LIMITE_RISCO}%).
                            Certifique-se de justificar qualquer ausência para evitar penalizações.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Histórico - Tabela */}
                <div className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                            <BookOpen className="h-4 w-4 text-teal-400" />
                            Histórico de Aulas
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data e Hora</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulo / Aula</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Justificativa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {presencas.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                            Ainda não tens registos de assiduidade.
                                        </td>
                                    </tr>
                                ) : (
                                    presencas.map((p, i) => {
                                        const data = new Date(p.dataHora);
                                        return (
                                            <motion.tr
                                                key={p.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700">{data.toLocaleDateString("pt-PT")}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {data.toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest leading-none mb-1">{p.modulo}</span>
                                                        <span className="text-sm font-semibold text-slate-600 line-clamp-1">{p.aula}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <BadgeEstado estado={p.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-400 italic">
                                                        {p.justificativa || "—"}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar - Resumo Mês & Regras */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Tendência Mensal */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-6">
                            <BarChart3 className="h-4 w-4 text-teal-400" />
                            Tendência Mensal
                        </h2>
                        {resumoMensal.length > 0 ? (
                            <div className="flex flex-col gap-5">
                                {resumoMensal.map((m) => {
                                    const total = m.presencas + m.faltas;
                                    const pct = total > 0 ? Math.round((m.presencas / total) * 100) : 100;
                                    return (
                                        <div key={m.mes} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                                                <span className="text-slate-600">{m.mes}</span>
                                                <span className={cn(
                                                    pct >= 90 ? "text-teal-600" : pct >= 75 ? "text-amber-500" : "text-rose-500"
                                                )}>{pct}%</span>
                                            </div>
                                            <Progress value={pct} className={cn(
                                                "h-2 bg-slate-100",
                                                pct >= 90 ? "[&>*]:bg-teal-400" : pct >= 75 ? "[&>*]:bg-amber-400" : "[&>*]:bg-rose-400"
                                            )} />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-xs text-slate-300 italic">
                                Dados insuficientes
                            </div>
                        )}
                    </div>

                    {/* Regras (Info Card) */}
                    <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <RotateCcw className="w-5 h-5 text-teal-400" />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Regulamento</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Mantenha a sua assiduidade acima de <span className="text-teal-400 font-bold">{LIMITE_RISCO}%</span> para garantir a aprovação direta nos módulos. Faltas injustificadas podem requerer trabalhos de compensação.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}