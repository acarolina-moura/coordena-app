"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  AlertTriangle,
  FileWarning,
  X,
  Menu,
  BookOpen,
  Users,
  GraduationCap,
  Puzzle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/app/api/notificacoes/route";
import type { ResultadoPesquisa } from "@/app/api/search/route";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopBarProps {
  user: { name: string; email: string; avatar?: string };
  notificationCount?: number;
  onMenuClick?: () => void;
}

const TIPO_CONFIG: Record<
  ResultadoPesquisa["tipo"],
  { icon: React.ElementType; cor: string }
> = {
  curso: { icon: BookOpen, cor: "text-indigo-500" },
  formador: { icon: Users, cor: "text-purple-500" },
  formando: { icon: GraduationCap, cor: "text-teal-500" },
  modulo: { icon: Puzzle, cor: "text-blue-500" },
};

const TIPO_LABEL: Record<ResultadoPesquisa["tipo"], string> = {
  curso: "Curso",
  formador: "Formador",
  formando: "Formando",
  modulo: "Módulo",
};

export function TopBar({
  user,
  notificationCount: _notificationCount = 0,
  onMenuClick,
}: TopBarProps) {
  // ── Notificações ──────────────────────────────────────────────────────────
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [openBell, setOpenBell] = useState(false);
  const [lidas, setLidas] = useState<Set<string>>(new Set());
  const bellRef = useRef<HTMLDivElement>(null);

  // ── Pesquisa ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ResultadoPesquisa[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data: Notificacao[]) => setNotificacoes(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setOpenBell(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (query.trim().length < 2) {
      setResultados([]);
      setSearchOpen(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          setResultados(await res.json());
          setSearchOpen(true);
        }
      } catch {
        /* silently fail */
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  }, [query]);

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
      {/* Mobile */}
      <div className="flex lg:hidden items-center gap-3 mr-2">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
            <span className="font-black text-sm">C</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-sm hidden xs:block">
            Coordena
          </span>
        </div>
      </div>

      {/* ── Pesquisa Global ─────────────────────────────────────────────────── */}
      <div className="relative flex-1 max-w-sm hidden md:block" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Pesquisar cursos, formadores, formandos..."
          aria-label="Pesquisar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm placeholder:text-gray-400 dark:text-gray-200 focus-visible:ring-indigo-500"
        />

        {searchOpen && (
          <div className="absolute left-0 top-12 z-50 w-full min-w-[360px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            {searchLoading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                A pesquisar...
              </div>
            ) : resultados.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Sem resultados para &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
                {resultados.map((r) => {
                  const { icon: Icon, cor } = TIPO_CONFIG[r.tipo];
                  return (
                    <Link
                      key={`${r.tipo}-${r.id}`}
                      href={r.href}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Icon className={cn("h-4 w-4", cor)} />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {r.titulo}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          {r.subtitulo}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {TIPO_LABEL[r.tipo]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />
      <ThemeToggle />

      {/* ── Sino ────────────────────────────────────────────────────────────── */}
      <div className="relative" ref={bellRef}>
        <button
          onClick={() => setOpenBell((v) => !v)}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            openBell
              ? "bg-indigo-50 dark:bg-indigo-900/30"
              : "hover:bg-gray-100 dark:hover:bg-gray-800",
          )}
          aria-label="Notificações"
        >
          <Bell
            className={cn(
              "h-5 w-5",
              openBell
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 dark:text-gray-400",
            )}
          />
          {naoLidas.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {naoLidas.length > 9 ? "9+" : naoLidas.length}
            </span>
          )}
        </button>

        {openBell && (
          <div className="absolute right-0 top-12 z-50 w-[360px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
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
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          iconCls,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <Link
                        href={notif.href}
                        onClick={() => {
                          marcarLida(notif.id);
                          setOpenBell(false);
                        }}
                        className="flex flex-1 flex-col gap-0.5 min-w-0"
                      >
                        <span
                          className={cn(
                            "text-sm font-semibold text-gray-900 dark:text-gray-100",
                            isLida &&
                              "font-medium text-gray-600 dark:text-gray-400",
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

            {notificacoes.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
                <Link
                  href="/dashboard/documentos"
                  onClick={() => setOpenBell(false)}
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
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {user.name}
          </span>
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
