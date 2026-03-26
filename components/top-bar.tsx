"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Search, AlertTriangle, FileWarning, X, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/app/api/notificacoes/route";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function TopBar({ user, notificationCount = 0, onMenuClick }: TopBarProps) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);
  const [lidas, setLidas] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Fetch notificações ao montar
  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data: Notificacao[]) => setNotificacoes(data))
      .catch(() => { });
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const naoLidas = notificacoes.filter((n) => !lidas.has(n.id));

  function marcarTodasLidas() {
    setLidas(new Set(notificacoes.map((n) => n.id)));
  }

  function marcarLida(id: string) {
    setLidas((prev) => new Set([...prev, id]));
  }

  const iconesPorTipo: Record<Notificacao["tipo"], React.ElementType> = {
    DOCUMENTO: FileWarning,
    ALUNO_RISCO: AlertTriangle,
  };

  const coresPorTipo: Record<Notificacao["tipo"], string> = {
    DOCUMENTO: "bg-orange-100 text-orange-600",
    ALUNO_RISCO: "bg-red-100 text-red-600",
  };

  return (
    <header className="flex h-[70px] shrink-0 items-center gap-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 md:px-8">
      {/* Mobile Menu & Logo */}
      <div className="flex lg:hidden items-center gap-3 mr-2">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-all"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
            <span className="font-black text-sm">C</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 tracking-tight text-sm hidden xs:block">Coordena</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-sm hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Pesquisar..."
          className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm placeholder:text-gray-400 dark:text-gray-200 focus-visible:ring-indigo-500"
        />
      </div>

      <div className="flex-1" />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* ── Sino de Notificações ─────────────────────────────────── */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            open
              ? "bg-indigo-50 dark:bg-indigo-900/30"
              : "hover:bg-gray-100 dark:hover:bg-gray-800",
          )}
          aria-label="Notificações"
        >
          <Bell
            className={cn(
              "h-5 w-5",
              open ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400",
            )}
          />
          {naoLidas.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {naoLidas.length > 9 ? "9+" : naoLidas.length}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 z-50 w-[360px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
            {/* Header dropdown */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Notificações
                </span>
                {naoLidas.length > 0 && (
                  <span className="rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                    {naoLidas.length} novas
                  </span>
                )}
              </div>
              {naoLidas.length > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="max-h-[400px] overflow-y-auto">
              {notificacoes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="mb-2 h-8 w-8 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400">Sem notificações</p>
                </div>
              ) : (
                notificacoes.map((notif) => {
                  const Icon = iconesPorTipo[notif.tipo];
                  const iconCls = coresPorTipo[notif.tipo];
                  const isLida = lidas.has(notif.id);

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
                        !isLida && "bg-indigo-50/40 dark:bg-indigo-900/10",
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          iconCls,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <Link
                        href={notif.href}
                        onClick={() => {
                          marcarLida(notif.id);
                          setOpen(false);
                        }}
                        className="flex flex-1 flex-col gap-0.5 min-w-0"
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold text-gray-900 dark:text-gray-100",
                            isLida && "font-medium text-gray-600 dark:text-gray-400",
                          )}
                        >
                          {notif.titulo}
                        </span>
                        <span className="truncate text-xs text-gray-400">
                          {notif.descricao}
                        </span>
                        {notif.urgente && !isLida && (
                          <span className="mt-0.5 w-fit rounded-full bg-red-100 dark:bg-red-900/40 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                            Urgente
                          </span>
                        )}
                      </Link>

                      {/* Dismiss */}
                      {!isLida && (
                        <button
                          onClick={() => marcarLida(notif.id)}
                          className="mt-0.5 shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
                          aria-label="Marcar como lida"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notificacoes.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                <Link
                  href="/dashboard/documentos"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  Ver todos os documentos →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right hidden sm:flex">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
          <span className="text-xs text-gray-400">{user.email}</span>
        </div>
        <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-700">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
