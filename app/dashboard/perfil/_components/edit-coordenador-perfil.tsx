"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateUserPerfil } from "../actions";
import { toast } from "sonner";

interface EditCoordenadorPerfilProps {
  user: {
    id: string;
    nome: string;
    email: string;
    telefone?: string | null;
  };
}

export function EditCoordenadorPerfil({ user }: EditCoordenadorPerfilProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [telefone, setTelefone] = useState(user.telefone || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateUserPerfil(
      user.id,
      nome,
      email,
      telefone,
      novaSenha,
    );

    if (result.sucesso) {
      toast.success(result.mensagem);
      setOpen(false);
    } else {
      toast.error(result.mensagem);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="novaSenha">Nova Senha</Label>
            <Input
              id="novaSenha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Deixe em branco para manter a senha atual"
              minLength={6}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Insira apenas se quiser alterar a senha.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
