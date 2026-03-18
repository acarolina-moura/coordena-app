import { getCursos } from "@/app/dashboard/_data/coordenador";
import { CursosContent } from "./_components/cursos-content";

export default async function CursosPage() {
  const cursos = await getCursos();

  return <CursosContent cursos={cursos} />;
}
