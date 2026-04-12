// app/dashboard/_data/coordenador.ts

import { prisma } from "@/lib/prisma";
import { 
  filtroCursosCoordenador, 
  filtroInscricoesCoordenador, 
  filtroModulosCoordenador,
  filtroFormadoresCoordenador,
  filtroFormandosCoordenador 
} from "@/lib/coordenador-utils";
import type { AssiduidadeFormando } from "../assiduidade/_components/coordenador-assiduidade";

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getCoordenadorStats() {
  const cursosFilter = await filtroCursosCoordenador({ status: "ATIVO" });
  
  const [cursos, formadores, formandos] = await Promise.all([
    prisma.curso.count({ where: cursosFilter }),
    prisma.formador.count({ where: await filtroFormadoresCoordenador() }),
    prisma.formando.count({ where: await filtroFormandosCoordenador() }),
  ]);
  return { cursos, formadores, formandos };
}

// ─── Próximas Sessões ─────────────────────────────────────────────────────────

export async function getProximasSessoes() {
  const agora = new Date();
  const modulosFilter = await filtroModulosCoordenador();
  
  const aulas = await prisma.aula.findMany({
    where: { 
      dataHora: { gte: agora },
      modulo: modulosFilter
    },
    orderBy: { dataHora: "asc" },
    take: 4,
    include: {
      modulo: { include: { curso: true } },
      formador: { include: { user: true } },
    },
  });
  return aulas.map((aula) => ({
    id: aula.id,
    titulo: `${aula.modulo.curso.nome} · ${aula.titulo}`,
    formador: aula.formador.user.nome,
    dataHora: aula.dataHora,
    duracao: aula.duracao,
  }));
}

// ─── Formandos em Risco ───────────────────────────────────────────────────────

type FormandoRiscoResult = {
  id: string;
  nome: string;
  curso: string;
  negativas: number;
};

export async function getFormandosEmRisco(): Promise<FormandoRiscoResult[]> {
  const modulosFilter = await filtroModulosCoordenador();
  
  const avaliacoesNegativas = await prisma.avaliacao.findMany({
    where: { 
      nota: { lt: 10 },
      modulo: modulosFilter
    },
    select: { formandoId: true, moduloId: true },
  });

  if (avaliacoesNegativas.length === 0) return [];

  const contagemPorFormando = avaliacoesNegativas.reduce<
    Record<string, Set<string>>
  >((acc, av) => {
    if (!acc[av.formandoId]) acc[av.formandoId] = new Set();
    acc[av.formandoId].add(av.moduloId);
    return acc;
  }, {});

  const formandoIdsOrdenados = Object.entries(contagemPorFormando)
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 5)
    .map(([id]) => id);

  const formandosFilter = await filtroFormandosCoordenador();
  
  const formandos = await prisma.formando.findMany({
    where: { 
      id: { in: formandoIdsOrdenados },
      ...formandosFilter
    },
    include: {
      user: { select: { nome: true } },
      inscricoes: { 
        where: await filtroInscricoesCoordenador(),
        include: { curso: { select: { nome: true } } }, 
        take: 1 
      },
    },
  });

  return formandoIdsOrdenados
    .map((id) => {
      const f = formandos.find((x) => x.id === id);
      if (!f) return null;
      return {
        id: f.id,
        nome: f.user.nome,
        curso: f.inscricoes[0]?.curso.nome ?? "—",
        negativas: contagemPorFormando[id].size,
      };
    })
    .filter(Boolean) as FormandoRiscoResult[];
}

// ─── Documentos em Falta / Expirados ─────────────────────────────────────────

export type DocumentoEmFalta = {
  id: string;
  formadorId: string;
  formadorNome: string;
  tipo: string;
  status: "EM_FALTA" | "EXPIRADO" | "A_EXPIRAR";
  dataExpiracao: Date | null;
};

export async function getDocumentosEmFalta(): Promise<DocumentoEmFalta[]> {
  const docs = await prisma.documento.findMany({
    where: {
      status: { in: ["EM_FALTA", "EXPIRADO", "A_EXPIRAR"] },
      formadorId: { not: null }
    },
    include: { formador: { include: { user: { select: { nome: true } } } } },
    orderBy: [{ status: "desc" }, { dataExpiracao: "asc" }],
    take: 6,
  });

  return docs.map((d) => ({
    id: d.id,
    formadorId: d.formadorId!,
    formadorNome: d.formador?.user.nome ?? "Desconhecido",
    tipo: d.tipo,
    status: d.status as "EM_FALTA" | "EXPIRADO" | "A_EXPIRAR",
    dataExpiracao: d.dataExpiracao,
  }));
}

// ─── Formadores ───────────────────────────────────────────────────────────────

