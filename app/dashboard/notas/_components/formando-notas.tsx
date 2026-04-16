"use client";

import React, { useState } from "react";
import { TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MinhasNotas } from "../../_data/formando";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormandoNotas({ inicial }: { inicial: MinhasNotas }) {
    const [notas] = useState<MinhasNotas>(inicial);

    // Agrupar notas por módulo
    const notasPorModulo = notas.reduce(
        (acc, item) => {
            if (!acc[item.modulo]) {
                acc[item.modulo] = [];
            }
            acc[item.modulo].push(item);
            return acc;
        },
        {} as Record<string, typeof notas>,
    );

    // Cálculo da Média Geral
    const avg =
        notas.length > 0
            ? (
                  notas.reduce((sum, item) => sum + item.nota, 0) / notas.length
              ).toFixed(1)
            : "0";

    // Obter lista de módulos ordenada
    const modulos = Object.keys(notasPorModulo).sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">
                    As Minhas Notas
                </h1>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    Consulte o seu desempenho acadêmico
                </p>
            </div>

            {/* Card de Média Geral */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200/50"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium opacity-80 text-teal-50">
                            Média Geral
                        </p>
                        <p className="text-4xl font-bold">
                            {avg}
                            <span className="text-lg font-normal opacity-60">
                                /20
                            </span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Acordeão de Notas por Módulo */}
            {notas.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm p-8 text-center">
                    <p className="text-slate-400 text-sm">
                        Ainda não tens notas registadas.
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <Accordion type="single" collapsible className="w-full">
                        {modulos.map((modulo, moduleIndex) => {
                            const notasModulo = notasPorModulo[modulo];
                            const mediaModulo =
                                notasModulo.length > 0
                                    ? (
                                          notasModulo.reduce(
                                              (sum, item) => sum + item.nota,
                                              0,
                                          ) / notasModulo.length
                                      ).toFixed(1)
                                    : "0";

                            return (
                                <AccordionItem key={modulo} value={modulo}>
                                    <AccordionTrigger className="px-6 hover:bg-slate-50/50 dark:hover:bg-gray-800/50">
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700 dark:text-gray-200 text-left">
                                                        {modulo}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-gray-400">
                                                        Média
                                                    </p>
                                                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                                        {mediaModulo}/20
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-t border-slate-100 dark:border-gray-800 bg-slate-50/30 dark:bg-gray-800/30">
                                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Componente
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Nota
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                                            Data
                                                        </th>
                                                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Estado
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                                    {notasModulo.map(
                                                        (item, i) => {
                                                            const isPassed =
                                                                item.nota >= 10;
                                                            return (
                                                                <motion.tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -10,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            moduleIndex *
                                                                                0.05 +
                                                                            i *
                                                                                0.05,
                                                                    }}
                                                                    className="hover:bg-slate-50/30 dark:hover:bg-gray-800/50 transition-colors"
                                                                >
                                                                    <td className="px-6 py-4">
                                                                        <p className="text-sm text-slate-600 dark:text-gray-300">
                                                                            {
                                                                                item.componente
                                                                            }
                                                                        </p>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <span
                                                                                className={`text-lg font-bold ${isPassed ? "text-emerald-600" : "text-red-500"}`}
                                                                            >
                                                                                {
                                                                                    item.nota
                                                                                }
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400 uppercase">
                                                                                Valores
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center text-sm text-slate-600 dark:text-gray-300 hidden md:table-cell">
                                                                        {new Date(
                                                                            item.createdAt,
                                                                        ).toLocaleDateString(
                                                                            "pt-PT",
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <div
                                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                                                isPassed
                                                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                                                                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                                                                            }`}
                                                                        >
                                                                            {isPassed ? (
                                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                            ) : (
                                                                                <XCircle className="w-3.5 h-3.5" />
                                                                            )}
                                                                            {isPassed
                                                                                ? "Aprovado"
                                                                                : "Reprovado"}
                                                                        </div>
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        },
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            )}
        </div>
    );
}
