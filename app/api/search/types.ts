export type ResultadoPesquisa = {
  id: string;
  tipo: "curso" | "formador" | "formando" | "modulo";
  titulo: string;
  subtitulo: string;
  href: string;
};
