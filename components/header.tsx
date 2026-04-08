"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

const NAV_LINKS = [
    { label: "Início", href: "#hero" },
    { label: "Sobre Nós", href: "#sobre" },
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Criadores", href: "#criadores" },
];

export function Header() {
    const [open, setOpen] = useState(false);

    // Handler para scroll suave
    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const el = document.getElementById(href.replace("#", ""));
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    };
    return (
        <header className="w-full bg-white dark:bg-background border-b border-border shadow-sm sticky top-0 z-30">
            <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-2xl font-bold text-primary"
                >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </span>
                    CoordenaApp
                </Link>
                {/* Desktop Nav */}
                <ul className="hidden md:flex gap-8 items-center">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            {link.href.startsWith("#") ? (
                                <a
                                    href={link.href}
                                    className="text-base font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                                    onClick={(e) =>
                                        handleNavClick(e, link.href)
                                    }
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    href={link.href}
                                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
                <div className="hidden md:flex gap-2 items-center">
                    <ThemeToggle />
                    <Link href="/login">
                        <Button size="sm">Entrar</Button>
                    </Link>
                    <Link href="/api/auth/register">
                        <Button size="sm" variant="outline">
                            Criar Conta
                        </Button>
                    </Link>
                </div>
                {/* Hamburger */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setOpen(!open)}
                    aria-label="Abrir menu"
                >
                    {open ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
            </nav>
            {/* Mobile Nav */}
            {open && (
                <div className="md:hidden bg-white dark:bg-background border-t border-border px-4 pb-4">
                    <ul className="flex flex-col gap-4 mt-2">
                        {NAV_LINKS.map((link) => (
                            <li key={link.href}>
                                {link.href.startsWith("#") ? (
                                    <a
                                        href={link.href}
                                        className="block text-base font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            handleNavClick(e, link.href);
                                            setOpen(false);
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="block text-base font-medium text-foreground hover:text-primary transition-colors"
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex justify-end mb-2">
                            <ThemeToggle />
                        </div>
                        <Link href="/login" onClick={() => setOpen(false)}>
                            <Button size="sm" className="w-full">
                                Entrar
                            </Button>
                        </Link>
                        <Link
                            href="/api/auth/register"
                            onClick={() => setOpen(false)}
                        >
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                            >
                                Inscrever-se
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
