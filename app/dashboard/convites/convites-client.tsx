/**
 * Componente Cliente - Página de Convites Interativa
 * Este é um componente com estado que gerencia a interação do utilizador
 * com os convites (aceitar/recusar)
 */
"use client";

import { useState } from "react";
// Importar ícones para diferentes estados do convite
import { Mail, CheckCircle2, XCircle, Clock, GraduationCap } from "lucide-react";
// Utilitário para combinar classes CSS
import { cn } from "@/lib/utils";
// Componente reutilizável de botão
import { Button } from "@/components/ui/button";
// Ação do servidor para responder ao convite
import { responderConvite } from "./actions";

// Tipos possíveis de status de um convite
type ConviteStatus = "pendente" | "aceite" | "recusado";

/**
 * Interface que define a estrutura de um convite
 * (compatível com o que é retornado da action)
 */
interface Convite {
  id: string;
  modulo: string;
  codigo: string;
  curso: string;
  coordenador: string;
  dataEnvio: string;
  status: ConviteStatus;
}

/**
 * Configuração visual para cada status de convite
 * Define: label (texto), ícone e classes Tailwind para cores
 */
const STATUS_CONFIG: Record<ConviteStatus, { label: string; icon: React.ElementType; className: string }> = {
  pendente:  { label: "Pendente",  icon: Clock,         className: "bg-amber-100 text-amber-700" },
  aceite:    { label: "Aceite",    icon: CheckCircle2,  className: "bg-green-100 text-green-700" },
  recusado:  { label: "Recusado",  icon: XCircle,       className: "bg-red-100 text-red-600" },
};

/**
 * Componente principal do cliente
 * Gerencia lista de convites com funcionalidade de aceitar/recusar
 */
export function ConvitesClient({ convitesIniciais }: { convitesIniciais: Convite[] }) {
  // Estado para armazenar convites (atualiza quando o utilizador responde)
  const [convites, setConvites] = useState<Convite[]>(convitesIniciais);
  // Estado para desabilitar botões enquanto processa a resposta
  const [carregando, setCarregando] = useState(false);

  /**
   * Função para responder a um convite (aceitar ou recusar)
   * 
   * - Envia a resposta ao servidor via Server Action
   * - Atualiza o estado local para refletir a mudança imediatamente
   * - Mostra alerta se houver erro
   */
  async function responder(id: string, resposta: "aceite" | "recusado") {
    try {
      setCarregando(true);
      // Converter resposta "aceite"/"recusado" para formato Prisma (maiúscula)
      const statusPrisma = resposta === "aceite" ? "ACEITE" : "RECUSADO";
      // Chamar server action para atualizar BD
      await responderConvite(id, statusPrisma);
      
      // Atualizar lista local para refletir a mudança (otimistic update)
      setConvites((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: resposta } : c))
      );
    } catch (error) {
      console.error("Erro ao responder convite:", error);
      alert("Erro ao registar resposta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  // Filtrar convites por status para exibir em seções diferentes
  const pendentes  = convites.filter((c) => c.status === "pendente"); // Convites que precisam resposta
  const historico  = convites.filter((c) => c.status !== "pendente"); // Já respondidos

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">Convites</h1>
        <p className="mt-0.5 text-sm text-gray-500">Convites para módulos enviados pelo coordenador</p>
      </div>

      {/* SEÇÃO: CONVITES PENDENTES */}
      <div className="flex flex-col gap-3">
        {/* Cabeçalho com contador */}
        <h2 className="text-sm font-semibold text-gray-700">
          Pendentes{" "}
          {pendentes.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              {pendentes.length}
            </span>
          )}
        </h2>

        {/* Se não há convites pendentes, mostrar mensagem vazia */}
        {pendentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
            <Mail className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">Sem convites pendentes</p>
          </div>
        ) : (
          /* Listar cada convite pendente */

          pendentes.map((convite) => (
            /* Card do convite com informações e botões de acção */
            <div key={convite.id} className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              {/* Ícone do convite */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
              {/* Informações do convite */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                {/* Nome do módulo */}
                <span className="text-sm font-bold text-gray-900">{convite.modulo}</span>
                {/* Código/ID do módulo */}
                <span className="text-xs text-purple-600 font-medium">{convite.codigo}</span>
                {/* Detalhes adicionais: curso, coordenador, data */}
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{convite.curso}</span>
                  <span>De: {convite.coordenador}</span>
                  <span>{convite.dataEnvio}</span>
                </div>
              </div>
              {/* Botões de ação: Recusar e Aceitar */}
              <div className="flex gap-2 shrink-0">
                {/* Botão Recusar */}
                <Button
                  size="sm"
                  onClick={() => responder(convite.id, "recusado")}
                  variant="outline"
                  disabled={carregando} // Desabilitar enquanto processa
                  className="rounded-xl border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500 text-xs px-3"
                >
                  Recusar
                </Button>
                {/* Botão Aceitar (principal) */}
                <Button
                  size="sm"
                  onClick={() => responder(convite.id, "aceite")}
                  disabled={carregando} // Desabilitar enquanto processa
                  className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs px-3"
                >
                  Aceitar
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEÇÃO: HISTÓRICO (Convites já respondidos) */}
      {historico.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Cabeçalho */}
          <h2 className="text-sm font-semibold text-gray-700">Histórico</h2>
          {/* Listar cada convite respondido */}
          {historico.map((convite) => {
            // Buscar configuração visual do status
            const cfg = STATUS_CONFIG[convite.status];
            const Icon = cfg.icon; // Ícone correspondente ao status
            return (
              /* Card do convite no histórico (sem botões de ação) */
              <div key={convite.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                {/* Ícone */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                {/* Informações do convite */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  {/* Nome do módulo */}
                  <span className="text-sm font-semibold text-gray-800">{convite.modulo}</span>
                  {/* Detalhes: código, curso, data */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span>{convite.codigo}</span>
                    <span>·</span>
                    <span>{convite.curso}</span>
                    <span>·</span>
                    <span>{convite.dataEnvio}</span>
                  </div>
                </div>
                {/* Badge de status com cor e ícone */}
                <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0", cfg.className)}>
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
