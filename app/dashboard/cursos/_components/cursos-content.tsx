"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Clock,
  Puzzle,
  GraduationCap,
  X,
  AlertCircle,
  CheckCircle,
  Trash2,
  Loader2,
} from "lucide-react";
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
import { CursoComDetalhes } from "@/app/dashboard/_data/coordenador";

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, string> = {
  ATIVO: "border-green-300 text-green-700 bg-green-50",
  PAUSADO: "border-amber-300 text-amber-700 bg-amber-50",
  ENCERRADO: "border-blue-300 text-blue-700 bg-blue-50",
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  ENCERRADO: "Encerrado",
};

// ─── Novo Curso Dialog ─────────────────────────────────────────────────────────

function NovoCursoDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    cargaHoraria: "",
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setError("");
    setSuccess(false);

    if (!formData.nome.trim()) {
      setError("O nome do curso é obrigatório.");
      return;
    }
    if (!formData.descricao.trim()) {
      setError("A descrição do curso é obrigatória.");
      return;
    }
    if (!formData.dataInicio) {
      setError("A data de início é obrigatória.");
      return;
    }
    if (!formData.dataFim) {
      setError("A data de fim é obrigatória.");
      return;
    }
    if (new Date(formData.dataFim) <= new Date(formData.dataInicio)) {
      setError("A data de fim deve ser posterior à data de início.");
      return;
    }
    if (!formData.cargaHoraria || parseInt(formData.cargaHoraria) <= 0) {
      setError("A carga horária é obrigatória e deve ser maior que 0.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao criar curso");
      }

      setSuccess(true);

      setFormData({
        nome: "",
        descricao: "",
        dataInicio: "",
        dataFim: "",
        cargaHoraria: "",
      });

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
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl px-5">
          <Plus className="h-4 w-4" /> Novo Curso
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
          <DialogDescription>
            Todos os campos são obrigatórios.
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
            <p className="text-sm text-green-700">Curso criado com sucesso!</p>
          </div>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>
              Nome do curso <span className="text-red-500">*</span>
            </Label>
            <Input
              name="nome"
              placeholder="Ex: Técnico de Multimédia"
              value={formData.nome}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              name="descricao"
              placeholder="Descrição do curso"
              value={formData.descricao}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>
                Data de início <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="dataInicio"
                value={formData.dataInicio}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>
                Data de fim <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                name="dataFim"
                value={formData.dataFim}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Carga horária (horas) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="cargaHoraria"
              placeholder="Ex: 1200"
              value={formData.cargaHoraria}
              onChange={handleInputChange}
              disabled={loading}
              min="1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "A criar..." : "Criar Curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detalhes Dialog ───────────────────────────────────────────────────────────

function DetalhesDialog({
  curso,
  onClose,
}: {
  curso: CursoComDetalhes;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 [&>button]:hidden">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {curso.nome}
            </DialogTitle>

            <span
              className={cn(
                "rounded-full border px-3 py-0.5 text-xs font-semibold",
                STATUS_CONFIG[curso.status],
              )}
            >
              {STATUS_LABELS[curso.status]}
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-6 pb-5">
          {[
            { value: `${curso.cargaHoraria}h`, label: "Carga Horária" },
            { value: curso.modulos.length, label: "Módulos" },
            { value: curso.formandos, label: "Formandos" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 py-4 gap-1"
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </span>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
            Módulos ({curso.modulos.length})
          </h3>

          <div className="flex flex-col gap-2">
            {curso.modulos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Sem módulos atribuídos
              </p>
            ) : (
              curso.modulos.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {mod.nome}
                    </span>
                    <span className="text-xs text-gray-400">
                      {mod.cargaHoraria}h
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Curso Row ─────────────────────────────────────────────────────────────────

function CursoRow({
  curso,
  onVerDetalhes,
  onExcluir,
}: {
  curso: CursoComDetalhes;
  onVerDetalhes: () => void;
  onExcluir: () => void;
}) {
  const dataInicio = curso.dataInicio
    ? new Date(curso.dataInicio).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const dataFim = curso.dataFim
    ? new Date(curso.dataFim).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-5 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            {curso.nome}
          </h3>

          <span
            className={cn(
              "shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold",
              STATUS_CONFIG[curso.status],
            )}
          >
            {STATUS_LABELS[curso.status]}
          </span>
        </div>

        <div className="flex gap-5 text-sm text-gray-500 dark:text-gray-400 shrink-0 flex-wrap">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {dataInicio} — {dataFim}
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            {curso.cargaHoraria}h
          </span>

          <span className="flex items-center gap-1.5">
            <Puzzle className="h-4 w-4 text-gray-400" />
            {curso.modulos.length} módulo{curso.modulos.length !== 1 ? "s" : ""}
          </span>

          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            {curso.formandos} formando{curso.formandos !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onVerDetalhes}
          className="shrink-0 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 text-sm px-4"
        >
          Ver Detalhes
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExcluir}
          className="rounded-xl border-red-100 dark:border-red-900 text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 h-9 w-9 p-0 flex items-center justify-center"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Excluir Curso Dialog ──────────────────────────────────────────────────────

function ExcluirCursoDialog({
  curso,
  onClose,
  onConfirm,
}: {
  curso: CursoComDetalhes;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExcluir() {
    setLoading(true);
    setError("");

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir curso");
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" /> Excluir Curso
          </DialogTitle>

          <DialogDescription>
            Tens a certeza que pretendes excluir o curso{" "}
            <span className="font-bold text-gray-900 dark:text-gray-100">
              "{curso.nome}"
            </span>
            ? Esta ação não pode ser desfeita e removerá também todos os módulos
            associados. A ação falhará se existirem formandos inscritos.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={handleExcluir}
            disabled={loading}
            className="rounded-xl bg-red-600 hover:bg-red-700 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />A excluir...
              </>
            ) : (
              "Excluir Curso"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CursosContent({ cursos }: { cursos: CursoComDetalhes[] }) {
  const [search, setSearch] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<CursoComDetalhes | null>(
    null,
  );
  const [cursoParaExcluir, setCursoParaExcluir] =
    useState<CursoComDetalhes | null>(null);

  const filtrados = cursos.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleConfirmExcluir() {
    if (!cursoParaExcluir) return;

    const response = await fetch(`/api/cursos/${cursoParaExcluir.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao excluir curso");
    }

    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Cursos
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {cursos.length} cursos registados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200"
            />
          </div>

          <NovoCursoDialog />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtrados.map((curso) => (
          <CursoRow
            key={curso.id}
            curso={curso}
            onVerDetalhes={() => setSelectedCurso(curso)}
            onExcluir={() => setCursoParaExcluir(curso)}
          />
        ))}

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center">
            <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Nenhum curso encontrado
            </p>
          </div>
        )}
      </div>

      {selectedCurso && (
        <DetalhesDialog
          curso={selectedCurso}
          onClose={() => setSelectedCurso(null)}
        />
      )}

      {cursoParaExcluir && (
        <ExcluirCursoDialog
          curso={cursoParaExcluir}
          onClose={() => setCursoParaExcluir(null)}
          onConfirm={handleConfirmExcluir}
        />
      )}
    </div>
  );
}
