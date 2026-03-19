"use client";

import React, { useState } from "react";
import { TrendingUp, Award, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MinhasNotas } from "../../_data/formando";

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormandoNotas({ inicial }: { inicial: MinhasNotas }) {
  const [notas] = useState<MinhasNotas>(inicial);

  // Cálculo da Média Geral
  const avg = notas.length > 0
    ? (notas.reduce((sum, item) => sum + item.nota, 0) / notas.length).toFixed(1)
    : "0";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-800">As Minhas Notas</h1>
            <p className="text-sm text-slate-500 mt-1">Consulte o seu desempenho acadêmico</p>
          </div>

          {/* Card de Média Geral */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200/50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-80 text-teal-50">Média Geral</p>
                <p className="text-4xl font-bold">
                  {avg}<span className="text-lg font-normal opacity-60">/20</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tabela de Notas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulo</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Nota</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {notas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                        Ainda não tens notas registadas.
                      </td>
                    </tr>
                  )}
                  {notas.map((item, i) => {
                    const isPassed = item.nota >= 10;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">{item.modulo}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {item.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-lg font-bold ${isPassed ? "text-emerald-600" : "text-red-500"}`}>
                              {item.nota}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase">Valores</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isPassed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}>
                            {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {isPassed ? "Aprovado" : "Reprovado"}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}