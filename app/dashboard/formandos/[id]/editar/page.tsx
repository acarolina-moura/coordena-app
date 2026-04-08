// Caminho: app/dashboard/formandos/[id]/editar/page.tsx

"use client";

import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFormandoPerfil } from "@/app/dashboard/_data/coordenador";
import { useState } from "react";

export default async function EditarFormandoPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Checagem segura do ID
  if (!id) {
    console.warn("ID do formando não foi fornecido!");
    notFound();
  }

  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COORDENADOR") redirect("/dashboard");

  const perfil = await getFormandoPerfil(id);
  if (!perfil) {
    console.warn(`Formando com id ${id} não encontrado.`);
    notFound();
  }

  // Exemplo de estado local para edição (nome/email)
  const [nome, setNome] = useState(perfil.nome);
  const [email, setEmail] = useState(perfil.email);

  // Função de submit fictícia
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const res = await fetch(`/api/formandos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar formando");
      redirect(`/dashboard/formandos/${id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar alterações");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back */}
      <Link
        href={`/dashboard/formandos/${id}`}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Perfil
      </Link>

      {/* Formulário de edição */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Editar Formando
        </h1>

        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Nome
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
        </label>

        <button
          type="submit"
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors",
          )}
        >
          <Save className="h-4 w-4" />
          Salvar
        </button>
      </form>
    </div>
  );
}
