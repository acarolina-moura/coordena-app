import { auth } from "@/auth";
import FormandoCurso from "./_components/formandos-meus-cursos";
import FormadorCursos from "./_components/formador-cursos";
import { getMeusCursos } from "../_data/formando";
import { redirect } from "next/navigation";

export default async function DocumentosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;

  if (role === "FORMANDO") {
    const cursos = await getMeusCursos(userId);
    return <FormandoCurso inicial={cursos} />;
  }
  if (role === "FORMADOR") return <FormadorCursos />;

  redirect("/dashboard");
}