export type FormadorComDetalhes = {
  id: string;
  userId: string;
  especialidade: string | null;
  competencias: string | null;
  linkedin: string | null;
  github: string | null;
  idioma: string | null;
  nacionalidade: string | null;
  modulosLecionados: Array<{ modulo: { nome: string } }>;
  user: { id: string; nome: string; email: string };
};

export async function getFormadores(): Promise<FormadorComDetalhes[]> {
  const formadoresFilter = await filtroFormadoresCoordenador();
  
  return await prisma.formador.findMany({
    where: formadoresFilter,
    select: {
      id: true,
      userId: true,
      especialidade: true,
      competencias: true,
      linkedin: true,
      github: true,
      idioma: true,
      nacionalidade: true,
      user: { select: { id: true, nome: true, email: true } },
      modulosLecionados: { 
        where: {
          modulo: await filtroModulosCoordenador()
        },
        include: { modulo: { select: { nome: true } } } 
      },
    },
    orderBy: { user: { nome: "asc" } },
  });
}

export type FormadorPerfil = {
  id: string;
  nome: string;
  email: string;
  especialidade: string | null;
  competencias: string | null;
  linkedin: string | null;
  github: string | null;
  idioma: string | null;
  nacionalidade: string | null;
  modulos: Array<{
    id: string;
    nome: string;
    cargaHoraria: number;
    curso: { id: string; nome: string };
  }>;
  documentos: Array<{
    id: string;
    tipo: string;
    status: string;
    dataExpiracao: Date | null;
  }>;
};

export async function getFormadorById(
  id: string,
): Promise<FormadorPerfil | null> {
  const modulosFilter = await filtroModulosCoordenador();
  
  const formador = await prisma.formador.findUnique({
    where: { id },
    select: {
      id: true,
      especialidade: true,
      competencias: true,
      linkedin: true,
      github: true,
      idioma: true,
      nacionalidade: true,
      user: { select: { nome: true, email: true } },
      modulosLecionados: {
        where: {
          modulo: modulosFilter
        },
        include: {
          modulo: { include: { curso: { select: { id: true, nome: true } } } },
        },
      },
      documentos: {
        select: { id: true, tipo: true, status: true, dataExpiracao: true },
        orderBy: { tipo: "asc" },
      },
    },
  });

  if (!formador) return null;

  return {
    id: formador.id,
    nome: formador.user.nome,
    email: formador.user.email,
    especialidade: formador.especialidade,
    competencias: formador.competencias ?? null,
    linkedin: formador.linkedin ?? null,
    github: formador.github ?? null,
    idioma: formador.idioma ?? null,
    nacionalidade: formador.nacionalidade ?? null,
    modulos: formador.modulosLecionados.map((fm) => ({
      id: fm.modulo.id,
      nome: fm.modulo.nome,
      cargaHoraria: fm.modulo.cargaHoraria,
      curso: fm.modulo.curso,
    })),
    documentos: formador.documentos.map((d) => ({
      id: d.id,
      tipo: d.tipo,
      status: d.status,
      dataExpiracao: d.dataExpiracao,
    })),
  };
}

// ─── Disponibilidades ──────────────────────────────────────────────────────────

export type SlotDisponibilidade = {
  diaSemana: string;
  hora: number;
  minuto: number;
};

export type FormadorComDisponibilidades = FormadorComDetalhes & {
  disponibilidades: SlotDisponibilidade[];
};

/**
 * MODIFICADO: Busca disponibilidades de todos os formadores
 * NOVO: Agora inclui o campo 'semana' (número 1-53 da semana do ano)
 *
 * Utilizado na página de disponibilidades do coordenador para ver
 * que horários cada formador tem marcado como disponível
 *
 * Retorna array com formador + lista de suas disponibilidades
 */
export async function getDisponibilidadesFormadores(): Promise<
  FormadorComDisponibilidades[]
> {
  const formadoresFilter = await filtroFormadoresCoordenador();
  
  const formadores = await prisma.formador.findMany({
    where: formadoresFilter,
    select: {
      id: true,
      userId: true,
      especialidade: true,
      competencias: true,
      linkedin: true,
      github: true,
      idioma: true,
      nacionalidade: true,
      user: { select: { id: true, nome: true, email: true } },
      modulosLecionados: { 
        where: {
          modulo: await filtroModulosCoordenador()
        },
        include: { modulo: { select: { nome: true } } } 
      },
      disponibilidades: {
        where: { disponivel: true },
        // NOVO: Agora seleciona também o campo 'semana'
        select: {
          diaSemana: true,
          hora: true,
          minuto: true,
          tipo: true,
          semana: true,
        },
      },
    },
    orderBy: { user: { nome: "asc" } },
  });

  return formadores.map((f) => ({
    ...f,
    disponibilidades: f.disponibilidades,
  }));
}

