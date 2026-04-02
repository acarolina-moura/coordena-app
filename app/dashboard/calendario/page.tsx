import { redirect } from "next/navigation";
import { auth } from "@/auth";
import FormadorCalendario from "./_components/formador-calendario";
import CalendarioFormandoPage from "./_components/formando-calendario";
import CoordenadorCalendario from "./_components/coordenador-calendario";

export default async function CalendarioPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "FORMANDO") return <CalendarioFormandoPage />;
  if (role === "FORMADOR") return <FormadorCalendario />;
  if (role === "COORDENADOR") return <CoordenadorCalendario />;

  redirect("/dashboard");
}