"use client";

import { useState } from "react";
import { BookOpen, Download, FileText, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
  const [openModules, setOpenModules] = useState<string[]>([]);

  if (materiais.length === 0) {
    return (
      <div className="flex bg-white dark:bg-gray-900 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 sm:p-12 lg:p-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
          <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Ainda não há materiais de apoio</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Os materiais de apoio carregados pelos teus formadores aparecerão aqui.
        </p>
      </div>
    );
  }

  // Agrupar por curso + módulo
  const materiaisAgrupados = materiais.reduce((acc, mat) => {
    const key = `${mat.cursoNome} - ${mat.moduloNome}`;
    if (!acc[key]) acc[key] = { curso: mat.cursoNome, modulo: mat.moduloNome, items: [] };
    acc[key].items.push(mat);
    return acc;
  }, {} as Record<string, { curso: string; modulo: string; items: Material[] }>);

  const entries = Object.entries(materiaisAgrupados);
  const totalMateriais = entries.reduce((acc, [, g]) => acc + g.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="flex items-center gap-3 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 px-5 py-3">
        <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-500 shrink-0" />
        <div>
          <p className="text-2xl font-black text-teal-700 dark:text-teal-400">{totalMateriais}</p>
          <p className="text-[10px] font-bold text-teal-500 dark:text-teal-400 uppercase tracking-widest">{entries.length} módulo{entries.length > 1 ? "s" : ""} com materiais</p>
        </div>
      </div>

      {/* Accordion */}
      <Accordion
        type="multiple"
        value={openModules}
        onValueChange={setOpenModules}
        className="flex flex-col gap-3"
      >
        {entries.map(([key, { curso, modulo, items }], idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <AccordionItem
              value={key}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all"
            >
              <AccordionTrigger className="px-5 py-4 [&>svg]:text-gray-400 hover:no-underline">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left flex-1 min-w-0">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-500">
                    <FileText className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-gray-900 dark:text-gray-100 truncate">{modulo}</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{curso}</p>
                  </div>

                  {/* Count badge */}
                  <div className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1">
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">{items.length}</span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">ficheiro{items.length > 1 ? "s" : ""}</span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="px-5 pb-4">
                  <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((material) => (
                      <div
                        key={material.id}
                        className="group relative flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 transition-colors group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <span className="inline-flex items-center rounded-full bg-white dark:bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {material.tipo || "DOC"}
                          </span>
                        </div>

                        <div className="mt-3 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                            {material.titulo}
                          </h4>
                          {material.descricao && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {material.descricao}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(material.createdAt), "dd MMM yyyy", { locale: pt })}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                              <User className="h-3 w-3" />
                              {material.formadorNome}
                            </span>
                          </div>

                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/40 shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
