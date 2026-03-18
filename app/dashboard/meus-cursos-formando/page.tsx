import { redirect } from "next/navigation";
import { UserRole } from "@/components/app-sidebar";
import  FormandoCursos  from "./_components/formando-cursos";

async function getAuthUser(): Promise<{ role: UserRole } | null> {
  return { role: "FORMANDO" };
}

export default async function MeusCursosFormandoPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "FORMANDO") redirect("/dashboard");
  return <FormandoCursos />;
}