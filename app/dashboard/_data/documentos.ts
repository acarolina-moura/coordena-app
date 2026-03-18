import { calcularStatus, DocStatus } from "@/lib/documento-utils";
import { prisma } from "@/lib/prisma";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DOCS_OBRIGATORIOS = [
  "CV",
  "Cartão de Cidadão",
  "CCP",
  "IBAN",
  "Seguro",
  "Registo Criminal",
  "Certidão Finanças",
  "Certidão Seg. Social",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentoResult = {
  id: string | null;
  nome: string;
  status: DocStatus | "EM_FALTA";
  dataValidade: Date | null;
  dataEmissao: Date | null;
  numero: string | null;
};

// ─── Funções ──────────────────────────────────────────────────────────────────

export async function getFormadoresComDocumentos() {
  // Query 1: buscar formadores com user
  const formadores = await prisma.formador.findMany({
    include: { user: true },
    orderBy: { user: { nome: "asc" } },
  });

  // Query 2: buscar todos os documentos de formadores de uma vez
  const todosDocumentos = await prisma.$queryRaw<
    Array<{
      id: string;
      tipo: string;
      numero: string | null;
      dataEmissao: Date | null;
      dataExpiracao: Date | null;
      status: string;
      formadorId: string;
    }>
  >`SELECT id, tipo, numero, "dataEmissao", "dataExpiracao", status, "formadorId" FROM "DocumentoFormador"`;

  return formadores.map((f) => {
    const docsFormador = todosDocumentos.filter((d) => d.formadorId === f.id);

    const documentos = DOCS_OBRIGATORIOS.map((nomeDoc): DocumentoResult => {
      const doc = docsFormador.find((d) => d.tipo === nomeDoc);

      return {
        id: doc?.id ?? null,
        nome: nomeDoc,
        status: doc ? calcularStatus(doc.dataExpiracao) : "EM_FALTA",
        dataValidade: doc?.dataExpiracao ?? null,
        dataEmissao: doc?.dataEmissao ?? null,
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
  const docs = await prisma.$queryRaw<
    Array<{
      id: string;
      tipo: string;
      numero: string | null;
      dataEmissao: Date | null;
      dataExpiracao: Date | null;
      status: string;
      formadorId: string;
    }>
  >`SELECT id, tipo, numero, "dataEmissao", "dataExpiracao", status, "formadorId" FROM "DocumentoFormador" WHERE "formadorId" = ${formadorId}`;

  return DOCS_OBRIGATORIOS.map((nomeDoc): DocumentoResult => {
    const doc = docs.find((d) => d.tipo === nomeDoc);

    return {
      id: doc?.id ?? null,
      nome: nomeDoc,
      status: doc ? calcularStatus(doc.dataExpiracao) : "EM_FALTA",
      dataValidade: doc?.dataExpiracao ?? null,
      dataEmissao: doc?.dataEmissao ?? null,
      numero: doc?.numero ?? null,
    };
  });
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────
export type FormadorComDocumentos = Awaited<
  ReturnType<typeof getFormadoresComDocumentos>
>[number];
export type DocumentoFormador = DocumentoResult;
