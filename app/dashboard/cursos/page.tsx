// "use client";

// import { useState } from "react";
// import {
//   Plus, Search, CalendarDays, Clock, Puzzle, GraduationCap, X,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type CursoStatus = "Ativo" | "Em Preparação" | "Concluído" | "Inativo";

// interface Modulo {
//   nome: string;
//   codigo: string;
//   tags: string[];
// }

// interface Curso {
//   id: number;
//   nome: string;
//   status: CursoStatus;
//   dataInicio: string;
//   dataFim: string;
//   cargaHoraria: number;
//   modulos: Modulo[];
//   formandos: number;
// }

// // ─── Mock Data ────────────────────────────────────────────────────────────────

// const cursosData: Curso[] = [
//   {
//     id: 1,
//     nome: "Técnico de Multimédia",
//     status: "Ativo",
//     dataInicio: "15 set 2025",
//     dataFim: "30 jun 2026",
//     cargaHoraria: 1200,
//     formandos: 4,
//     modulos: [
//       { nome: "Design Gráfico",      codigo: "UFCD-0145", tags: ["Design", "Photoshop", "Illustrator"] },
//       { nome: "Desenvolvimento Web",  codigo: "UFCD-0577", tags: ["HTML", "CSS", "JavaScript"] },
//       { nome: "Marketing Digital",   codigo: "UFCD-9214", tags: ["Marketing", "SEO", "Redes Sociais"] },
//     ],
//   },
//   {
//     id: 2,
//     nome: "Técnico de Informática",
//     status: "Ativo",
//     dataInicio: "01 out 2025",
//     dataFim: "15 jul 2026",
//     cargaHoraria: 1100,
//     formandos: 2,
//     modulos: [
//       { nome: "Redes de Computadores", codigo: "UFCD-0773", tags: ["Redes", "TCP/IP", "Cisco"] },
//       { nome: "Bases de Dados",        codigo: "UFCD-0787", tags: ["SQL", "MySQL", "MongoDB"] },
//     ],
//   },
//   {
//     id: 3,
//     nome: "Gestão de Empresas",
//     status: "Em Preparação",
//     dataInicio: "10 jan 2026",
//     dataFim: "30 set 2026",
//     cargaHoraria: 900,
//     formandos: 0,
//     modulos: [
//       { nome: "Contabilidade Geral", codigo: "UFCD-0567", tags: ["Contabilidade", "Finanças"] },
//     ],
//   },
// ];

// // ─── Config ───────────────────────────────────────────────────────────────────

// const STATUS_CONFIG: Record<CursoStatus, string> = {
//   "Ativo":         "border-green-300 text-green-700 bg-green-50",
//   "Em Preparação": "border-amber-300 text-amber-700 bg-amber-50",
//   "Concluído":     "border-blue-300 text-blue-700 bg-blue-50",
//   "Inativo":       "border-gray-300 text-gray-500 bg-gray-50",
// };

// // ─── Novo Curso Dialog ────────────────────────────────────────────────────────

// function NovoCursoDialog() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-xl px-5">
//           <Plus className="h-4 w-4" /> Novo Curso
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Criar Novo Curso</DialogTitle>
//           <DialogDescription>Preenche os dados para criar um novo curso.</DialogDescription>
//         </DialogHeader>
//         <div className="flex flex-col gap-4 py-2">
//           <div className="flex flex-col gap-1.5">
//             <Label>Nome do curso</Label>
//             <Input placeholder="Ex: Técnico de Multimédia" />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div className="flex flex-col gap-1.5">
//               <Label>Data de início</Label>
//               <Input type="date" />
//             </div>
//             <div className="flex flex-col gap-1.5">
//               <Label>Data de fim</Label>
//               <Input type="date" />
//             </div>
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <Label>Carga horária (horas)</Label>
//             <Input type="number" placeholder="Ex: 1200" />
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline">Cancelar</Button>
//           <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Criar Curso</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Detalhes Dialog ──────────────────────────────────────────────────────────

