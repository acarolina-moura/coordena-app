//app/dashboard/assiduidade/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMinhasPresencas } from "../_data/formando";
import {
  getAssiduidadeCoordenador,
  getJustificativasPendentesCoordenador,
} from "../_data/coordenador";
import { FormandoAssiduidade } from "./_components/formando-assiduidade";
import { CoordenadorAssiduidade } from "./_components/coordenador-assiduidade";

export default async function AssiduidadePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;

  if (role === "FORMANDO") {
    const presencas = await getMinhasPresencas(userId);
    return <FormandoAssiduidade presencas={presencas} />;
  }

  if (role === "COORDENADOR") {
    const [dados, pendentes] = await Promise.all([
      getAssiduidadeCoordenador(),
      getJustificativasPendentesCoordenador(),
    ]);
    return <CoordenadorAssiduidade dados={dados} pendentes={pendentes} />;
  }

  redirect("/dashboard");
}
