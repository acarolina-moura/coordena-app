"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notificationCount?: number;
  children: React.ReactNode;
}

export function DashboardShell({ sidebar, user, notificationCount = 0, children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Fechar o sidebar mobile quando mudar de rota
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Impedir scroll quando o sidebar mobile estiver aberto
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 uppercase-none">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:shrink-0">
        {sidebar}
      </div>

      {/* Sidebar Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Mobile Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4 lg:hidden">
            <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
        {sidebar}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden w-full relative">
        <TopBar 
          user={user} 
          notificationCount={notificationCount} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
