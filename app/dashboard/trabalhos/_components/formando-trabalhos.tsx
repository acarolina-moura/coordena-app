"use client";

import { useState } from "react";
import {
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Clock3,
    ChevronDown,
    ChevronUp,
    Download,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MeusTrabalhos } from "../../_data/formando";
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
import { registarSubmissao } from "@/app/dashboard/upload-actions";

interface Props {
    trabalhos: MeusTrabalhos;
}

// ---------------------------------------------------------------------------
// Sub-componentes auxiliares
// ---------------------------------------------------------------------------
interface KPIProps {
    label: string;
    value: number | string;
    icon: React.ElementType;
    bg: string;
    iconBg: string;
    iconColor: string;
}

function KPI({ label, value, icon: Icon, bg, iconBg, iconColor }: KPIProps) {
    return (
        <div className={cn('flex items-center justify-between rounded-2xl p-5 border border-slate-100/50 shadow-sm', bg)}>
            <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">{label}</span>
                <span className="text-4xl font-bold text-slate-900 dark:text-gray-100">{value}</span>
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
        </div>
    );
}

export default function FormandoTrabalhos({ trabalhos }: Props) {
    const [submetendo, setSubmetendo] = useState(false);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const stats = {
        total: trabalhos.length,
        entregues: trabalhos.filter((t) => t.status === 'ENTREGUE').length,
        pendentes: trabalhos.filter((t) => t.status === 'PENDENTE').length,
        emFalta: trabalhos.filter((t) => t.status === 'EM_FALTA' || t.status === 'ATRASADO').length,
    };

    const groupedTrabalhos = (trabalhos as MeusTrabalhos).reduce((acc, t) => {
        if (!acc[t.moduloId]) {
            acc[t.moduloId] = { nome: t.moduloNome, items: [] };
        }
        acc[t.moduloId].items.push(t);
        return acc;
    }, {} as Record<string, { nome: string, items: MeusTrabalhos }>);

    const handleSubmeter = async (itemId: string, fileUrl: string, comentario: string) => {
        setSubmetendo(true);
        try {
            await registarSubmissao(itemId, fileUrl, comentario);
            alert("Trabalho entregue com sucesso!");
        } catch {
            alert("Ocorreu um erro ao submeter o trabalho.");
        } finally {
            setSubmetendo(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
                        Entrega de Trabalhos
                    </h1>
                    <p className="mt-1 text-sm text-gray-400">Gere as tuas tarefas e submissões por módulo</p>
                </div>
            </motion.div>

            {/* KPIs */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <KPI
                    label="Total Trabalhos"
                    value={stats.total}
                    icon={FileText}
                    bg="bg-white dark:bg-gray-900"
                    iconBg="bg-slate-50 dark:bg-gray-800"
                    iconColor="text-slate-600"
                />
                <KPI
                    label="Entregues"
                    value={stats.entregues}
                    icon={CheckCircle2}
                    bg="bg-emerald-50/30 dark:bg-emerald-950/30"
                    iconBg="bg-emerald-50 dark:bg-emerald-900/30"
                    iconColor="text-emerald-600"
                />
                <KPI
                    label="Pendentes"
                    value={stats.pendentes}
                    icon={Clock3}
                    bg="bg-amber-50/30 dark:bg-amber-950/30"
                    iconBg="bg-amber-50 dark:bg-amber-900/30"
                    iconColor="text-amber-600"
                />
                <KPI
                    label="Em Falta"
                    value={stats.emFalta}
                    icon={AlertCircle}
                    bg="bg-red-50/30 dark:bg-red-950/30"
                    iconBg="bg-red-50 dark:bg-red-900/30"
                    iconColor="text-red-600"
                />
            </motion.div>

            {/* Modules List */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-6"
            >
                {Object.entries(groupedTrabalhos).map(([modId, mod], idx) => {
                    const isExpanded = expandedModules.includes(modId) || (expandedModules.length === 0 && idx === 0);
                    const itemsPendentes = mod.items.filter((i) => i.status === 'PENDENTE' || i.status === 'EM_FALTA' || i.status === 'ATRASADO').length;

                    return (
                        <div key={modId} className="bg-white dark:bg-gray-900 rounded-[32px] border border-slate-100/50 dark:border-gray-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
                            <button
                                onClick={() => toggleModule(modId)}
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 shadow-inner">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-gray-100 text-lg truncate">{mod.nome}</h3>
                                        {itemsPendentes > 0 ? (
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/50">{itemsPendentes} {itemsPendentes === 1 ? 'Tarefa pendente' : 'Tarefas pendentes'}</span>
                                        ) : (
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">Tudo entregue</span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="border-t border-slate-100 dark:border-gray-800 overflow-hidden"
                                    >
                                        <div className="p-4 flex flex-col gap-3">
                                            {mod.items.map((trabalho) => (
                                                <TrabalhoCard
                                                    key={trabalho.id}
                                                    trabalho={trabalho}
                                                    onSubmeter={handleSubmeter}
                                                    loading={submetendo}
                                                    moduloNome={mod.nome}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}

                {Object.keys(groupedTrabalhos).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-slate-200 dark:border-gray-700">
                        <FileText className="w-12 h-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">Sem trabalhos atribuídos</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">Ainda não tens trabalhos para entregar de momento.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function TrabalhoCard({ trabalho, onSubmeter, loading, moduloNome }: { trabalho: MeusTrabalhos[number], onSubmeter: (id: string, fileUrl: string, comentario: string) => void, loading: boolean, moduloNome: string }) {
    const [comentario, setComentario] = useState("");
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

    const statusConfig = {
        PENDENTE: { icon: Clock3, color: "bg-indigo-50 text-indigo-700 border-indigo-100/50", label: "Pendente" },
        ENTREGUE: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-100/50", label: "Entregue" },
        EM_FALTA: { icon: AlertCircle, color: "bg-red-50 text-red-700 border-red-100/50", label: "Em falta" },
        ATRASADO: { icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-100/50", label: "Atrasado" },
    };

    const config = statusConfig[trabalho.status as keyof typeof statusConfig] || statusConfig.PENDENTE;
    const StatusIcon = config.icon;

    async function handleSubmit() {
        if (!uploadedFileUrl) return;
        await onSubmeter(trabalho.id, uploadedFileUrl, comentario);
    }

    return (
        <div className="p-4 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/30 dark:bg-gray-900/50 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-bold text-slate-800 dark:text-gray-100">{trabalho.nome}</h4>
                        <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border", config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                        </div>
                    </div>
                    {trabalho.descricao && (
                        <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-1 italic">{trabalho.descricao}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entrega</span>
                        <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                            {trabalho.dataLimite ? new Date(trabalho.dataLimite).toLocaleDateString('pt-PT') : 'Sem prazo'}
                        </span>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant={trabalho.status === 'ENTREGUE' ? "outline" : "default"}
                                size="sm"
                                className={cn(
                                    "rounded-xl font-bold h-9 ml-2",
                                    trabalho.status !== 'ENTREGUE' && "bg-teal-600 hover:bg-teal-700 text-white"
                                )}
                            >
                                {trabalho.status === 'ENTREGUE' ? 'Ver Entrega' : 'Entregar'}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl font-sans">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                    {trabalho.status === 'ENTREGUE' ? 'A tua Entrega' : 'Entregar Trabalho'}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-slate-500">
                                    {trabalho.nome} · {moduloNome}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col gap-6 py-4">
                                {trabalho.descricao && (
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                                            &quot;{trabalho.descricao}&quot;
                                        </p>
                                    </div>
                                )}

                                {trabalho.ficheiroAnexoUrl && (
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-white">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                                            <span className="text-xs font-bold text-slate-700 truncate">Enunciado / Apoio</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-11 sm:h-8 text-teal-600 font-bold shrink-0" asChild>
                                            <a href={trabalho.ficheiroAnexoUrl} download><Download className="w-4 h-4 mr-2" /> Baixar</a>
                                        </Button>
                                    </div>
                                )}

                                {trabalho.status === 'ENTREGUE' && trabalho.submissao && (
                                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-bold text-emerald-700">Trabalho entregue</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600/60">
                                                {new Date(trabalho.submissao.dataEntrega).toLocaleString('pt-PT')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-emerald-100 min-w-0">
                                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-xs font-medium text-slate-700 truncate">{trabalho.submissao.ficheiroUrl}</span>
                                        </div>
                                        {trabalho.submissao.comentario && (
                                            <p className="text-xs text-slate-600 italic">&quot;{trabalho.submissao.comentario}&quot;</p>
                                        )}
                                    </div>
                                )}

                                {trabalho.status !== 'ENTREGUE' && (
                                    <>
                                        <UploadFormando
                                            endpoint="fileUploader"
                                            label="Ficheiro do Trabalho"
                                            description="PDF, ZIP, DOC, XLS (máx. 32MB)"
                                            onUploadComplete={(url) => {
                                                setUploadedFileUrl(url);
                                            }}
                                            variant="dropzone"
                                        />

                                        <div className="grid w-full items-center gap-2">
                                            <Label htmlFor="comentario" className="text-xs font-black uppercase tracking-widest text-slate-400">Comentário (opcional)</Label>
                                            <Textarea
                                                id="comentario"
                                                placeholder="Deixa uma nota para o formador..."
                                                value={comentario}
                                                onChange={(e) => setComentario(e.target.value)}
                                                className="rounded-2xl border-slate-200 focus:ring-teal-500/10 focus:border-teal-500 min-h-[80px] text-sm"
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                onClick={handleSubmit}
                                                disabled={loading || !uploadedFileUrl}
                                                className="w-full h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm transition-all shadow-lg shadow-teal-600/20 active:scale-95"
                                            >
                                                {loading ? 'A enviar...' : 'Submeter Trabalho'}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
