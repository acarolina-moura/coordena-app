"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function Hero() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    return (
        <section
            id="home"
            className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-950"
        >
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse"
                    style={{ animationDelay: "2s" }}
                />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-[100px]" />

                {/* Hero Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-100"
                    style={{ backgroundImage: "url('/hero-bg.png')" }}
                />

                {/* Dark Blur Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-10">
                {/* Badge */}

                {/* Main Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col gap-6"
                >
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight dark:text-white leading-[1.1]">
                        <span className="text-white">O futuro da</span> <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500">
                            Coordenação Escolar
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Simplificamos a gestão académica com ferramentas
                        intuitivas para coordenadores, professores e alunos.
                        Tudo num só lugar, com máxima clareza e eficiência.
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
                >
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] active:scale-95 transition-all flex items-center gap-3">
                        Começar Agora
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto h-16 px-10 rounded-2xl border-2 border-slate-800 bg-slate-900/50 backdrop-blur-md font-black text-xl active:scale-95 transition-all text-white"
                    >
                        Ver Demo
                    </Button>
                </motion.div>

                {/* Status Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="flex flex-wrap items-center justify-center gap-8 pt-8"
                >
                    {[
                        { label: "Gestão de Notas", icon: CheckCircle },
                        { label: "Assiduidade", icon: CheckCircle },
                        { label: "Cronograma", icon: CheckCircle },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 text-base font-bold text-slate-500 dark:text-slate-400"
                        >
                            <item.icon className="w-6 h-6 text-emerald-500" />
                            {item.label}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Sign Up Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Criar Conta</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                            <User className="w-5 h-5 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Nome completo"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-transparent border-0 focus:ring-0 focus-visible:ring-0"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-transparent border-0 focus:ring-0 focus-visible:ring-0"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                            <Lock className="w-5 h-5 text-slate-500" />
                            <Input
                                type="password"
                                placeholder="Senha"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="bg-transparent border-0 focus:ring-0 focus-visible:ring-0"
                            />
                        </div>
                        <Button 
                            onClick={() => {
                                console.log("Registo:", formData);
                                setIsDialogOpen(false);
                            }}
                            className="w-full h-12 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-lg"
                        >
                            Criar Conta
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