// ─── Assiduidade ──────────────────────────────────────────────────────────────

export async function getAssiduidadeCoordenador(): Promise<
  {
    id: string;
    nome: string;
    curso: string;
    total: number;
    presentes: number;
    ausentes: number;
    justificados: number;
  }[]
> {
  const formandosFilter = await filtroFormandosCoordenador();
  
  const formandos = await prisma.formando.findMany({
    where: formandosFilter,
    include: {
      user: { select: { nome: true } },
      inscricoes: { 
        where: await filtroInscricoesCoordenador(),
        include: { curso: { select: { nome: true } } }, 
        take: 1 
      },
      presencas: {
        where: {
          status: { in: ["PRESENTE", "AUSENTE", "JUSTIFICADO", "PENDENTE"] },
          aula: {
            modulo: await filtroModulosCoordenador()
          }
        },
        select: { status: true },
      },
    },
    orderBy: { user: { nome: "asc" } },
  });

  return formandos.map((f) => ({
    id: f.id,
    nome: f.user.nome,
    curso: f.inscricoes[0]?.curso.nome ?? "Sem curso",
    total: f.presencas.length,
    presentes: f.presencas.filter((p) => p.status === "PRESENTE").length,
    ausentes: f.presencas.filter(
      (p) => p.status === "AUSENTE" || p.status === "PENDENTE",
    ).length,
    justificados: f.presencas.filter((p) => p.status === "JUSTIFICADO").length,
  }));
}

export type JustificativaPendente = {
  id: string;
  status: string;
  comentarioFormando: string | null;
  documentoUrl: string | null;
  aula: {
    id: string;
    titulo: string;
    dataHora: Date;
    modulo: { nome: string };
  };
  formando: {
    id: string;
    user: { nome: string };
    curso: string | null;
  };
};

export async function getJustificativasPendentesCoordenador(): Promise<
  JustificativaPendente[]
> {
  const modulosFilter = await filtroModulosCoordenador();
  
  const presencas = await prisma.presenca.findMany({
    where: { 
      status: "PENDENTE",
      aula: {
        modulo: modulosFilter
      }
    },
    include: {
      aula: {
        select: {
          id: true,
          titulo: true,
          dataHora: true,
          modulo: { select: { nome: true } },
        },
      },
      formando: {
        select: {
          id: true,
          user: { select: { nome: true } },
          inscricoes: {
            include: { curso: { select: { nome: true } } },
            take: 1,
          },
        },
      },
    },
    orderBy: { aula: { dataHora: "desc" } },
  });

  return presencas.map((p) => ({
    id: p.id,
    status: p.status,
    comentarioFormando: p.comentarioFormando,
    documentoUrl: p.documentoUrl,
    aula: p.aula,
    formando: {
      id: p.formando.id,
      user: p.formando.user,
      curso: p.formando.inscricoes[0]?.curso?.nome ?? null,
    },
  }));
}

// ─── Módulos ──────────────────────────────────────────────────────────────────

export type ModuloComDetalhes = {
  id: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  cargaHoraria: number;
  cursoId: string;
  curso?: { id: string; nome: string };
  formadores?: Array<{
    id: string;
    especialidade: string | null;
    user: { id: string; nome: string };
  }>;
};

export async function getModulos(): Promise<ModuloComDetalhes[]> {
  const modulosFilter = await filtroModulosCoordenador();
  
  const modulos = await prisma.modulo.findMany({
    where: modulosFilter,
    include: {
      curso: { select: { id: true, nome: true } },
      formadores: { include: { formador: { include: { user: true } } } },
    },
    orderBy: { ordem: "asc" },
  });
  return modulos.map((mod) => ({
    ...mod,
    formadores: mod.formadores.map((fm) => fm.formador),
  }));
}

// ─── Cursos ───────────────────────────────────────────────────────────────────

export type CursoComDetalhes = {
  id: string;
  nome: string;
  descricao: string | null;
  dataInicio: Date | null;
  dataFim: Date | null;
  cargaHoraria: number;
  status: "ATIVO" | "PAUSADO" | "ENCERRADO";
  createdAt: Date;
  modulos: Array<{
    id: string;
    nome: string;
    descricao: string | null;
    ordem: number;
    cargaHoraria: number;
  }>;
  formandos: number;
};

export async function getCursos(): Promise<CursoComDetalhes[]> {
  const cursosFilter = await filtroCursosCoordenador();
  
  const cursos = await prisma.curso.findMany({
    where: cursosFilter,
    include: { modulos: true, inscricoes: true },
    orderBy: { createdAt: "desc" },
  });
  return cursos.map((curso) => ({
    ...curso,
    formandos: curso.inscricoes.length,
  }));
}

// ─── Formandos ────────────────────────────────────────────────────────────────

