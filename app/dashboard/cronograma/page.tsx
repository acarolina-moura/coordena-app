import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCourseSchedule } from "../_data/formando";
import FormandoCronograma from "./_components/formando-cronograma";

export default async function CronogramaPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    if (session.user.role !== "FORMANDO") {
        redirect("/dashboard");
    }

    const cronograma = await getCourseSchedule(session.user.id);

    return <FormandoCronograma dados={cronograma} />;
}
