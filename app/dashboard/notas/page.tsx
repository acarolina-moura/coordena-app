import { redirect } from "next/navigation";
import { UserRole } from "@/components/app-sidebar";
import FormandoNotas  from "./_components/formando-notas";
import FormadorNotas  from "./_components/formador-notas";

async function getAuthUser(): Promise<{ name: string; role: UserRole } | null> {
  return { name: "Ana Rodrigues", role: "FORMANDO" };
}

export default async function NotasPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  if (user.role === "FORMANDO") return <FormandoNotas />;
  
  if (user.role === "FORMADOR") return <FormadorNotas />;


  redirect("/dashboard");
}