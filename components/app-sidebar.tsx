"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Puzzle,
  Users,
  GraduationCap,
  CalendarDays,
  FileText,
  LogOut,
  User,
  ClipboardList,
  Mail,
  Clock,
  BarChart2,
  CheckCircle2,
  Star,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export type UserRole = "COORDENADOR" | "FORMADOR" | "FORMANDO";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  group?: string;
}

// Ordem dos grupos
const GROUP_ORDER = [
  "PRINCIPAL",
  "APRENDIZAGEM",
  "PLANEAMENTO",
  "RECURSOS",
  "CONTA",
  "OUTROS"
];

const NAV_ITEMS: NavItem[] = [
  // PRINCIPAL
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["COORDENADOR", "FORMADOR", "FORMANDO"], group: "PRINCIPAL" },
  { label: "Os Meus Cursos", href: "/dashboard/meus-cursos", icon: BookOpen, roles: ["FORMANDO"], group: "PRINCIPAL" },
  { label: "Cronograma", href: "/dashboard/cronograma", icon: ClipboardList, roles: ["FORMANDO"], group: "PRINCIPAL" },
  { label: "Entregar Trabalhos", href: "/dashboard/trabalhos", icon: ClipboardList, roles: ["FORMANDO"], group: "PRINCIPAL" },

  // PRINCIPAL (COORDENADOR / FORMADOR específicos)
  { label: "Cursos", href: "/dashboard/cursos", icon: BookOpen, roles: ["COORDENADOR"], group: "PRINCIPAL" },
  { label: "Módulos", href: "/dashboard/modulos", icon: Puzzle, roles: ["COORDENADOR"], group: "PRINCIPAL" },
  { label: "Formadores", href: "/dashboard/formadores", icon: Users, roles: ["COORDENADOR"], group: "PRINCIPAL" },
  { label: "Formandos", href: "/dashboard/formandos", icon: GraduationCap, roles: ["COORDENADOR"], group: "PRINCIPAL" },
  { label: "Módulos Atribuídos", href: "/dashboard/modulos-atribuidos", icon: BookOpen, roles: ["FORMADOR"], group: "PRINCIPAL" },

  // APRENDIZAGEM
  { label: "Minhas Notas", href: "/dashboard/notas", icon: FileText, roles: ["FORMANDO"], group: "APRENDIZAGEM" },
  { label: "Minhas Presenças", href: "/dashboard/assiduidade", icon: CheckCircle2, roles: ["FORMANDO"], group: "APRENDIZAGEM" },
  { label: "Assiduidade", href: "/dashboard/assiduidade", icon: BarChart2, roles: ["COORDENADOR"], group: "APRENDIZAGEM" },
  { label: "Avaliar Módulos", href: "/dashboard/reviews", icon: Star, roles: ["FORMANDO"], group: "APRENDIZAGEM" },
  { label: "Notas de Alunos", href: "/dashboard/notas", icon: ClipboardList, roles: ["FORMADOR"], group: "APRENDIZAGEM" },

  // PLANEAMENTO
  { label: "Calendário", href: "/dashboard/calendario", icon: CalendarDays, roles: ["COORDENADOR", "FORMADOR", "FORMANDO"], group: "PLANEAMENTO" },
  { label: "Disponibilidades", href: "/dashboard/disponibilidades", icon: Clock, roles: ["COORDENADOR", "FORMADOR"], group: "PLANEAMENTO" },

  // RECURSOS
  { label: "Documentos", href: "/dashboard/documentos", icon: FileText, roles: ["FORMADOR", "COORDENADOR", "FORMANDO"], group: "RECURSOS" },
  { label: "Convites", href: "/dashboard/convites", icon: Mail, roles: ["FORMADOR", "FORMANDO"], group: "RECURSOS" },

  // CONTA
  { label: "O Meu Perfil", href: "/dashboard/perfil", icon: User, roles: ["FORMADOR", "FORMANDO"], group: "CONTA" },
];

const ROLE_CONFIG: Record<UserRole, { label: string; active: string; logo: string; color: string; iconActive: string }> = {
  COORDENADOR: { label: "COORDENADOR", active: "bg-indigo-50 text-indigo-700 font-semibold", logo: "bg-indigo-600", color: "#4f46e5", iconActive: "text-indigo-600" },
  FORMADOR: { label: "FORMADOR", active: "bg-purple-50 text-purple-700 font-semibold", logo: "bg-purple-600", color: "#9333ea", iconActive: "text-purple-600" },
  FORMANDO: { label: "FORMANDO", active: "bg-teal-50 text-teal-700 font-semibold", logo: "bg-teal-500", color: "#14b8a6", iconActive: "text-teal-600" },
};

interface AppSidebarProps {
  user: { name: string; email: string; role: UserRole; avatar?: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const cfg = ROLE_CONFIG[user.role];
  const visible = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const groupedItems = visible.reduce((acc, item) => {
    const group = item.group || "OUTROS";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const sortedGroups = Object.keys(groupedItems).sort((a, b) => {
    return GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b);
  });

  // Estado para os grupos abertos (por defeito, todos abertos inicialmente ou com base no pathname ativo)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    sortedGroups.forEach(g => {
      // Abre automaticamente se algum filho estiver ativo
      const hasActiveChild = groupedItems[g].some(item => item.href === pathname);
      initialState[g] = hasActiveChild || g === "PRINCIPAL"; // Mantemos principal sempre aberto por default
    });
    return initialState;
  });

  useEffect(() => {
    // Quando a rota muda, garante que o grupo atual está aberto
    const activeGroup = sortedGroups.find(g => groupedItems[g].some(item => item.href === pathname));
    if (activeGroup && !openGroups[activeGroup]) {
      setOpenGroups(prev => ({ ...prev, [activeGroup]: true }));
    }
  }, [pathname, sortedGroups, groupedItems, openGroups]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <aside className="flex h-full w-[268px] shrink-0 flex-col border-r border-gray-200 bg-white/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 transition-all">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-sm", cfg.logo)}>
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-gray-900 tracking-tight leading-tight">Coordena</span>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col px-3 pb-6 flex-1 overflow-y-auto w-full custom-scrollbar">
        {sortedGroups.map((groupName) => {
          const isOpen = openGroups[groupName];

          return (
            <div key={groupName} className="mb-2 w-full">
              {groupName !== "OUTROS" && (
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                    {groupName}
                  </span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform duration-200", isOpen ? "" : "-rotate-90")} />
                </button>
              )}

              <div
                className={cn(
                  "grid transition-all duration-200 ease-in-out",
                  isOpen || groupName === "OUTROS" ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden flex flex-col gap-1 w-full">
                  {groupedItems[groupName].map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all w-full",
                          isActive
                            ? cfg.active
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? cfg.iconActive : "text-gray-400")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-gray-100 bg-white/30">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 group-hover:bg-red-100 transition-colors">
            <LogOut className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
          Terminar sessão
        </button>
      </div>
    </aside>
  );
}
