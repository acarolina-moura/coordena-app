import { redirect } from "next/navigation";
import { UserRole } from "@/components/app-sidebar";
import { FormandoAssiduidade } from "./_components/formando-assiduidade";

async function getAuthUser(): Promise<{ role: UserRole } | null> {
  return { role: "FORMANDO" };
}

export default async function AssiduidadePage() {
  const user = await getAuthUser();
  if (!user || user.role !== "FORMANDO") redirect("/dashboard");
  return <FormandoAssiduidade />;
}