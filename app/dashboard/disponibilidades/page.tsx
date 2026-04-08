import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
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
    return (
      <Suspense fallback={<div className="text-center py-8">A carregar...</div>}>
        <DisponibilidadesFormador userId={session.user.id} />
      </Suspense>
    );
  }

  redirect("/dashboard");
}