"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserPlus, LogIn, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Sobre nós", href: "#sobre-nos" },
    { name: "Funcionalidades", href: "#funcionalidades" },
    { name: "Criadores", href: "#criadores" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.getElementById(href.replace("#", ""));
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                closeMenu();
            }
        }
    };

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => {
                if (menuContentRef.current) menuContentRef.current.scrollTop = 0;
            });
            return () => {
                document.body.style.overflow = "";
            };
        } else {
            document.body.style.overflow = "";
        }
    }, [mobileMenuOpen]);

    const menuContentRef = useRef<HTMLDivElement>(null);

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 py-3 sm:py-4",
                isScrolled
                    ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-slate-200/50 dark:border-slate-800/50 py-2 sm:py-3"
                    : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-transparent",
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group shrink-0">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 truncate">
                        Coordena<span className="text-blue-600">App</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                    <Button
                        variant="ghost"
                        asChild
                        className="font-bold text-slate-700 dark:text-slate-200 h-9 px-4"
                    >
                        <Link href="/login" className="flex items-center gap-2">
                            <LogIn className="w-4 h-4" />
                            <span className="hidden xl:inline">Entrar</span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 xl:px-6 font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all h-9"
                    >
                        <Link
                            href="/register"
                            className="flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden xl:inline">Criar conta</span>
                        </Link>
                    </Button>
                    <ThemeToggle />
                </div>

                {/* Mobile Menu Toggle - min 44px touch target */}
                <button
                    className="lg:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Abrir menu"
                >
                    {mobileMenuOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Mobile Menu - Fullscreen Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="lg:hidden fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-slate-950 flex flex-col"
                    >
                        {/* Top Bar with Logo + Close */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
                            <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                    Coordena<span className="text-blue-600">App</span>
                                </span>
                            </Link>
                            <button
                                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300"
                                onClick={closeMenu}
                                aria-label="Fechar menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area - top aligned, flexible spacing */}
                        <div className="flex-1 flex flex-col items-center px-8 pt-6 pb-4 overflow-y-auto">
                            {/* Nav Links */}
                            <div className="flex flex-col items-center w-full gap-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        className="text-xl font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[48px] flex items-center w-full justify-center"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="w-24 h-px bg-slate-200 dark:bg-slate-800 my-3" />

                            {/* Auth Buttons */}
                            <div className="flex flex-col items-center gap-3 w-full">
                                <Button
                                    variant="outline"
                                    asChild
                                    className="w-full justify-center font-bold rounded-xl border-2 h-12 text-base"
                                >
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Entrar
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="w-full justify-center font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-12 text-base shadow-lg shadow-blue-600/20"
                                >
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <UserPlus className="w-5 h-5 mr-2" />
                                        Criar conta
                                    </Link>
                                </Button>
                            </div>

                            {/* Fills remaining space then Theme Toggle at bottom */}
                            <div className="flex-1" />
                            <ThemeToggle />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
