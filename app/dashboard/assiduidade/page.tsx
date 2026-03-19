import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMinhasPresencas } from "../_data/formando";
import { FormandoAssiduidade } from "./_components/formando-assiduidade";

export default async function AssiduidadePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;

  if (role !== "FORMANDO") {
    redirect("/dashboard");
  }

  const presencas = await getMinhasPresencas(userId);

  return (
    <div className="p-0">
      <FormandoAssiduidade presencas={presencas} />
    </div>
  );
}