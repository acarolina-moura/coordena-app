"use client";

import { motion } from "motion/react";
import { LayoutDashboard, Users, Zap, ShieldCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutUs() {
  return (
    <section id="sobre-nos" className="py-16 bg-white dark:bg-slate-950 overflow-hidden border-t border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1 flex flex-col h-full"
          >
            <div className="relative w-full h-full z-10 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden flex min-h-[320px]">
              {/* Internal Sidebar */}
              <div className="w-16 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-8 gap-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-6 opacity-40">
                   {[1, 2, 3, 4].map(i => <div key={i} className="h-6 w-6 rounded-md bg-slate-400" />)}
                </div>
              </div>

              {/* Internal Content */}
              <div className="flex-1 flex flex-col">
                {/* Header Strip */}
                <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
                   <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                   <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                
                {/* Dashboard Elements */}
                <div className="p-6 space-y-6 flex-1 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl p-3 flex flex-col justify-end gap-2">
                       <div className="h-1.5 w-1/2 bg-blue-600/20 rounded-full" />
                       <div className="h-4 w-3/4 bg-blue-600/40 rounded-full" />
                    </div>
                    <div className="h-20 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/30 rounded-2xl p-3 flex flex-col justify-end gap-2">
                       <div className="h-1.5 w-1/2 bg-purple-600/20 rounded-full" />
                       <div className="h-4 w-3/4 bg-purple-600/40 rounded-full" />
                    </div>
                    <div className="h-20 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 rounded-2xl p-3 flex flex-col justify-end gap-2">
                       <div className="h-1.5 w-1/2 bg-emerald-600/20 rounded-full" />
                       <div className="h-4 w-3/4 bg-emerald-600/40 rounded-full" />
                    </div>
                  </div>

                  {/* Representative Bar Chart */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 h-32 flex items-end justify-around gap-1.5">
                     <div className="w-full bg-blue-600/40 rounded-t-md h-[60%]" />
                     <div className="w-full bg-blue-600/60 rounded-t-md h-[40%]" />
                     <div className="w-full bg-blue-600/40 rounded-t-md h-[80%]" />
                     <div className="w-full bg-blue-600/20 rounded-t-md h-[30%]" />
                     <div className="w-full bg-blue-600/50 rounded-t-md h-[55%]" />
                     <div className="w-full bg-blue-600/30 rounded-t-md h-[45%]" />
                     <div className="w-full bg-blue-600/70 rounded-t-md h-[90%]" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Absolute Decorative elements */}
            <div className="absolute -top-16 -right-16 h-48 w-48 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 bg-purple-500/10 blur-[100px] -z-10 rounded-full" />
          </motion.div>

          {/* Text Content - Symmetrical Spacing */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center gap-10 order-1 lg:order-2 py-8"
          >
            <div className="flex flex-col gap-5">
              <span className="text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-[0.3em] text-sm">Sobre nós</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Transformando a <br />
                <span className="text-blue-600">Educação Digital</span>
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              O CoordenaApp centraliza toda a gestão pedagógica numa plataforma única, robusta e intuitiva. Acreditamos que a produtividade escolar começa com ferramentas que eliminam a burocracia desnecessária.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              {[
                { 
                  title: "Dashboard Central", 
                  desc: "Visão 360º de todas as métricas acadêmicas.", 
                  icon: LayoutDashboard,
                  color: "blue"
                },
                { 
                  title: "Foco no Utilizador", 
                  desc: "Desenvolvido com base no feedback real.", 
                  icon: Users,
                  color: "purple"
                },
                { 
                  title: "Agilidade Máxima", 
                  desc: "Menos burocracia, mais tempo para ensinar.", 
                  icon: Zap,
                  color: "emerald"
                },
                { 
                  title: "Segurança Total", 
                  desc: "Dados protegidos com criptografia moderna.", 
                  icon: ShieldCheck,
                  color: "blue"
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                    item.color === 'blue' && "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
                    item.color === 'purple' && "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
                    item.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"
                  )}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 mt-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
