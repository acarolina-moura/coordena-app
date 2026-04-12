"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { deleteMaterialApoio } from "../actions";
import { registarMaterialApoio } from "@/app/dashboard/upload-actions";
import { UploadFormando } from "@/components/upload-formando";
import { toast } from "sonner";

interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  fileUrl: string;
  tipo: string | null;
  createdAt: Date;
  moduloNome: string;
}

interface Modulo {
  id: string;
  nome: string;
}

interface GestaoMateriaisFormadorProps {
  materiais: Material[];
  modulos: Modulo[];
}

export function GestaoMateriaisFormador({ materiais, modulos }: GestaoMateriaisFormadorProps) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [moduloId, setModuloId] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  async function handleUploadComplete(url: string, name: string, size: number) {
    if (!titulo.trim() || !moduloId) return;

    startTransition(async () => {
      const result = await registarMaterialApoio(url, titulo, descricao, moduloId);
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Módulo</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {materiais.map((mat) => (
                <tr key={mat.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{mat.titulo}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mat.tipo || "ficheiro"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{mat.moduloNome}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-500">
                    {format(new Date(mat.createdAt), "dd/MM/yyyy", { locale: pt })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(mat.id)}
                      disabled={isPending}
                      className="rounded-lg p-2 text-gray-400 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
