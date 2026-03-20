//app/dashboard/assiduidade/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMinhasPresencas } from "../_data/formando";
import { getAssiduidadeCoordenador } from "../_data/coordenador";
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
    const dados = await getAssiduidadeCoordenador();
    return <CoordenadorAssiduidade dados={dados} />;
  }

  redirect("/dashboard");
}