// function DetalhesDialog({ curso, onClose }: { curso: Curso; onClose: () => void }) {
//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 [&>button]:hidden">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
//           <div className="flex items-center gap-3 flex-wrap">
//             <DialogTitle className="text-lg font-bold text-gray-900">
//               {curso.nome}
//             </DialogTitle>
//             <span className={cn(
//               "rounded-full border px-3 py-0.5 text-xs font-semibold",
//               STATUS_CONFIG[curso.status]
//             )}>
//               {curso.status}
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-3 px-6 pb-5">
//           {[
//             { value: `${curso.cargaHoraria}h`, label: "Carga Horária" },
//             { value: curso.modulos.length,      label: "Módulos" },
//             { value: curso.formandos,            label: "Formandos" },
//           ].map((stat) => (
//             <div key={stat.label} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-100 py-4 gap-1">
//               <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
//               <span className="text-xs text-gray-400">{stat.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* Módulos */}
//         <div className="px-6 pb-6">
//           <h3 className="text-sm font-bold text-gray-900 mb-3">Módulos</h3>
//           <div className="flex flex-col gap-2">
//             {curso.modulos.map((mod) => (
//               <div
//                 key={mod.codigo}
//                 className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
//               >
//                 <div className="flex flex-col gap-0.5 min-w-0">
//                   <span className="text-sm font-semibold text-gray-800">{mod.nome}</span>
//                   <span className="text-xs text-indigo-500">{mod.codigo}</span>
//                 </div>
//                 <div className="flex flex-wrap gap-1.5 justify-end">
//                   {mod.tags.map((tag) => (
//                     <span
//                       key={tag}
//                       className="rounded-full border border-indigo-100 bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Curso Row ────────────────────────────────────────────────────────────────

// function CursoRow({ curso, onVerDetalhes }: { curso: Curso; onVerDetalhes: () => void }) {
//   return (
//     <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 hover:border-indigo-200 hover:shadow-sm transition-all">

//       <div className="flex flex-col gap-3">
//           <div className="flex items-center gap-3 min-w-0 flex-1">
//             <h3 className="text-base font-bold text-gray-900 truncate">{curso.nome}</h3>
//             <span className={cn(
//               "shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold",
//               STATUS_CONFIG[curso.status]
//             )}>
//               {curso.status}
//             </span>
//           </div>

//           <div className="flex gap-5 text-sm text-gray-500 shrink-0">

//             <span className="flex items-center gap-1.5">
//               <CalendarDays className="h-4 w-4 text-gray-400" />
//               {curso.dataInicio} – {curso.dataFim}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <Clock className="h-4 w-4 text-gray-400" />
//               {curso.cargaHoraria}h
//             </span>
//             <span className="flex items-center gap-1.5">
//               <Puzzle className="h-4 w-4 text-gray-400" />
//               {curso.modulos.length} módulo{curso.modulos.length !== 1 ? "s" : ""}
//             </span>
//             <span className="flex items-center gap-1.5">
//               <GraduationCap className="h-4 w-4 text-gray-400" />
//               {curso.formandos} formando{curso.formandos !== 1 ? "s" : ""}
//             </span>
//           </div>
//       </div>

//         <div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={onVerDetalhes}
//             className="shrink-0 rounded-xl border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 text-sm px-4"
//           >
//             Ver Detalhes
//           </Button>
//         </div>
//     </div>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function CursosPage() {
//   const [search, setSearch] = useState("");
//   const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);

//   const filtrados = cursosData.filter((c) =>
//     c.nome.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//         <div>
//           <h1 className="text-[26px] font-bold text-gray-900">Cursos</h1>
//           <p className="mt-0.5 text-sm text-gray-500">{cursosData.length} cursos registados</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="relative w-64">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <Input
//               placeholder="Pesquisar cursos..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-9 bg-white border-gray-200 text-sm rounded-xl"
//             />
//           </div>
//           <NovoCursoDialog />
//         </div>
//       </div>

//       <div className="flex flex-col gap-3">
//         {filtrados.map((curso) => (
//           <CursoRow key={curso.id} curso={curso} onVerDetalhes={() => setSelectedCurso(curso)} />
//         ))}
//         {filtrados.length === 0 && (
//           <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
//             <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
//             <p className="text-sm font-medium text-gray-500">Nenhum curso encontrado</p>
//           </div>
//         )}
//       </div>

//       {selectedCurso && (
//         <DetalhesDialog curso={selectedCurso} onClose={() => setSelectedCurso(null)} />
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CalendarDays,
  Clock,
  Puzzle,
  GraduationCap,
  X,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type CursoStatus = "ATIVO" | "PAUSADO" | "ENCERRADO";

