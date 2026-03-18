import { redirect } from "next/navigation";
import { UserRole } from "@/components/app-sidebar";
import  FormadorDocumentos  from "./_components/formador-calendario";
import CalendarioFormandoPage from "./_components/formando-calendario";
async function getAuthUser(): Promise<{ name: string; role: UserRole } | null> {
  return { name: "Ana Rodrigues", role: "FORMANDO" };
}

export default async function DocumentosPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  if (user.role === "FORMANDO") return <CalendarioFormandoPage />;
  if (user.role === "FORMADOR") return <FormadorDocumentos />;

  redirect("/dashboard");
}