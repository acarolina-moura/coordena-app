"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Calendar, Clock, CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { responderConviteFormador } from "../actions";

interface ConviteItem {
    id: string;
    status: string;
    descricao: string | null;
    dataEnvio: Date | string;
    dataResposta: Date | string | null;
    cursoNome: string | null;
    moduloNome: string | null;
}

interface ConvitesFormadorProps {
    initialConvites: ConviteItem[];
}

export function ConvitesFormador({ initialConvites }: ConvitesFormadorProps) {
    const [convites, setConvites] = useState(initialConvites);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const pendentes = convites.filter((c) => c.status === "PENDENTE");
    const historico = convites.filter((c) => c.status !== "PENDENTE");

    async function handleResposta(id: string, acao: "ACEITE" | "RECUSADO") {
        setLoadingId(id);
        const res = await responderConviteFormador(id, acao);

        if (res.success) {
            setConvites((prev: ConviteItem[]) =>
                prev.map((c) => c.id === id ? { ...c, status: acao, dataResposta: new Date() } : c)
            );
        }
        setLoadingId(null);
    }

    return (
        <div className="space-y-12">
            {/* Secção de Pendentes */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-500">
                        <Mail className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Convites Pendentes ({pendentes.length})</h2>
                </div>

                {pendentes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center"
                    >
                        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Não tens nenhum convite pendente de momento.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Fica atento às notificações para novas oportunidades!</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {pendentes.map((convite, i) => (
                                <motion.div
                                    key={convite.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Sparkles className="h-4 w-4" />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                                                <BookOpen className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate pr-6">{convite.cursoNome || 'Novo Curso'}</h3>
                                                {convite.moduloNome && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{convite.moduloNome}</p>
                                                )}
                                                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none mt-1">Convite Aberto</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 py-2">
                                            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                <span>Envio: {new Date(convite.dataEnvio).toLocaleDateString()}</span>
                                            </div>
                                            {convite.descricao && (
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 italic">
                                                    &quot;{convite.descricao}&quot;
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-xl h-11 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-800"
                                                onClick={() => handleResposta(convite.id, "RECUSADO")}
                                                disabled={loadingId === convite.id}
                                            >
                                                {loadingId === convite.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Recusar"
                                                )}
                                            </Button>
                                            <Button
                                                className="flex-1 rounded-xl h-11 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-600/20"
                                                onClick={() => handleResposta(convite.id, "ACEITE")}
                                                disabled={loadingId === convite.id}
                                            >
                                                {loadingId === convite.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>Aceitar</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Secção de Histórico */}
            {historico.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Clock className="h-4 w-4" />
                        <h2 className="text-sm font-bold uppercase tracking-widest">Histórico de Convites</h2>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Curso</th>
                                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Data</th>
                                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Status</th>
                                    <th className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">Resposta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {historico.map((convite) => (
                                    <tr key={convite.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-200">
                                            {convite.cursoNome || 'Curso Removido'}
                                            {convite.moduloNome && (
                                                <span className="block text-xs text-gray-400 font-normal">{convite.moduloNome}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(convite.dataEnvio).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                convite.status === "ACEITE"
                                                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-500"
                                                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            )}>
                                                {convite.status === "ACEITE" ? (
                                                    <CheckCircle2 className="h-3 w-3" />
                                                ) : (
                                                    <XCircle className="h-3 w-3" />
                                                )}
                                                {convite.status.toLowerCase()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs italic">
                                            Respondido em {convite.dataResposta ? new Date(convite.dataResposta).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
