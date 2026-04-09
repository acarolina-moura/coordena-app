"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  formando: {
    id: string;
    userId: string;
    nome: string;
    email: string;
    cursoId: string;
    cursoNome: string;
  };
  cursos: { id: string; nome: string }[];
}

export function EditarFormandoClient({ formando, cursos }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: formando.nome,
    email: formando.email,
    cursoId: formando.cursoId,
    novaSenha: "",
  });

  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setErro("");
    setSucesso(false);

    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setErro("");
    setSucesso(false);

    if (!form.nome.trim() || !form.email.trim()) {
      setErro("Nome e email são obrigatórios.");
      return;
    }

    if (form.novaSenha && form.novaSenha.length < 6) {
      setErro("A password deve ter no mínimo 6 caracteres.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/formandos/${formando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formando.userId,
          nome: form.nome.trim(),
          email: form.email.trim(),
          cursoId: form.cursoId || null,
          novaSenha: form.novaSenha || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErro(data?.error ?? "Erro ao guardar alterações.");
        return;
      }

      setSucesso(true);

      setTimeout(() => {
        router.push(`/dashboard/formandos/${formando.id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      console.error(err);
      setErro("Erro de rede. Tenta novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Back */}
      <Link
        href={`/dashboard/formandos/${formando.id}`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Perfil
      </Link>

      <div>
        <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
          Editar Formando
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Atualiza os dados de {formando.nome}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-5">
        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <Label>
            Nome completo <span className="text-red-500">*</span>
          </Label>
          <Input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            disabled={saving}
            placeholder="Ex: João Silva"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={saving}
            placeholder="Ex: joao@email.com"
          />
        </div>

        {/* Curso */}
        <div className="flex flex-col gap-1.5">
          <Label>Curso</Label>
          <select
            name="cursoId"
            value={form.cursoId}
            onChange={handleChange}
            disabled={saving}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Sem curso</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Nova senha */}
        <div className="flex flex-col gap-1.5">
          <Label>
            Nova password{" "}
            <span className="text-xs text-gray-400">(opcional)</span>
          </Label>
          <Input
            name="novaSenha"
            type="password"
            value={form.novaSenha}
            onChange={handleChange}
            disabled={saving}
            placeholder="Deixa em branco para manter a atual"
          />
        </div>

        {/* Feedback */}
        {erro && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-600">
            Alterações guardadas! A redirecionar...
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />A guardar...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Alterações
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
            className="rounded-xl"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
