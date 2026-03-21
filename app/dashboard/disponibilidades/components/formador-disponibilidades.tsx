"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const HORAS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

type Slot = { hora: number; minuto: number; diaSemana: string };

function slotKey(hora: number, minuto: number, dia: string) {
  return `${hora}:${minuto}-${dia}`;
}

function horaLabel(hora: number, minuto: number) {
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

export default function DisponibilidadesFormador({
  userId,
}: {
  userId: string;
}) {
  const [slots, setSlots] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carrega disponibilidades do formador
  useEffect(() => {
    fetch(`/api/disponibilidades?userId=${userId}`)
      .then((r) => r.json())
      .then((data: Slot[]) => {
        const mapa: Record<string, boolean> = {};
        if (Array.isArray(data)) {
          data.forEach((s) => {
            mapa[slotKey(s.hora, s.minuto, s.diaSemana)] = true;
          });
        }
        setSlots(mapa);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  function toggle(hora: number, minuto: number, dia: string) {
    const key = slotKey(hora, minuto, dia);
    setSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Converte o estado para lista de slots ativos
      const ativos: Slot[] = [];
      for (const [key, ativo] of Object.entries(slots)) {
        if (!ativo) continue;
        const [horaMinuto, dia] = key.split("-");
        const [hora, minuto] = horaMinuto.split(":").map(Number);
        ativos.push({ hora, minuto, diaSemana: dia });
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

  const totalSelected = Object.values(slots).filter(Boolean).length;

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
          <h1 className="text-[26px] font-bold text-gray-900">
            Disponibilidades
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="w-20 text-left text-sm font-semibold text-gray-500 pb-2">
                Hora
              </th>
              {DIAS.map((dia) => (
                <th
                  key={dia}
                  className="text-center text-sm font-semibold text-gray-600 pb-2"
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
                  <td className="text-sm text-gray-400 font-medium pr-4 py-1 align-middle">
                    {horaLabel(hora, minuto)}
                  </td>
                  {DIAS.map((dia) => {
                    const key = slotKey(hora, minuto, dia);
                    const isActive = !!slots[key];
                    return (
                      <td key={dia} className="px-1.5 py-1">
                        <button
                          onClick={() => toggle(hora, minuto, dia)}
                          disabled={saving}
                          className={cn(
                            "w-full h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-150",
                            saving && "opacity-50 cursor-not-allowed",
                            isActive
                              ? "border-purple-300 bg-purple-100 hover:bg-purple-200"
                              : "border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50",
                          )}
                        >
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full transition-all",
                              isActive
                                ? "bg-purple-500 scale-110"
                                : "bg-transparent",
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-purple-400" /> Disponível
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-gray-200" /> Indisponível
        </span>
      </div>
    </div>
  );
}
