import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFormandos } from "@/app/dashboard/_data/coordenador";
import { FormandosClient } from "./formandos-client";

export default async function FormandosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "COORDENADOR") redirect("/dashboard");

  const formandos = await getFormandos();

  return <FormandosClient formandos={formandos} />;
}
