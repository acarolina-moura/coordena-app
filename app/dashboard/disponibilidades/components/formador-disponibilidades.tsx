"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const HORAS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const INITIAL: Record<string, boolean> = {
  "09:00-Segunda": true, "09:00-Terça": true,  "09:00-Quinta": true, "09:00-Sexta": true,
  "10:00-Segunda": true, "10:00-Terça": true,  "10:00-Quinta": true, "10:00-Sexta": true,
  "11:00-Segunda": true, "11:00-Terça": true,  "11:00-Quinta": true,
  "14:00-Segunda": true, "14:00-Quarta": true, "14:00-Quinta": true,
  "15:00-Segunda": true, "15:00-Quarta": true,
  "16:00-Quarta": true,
};

export default function DisponibilidadesFormador() {
  const [slots, setSlots] = useState<Record<string, boolean>>(INITIAL);
  const [saved, setSaved] = useState(false);

  function toggle(hora: string, dia: string) {
    const key = `${hora}-${dia}`;
    setSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const totalSelected = Object.values(slots).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Disponibilidades</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Clique nos blocos para marcar disponibilidade · {totalSelected} blocos selecionados
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5"
        >
          <Save className="h-4 w-4" />
          {saved ? "Guardado!" : "Guardar"}
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="w-20 text-left text-sm font-semibold text-gray-500 pb-2">Hora</th>
              {DIAS.map((dia) => (
                <th key={dia} className="text-center text-sm font-semibold text-gray-600 pb-2">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                <td className="text-sm text-gray-400 font-medium pr-4 py-1 align-middle">{hora}</td>
                {DIAS.map((dia) => {
                  const key = `${hora}-${dia}`;
                  const isActive = !!slots[key];
                  return (
                    <td key={dia} className="px-1.5 py-1">
                      <button
                        onClick={() => toggle(hora, dia)}
                        className={cn(
                          "w-full h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150",
                          isActive
                            ? "border-purple-300 bg-purple-100 hover:bg-purple-200"
                            : "border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50",
                        )}
                      >
                        <span className={cn(
                          "h-2.5 w-2.5 rounded-full transition-all",
                          isActive ? "bg-purple-500 scale-110" : "bg-transparent",
                        )} />
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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