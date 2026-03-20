import { auth } from "@/auth";
import { getModulosParaReview } from "../_data/formando";
import { redirect } from "next/navigation";
import { ReviewLista } from "./_components/review-lista";

export default async function ReviewsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const modulos = await getModulosParaReview(session.user.id);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Avaliação de Módulos</h1>
                <p className="text-gray-500 text-sm">Partilha a tua opinião sobre os módulos concluídos.</p>
            </div>

            <ReviewLista initialModulos={modulos} />
        </div>
    );
}
