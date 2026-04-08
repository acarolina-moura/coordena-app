import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import { AboutUs } from "@/components/landing-page/about";
import { Features } from "@/components/landing-page/features";
import { Creators } from "@/components/landing-page/creators";
import { Footer } from "@/components/landing-page/footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-white dark:bg-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <Navbar />
            <div className="flex flex-col">
                <Hero />
                <AboutUs />
                <Features />
                <Creators />
                <Footer />
            </div>
        </main>
    );
}
