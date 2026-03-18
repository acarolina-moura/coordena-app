"use client";

import { useState } from "react";
import { Plus, Search, Puzzle, Tag, Users, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
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
import { ModuloComDetalhes, CursoComDetalhes, FormadorComDetalhes } from "@/app/dashboard/_data/coordenador";

// ─── Novo Módulo Dialog ───────────────────────────────────────────────────────

function NovoModuloDialog({ cursos, formadores }: { cursos: CursoComDetalhes[]; formadores: FormadorComDetalhes[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ordem: "",
    cargaHoraria: "",
    cursoId: "",
    formadorId: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!formData.nome.trim()) {
      setError("Nome do módulo é obrigatório");
      return;
    }

    if (!formData.cursoId) {
      setError("Curso é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/modulos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          descricao: formData.descricao?.trim() || null,
          ordem: parseInt(formData.ordem) || 0,
          cargaHoraria: parseInt(formData.cargaHoraria) || 0,
          cursoId: formData.cursoId,
          formadorId: formData.formadorId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar módulo");
      }

      setSuccess(true);
      setFormData({ nome: "", descricao: "", ordem: "", cargaHoraria: "", cursoId: "", formadorId: "" });
      
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl px-5">
          <Plus className="h-4 w-4" />
          Novo Módulo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Módulo</DialogTitle>
          <DialogDescription>
            Preenche os dados para adicionar um novo módulo.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700">Módulo criado com sucesso!</p>
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Curso *</Label>
            <select
              name="cursoId"
              value={formData.cursoId}
              onChange={handleInputChange}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Seleciona um curso...</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Nome do módulo *</Label>
            <Input
              name="nome"
              placeholder="Ex: Design Gráfico"
              value={formData.nome}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Descrição (opcional)</Label>
            <Input
              name="descricao"
              placeholder="Descrição do módulo"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Ordem</Label>
              <Input
                type="number"
                name="ordem"
                placeholder="Ex: 1"
                value={formData.ordem}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Carga horária (horas)</Label>
              <Input
                type="number"
                name="cargaHoraria"
                placeholder="Ex: 120"
                value={formData.cargaHoraria}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Formador (opcional)</Label>
            <select
              name="formadorId"
              value={formData.formadorId}
              onChange={handleInputChange}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Sem formador</option>
              {formadores.map(formador => (
                <option key={formador.id} value={formador.id}>
                  {formador.user.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "A criar..." : "Criar Módulo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Módulo Card ──────────────────────────────────────────────────────────────

function ModuloCard({ modulo, onEditar }: { modulo: ModuloComDetalhes; onEditar: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 flex-1">
          <h3 className="text-base font-bold text-gray-900">{modulo.nome}</h3>
          {modulo.curso && (
            <span className="text-sm text-gray-500">{modulo.curso.nome}</span>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
          <Puzzle className="h-4 w-4 text-indigo-400" />
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
        <span className="font-medium">Ordem: {modulo.ordem}</span>
        <span className="font-medium">{modulo.cargaHoraria}h</span>
      </div>

      {/* Formadores */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-400 shrink-0" />
        {modulo.formadores && modulo.formadores.length > 0 ? (
          <span className="text-sm text-gray-600">{modulo.formadores.map(f => f.user.nome).join(", ")}</span>
        ) : (
          <span className="text-sm font-medium text-amber-500">Sem formador</span>
        )}
      </div>

      {/* Botão Editar */}
      <div className="flex pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditar}
          className="w-full rounded-xl border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50"
        >
          Editar
        </Button>
      </div>
    </div>
  );
}

// ─── Editar Módulo Dialog ─────────────────────────────────────────────────────

function EditarModuloDialog({ modulo, cursos, formadores, onClose }: { modulo: ModuloComDetalhes; cursos: CursoComDetalhes[]; formadores: FormadorComDetalhes[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: modulo.nome,
    descricao: modulo.descricao || "",
    ordem: modulo.ordem.toString(),
    cargaHoraria: modulo.cargaHoraria.toString(),
    cursoId: modulo.cursoId,
    formadorId: modulo.formadores?.[0]?.id || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!formData.nome.trim()) {
      setError("Nome do módulo é obrigatório");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/modulos/${modulo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          descricao: formData.descricao?.trim() || null,
          ordem: parseInt(formData.ordem) || 0,
          cargaHoraria: parseInt(formData.cargaHoraria) || 0,
          cursoId: formData.cursoId,
          formadorId: formData.formadorId || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao atualizar módulo");
      }

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>Atualiza os dados do módulo.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700">Módulo atualizado com sucesso!</p>
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Curso</Label>
            <select
              name="cursoId"
              value={formData.cursoId}
              onChange={handleInputChange}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Nome do módulo</Label>
            <Input
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Descrição</Label>
            <Input
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Ordem</Label>
              <Input
                type="number"
                name="ordem"
                value={formData.ordem}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Carga horária</Label>
              <Input
                type="number"
                name="cargaHoraria"
                value={formData.cargaHoraria}
                onChange={handleInputChange}
                disabled={loading}
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Formador</Label>
            <select
              name="formadorId"
              value={formData.formadorId}
              onChange={handleInputChange}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
            >
              <option value="">Sem formador</option>
              {formadores.map(formador => (
                <option key={formador.id} value={formador.id}>
                  {formador.user.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Modulos Content Component ─────────────────────────────────────────────────

export function ModulosContent({ modulos, cursos, formadores }: { modulos: ModuloComDetalhes[]; cursos: CursoComDetalhes[]; formadores: FormadorComDetalhes[] }) {
  const [search, setSearch] = useState("");
  const [selectedModulo, setSelectedModulo] = useState<ModuloComDetalhes | null>(null);

  const modulosFiltrados = modulos.filter(
    (m) =>
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.curso?.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Módulos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {modulos.length} módulos registados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar módulos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 text-sm rounded-xl"
            />
          </div>
          <NovoModuloDialog cursos={cursos} formadores={formadores} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {modulosFiltrados.length > 0 ? (
          modulosFiltrados.map((modulo) => (
            <ModuloCard key={modulo.id} modulo={modulo} onEditar={() => setSelectedModulo(modulo)} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <Puzzle className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">Nenhum módulo encontrado</p>
          </div>
        )}
      </div>

      {selectedModulo && (
        <EditarModuloDialog modulo={selectedModulo} cursos={cursos} formadores={formadores} onClose={() => setSelectedModulo(null)} />
      )}
    </div>
  );
}
