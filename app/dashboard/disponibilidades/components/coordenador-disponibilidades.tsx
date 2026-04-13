"use client";

import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { FormadorComDisponibilidades } from "@/app/dashboard/_data/coordenador";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

function GrelhaDisponibilidade({
  disponibilidades,
}: {
  disponibilidades: { diaSemana: string; hora: number; minuto: number }[];
}) {
  // Converte para Set de chaves "hora:minuto-dia"
  const slots = new Set(
    disponibilidades.map((d) => `${d.hora}:${d.minuto}-${d.diaSemana}`),
  );

  const temDados = disponibilidades.length > 0;

  return (
    <div className="overflow-x-auto">
      {!temDados && (
        <p className="mb-3 text-xs text-gray-400 text-center">
          Este formador ainda não submeteu disponibilidades
        </p>
      )}
      <table className="w-full min-w-[500px] border-separate border-spacing-1">
        <thead>
          <tr className="transition-colors">
            <th className="w-16 text-left text-[11px] font-semibold text-gray-400 dark:text-gray-500 pb-1">
              Hora
            </th>
            {DIAS.map((dia) => (
              <th
                key={dia}
                className="text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 pb-1 transition-colors"
              >
                {dia}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map((hora) =>
            [0, 30].map((minuto) => {
              const label = `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
              return (
                <tr key={`${hora}-${minuto}`} className="transition-colors">
                  <td className="text-[11px] text-gray-400 dark:text-gray-500 pr-2 align-middle">
                    {label}
                  </td>
                  {DIAS.map((dia) => {
                    const key = `${hora}:${minuto}-${dia}`;
                    const ativo = slots.has(key);
                    return (
                      <td key={dia} className="px-0.5">
                        <div
                          className={cn(
                            "h-7 w-full rounded-lg border transition-colors",
                            ativo
                              ? "border-purple-300 dark:border-purple-800 bg-purple-100 dark:bg-purple-900/40"
                              : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50",
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            }),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function DisponibilidadesCoordenador({
  formadores,
}: {
  formadores: FormadorComDisponibilidades[];
}) {
  const [search, setSearch] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);

  const filtrados = formadores.filter(
    (f) =>
      f.user.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.especialidade ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 transition-colors">
            Disponibilidades
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 transition-colors">
            Consulta as disponibilidades semanais dos formadores
          </p>
        </div>
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="pesquisa-formador"
            placeholder="Pesquisar formador..."
            aria-label="Pesquisar formador"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200 transition-colors"
          />
        </div>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-16 text-center transition-colors">
          <Clock className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum formador encontrado</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((f) => {
            const initials = f.user.nome
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            const isOpen = expandido === f.id;
            const temDados = f.disponibilidades.length > 0;

            return (
              <div
                key={f.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandido(isOpen ? null : f.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <Avatar className="h-10 w-10 border-2 border-gray-100 dark:border-gray-800 shrink-0 transition-colors">
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                      {f.user.nome}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate transition-colors">
                      {f.especialidade ?? f.user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "rounded-full px-3 py-0.5 text-xs font-medium transition-colors",
                        temDados
                          ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
                      )}
                    >
                      {temDados
                        ? `${f.disponibilidades.length} slots`
                        : "Sem dados"}
                    </span>
                    <svg
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform",
                        isOpen && "rotate-180",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-5 transition-colors">
                    <GrelhaDisponibilidade
                      disponibilidades={f.disponibilidades}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 transition-colors">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-purple-400 dark:bg-purple-500" /> Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" /> Indisponível /
          Sem dados
        </span>
      </div>
    </div>
  );
}
