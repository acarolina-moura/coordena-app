"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, FileText, Loader2, Calendar, Download } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { deleteMaterialApoio } from "../actions";
import { registarMaterialApoio } from "@/app/dashboard/upload-actions";
import { UploadFormando } from "@/components/upload-formando";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  fileUrl: string;
  tipo: string | null;
  createdAt: Date;
  moduloNome: string;
  moduloId: string;
}

interface Modulo {
  id: string;
  nome: string;
}

interface GestaoMateriaisFormadorProps {
  materiais: Material[];
  modulos: Modulo[];
}

function extrairNomeFicheiro(url: string): string {
  try {
    const pathname = url.startsWith("http") ? new URL(url).pathname : url;
    const nome = pathname.split("/").pop();
    if (!nome) return "Ficheiro";
    const partes = nome.split("-");
    if (partes.length > 1 && /^\d+$/.test(partes[0])) {
      return partes.slice(1).join("-");
    }
    return nome;
  } catch {
    return "Ficheiro";
  }
}

function extrairExtensao(url: string): string {
  try {
    const nome = extrairNomeFicheiro(url);
    const ext = nome.split(".").pop()?.toUpperCase();
    return ext || "DOC";
  } catch {
    return "DOC";
  }
}

export function GestaoMateriaisFormador({ materiais, modulos }: GestaoMateriaisFormadorProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [openModules, setOpenModules] = useState<string[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Agrupar materiais por módulo
  const materiaisPorModulo = materiais.reduce((acc, mat) => {
    const key = mat.moduloId || mat.moduloNome;
    if (!acc[key]) {
      acc[key] = { nome: mat.moduloNome, items: [] };
    }
    acc[key].items.push(mat);
    return acc;
  }, {} as Record<string, { nome: string; items: Material[] }>);

  async function handleUploadComplete(url: string, name: string, size: number) {
    if (!titulo.trim() || !moduloId) return;

    startTransition(async () => {
      const result = await registarMaterialApoio(url, titulo, descricao, moduloId, name);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Material carregado com sucesso!");
        setShowForm(false);
        setTitulo("");
        setDescricao("");
        setModuloId("");
        setUploadedFileUrl(null);
        setUploadedFileName(null);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja eliminar este material?")) return;

    startTransition(async () => {
      const result = await deleteMaterialApoio(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Material eliminado!");
      }
    });
  }

  const entries = Object.entries(materiaisPorModulo);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerir Materiais de Apoio</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700 hover:shadow-purple-700/30 active:scale-95"
        >
          {showForm ? "Cancelar" : <><Plus className="h-4 w-4" /> Novo Material</>}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Material</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Ex: Guia de Estudo Módulo 1"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Módulo</label>
                <select
                  value={moduloId}
                  onChange={(e) => setModuloId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                >
                  <option value="">Selecionar módulo...</option>
                  {modulos.map((mod) => (
                    <option key={mod.id} value={mod.id}>
                      {mod.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                placeholder="Breve descrição sobre o conteúdo deste material..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
              />
            </div>

            {/* UploadThing */}
            <UploadFormando
              endpoint="fileUploader"
              label="Ficheiro do Material"
              description="PDF, ZIP, DOC, XLS (máx. 32MB)"
              onUploadComplete={handleUploadComplete}
              variant="dropzone"
              disabled={!titulo.trim() || !moduloId}
            />

            {uploadedFileName && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-2 text-sm">
                <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium truncate">{uploadedFileName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {materiais.length === 0 ? (
        <div className="flex bg-white dark:bg-gray-900 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Nenhum material carregado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece por carregar materiais para os seus alunos.</p>
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={openModules}
          onValueChange={setOpenModules}
          className="flex flex-col gap-3"
        >
          {entries.map(([modId, { nome, items }], idx) => (
            <motion.div
              key={modId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <AccordionItem
                value={modId}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all"
              >
                <AccordionTrigger className="px-5 py-4 [&>svg]:text-gray-400 hover:no-underline">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left flex-1 min-w-0">
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <FileText className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-gray-900 dark:text-gray-100 truncate">{nome}</h3>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{items.length} {items.length === 1 ? "ficheiro" : "ficheiros"}</p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="px-5 pb-4">
                    <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((mat) => (
                        <div
                          key={mat.id}
                          className="group relative flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 transition-colors group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              <FileText className="h-5 w-5" />
                            </div>
                            <span className="inline-flex items-center rounded-full bg-white dark:bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {mat.tipo || extrairExtensao(mat.fileUrl)}
                            </span>
                          </div>

                          <div className="mt-3 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                              {mat.titulo}
                            </h4>
                            {mat.descricao && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                {mat.descricao}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(mat.createdAt), "dd MMM yyyy", { locale: pt })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={mat.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/40 shrink-0"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Abrir ficheiro
                              </a>
                              <button
                                onClick={() => handleDelete(mat.id)}
                                disabled={isPending}
                                className="rounded-lg p-2 text-gray-400 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
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
      )}
    </div>
  );
}
