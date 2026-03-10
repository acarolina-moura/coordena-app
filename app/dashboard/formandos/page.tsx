import { FormandosContent } from './formandos-client';
import { getFormandos, getCursos } from '@/app/dashboard/_data/coordenador';

export default async function FormandosPage() {
  const [formandos, cursos] = await Promise.all([
    getFormandos(),
    getCursos(),
  ]);

  return <FormandosContent data={formandos} cursos={cursos} />;
}
