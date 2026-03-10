'use client';

import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Mail, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getFormandoPerfil } from "@/app/dashboard/_data/coordenador";
import type { FormandoPerfil } from "@/app/dashboard/_data/coordenador";
import { cn } from "@/lib/utils";

interface VerPerfilDialogProps {
  formandoId: string;
  formandoNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerPerfilDialog({
  formandoId,
  formandoNome,
  open,
  onOpenChange,
}: VerPerfilDialogProps) {
  const [perfil, setPerfil] = useState<FormandoPerfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!open) return;

    const carregarPerfil = async () => {
      try {
        setCarregando(true);
        // Nota: Esta é uma função server, vamos chamar uma API
        const response = await fetch(`/api/formandos/${formandoId}`);
        const data = await response.json();
        setPerfil(data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [formandoId, open]);

  const initials = formandoNome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const mediaNota =
    perfil?.avaliacoes.length && perfil.avaliacoes.length > 0
      ? (perfil.avaliacoes.reduce((sum, a) => sum + a.nota, 0) / perfil.avaliacoes.length).toFixed(1)
      : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil do Formando</DialogTitle>
        </DialogHeader>

        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">A carregar perfil...</p>
          </div>
        ) : perfil ? (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <Avatar className="h-16 w-16 border-2 border-indigo-200">
                <AvatarImage src={perfil.avatar} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{perfil.nome}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Mail className="h-4 w-4" />
                  {perfil.email}
                </div>
                {perfil.avaliacoes.length > 0 && (
                  <div className="mt-3 flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-indigo-600">
                        {mediaNota}
                      </span>
                      <span className="text-sm text-gray-600">Média de notas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {perfil.avaliacoes.length}
                      </span>
                      <span className="text-sm text-gray-600">Avaliações</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cursos */}
            {perfil.cursos.length > 0 ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Cursos Inscritos
                </h3>

                {perfil.cursos.map((curso) => (
                  <div
                    key={curso.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900">{curso.nome}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Carga Horária: {curso.cargaHoraria}h
                        {curso.dataInicio && (
                          <>
                            {" "}
                            • Início:{" "}
                            {new Date(curso.dataInicio).toLocaleDateString("pt-PT")}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Módulos */}
                    {curso.modulos.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 mb-2">
                          Módulos ({curso.modulos.length})
                        </p>
                        {curso.modulos.map((modulo) => (
                          <div
                            key={modulo.id}
                            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {modulo.nome}
                              </p>
                              <p className="text-xs text-gray-500">
                                {modulo.cargaHoraria}h
                              </p>
                            </div>
                            {modulo.nota !== null ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center",
                                    modulo.nota >= 10
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  )}
                                >
                                  {modulo.nota.toFixed(1)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Sem avaliação
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Sem módulos</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-sm text-gray-600">
                  Formando não está inscrito em nenhum curso
                </p>
              </div>
            )}

            {/* Resumo de Avaliações */}
            {perfil.avaliacoes.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Resumo de Avaliações
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {perfil.avaliacoes.length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="text-sm text-gray-600">Positivas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {perfil.avaliacoes.filter((a) => a.nota >= 10).length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-sm text-gray-600">Negativas</p>
                    <p className="text-2xl font-bold text-red-600">
                      {perfil.avaliacoes.filter((a) => a.nota < 10).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Formando não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