export type FormandoComDetalhes = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar?: string;
  curso: string;
  progresso: number;
  status: "ATIVO" | "INATIVO" | "CONCLUÍDO";
  negativos: number;
  favorito: boolean;
};

export async function getFormandos(): Promise<FormandoComDetalhes[]> {
  const formandosFilter = await filtroFormandosCoordenador();
  const modulosFilter = await filtroModulosCoordenador();

  const formandos = await prisma.formando.findMany({
    where: formandosFilter,
    include: {
      user: { select: { id: true, nome: true, email: true } },
      inscricoes: {
        where: await filtroInscricoesCoordenador(),
        include: {
          curso: {
            include: {
              modulos: {
                where: modulosFilter
              }
            }
          }
        }
      },
      // CORREÇÃO: Filtrar avaliações apenas pelos módulos do coordenador
      avaliacoes: {
        where: {
          modulo: modulosFilter
        }
      },
    },
    orderBy: { user: { nome: "asc" } },
  });

  return formandos.map((f) => {
    const negativos = f.avaliacoes.filter((a) => a.nota < 10).length;
    // CORREÇÃO: Calcular progresso baseado nos módulos concluídos (com nota)
    // vs total de módulos do curso, não pela média das notas
    const totalModulosCurso = f.inscricoes[0]?.curso.modulos?.length ?? 0;
    const modulosConcluidos = f.avaliacoes.length;
    const progresso =
      totalModulosCurso > 0
        ? Math.round((modulosConcluidos / totalModulosCurso) * 100)
        : 0;
    let status: "ATIVO" | "INATIVO" | "CONCLUÍDO" = "ATIVO";
    if (progresso === 100) status = "CONCLUÍDO";
    if (f.inscricoes.length === 0) status = "INATIVO";
    return {
      id: f.id,
      nome: f.user.nome,
      email: f.user.email,
      telefone: "",
      avatar: undefined,
      curso: f.inscricoes[0]?.curso.nome ?? "Sem curso",
      progresso,
      status,
      negativos,
      favorito: false,
    };
  });
}

// ─── Perfil do Formando ───────────────────────────────────────────────────────

export type FormandoPerfil = {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  cursos: Array<{
    id: string;
    nome: string;
    dataInicio: Date | null;
    dataFim: Date | null;
    cargaHoraria: number;
    modulos: Array<{
      id: string;
      nome: string;
      cargaHoraria: number;
      nota: number | null;
    }>;
  }>;
  avaliacoes: Array<{
    id: string;
    nota: number;
    modulo: { id: string; nome: string; curso: { id: string; nome: string } };
  }>;
  documentos: Array<{
    id: string;
    tipo: string;
    status: string;
    fileUrl: string | null;
  }>;
};

export async function getFormandoPerfil(
  formandoId: string,
): Promise<FormandoPerfil | null> {
  if (!formandoId) return null;
  
  const inscricoesFilter = await filtroInscricoesCoordenador();
  const modulosFilter = await filtroModulosCoordenador();
  
  const formando = await prisma.formando.findUnique({
    where: { id: formandoId },
    include: {
      user: { select: { id: true, nome: true, email: true } },
      inscricoes: {
        where: inscricoesFilter,
        include: {
          curso: {
            include: {
              modulos: { 
                where: modulosFilter,
                select: { id: true, nome: true, cargaHoraria: true } 
              },
            },
          },
        },
      },
      avaliacoes: {
        where: {
          modulo: modulosFilter
        },
        include: {
          modulo: { include: { curso: { select: { id: true, nome: true } } } },
        },
      },
      documentos: {
        select: { id: true, tipo: true, status: true, fileUrl: true },
      },
    },
  });

  if (!formando) return null;

  return {
    id: formando.id,
    nome: formando.user.nome,
    email: formando.user.email,
    avatar: undefined,
    cursos: formando.inscricoes.map((insc) => ({
      id: insc.curso.id,
      nome: insc.curso.nome,
      dataInicio: insc.curso.dataInicio,
      dataFim: insc.curso.dataFim,
      cargaHoraria: insc.curso.cargaHoraria,
      modulos: insc.curso.modulos.map((mod) => {
        const avaliacao = formando.avaliacoes.find(
          (a) => a.moduloId === mod.id,
        );
        return {
          id: mod.id,
          nome: mod.nome,
          cargaHoraria: mod.cargaHoraria,
          nota: avaliacao?.nota ?? null,
        };
      }),
    })),
    avaliacoes: formando.avaliacoes,
    documentos: formando.documentos,
  };
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type ProximaSessao = Awaited<
  ReturnType<typeof getProximasSessoes>
>[number];
export type FormandoEmRisco = Awaited<
  ReturnType<typeof getFormandosEmRisco>
>[number];
export type FormadorItem = FormadorComDetalhes;
