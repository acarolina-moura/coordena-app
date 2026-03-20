import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMeusTrabalhos } from "../_data/formando";
import FormandoTrabalhos from "./_components/formando-trabalhos";

export default async function TrabalhosPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    if (session.user.role !== "FORMANDO") {
        redirect("/dashboard");
    }

    const trabalhos = await getMeusTrabalhos(session.user.id);

    return <FormandoTrabalhos trabalhos={trabalhos} />;
}
