import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFormadores } from "@/app/dashboard/_data/coordenador";
import { FormadoresClient } from "./_components/formadores-client";

export default async function FormadoresPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (session.user.role !== "COORDENADOR") redirect("/dashboard");

    const formadores = await getFormadores();

    return <FormadoresClient formadores={formadores} />;
}
