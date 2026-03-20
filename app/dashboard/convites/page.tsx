import { auth } from "@/auth";
import { getMeusConvites } from "../_data/formando";
import { ConvitesFormando } from "./_components/convites-formando";
import { redirect } from "next/navigation";

export default async function ConvitesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const convites = await getMeusConvites(session.user.id);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Os Meus Convites</h1>
                <p className="text-gray-500 text-sm">Gere as tuas participações em novos cursos e módulos.</p>
            </div>

            <ConvitesFormando initialConvites={convites} />
        </div>
    );
}
