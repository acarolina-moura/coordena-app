import { calcularStatus, DocStatus } from "@/lib/documento-utils";
import { prisma } from "@/lib/prisma";
import { filtroFormadoresCoordenador } from "@/lib/coordenador-utils";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DOCS_OBRIGATORIOS_FORMADOR = [
  "CV",
  "Cartão de Cidadão",
  "CCP",
  "IBAN",
  "Seguro",
  "Registo Criminal",
  "Certidão Finanças",
  "Certidão Seg. Social",
];

const DOCS_OBRIGATORIOS_FORMANDO = [
  "Cartão de Cidadão",
  "Certificado de Habilitações",
  "IBAN",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentoResult = {
  id: string | null;
  nome: string;
  status: DocStatus | "EM_FALTA";
  dataValidade: string | null;
  dataEmissao: string | null;
  numero: string | null;
};

// ─── Funções ──────────────────────────────────────────────────────────────────

export async function getFormadoresComDocumentos() {
  // Filtrar formadores do coordenador logado
  const formadoresFilter = await filtroFormadoresCoordenador();
  
  // Query 1: buscar formadores com user (filtrados por coordenador)
  const formadores = await prisma.formador.findMany({
    where: formadoresFilter,
    include: { user: true },
    orderBy: { user: { nome: "asc" } },
  });

  // Query 2: buscar todos os documentos de formadores de uma vez
  const todosDocumentos = await prisma.documento.findMany({
    where: { formadorId: { not: null } },
    select: {
      id: true,
      tipo: true,
      numero: true,
      dataEmissao: true,
      dataExpiracao: true,
      formadorId: true,
    },
  });

  // Otimização: agrupar documentos por formadorId com Map O(1)
  const docsByFormador = new Map<string, typeof todosDocumentos>();
  for (const d of todosDocumentos) {
    if (d.formadorId) {
      if (!docsByFormador.has(d.formadorId)) docsByFormador.set(d.formadorId, []);
      docsByFormador.get(d.formadorId)!.push(d);
    }
  }

  return formadores.map((f) => {
    const docsFormador = docsByFormador.get(f.id) ?? [];

    const documentos = DOCS_OBRIGATORIOS_FORMADOR.map((nomeDoc): DocumentoResult => {
      const doc = docsFormador.find((d) => d.tipo === nomeDoc);

      return {
        id: doc?.id ?? null,
        nome: nomeDoc,
        status: doc ? calcularStatus(doc.dataExpiracao) : "EM_FALTA",
        dataValidade: doc?.dataExpiracao?.toISOString() ?? null,
        dataEmissao: doc?.dataEmissao?.toISOString() ?? null,
        numero: doc?.numero ?? null,
      };
    });

    return {
      id: f.id,
      userId: f.userId,
      nome: f.user.nome,
      email: f.user.email,
      documentos,
    };
  });
}

export async function getDocumentosFormador(
  formadorId: string,
): Promise<DocumentoResult[]> {
  console.log("[getDocumentosFormador] Buscando documentos para:", formadorId);
  
  const docs = await prisma.documento.findMany({
    where: { formadorId }
  });

  console.log("[getDocumentosFormador] Encontrados na BD:", docs.length, "documentos");

  const resultado = DOCS_OBRIGATORIOS_FORMADOR.map((nomeDoc): DocumentoResult => {
    const doc = docs.find((d) => d.tipo === nomeDoc);

    return {
      id: doc?.id ?? null,
      nome: nomeDoc,
      status: doc ? calcularStatus(doc.dataExpiracao) : "EM_FALTA",
      dataValidade: doc?.dataExpiracao?.toISOString() ?? null,
      dataEmissao: doc?.dataEmissao?.toISOString() ?? null,
      numero: doc?.numero ?? null,
    };
  });

  console.log("[getDocumentosFormador] Mapeados:", resultado.length, "documentos com status");

  return resultado;
}

export async function getDocumentosFormando(
  userId: string,
) {
  const docs = await prisma.documento.findMany({
    where: { formando: { userId } },
  });

  return DOCS_OBRIGATORIOS_FORMANDO.map((nomeDoc) => {
    const doc = docs.find((d) => d.tipo === nomeDoc);

    return {
      id: doc?.id ?? null,
      nome: nomeDoc,
      status: doc ? calcularStatus(doc.dataExpiracao) : "EM_FALTA",
      dataValidade: doc?.dataExpiracao?.toISOString() ?? null,
      dataEmissao: doc?.dataEmissao?.toISOString() ?? null,
      numero: doc?.numero ?? null,
    };
  });
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────
export type FormadorComDocumentos = Awaited<
  ReturnType<typeof getFormadoresComDocumentos>
>[number];
export type DocumentoFormador = DocumentoResult;
