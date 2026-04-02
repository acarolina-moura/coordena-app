"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import Image from "next/image";

const creators = [
  {
    name: "Alexandre Silva",
    role: "Lead Developer",
    description: "Especialista em arquitetura de sistemas e apaixonado por educação tecnológica.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Beatriz Santos",
    role: "UI/UX Designer",
    description: "Focada em criar experiências intuitivas e designs que encantam os utilizadores.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bea",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Carlos Oliveira",
    role: "Backend Engineer",
    description: "Mestre em bases de dados e segurança, garantindo a robustez do CoordenaApp.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Daniela Costa",
    role: "Product Manager",
    description: "Transforma necessidades pedagógicas em funcionalidades inovadoras de alto impacto.",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dani",
    github: "#",
    linkedin: "#",
  },
];

export function Creators() {
  return (
    <section id="criadores" className="py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] text-sm">A Equipa</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
            As mentes por trás <br />
            da <span className="text-blue-600">inovação escolar</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className="relative mb-6">
                <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute bottom-2 right-2 h-10 w-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg text-blue-600 border border-slate-100 dark:border-slate-700">
                   <ExternalLink className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {creator.name}
              </h3>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">
                {creator.role}
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 px-4">
                {creator.description}
              </p>

              <div className="flex items-center gap-4">
                <a
                  href={creator.github}
                  className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={creator.linkedin}
                  className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#0077b5] hover:text-white dark:hover:bg-[#0077b5] dark:hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
