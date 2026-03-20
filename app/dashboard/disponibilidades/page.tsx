'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { salvarDisponibilidades } from './actions';

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const HORAS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// Pre-selected slots matching the image (updated for 30-min intervals)
const INITIAL: Record<string, boolean> = {
  '09:00-Segunda': true,  '09:00-Terça': true,  '09:00-Quinta': true, '09:00-Sexta': true,
  '09:30-Segunda': true,  '09:30-Terça': true,  '09:30-Quinta': true, '09:30-Sexta': true,
  '10:00-Segunda': true,  '10:00-Terça': true,  '10:00-Quinta': true, '10:00-Sexta': true,
  '10:30-Segunda': true,  '10:30-Terça': true,  '10:30-Quinta': true,
  '11:00-Segunda': true,  '11:00-Terça': true,  '11:00-Quinta': true,
  '14:00-Segunda': true,  '14:00-Quarta': true, '14:00-Quinta': true,
  '14:30-Segunda': true,  '14:30-Quarta': true,
  '15:00-Segunda': true,  '15:00-Quarta': true,
  '16:00-Quarta': true,
  '16:30-Quarta': true,
};

export default function DisponibilidadesPage() {
  const [slots, setSlots] = useState<Record<string, boolean>>(INITIAL);
  const [saved, setSaved] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function toggle(hora: string, dia: string) {
    const key = `${hora}-${dia}`;
    setSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setCarregando(true);
    try {
      const resultado = await salvarDisponibilidades(slots);
      
      if (resultado.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(`Erro ao guardar: ${resultado.error}`);
      }
    } catch (erro) {
      console.error('Erro:', erro);
      alert('Erro ao guardar disponibilidades');
    } finally {
      setCarregando(false);
    }
  }

  const totalSelected = Object.values(slots).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900">Disponibilidades</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Clique nos blocos para marcar disponibilidade · {totalSelected} blocos selecionados
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={carregando}
          className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5"
        >
          <Save className="h-4 w-4" />
          {carregando ? 'Guardando...' : saved ? 'Guardado!' : 'Guardar'}
        </Button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="w-20 text-left text-sm font-semibold text-gray-500 pb-2">Hora</th>
              {DIAS.map((dia) => (
                <th key={dia} className="text-center text-sm font-semibold text-gray-600 pb-2">
                  {dia}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora) => (
              <tr key={hora}>
                {/* Hour label */}
                <td className="text-sm text-gray-400 font-medium pr-4 py-1 align-middle">
                  {hora}
                </td>
                {/* Day slots */}
                {DIAS.map((dia) => {
                  const key = `${hora}-${dia}`;
                  const isActive = !!slots[key];
                  return (
                    <td key={dia} className="px-1.5 py-1">
                      <button
                        onClick={() => toggle(hora, dia)}
                        disabled={carregando}
                        className={cn(
                          'w-full h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150',
                          carregando && 'opacity-50 cursor-not-allowed',
                          isActive
                            ? 'border-purple-300 bg-purple-100 hover:bg-purple-200'
                            : 'border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50'
                        )}
                      >
                        <span className={cn(
                          'h-2.5 w-2.5 rounded-full transition-all',
                          isActive ? 'bg-purple-500 scale-110' : 'bg-transparent'
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