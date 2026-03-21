import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDisponibilidadesFormadores } from "@/app/dashboard/_data/coordenador";
import DisponibilidadesCoordenador from "./components/coordenador-disponibilidades";
import DisponibilidadesFormador from "./components/formador-disponibilidades";

export default async function DisponibilidadesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  if (role === "COORDENADOR") {
    const formadores = await getDisponibilidadesFormadores();
    return <DisponibilidadesCoordenador formadores={formadores} />;
  }

  if (role === "FORMADOR") {
    return <DisponibilidadesFormador userId={session.user.id} />;
  }

  redirect("/dashboard");
}