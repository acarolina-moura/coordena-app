"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, UserPlus, LogIn, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
        isScrolled 
          ? "bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border-b border-slate-200/50 dark:border-slate-800/50 py-3" 
          : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Coordena<span className="text-blue-600">App</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild className="font-bold text-slate-700 dark:text-slate-200">
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Link href="/register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Criar conta
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-slate-600 dark:text-slate-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-6 md:hidden shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-slate-900 dark:text-white"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-100 dark:border-slate-800" />
            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="w-full justify-start font-bold rounded-xl border-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Entrar
                </Link>
              </Button>
              <Button asChild className="w-full justify-start font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  Criar conta
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
