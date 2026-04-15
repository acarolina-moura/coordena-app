export type Notificacao = {
  id: string;
  tipo: "DOCUMENTO" | "ALUNO_RISCO";
  titulo: string;
  descricao: string;
  href: string;
  urgente: boolean;
};
