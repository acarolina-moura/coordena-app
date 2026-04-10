"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adicionarFormando } from "../actions";

type Curso = {
  id: string;
  nome: string;
};

export default function NovoFormandoPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCursos() {
      const res = await fetch("/api/cursos");
      if (res.ok) {
        const data = await res.json();
        setCursos(data);
      }
    }
    fetchCursos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (senha.length < 6) {
      alert("Senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!cursoId) {
      alert("Selecione um curso");
      setLoading(false);
      return;
    }

    const res = await adicionarFormando({
      nome,
      email,
      senha,
      telefone,
      cursoId,
    });
    if (res.sucesso) {
      alert(res.mensagem);
      router.push("/dashboard/formandos");
    } else {
      alert(res.mensagem);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Novo Formando
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione um novo formando ao sistema
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="+351 912 345 678"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="curso">Curso *</Label>
            <select
              id="curso"
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            >
              <option value="">Selecione um curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha *</Label>
          <Input
            id="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Criando..." : "Criar Formando"}
          </Button>
        </div>
      </form>
    </div>
  );
}
