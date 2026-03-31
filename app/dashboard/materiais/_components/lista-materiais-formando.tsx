"use client";

import { BookOpen, Download, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  fileUrl: string;
  tipo: string | null;
  createdAt: Date;
  moduloNome: string;
  cursoNome: string;
  formadorNome: string;
}

interface ListaMateriaisFormandoProps {
  materiais: Material[];
}

export function ListaMateriaisFormando({ materiais }: ListaMateriaisFormandoProps) {
  if (materiais.length === 0) {
    return (
      <div className="flex bg-white dark:bg-gray-900 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 p-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-gray-800">
          <BookOpen className="h-8 w-8 text-slate-400 dark:text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-gray-100">Ainda não há materiais de apoio</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400 max-w-xs">
          Os materiais de apoio carregados pelos teus formadores aparecerão aqui.
        </p>
      </div>
    );
  }

  const materiaisAgrupados = materiais.reduce((acc, mat) => {
    const key = `${mat.cursoNome} - ${mat.moduloNome}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(mat);
    return acc;
  }, {} as Record<string, Material[]>);

  return (
    <div className="space-y-8">
      {Object.entries(materiaisAgrupados).map(([grupo, items]) => (
        <section key={grupo} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-teal-500 rounded-full" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{grupo}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((material) => (
              <div
                key={material.id}
                className="group relative flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-5 transition-all hover:border-teal-500/50 dark:hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-500 transition-colors group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-gray-300">
                    {material.tipo || "DOC"}
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {material.titulo}
                  </h3>
                  {material.descricao && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {material.descricao}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(material.createdAt), "dd MMM yyyy", { locale: pt })}</span>
                  </div>
                  
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
