"use client";

import React, { useState } from "react";
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    XCircle,
    Activity,
    UserCheck,
    RotateCcw,
    BarChart3,
    Send,
    Loader2,
    FileText,
    Clock3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import type { MinhasPresencas } from "../../_data/formando";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadFormando } from "@/components/upload-formando";
import { justificarFalta } from "@/app/dashboard/assiduidade/actions";

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                <CheckCircle2 className="w-3.5 h-3.5" /> Presente
            </div>
        );
    if (estado === "PENDENTE")
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                <Clock3 className="w-3.5 h-3.5" /> Pendente
            </div>
        );
    if (estado === "JUSTIFICADO")
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                <CheckCircle2 className="w-3.5 h-3.5" /> Justificada
            </div>
        );
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100/50">
            <XCircle className="w-3.5 h-3.5" /> {estado === "AUSENTE" ? "Falta" : estado}
        </div>
    );
}

function KPI({ label, value, icon: Icon, bg, iconBg, iconColor }: any) {
    return (
        <div className={cn('flex items-center justify-between rounded-2xl p-5', bg)}>
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">{label}</span>
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
        </div>
    );
}

function JustificarDialog({ presencaId, data, modulo }: { presencaId: string, data: string, modulo: string }) {
    const [open, setOpen] = useState(false);
    const [justificativa, setJustificativa] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    async function handleSubmeter() {
        if (!justificativa.trim()) return;
        setCarregando(true);
        const result = await justificarFalta(presencaId, justificativa);
        setCarregando(false);
        if (result.sucesso) {
            setSucesso(true);
            setTimeout(() => {
                setOpen(false);
                setSucesso(false);
                setJustificativa("");
            }, 2000);
        } else {
            alert(result.mensagem);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 h-7 gap-1.5 border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-all font-bold text-[9px] uppercase tracking-wider rounded-lg shadow-sm"
                >
                    <RotateCcw className="w-3 h-3" /> Justificar Falta
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-none shadow-2xl overflow-hidden rounded-[2rem] p-0">
                <div className="bg-gradient-to-br from-amber-500 to-rose-600 p-8 text-white relative">
                    <div className="absolute top-4 right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Justificar Falta</DialogTitle>
                        <DialogDescription className="text-amber-50 text-base leading-relaxed mt-2">
                            Estás Prestes a justificar a tua ausência no módulo <span className="font-bold text-white">{modulo}</span> ({data}).
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white">
                    {sucesso ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Sucesso!</h3>
                            <p className="text-slate-500 mt-1">A tua justificação foi registada com sucesso.</p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="justificativa" className="text-sm font-bold text-slate-700 ml-1">MOTIVO DA AUSÊNCIA</Label>
                                <Textarea
                                    id="justificativa"
                                    placeholder="Explica brevemente o motivo da tua falta..."
                                    value={justificativa}
                                    onChange={(e) => setJustificativa(e.target.value)}
                                    className="min-h-[120px] bg-slate-50 border-slate-100 focus:bg-white rounded-2xl resize-none p-4 text-slate-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            <DialogFooter className="flex gap-3 sm:justify-end">
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    disabled={carregando}
                                    className="rounded-xl font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSubmeter}
                                    disabled={carregando || !justificativa.trim()}
                                    className="bg-slate-900 hover:bg-black text-white rounded-xl px-6 font-bold shadow-lg shadow-slate-200 gap-2 h-11"
                                >
                                    {carregando ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Enviar Justificação
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function JustificarFaltasGeral({ faltas }: { faltas: any[] }) {
    const [open, setOpen] = useState(false);
    const [selectedFaltaId, setSelectedFaltaId] = useState<string | null>(faltas.length === 1 ? faltas[0].id : null);
    const [justificativa, setJustificativa] = useState("");
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [sucesso, setSucesso] = useState(false);

    async function handleSubmeter() {
        if (!selectedFaltaId || !justificativa.trim() || !uploadedFileUrl) return;
        setCarregando(true);
        const result = await justificarFalta(selectedFaltaId, justificativa, uploadedFileUrl);
        setCarregando(false);
        if (result.sucesso) {
            setSucesso(true);
            setTimeout(() => {
                setOpen(false);
                setSucesso(false);
                setJustificativa("");
                setUploadedFileUrl(null);
                setUploadedFileName(null);
                setSelectedFaltaId(faltas.length === 1 ? faltas[0].id : null);
            }, 2000);
        } else {
            alert(result.mensagem);
        }
    }

    function handleUploadComplete(url: string, name: string) {
        setUploadedFileUrl(url);
        setUploadedFileName(name);
    }

    const selecionada = faltas.find(f => f.id === selectedFaltaId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all gap-2 px-6 h-11 border-none">
                    <RotateCcw className="w-4 h-4 text-teal-400" /> Justificar Ausências
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-hidden rounded-[2rem] p-0">
                <div className="bg-slate-900 p-8 text-white relative">
                    <div className="absolute top-4 right-4 h-24 w-24 bg-teal-500/10 rounded-full blur-2xl" />
                    <DialogHeader className="relative z-10">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Justificar Faltas</DialogTitle>
                        <DialogDescription className="text-slate-400 text-base leading-relaxed mt-2 italic">
                            Tens <span className="font-bold text-teal-400">{faltas.length}</span> ausências pendentes de justificação.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white">
                    {sucesso ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center justify-center py-8 text-center"
                        >
                            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Sucesso!</h3>
                            <p className="text-slate-500 mt-1">A tua justificação foi registada com sucesso.</p>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {faltas.length > 1 && (
                                <div className="flex flex-col gap-3">
                                    <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest">Seleciona a Aula</Label>
                                    <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                        {faltas.map((f) => {
                                            const d = new Date(f.dataHora);
                                            return (
                                                <button
                                                    key={f.id}
                                                    onClick={() => setSelectedFaltaId(f.id)}
                                                    className={cn(
                                                        "flex flex-col p-4 rounded-2xl border text-left transition-all",
                                                        selectedFaltaId === f.id
                                                            ? "border-teal-500 bg-teal-50 ring-4 ring-teal-500/5 shadow-sm"
                                                            : "border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider mb-1",
                                                        selectedFaltaId === f.id ? "text-teal-600" : "text-slate-400"
                                                    )}>{f.modulo}</span>
                                                    <span className="text-sm font-bold text-slate-900">{f.aula}</span>
                                                    <span className="text-xs text-slate-500 mt-0.5">{d.toLocaleDateString("pt-PT")}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {selectedFaltaId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="justificativa" className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-widest leading-none">
                                            {faltas.length === 1 ? "Comentário da Ausência" : `Comentário para ${selecionada?.modulo}`}
                                        </Label>
                                        <Textarea
                                            id="justificativa"
                                            placeholder="Explica brevemente o motivo da tua falta..."
                                            value={justificativa}
                                            onChange={(e) => setJustificativa(e.target.value)}
                                            className="min-h-[100px] bg-slate-50 border-slate-100 focus:bg-white focus:border-teal-400 rounded-2xl resize-none p-4 text-slate-600 focus:ring-4 focus:ring-teal-500/5 transition-all outline-none text-sm"
                                        />
                                    </div>

                                    {/* UploadThing */}
                                    <UploadFormando
                                        endpoint="documentUploader"
                                        label="Documento Comprovativo"
                                        description="PDF (máx. 16MB)"
                                        onUploadComplete={(url, name) => handleUploadComplete(url, name)}
                                        variant="dropzone"
                                    />

                                    {uploadedFileName && (
                                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="text-emerald-700 font-medium truncate">{uploadedFileName}</span>
                                        </div>
                                    )}

                                    <DialogFooter className="flex gap-3 sm:justify-end pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setOpen(false)}
                                            disabled={carregando}
                                            className="rounded-xl font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleSubmeter}
                                            disabled={carregando || !justificativa.trim() || !uploadedFileUrl}
                                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-10 font-bold shadow-lg shadow-teal-100 gap-2 h-11"
                                        >
                                            {carregando ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Submeter Justificação
                                        </Button>
                                    </DialogFooter>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function FormandoAssiduidade({ presencas }: FormandoAssiduidadeProps) {
    const LIMITE_RISCO = 75; // % mínima exigida
    const totalAulas = presencas.length;
    const totalPresencas = presencas.filter((p: any) => p.status === "PRESENTE").length;
    const totalFaltas = presencas.filter((p: any) => p.status === "AUSENTE" || p.status === "PENDENTE").length;
    const totalJustificadas = presencas.filter((p: any) => p.status === "JUSTIFICADO").length;

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
            presencas: mesDocs.filter(p => (p.status as string) === "PRESENTE").length,
            faltas: mesDocs.filter(p => (p.status as string) === "AUSENTE" || (p.status as string) === "PENDENTE").length
        };
    }).reverse();

    // CORREÇÃO: Incluir TODAS as ausências sem comentário (AUSENTE sem justificativa)
    const faltasNaoJustificadas = presencas.filter(p => {
        const s = p.status as string;
        return (
            s !== "PRESENTE" &&
            s !== "JUSTIFICADO" &&
            s !== "PENDENTE" &&
            !p.comentarioFormando
        );
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
                        Minha Assiduidade
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">Acompanha o teu registo de presenças e faltas</p>
                </motion.div>

                {faltasNaoJustificadas.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <JustificarFaltasGeral faltas={faltasNaoJustificadas} />
                    </motion.div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:grid-cols-4">
                <KPI
                    label="TAXA GLOBAL"
                    value={`${percentagem}%`}
                    icon={Activity}
                    bg="bg-teal-50 dark:bg-teal-950/50"
                    iconBg="bg-teal-100 dark:bg-teal-900/50"
                    iconColor="text-teal-500"
                />
                <KPI
                    label="PRESENÇAS"
                    value={totalPresencas}
                    icon={UserCheck}
                    bg="bg-blue-50 dark:bg-blue-950/50"
                    iconBg="bg-blue-100 dark:bg-blue-900/50"
                    iconColor="text-blue-500"
                />
                <KPI
                    label="FALTAS"
                    value={totalFaltas}
                    icon={XCircle}
                    bg="bg-rose-50 dark:bg-rose-950/50"
                    iconBg="bg-rose-100 dark:bg-rose-900/50"
                    iconColor="text-rose-500"
                />
                <KPI
                    label="JUSTIFICADAS"
                    value={totalJustificadas}
                    icon={CheckCircle2}
                    bg="bg-emerald-50 dark:bg-emerald-950/50"
                    iconBg="bg-emerald-100 dark:bg-emerald-900/50"
                    iconColor="text-emerald-500"
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
                <div className="lg:col-span-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                            <BookOpen className="h-4 w-4 text-teal-400" />
                            Histórico de Aulas
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Data e Hora</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Módulo / Aula</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Justificativa</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                                {presencas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                                            Ainda não tens registos de assiduidade.
                                        </td>
                                    </tr>
                                ) : (
                                    presencas.map((p: any, i: number) => {
                                        const data = new Date(p.dataHora);
                                        const podeJustificar =
                                            (p.status === "AUSENTE") &&
                                            !p.comentarioFormando;

                                        return (
                                            <motion.tr
                                                key={p.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200">{data.toLocaleDateString("pt-PT")}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {data.toLocaleTimeString("pt-PT", { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest leading-none mb-1">{p.modulo}</span>
                                                        <span className="text-sm font-semibold text-slate-600 dark:text-gray-300 line-clamp-1">{p.aula}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <BadgeEstado estado={p.status as string} />
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    {(p.status as string) === "PENDENTE" ? (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-indigo-600">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                <span className="text-xs font-bold uppercase tracking-wider">Em Análise</span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                                                                DOC: {p.documentoUrl || "Sem anexo"}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">
                                                            {p.justificativa || "—"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {podeJustificar && (
                                                        <JustificarDialog
                                                            presencaId={p.id}
                                                            data={data.toLocaleDateString("pt-PT")}
                                                            modulo={p.modulo}
                                                        />
                                                    )}
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
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100 mb-6">
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