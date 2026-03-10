"use client";

import { useState } from "react";
import {
  Plus, Search, Star, Mail, Phone, GraduationCap,
  MoreVertical, Eye, Pencil, Trash2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FormandoComDetalhes, CursoComDetalhes } from "@/app/dashboard/_data/coordenador";
import { adicionarFormando } from "./actions";
import { VerPerfilDialog } from "./ver-perfil-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormandoStatus = "ATIVO" | "INATIVO" | "CONCLUÍDO";

interface FormandoUI extends FormandoComDetalhes {
  status: FormandoStatus;
  favorito: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FormandoStatus, { label: string; className: string }> = {
  ATIVO:     { label: "Ativo",     className: "bg-green-100 text-green-700" },
  INATIVO:   { label: "Inativo",   className: "bg-gray-100 text-gray-500" },
  CONCLUÍDO: { label: "Concluído", className: "bg-blue-100 text-blue-700" },
};

const FILTER_TABS: { label: string; value: FormandoStatus | "todos" | "risco" }[] = [
  { label: "Todos",       value: "todos" },
  { label: "Ativos",      value: "ATIVO" },
  { label: "Em Risco",    value: "risco" },
  { label: "Concluídos",  value: "CONCLUÍDO" },
  { label: "Inativos",    value: "INATIVO" },
];

// ─── Add Formando Dialog ──────────────────────────────────────────────────────

interface AdicionarFormandoDialogProps {
  cursos: CursoComDetalhes[];
}

function AdicionarFormandoDialog({ cursos }: AdicionarFormandoDialogProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cursoId, setCursoId] = useState(cursos[0]?.id || "");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await adicionarFormando({
        nome,
        email,
        telefone: telefone || undefined,
        cursoId,
      });

      if (resultado.sucesso) {
        // Limpar formulário e fechar diálogo
        setNome("");
        setEmail("");
        setTelefone("");
        setCursoId(cursos[0]?.id || "");
        setOpen(false);
        // Mostrar mensagem de sucesso
        console.log("✅ " + resultado.mensagem);
      } else {
        setErro(resultado.mensagem);
      }
    } catch (err) {
      setErro("Erro ao adicionar formando. Tenta novamente.");
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4" /> Novo Formando
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Formando</DialogTitle>
          <DialogDescription>Preenche os dados do novo formando.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label>Nome completo</Label>
            <Input
              placeholder="Ex: Ana Sousa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="formando@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Telefone (opcional)</Label>
            <Input
              placeholder="+351 9XX XXX XXX"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Curso</Label>
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
              className="flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              required
            >
              <option value="">Seleciona um curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.nome}
                </option>
              ))}
            </select>
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erro}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={carregando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={carregando}
            >
              {carregando ? "A guardar..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Formando Card ────────────────────────────────────────────────────────────

function FormandoCard({
  formando,
  onToggleFavorito,
}: {
  formando: FormandoUI;
  onToggleFavorito: (id: string) => void;
}) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const initials = formando.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const statusCfg = STATUS_CONFIG[formando.status];

  return (
    <>
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-gray-100 shrink-0">
            <AvatarImage src={formando.avatar} />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-gray-900 truncate">{formando.nome}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onToggleFavorito(formando.id)}>
                  <Star className={cn("h-4 w-4 transition-colors", formando.favorito ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-300")} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      className="gap-2 text-sm cursor-pointer"
                      onClick={() => setPerfilAberto(true)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm"><Pencil className="h-3.5 w-3.5" /> Editar</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-sm text-red-500 focus:text-red-500"><Trash2 className="h-3.5 w-3.5" /> Remover</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <span className="text-xs text-gray-500 truncate">{formando.email}</span>
          </div>
        </div>

        {/* Curso + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-600 truncate">{formando.curso}</span>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", statusCfg.className)}>
            {statusCfg.label}
          </span>
        </div>

        {/* Progresso */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Progresso</span>
            <span className="font-semibold text-gray-700">{formando.progresso}%</span>
          </div>
          <Progress
            value={formando.progresso}
            className={cn("h-2 bg-gray-100",
              formando.status === "CONCLUÍDO" && "[&>*]:bg-blue-500",
              formando.status === "ATIVO" && "[&>*]:bg-indigo-500",
              formando.status === "INATIVO" && "[&>*]:bg-gray-300",
            )}
          />
        </div>

        {/* Negativos alert */}
        {formando.negativos > 0 && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            formando.negativos >= 2 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
          )}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {formando.negativos} avaliação{formando.negativos > 1 ? "ões" : ""} negativa{formando.negativos > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <VerPerfilDialog
        formandoId={formando.id}
        formandoNome={formando.nome}
        open={perfilAberto}
        onOpenChange={setPerfilAberto}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FormandosContent({ data, cursos }: { data: FormandoComDetalhes[]; cursos: CursoComDetalhes[] }) {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<FormandoStatus | "todos" | "risco">("todos");
  const [formandos, setFormandos] = useState<FormandoUI[]>(
    data.map(f => ({ ...f, status: f.status as FormandoStatus, favorito: false }))
  );

  const toggleFavorito = (id: string) =>
    setFormandos((prev) => prev.map((f) => f.id === id ? { ...f, favorito: !f.favorito } : f));

  const counts = {
    todos:     formandos.length,
    ATIVO:     formandos.filter((f) => f.status === "ATIVO").length,
    risco:     formandos.filter((f) => f.negativos > 0).length,
    CONCLUÍDO: formandos.filter((f) => f.status === "CONCLUÍDO").length,
    INATIVO:   formandos.filter((f) => f.status === "INATIVO").length,
  };

  const filtrados = formandos.filter((f) => {
    const matchSearch =
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.curso.toLowerCase().includes(search.toLowerCase());
    const matchFiltro =
      filtro === "todos" ? true :
      filtro === "risco" ? f.negativos > 0 :
      f.status === filtro;
    return matchSearch && matchFiltro;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Formandos</h1>
          <p className="mt-0.5 text-sm text-gray-500">{formandos.length} formandos registados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white border-gray-200 text-sm" />
          </div>
          <AdicionarFormandoDialog cursos={cursos} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFiltro(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              filtro === tab.value ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {tab.value === "risco" && <AlertTriangle className="h-3 w-3" />}
            {tab.label}
            <span className={cn("rounded-full px-1.5 text-[10px] font-bold",
              filtro === tab.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            )}>
              {counts[tab.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((formando) => (
            <FormandoCard key={formando.id} formando={formando} onToggleFavorito={toggleFavorito} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">Nenhum formando encontrado</p>
          <p className="text-xs text-gray-400 mt-1">Tenta ajustar a pesquisa ou os filtros</p>
        </div>
      )}
    </div>
  );
}