interface Curso {
  id: string;
  nome: string;
  status: CursoStatus;
  dataInicio: string | null;
  dataFim: string | null;
  cargaHoraria: number;
  totalModulos: number;
  totalFormandos: number;
  descricao?: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<CursoStatus, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  ENCERRADO: "Encerrado",
};

const STATUS_CONFIG: Record<CursoStatus, string> = {
  ATIVO: "border-green-300 text-green-700 bg-green-50",
  PAUSADO: "border-amber-300 text-amber-700 bg-amber-50",
  ENCERRADO: "border-gray-300 text-gray-500 bg-gray-50",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Novo Curso Dialog ────────────────────────────────────────────────────────

interface NovoCursoDialogProps {
  onCursoCreated: () => void;
}

function NovoCursoDialog({ onCursoCreated }: NovoCursoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    status: "ATIVO" as CursoStatus,
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setErro(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.nome.trim()) {
      setErro("O nome do curso é obrigatório.");
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || undefined,
          dataInicio: form.dataInicio || null,
          dataFim: form.dataFim || null,
          status: form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Erro ao criar curso.");
        return;
      }

      // Reset e fecha
      setForm({
        nome: "",
        descricao: "",
        dataInicio: "",
        dataFim: "",
        status: "ATIVO",
      });
      setOpen(false);
      onCursoCreated();
    } catch {
      setErro("Erro de rede. Tenta novamente.");
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
            Preenche os dados para criar um novo curso.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">
              Nome do curso <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Técnico de Multimédia"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">
              Descrição{" "}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <Input
              id="descricao"
              name="descricao"
              placeholder="Breve descrição do curso..."
              value={form.descricao}
              onChange={handleChange}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataInicio">Data de início</Label>
              <Input
                id="dataInicio"
                name="dataInicio"
                type="date"
                value={form.dataInicio}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataFim">Data de fim</Label>
              <Input
                id="dataFim"
                name="dataFim"
                type="date"
                value={form.dataFim}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="flex h-9 w-full rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ATIVO">Ativo</option>
              <option value="PAUSADO">Pausado</option>
              <option value="ENCERRADO">Encerrado</option>
            </select>
          </div>

          {/* Erro */}
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> A criar...
              </>
            ) : (
              "Criar Curso"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Curso Row ────────────────────────────────────────────────────────────────

function CursoRow({ curso }: { curso: Curso }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {curso.nome}
          </h3>
          <span
            className={cn(
              "shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold",
              STATUS_CONFIG[curso.status],
            )}
          >
            {STATUS_LABEL[curso.status]}
          </span>
        </div>

        {curso.descricao && (
          <p className="text-sm text-gray-400 -mt-1">{curso.descricao}</p>
        )}

        <div className="flex gap-5 text-sm text-gray-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {formatDate(curso.dataInicio)} – {formatDate(curso.dataFim)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            {curso.cargaHoraria}h
          </span>
          <span className="flex items-center gap-1.5">
            <Puzzle className="h-4 w-4 text-gray-400" />
            {curso.totalModulos} módulo{curso.totalModulos !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            {curso.totalFormandos} formando
            {curso.totalFormandos !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CursosPage() {
  const [search, setSearch] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchCursos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/cursos");
      if (!res.ok) throw new Error("Erro ao carregar cursos");
      const data = await res.json();
      setCursos(data);
    } catch {
      setErro("Não foi possível carregar os cursos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCursos();
  }, [fetchCursos]);

  const filtrados = cursos.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Cursos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading
              ? "A carregar..."
              : `${cursos.length} curso${cursos.length !== 1 ? "s" : ""} registado${cursos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-gray-200 text-sm rounded-xl"
            />
          </div>
          <NovoCursoDialog onCursoCreated={fetchCursos} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        )}

        {/* Erro */}
        {!loading && erro && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-12 text-center gap-2">
            <X className="h-8 w-8 text-red-300" />
            <p className="text-sm font-medium text-red-500">{erro}</p>
            <button
              onClick={fetchCursos}
              className="text-xs text-indigo-600 underline mt-1"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista */}
        {!loading &&
          !erro &&
          filtrados.map((curso) => <CursoRow key={curso.id} curso={curso} />)}

        {/* Vazio */}
        {!loading && !erro && filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {search
                ? "Nenhum curso encontrado"
                : "Ainda não há cursos criados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
