"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Search, Star, Users, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { FormadorComDetalhes } from "@/app/dashboard/_data/coordenador";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarUrl(email: string) {
  return `https://i.pravatar.cc/150?u=${email}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormadorUI {
  id: string;
  nome: string;
  email: string;
  avatar: string;
  tags: string[];
  status: "aceite" | "pendente";
  favorito: boolean;
}

function toFormadorUI(f: FormadorComDetalhes): FormadorUI {
  const especialidadeTag = f.especialidade ? [f.especialidade] : [];
  const competenciasTags = f.competencias
    ? f.competencias
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c !== "")
    : [];

  return {
    id: f.id,
    nome: f.user.nome,
    email: f.user.email,
    avatar: getAvatarUrl(f.user.email),
    tags: [...especialidadeTag, ...competenciasTags],
    status: "aceite",
    favorito: false,
  };
}

// ─── Criar Conta Dialog ───────────────────────────────────────────────────────

function CriarContaDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErro("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/formadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro ao criar formador.");
        return;
      }
      setForm({ nome: "", email: "", senha: "" });
      setOpen(false);
      onCreated();
    } catch {
      setErro("Erro de rede. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm rounded-xl px-5">
          <Plus className="h-4 w-4" /> Criar Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Conta de Formador</DialogTitle>
          <DialogDescription>
            Crie uma conta para um formador manualmente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: João Alves"
              value={form.nome}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Ex: joao@email.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senha">
              Password inicial <span className="text-red-500">*</span>
            </Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              placeholder="Escolha uma password"
              value={form.senha}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {erro && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}
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
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />A criar...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Formador Card ────────────────────────────────────────────────────────────

function FormadorCard({
  formador,
  onToggleFavorito,
  onDelete,
}: {
  formador: FormadorUI;
  onToggleFavorito: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = formador.nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleDelete() {
    setDeleting(true);
    await onDelete(formador.id);
    setDeleting(false);
    setShowConfirm(false);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 hover:border-indigo-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border-2 border-gray-100 shrink-0">
          <AvatarImage src={formador.avatar} alt={formador.nome} />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {formador.nome}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleFavorito(formador.id)}
                className="shrink-0 transition-transform hover:scale-110"
                aria-label="Favorito"
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    formador.favorito
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300 hover:text-amber-300",
                  )}
                />
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Eliminar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 4h8a2 2 0 012 2v1H6V6a2 2 0 012-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{formador.email}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {formador.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {formador.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors",
                tag === formador.tags[0]
                  ? "border-indigo-100 bg-indigo-50 text-indigo-600 font-bold"
                  : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <span
          className={cn(
            "rounded-full border px-4 py-1 text-sm font-medium",
            formador.status === "aceite"
              ? "border-green-200 bg-green-50 text-green-600"
              : "border-amber-200 bg-amber-50 text-amber-600",
          )}
        >
          {formador.status === "aceite" ? "Aceite" : "Pendente"}
        </span>
        <Link
          href={`/dashboard/formadores/${formador.id}`}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
        >
          Ver Perfil
        </Link>
      </div>

      {/* Confirmação de eliminação */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
          <div className="bg-white border border-red-200 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 max-w-sm mx-4">
            <span className="text-red-600 text-lg font-bold">
              Eliminar formador?
            </span>
            <span className="text-sm text-gray-600 text-center">
              Esta ação não pode ser desfeita. O formador perderá acesso à
              plataforma.
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Eliminar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FormadoresClient({
  formadores: initialFormadores,
}: {
  formadores: FormadorComDetalhes[];
}) {
  const [formadores, setFormadores] = useState<FormadorUI[]>(
    initialFormadores.map(toFormadorUI),
  );
  const [search, setSearch] = useState("");
  const [apenasFavoritos, setApenasFavoritos] = useState(false);

  async function refreshFormadores() {
    const res = await fetch("/api/formadores");
    if (res.ok) {
      const data: FormadorComDetalhes[] = await res.json();
      setFormadores(data.map(toFormadorUI));
    }
  }

  function toggleFavorito(id: string) {
    setFormadores((prev) =>
      prev.map((f) => (f.id === id ? { ...f, favorito: !f.favorito } : f)),
    );
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/formadores/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setFormadores((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert(data.error || "Erro ao eliminar formador.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de rede ao tentar eliminar o formador.");
    }
  }

  const filtrados = formadores.filter((f) => {
    const matchSearch =
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchFav = apenasFavoritos ? f.favorito : true;
    return matchSearch && matchFav;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Formadores</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {formadores.length} formadores registados
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 text-sm rounded-xl"
            />
          </div>
          <button
            onClick={() => setApenasFavoritos(!apenasFavoritos)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              apenasFavoritos
                ? "border-amber-300 bg-amber-50 text-amber-600"
                : "border-gray-200 bg-white text-gray-600 hover:border-amber-200 hover:text-amber-500",
            )}
          >
            <Star
              className={cn(
                "h-4 w-4",
                apenasFavoritos
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-400",
              )}
            />
            Favoritos
          </button>
          <CriarContaDialog onCreated={refreshFormadores} />
        </div>
      </div>

      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((formador) => (
            <FormadorCard
              key={formador.id}
              formador={formador}
              onToggleFavorito={toggleFavorito}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <Users className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {search || apenasFavoritos
              ? "Nenhum formador encontrado"
              : "Ainda não há formadores registados"}
          </p>
        </div>
      )}
    </div>
  );
}
