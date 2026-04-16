"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ModuloCard from "./modulo-card";

interface ModuloAtribuido {
  id: string;
  nome: string;
  codigo: string;
  curso: string;
  tags: string[];
  formandos: number;
  status: "Ativo" | "Inativo" | "Concluído";
  estudantes: Array<{
    id: string;
    nome: string;
    email: string;
    dataInscricao: Date;
  }>;
}

interface ModulosPorCursoProps {
  modulos: ModuloAtribuido[];
}

export default function ModulosPorCurso({ modulos }: ModulosPorCursoProps) {
  // Agrupar módulos por curso
  const modulosPorCurso = modulos.reduce(
    (acc, modulo) => {
      if (!acc[modulo.curso]) {
        acc[modulo.curso] = [];
      }
      acc[modulo.curso].push(modulo);
      return acc;
    },
    {} as Record<string, ModuloAtribuido[]>
  );

  // Ordenar cursos alfabeticamente
  const cursos = Object.keys(modulosPorCurso).sort();

  // Estado para controlar quais cursos estão abertos
  const [cursoAberto, setCursoAberto] = useState<Record<string, boolean>>(
    cursos.reduce((acc, curso) => ({ ...acc, [curso]: true }), {})
  );

  const toggleCurso = (curso: string) => {
    setCursoAberto((prev) => ({
      ...prev,
      [curso]: !prev[curso],
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {cursos.map((curso) => {
        const modulosDoCurso = modulosPorCurso[curso];
        const isAberto = cursoAberto[curso];

        return (
          <div
            key={curso}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            {/* Header do Acordeão */}
            <button
              onClick={() => toggleCurso(curso)}
              className="w-full flex items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {curso}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {modulosDoCurso.length} módulo{modulosDoCurso.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Ícone de seta animado */}
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200",
                  isAberto && "rotate-180"
                )}
              />
            </button>

            {/* Conteúdo do Acordeão - Grid de Módulos */}
            {isAberto && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {modulosDoCurso.map((modulo) => (
                    <ModuloCard key={modulo.id} modulo={modulo} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
