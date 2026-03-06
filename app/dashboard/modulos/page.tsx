import { getModulos, getCursos, getFormadores } from "@/app/dashboard/_data/coordenador";
import { ModulosContent } from "./_components/modulos-content";

export default async function ModulosPage() {
  const [modulos, cursos, formadores] = await Promise.all([
    getModulos(),
    getCursos(),
    getFormadores(),
  ]);

  return <ModulosContent modulos={modulos} cursos={cursos} formadores={formadores} />;
}