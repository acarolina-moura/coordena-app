"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, ExternalLink } from "lucide-react";
import Image from "next/image";

const creators = [
    {
        name: "Everton Santos",
        role: "Lead Developer",
        description:
            "Liderar a equipa por todo o processo de criação da CoordenaApp",
        image: "https://avatars.githubusercontent.com/u/97559532?v=4",
        github: "https://github.com/EvertonClaudino",
        linkedin: "https://www.linkedin.com/in/evertonclaudino/",
    },
    {
        name: "Ana Moura",
        role: "Developer",
        description: "Desenvolvimento da CoordenaApp. Backedn e Frontend",
        image: "https://media.licdn.com/dms/image/v2/D4D03AQGHnn3dP8yWpw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1718831145503?e=1777507200&v=beta&t=qUYrHCxlDXzIMUnosrD6th5iU-zeH92N4B11xdXw2qs",
        github: "https://github.com/acarolina-moura",
        linkedin: "https://www.linkedin.com/in/anacarolinat-moura",
    },
    {
        name: "Daniel Castanho",
        role: "Developer",
        description: "Desenvolvimento da CoordenaApp. Backedn e Frontend",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
        github: "https://github.com/DanSenCas",
        linkedin:
            "statics.teams.cdn.office.net/evergreen-assets/safelinks/2/atp-safelinks.html",
    },
    {
        name: "Margarida Louzeiro",
        role: "Developer",
        description: "Desenvolvimento da CoordenaApp. Backedn e Frontend",
        image: "https://media.licdn.com/dms/image/v2/D4E03AQGdv7o27x8G_g/profile-displayphoto-scale_400_400/B4EZ2GlrrYHYAg-/0/1776079521028?e=1777507200&v=beta&t=inePYifBwPRx4SFNRsTds2PTDolszr3nPqyCGnoEcXU",
        github: "https://github.com/mp-24",
        linkedin: "https://www.linkedin.com/in/margarida-louzeiro-b1a765361/",
    },
];

export function Creators() {
    return (
        <section
            id="criadores"
            className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col items-center text-center gap-4 sm:gap-6 mb-10 sm:mb-12 lg:mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs sm:text-sm">
                        A Equipa
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
                        As mentes por trás <br />
                        da{" "}
                        <span className="text-blue-600">inovação escolar</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {creators.map((creator, index) => (
                        <motion.div
                            key={creator.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-3 sm:mb-4 lg:mb-6">
                                <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36 xl:h-40 xl:w-40 rounded-full overflow-hidden border-3 sm:border-4 border-slate-100 dark:border-slate-800 group-hover:border-blue-500 transition-colors duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                    <img
                                        src={creator.image}
                                        alt={creator.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="absolute bottom-0.5 sm:bottom-1 lg:bottom-2 right-0.5 sm:right-1 lg:right-2 h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg text-blue-600 border border-slate-100 dark:border-slate-700">
                                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                                </div>
                            </div>

                            <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 px-1">
                                {creator.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs lg:text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 sm:mb-3 lg:mb-4">
                                {creator.role}
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 lg:mb-6 px-1 line-clamp-2">
                                {creator.description}
                            </p>

                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <a
                                    href={creator.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all transform hover:-translate-y-1"
                                >
                                    <Github className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                </a>
                                <a
                                    href={creator.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#0077b5] hover:text-white dark:hover:bg-[#0077b5] dark:hover:text-white transition-all transform hover:-translate-y-1"
                                >
                                    <Linkedin className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
