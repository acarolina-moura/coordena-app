"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

type Slot = { hora: number; minuto: number; diaSemana: string; tipo?: string };

function slotKey(hora: number, minuto: number, dia: string) {
  return `${hora}:${minuto}-${dia}`;
}

function horaLabel(hora: number, minuto: number) {
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

// Estados: null = indisponível, "TOTAL" = roxo, "PARCIAL" = amarelo
type TipoDisponibilidade = null | "TOTAL" | "PARCIAL";

export default function DisponibilidadesFormador({
  userId,
}: {
  userId: string;
}) {
  const [slots, setSlots] = useState<Record<string, TipoDisponibilidade>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carrega disponibilidades do formador
  useEffect(() => {
    fetch(`/api/disponibilidades?userId=${userId}`)
      .then((r) => r.json())
      .then((data: Slot[]) => {
        const mapa: Record<string, TipoDisponibilidade> = {};
        if (Array.isArray(data)) {
          data.forEach((s) => {
            mapa[slotKey(s.hora, s.minuto, s.diaSemana)] = (s.tipo as TipoDisponibilidade) || "TOTAL";
          });
        }
        setSlots(mapa);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  function toggle(hora: number, minuto: number, dia: string) {
    const key = slotKey(hora, minuto, dia);
    setSlots((prev) => {
      const current = prev[key];
      let next: TipoDisponibilidade;

      // Ciclar: indisponível → TOTAL → PARCIAL → indisponível
      if (current === null || current === undefined) {
        next = "TOTAL";
      } else if (current === "TOTAL") {
        next = "PARCIAL";
      } else {
        next = null;
      }

      return { ...prev, [key]: next };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Converte o estado para lista de slots ativos
      const ativos: Slot[] = [];
      for (const [key, tipo] of Object.entries(slots)) {
        if (!tipo) continue; // Pula os indisponíveis
        const [horaMinuto, dia] = key.split("-");
        const [hora, minuto] = horaMinuto.split(":").map(Number);
        ativos.push({ hora, minuto, diaSemana: dia, tipo });
      }

      const res = await fetch("/api/disponibilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, slots: ativos }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert("Erro ao guardar disponibilidades.");
      }
    } catch {
      alert("Erro de rede.");
    } finally {
      setSaving(false);
    }
  }

  const totalSelected = Object.values(slots).filter((t) => t !== null).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">
            Disponibilidades
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Clique nos blocos para marcar disponibilidade · {totalSelected}{" "}
            blocos selecionados
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> A guardar…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> {saved ? "Guardado!" : "Guardar"}
            </>
          )}
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 overflow-x-auto">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-purple-500" /> Disponibilidade Total
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" /> Parcial (Só Online)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-gray-300" /> Indisponível
          </span>
        </div>

        <table className="w-full min-w-[600px] border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="w-20 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 pb-2">
                Hora
              </th>
              {DIAS.map((dia) => (
                <th
                  key={dia}
                  className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 pb-2"
                >
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) =>
              [0, 30].map((minuto) => (
                <tr key={`${hora}-${minuto}`}>
                  <td className="text-sm text-gray-400 dark:text-gray-500 font-medium pr-4 py-1 align-middle">
                    {horaLabel(hora, minuto)}
                  </td>
                  {DIAS.map((dia) => {
                    const key = slotKey(hora, minuto, dia);
                    const tipo = slots[key];
                    
                    let bgColor = "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/20";
                    let dotColor = "bg-transparent";
                    
                    if (tipo === "TOTAL") {
                      bgColor = "border-purple-300 dark:border-purple-600 bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200";
                      dotColor = "bg-purple-500";
                    } else if (tipo === "PARCIAL") {
                      bgColor = "border-amber-300 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200";
                      dotColor = "bg-amber-500";
                    }
                    
                    return (
                      <td key={dia} className="px-1.5 py-1">
                        <button
                          onClick={() => toggle(hora, minuto, dia)}
                          disabled={saving}
                          className={cn(
                            "w-full h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-150",
                            saving && "opacity-50 cursor-not-allowed",
                            bgColor,
                          )}
                          title={tipo === "TOTAL" ? "Disponibilidade Total" : tipo === "PARCIAL" ? "Disponibilidade Parcial" : "Indisponível"}
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full transition-all",
                              tipo ? "scale-110" : "",
                              dotColor,
                            )}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
