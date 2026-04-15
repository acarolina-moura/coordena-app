"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { criarConvite } from "../actions";

interface Formador {
  id: string;
  user: {
    nome: string;
  };
}

interface Modulo {
  id: string;
  nome: string;
  curso?: {
    nome: string;
  } | null;
  formadores: {
    formador: Formador;
  }[];
}

interface Curso {
  id: string;
  nome: string;
}

interface ConviteFormProps {
  formadores: Formador[];
  modulos: Modulo[];
  cursos: Curso[];
}

export function ConviteForm({
  formadores: initialFormadores,
  modulos,
  cursos,
}: ConviteFormProps) {
  const [selectedModulo, setSelectedModulo] = useState<string>("");
  const [availableFormadores, setAvailableFormadores] =
    useState<Formador[]>(initialFormadores);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar formadores disponíveis quando o módulo muda
  useEffect(() => {
    if (selectedModulo) {
      const modulo = modulos.find((m) => m.id === selectedModulo);
      if (modulo) {
        const formadoresDoModulo = modulo.formadores.map((fm) => fm.formador);
        setAvailableFormadores(formadoresDoModulo);
      }
    } else {
      setAvailableFormadores(initialFormadores);
    }
  }, [selectedModulo, modulos, initialFormadores]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await criarConvite(formData);
      // Reset form
      setSelectedModulo("");
      setAvailableFormadores(initialFormadores);
    } catch (error) {
      console.error("Erro ao criar convite:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4 dark:text-gray-100">
        <Plus className="h-5 w-5 text-indigo-500" /> Novo Convite
      </h2>
      <form action={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium dark:text-gray-300">
            Módulo
          </label>
          <select
            name="moduloId"
            value={selectedModulo}
            onChange={(e) => setSelectedModulo(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            required
          >
            <option value="">Selecione um módulo...</option>
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} - {m.curso?.nome || "Módulo Independente"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium dark:text-gray-300">
            Formador
          </label>
          <select
            name="formadorId"
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            required
            disabled={!selectedModulo}
          >
            <option value="">
              {selectedModulo
                ? "Selecione um formador..."
                : "Selecione um módulo primeiro"}
            </option>
            {availableFormadores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.user.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium dark:text-gray-300">
            Mensagem
          </label>
          <textarea
            name="descricao"
            rows={3}
            placeholder="Escreva o convite..."
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 p-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedModulo}
          className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enviando..." : "Enviar Convite"}
        </button>
      </form>
    </div>
  );
}
