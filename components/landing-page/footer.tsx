"use client";

import { motion } from "framer-motion";
import {
    GraduationCap,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
} from "lucide-react";
import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.getElementById(href.replace("#", ""));
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 group w-fit"
                        >
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                                Coordena
                                <span className="text-blue-600">App</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            A solução definitiva para a gestão escolar
                            inteligente. Revolucionando a educação digital um
                            módulo de cada vez.
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map(
                                (Icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all transform hover:-translate-y-1"
                                    >
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <h4 className="text-white font-bold text-base sm:text-lg">
                            Produto
                        </h4>
                        <ul className="flex flex-col gap-2.5 sm:gap-3 text-sm font-medium">
                            <li>
                                <Link
                                    href="#home"
                                    onClick={(e) => handleNavClick(e, "#home")}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#funcionalidades"
                                    onClick={(e) =>
                                        handleNavClick(e, "#funcionalidades")
                                    }
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Funcionalidades
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#sobre-nos"
                                    onClick={(e) =>
                                        handleNavClick(e, "#sobre-nos")
                                    }
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Sobre nós
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#criadores"
                                    onClick={(e) =>
                                        handleNavClick(e, "#criadores")
                                    }
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Criadores
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="flex flex-col gap-4 sm:gap-6">
                        <h4 className="text-white font-bold text-base sm:text-lg">
                            Suporte
                        </h4>
                        <ul className="flex flex-col gap-2.5 sm:gap-3 text-sm font-medium">
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Documentação
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Centro de Ajuda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Privacidade
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="#"
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    Termos de Uso
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col gap-4 sm:gap-6 sm:col-span-2 lg:col-span-1">
                        <h4 className="text-white font-bold text-base sm:text-lg">
                            Contacto
                        </h4>
                        <ul className="flex flex-col gap-3 sm:gap-4 text-sm font-medium">
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                                <span className="text-xs sm:text-sm">suporte@coordenaapp.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                                <span className="text-xs sm:text-sm">+351 123 456 789</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
                                <span className="text-xs sm:text-sm">Lisboa, Portugal</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 sm:pt-10 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-6 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <p className="text-center sm:text-left">
                        © {currentYear} CoordenaApp. Todos os direitos
                        reservados.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2">
                        <Link
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            Política de Cookies
                        </Link>
                        <Link
                            href="#"
                            className="hover:text-white transition-colors"
                        >
                            RGPD
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
