"use client";

import { useState } from "react";
import { Star, CheckCircle2, Loader2, Send, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { submeterReview } from "../actions";

interface Review {
    nota: number;
    comentario?: string;
    data: Date | string;
}

export interface ModuloReview {
    id: string;
    nome: string;
    cursoNome: string;
    hasReview: boolean;
    review?: Review;
}

interface ReviewListaProps {
    initialModulos: ModuloReview[];
}

export function ReviewLista({ initialModulos }: ReviewListaProps) {
    const [modulos, setModulos] = useState<ModuloReview[]>(initialModulos);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [hoveredIdx, setHoveredIdx] = useState<{ modId: string; star: number } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    async function handleSubmit(moduloId: string, nota: number, comentario: string) {
        if (nota === 0) return;

        setSubmitting(moduloId);

        const res = await submeterReview(moduloId, nota, comentario);

        if (res.success) {
            setModulos(prev =>
                prev.map(m =>
                    m.id === moduloId
                        ? { ...m, hasReview: true, review: { nota, comentario, data: new Date() } }
                        : m
                )
            );
            setEditingId(null);
        }

        setSubmitting(null);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modulos.map(modulo => (
                <div
                    key={modulo.id}
                    className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none mb-1">
                                {modulo.cursoNome}
                            </p>
                            <h3 className="font-bold text-gray-900 line-clamp-1">{modulo.nome}</h3>
                        </div>

                        {modulo.hasReview && (
                            <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold">
                                <CheckCircle2 className="h-3 w-3" />
                                Avaliado
                            </div>
                        )}
                    </div>

                    {!modulo.hasReview || editingId === modulo.id ? (
                        <ReviewForm
                            initialNota={modulo.review?.nota}
                            initialComentario={modulo.review?.comentario}
                            onSubmit={(nota, msg) => handleSubmit(modulo.id, nota, msg)}
                            loading={submitting === modulo.id}
                            hoveredIdx={hoveredIdx?.modId === modulo.id ? hoveredIdx.star : null}
                            setHoveredIdx={star =>
                                setHoveredIdx(star !== null ? { modId: modulo.id, star } : null)
                            }
                            onCancel={editingId === modulo.id ? () => setEditingId(null) : undefined}
                        />
                    ) : (
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 relative group">
                            <button
                                onClick={() => setEditingId(modulo.id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100"
                                title="Editar avaliação"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>

                            <div className="flex gap-1 pr-6">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star
                                        key={s}
                                        className={cn(
                                            "h-4 w-4",
                                            s <= (modulo.review?.nota ?? 0)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-200"
                                        )}
                                    />
                                ))}
                            </div>

                            <p className="text-sm text-gray-600 italic">"{modulo.review?.comentario}"</p>

                            <p className="text-[10px] text-gray-400">
                                Avaliado em{" "}
                                {modulo.review ? new Date(modulo.review.data).toLocaleDateString() : ""}
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function ReviewForm({
    initialNota = 0,
    initialComentario = "",
    onSubmit,
    loading,
    hoveredIdx,
    setHoveredIdx,
    onCancel,
}: {
    initialNota?: number;
    initialComentario?: string;
    onSubmit: (nota: number, comentario: string) => void;
    loading: boolean;
    hoveredIdx: number | null;
    setHoveredIdx: (star: number | null) => void;
    onCancel?: () => void;
}) {
    const [nota, setNota] = useState(initialNota);
    const [comentario, setComentario] = useState(initialComentario);

    return (
        <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Classificação</span>

                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            onMouseEnter={() => setHoveredIdx(s)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            onClick={() => setNota(s)}
                            className="transition-transform hover:scale-110 active:scale-95"
                        >
                            <Star
                                className={cn(
                                    "h-6 w-6 transition-colors",
                                    (hoveredIdx !== null && hoveredIdx >= s) || (hoveredIdx === null && s <= nota)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-200"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">O teu comentário</span>

                <textarea
                    className="w-full rounded-2xl border-gray-100 bg-gray-50 p-4 text-sm focus:ring-teal-500 focus:border-teal-500 min-h-[100px] resize-none"
                    placeholder="O que achaste deste módulo?"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                {onCancel && (
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-none rounded-xl h-11 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        Cancelar
                    </Button>
                )}
                <Button
                    onClick={() => onSubmit(nota, comentario)}
                    disabled={loading || nota === 0}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 rounded-xl h-11 shadow-lg shadow-teal-600/10 gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Enviar</>}
                </Button>
            </div>
        </div>
    );
}