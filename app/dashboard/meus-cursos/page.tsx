import { redirect } from "next/navigation";
import { UserRole } from "@/components/app-sidebar";
import FormandoCurso from "./_components/formandos-meus-cursos";
import FormadorCursos from "./_components/formador-cursos";
async function getAuthUser(): Promise<{ name: string; role: UserRole } | null> {
  return { name: "Ana Rodrigues", role: "FORMANDO" };
}

export default async function DocumentosPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  if (user.role === "FORMANDO") return <FormandoCurso />;
  if (user.role === "FORMADOR") return <FormadorCursos />;

  redirect("/dashboard");
}