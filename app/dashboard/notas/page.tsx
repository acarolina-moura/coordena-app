import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FormandoNotas from "./_components/formando-notas";
import FormadorNotas from "./_components/formador-notas";
import { getMinhasNotas } from "../_data/formando";

export default async function NotasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, id: userId } = session.user;

  if (role === "FORMANDO") {
    const notas = await getMinhasNotas(userId);
    return <FormandoNotas inicial={notas} />;
  }

  if (role === "FORMADOR") return <FormadorNotas />;

  redirect("/dashboard");
}