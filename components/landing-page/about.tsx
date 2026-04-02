"use client";

import { motion } from "motion/react";
import { LayoutDashboard, Users, Zap, ShieldCheck, GraduationCap, Home, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutUs() {
  return (
    <section id="sobre-nos" className="py-20 bg-white dark:bg-slate-950 overflow-hidden border-t border-slate-100 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-20">
          
          {/* Text Content - Centered Top */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center gap-10 max-w-4xl"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-4">
              {[
                { 
                  title: "Dashboard Central", 
                  desc: "Visão 360º de todas as métricas.", 
                  icon: LayoutDashboard,
                  color: "blue"
                },
                { 
                  title: "Foco no Utilizador", 
                  desc: "Feito sob medida para você.", 
                  icon: Users,
                  color: "purple"
                },
                { 
                  title: "Agilidade Máxima", 
                  desc: "Menos burocracia, mais ensino.", 
                  icon: Zap,
                  color: "emerald"
                },
                { 
                  title: "Segurança Total", 
                  desc: "Dados protegidos sempre.", 
                  icon: ShieldCheck,
                  color: "blue"
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
                    item.color === 'blue' && "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
                    item.color === 'purple' && "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
                    item.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"
                  )}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mockup Representation - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="relative w-full max-w-5xl"
          >
            <div className="relative w-full z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl p-0 overflow-hidden flex min-h-[320px] md:min-h-[450px]">
              {/* Internal Sidebar */}
              <div className="w-12 md:w-16 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-8 gap-8 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex flex-col gap-6 text-slate-400 dark:text-slate-500">
                   <div className="text-blue-600"><Home className="w-5 h-5" /></div>
                   <Users className="w-5 h-5" />
                   <BookOpen className="w-5 h-5" />
                   <Settings className="w-5 h-5" />
                </div>
              </div>

              {/* Internal Content */}
              <div className="flex-1 flex flex-col">
                {/* Header Strip */}
                <div className="h-12 md:h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8">
                   <div className="h-3 w-24 md:h-4 md:w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
                   <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                
                {/* Dashboard Elements */}
                <div className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 md:gap-6">
                    <div className="h-20 md:h-24 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-2xl p-4 flex flex-col justify-end gap-1">
                       <span className="text-[10px] font-black text-blue-600/60 uppercase tracking-wider">Alunos Ativos</span>
                       <span className="text-xl md:text-2xl font-black text-blue-600">842</span>
                    </div>
                    <div className="h-20 md:h-24 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100/50 dark:border-purple-800/30 rounded-2xl p-4 flex flex-col justify-end gap-1">
                       <span className="text-[10px] font-black text-purple-600/60 uppercase tracking-wider">Turmas</span>
                       <span className="text-xl md:text-2xl font-black text-purple-600">24</span>
                    </div>
                    <div className="h-20 md:h-24 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 rounded-2xl p-4 flex flex-col justify-end gap-1">
                       <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-wider">Média Geral</span>
                       <span className="text-xl md:text-2xl font-black text-emerald-600">8.2</span>
                    </div>
                  </div>

                  {/* Representative Bar Chart */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-32 md:h-48 flex flex-col gap-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desempenho Semanal</span>
                        <div className="flex gap-2">
                           <div className="h-1.5 w-6 bg-blue-600/40 rounded-full" />
                           <div className="h-1.5 w-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        </div>
                     </div>
                     <div className="flex-1 flex items-end justify-around gap-2 md:gap-4">
                        {[
                          { h1: "60%", h2: "40%", l: "S" },
                          { h1: "40%", h2: "55%", l: "T" },
                          { h1: "80%", h2: "60%", l: "Q" },
                          { h1: "30%", h2: "45%", l: "Q" },
                          { h1: "55%", h2: "70%", l: "S" },
                          { h1: "45%", h2: "40%", l: "S" },
                          { h1: "90%", h2: "30%", l: "D" },
                        ].map((day, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <div className="w-full flex items-end gap-1 px-0.5 h-20 md:h-28">
                               <div className="flex-1 bg-blue-600/40 rounded-t-[4px]" style={{ height: day.h1 }} />
                               <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-[4px]" style={{ height: day.h2 }} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{day.l}</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Absolute Decorative elements */}
            <div className="absolute -top-16 -right-16 h-48 w-48 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 bg-purple-500/10 blur-[100px] -z-10 rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
