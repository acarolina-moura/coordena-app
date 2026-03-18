'use client';

/**
 * ============================================================================
 * COMPONENTE: Template Avaliações Modal
 * ============================================================================
 * 
 * Modal para que o formador defina os componentes de avaliação e seus pesos
 * para um módulo específico.
 * 
 * Características:
 * - Adicionar/remover itens (Ficha, Projeto, Teste, etc)
 * - Validação que o peso total é 80%
 * - Barra visual mostrando o peso acumulado
 * - Integração com Server Actions
 * ============================================================================
 */

import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { salvarTemplateAvaliacao } from '../actions';

interface TemplateItem {
  nome: string;
  peso: number;
}

interface TemplateAvaliacoeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduloId: string;
  moduloNome: string;
  onSuccess?: () => void;
}

export function TemplateAvaliacoeModal({
  open,
  onOpenChange,
  moduloId,
  moduloNome,
  onSuccess,
}: TemplateAvaliacoeModalProps) {
  const [items, setItems] = useState<TemplateItem[]>([
    { nome: 'Ficha', peso: 20 },
    { nome: 'Projeto', peso: 35 },
    { nome: 'Teste', peso: 25 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState< string | null>(null);

  // Calcular peso total
  const pesoTotal = items.reduce((acc, item) => acc + item.peso, 0);
  const pesoCorrecto = pesoTotal === 80;

  /**
   * Adicionar novo item ao template
   */
  function adicionarItem() {
    setItems([
      ...items,
      {
        nome: '',
        peso: 0,
      },
    ]);
  }

  /**
   * Remover item do template
   */
  function removerItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  /**
   * Atualizar nome de um item
   */
  function atualizarNome(index: number, nome: string) {
    const novoItems = [...items];
    novoItems[index].nome = nome;
    setItems(novoItems);
  }

  /**
   * Atualizar peso de um item
   */
  function atualizarPeso(index: number, peso: number) {
    const novoItems = [...items];
    novoItems[index].peso = peso;
    setItems(novoItems);
  }

  /**
   * Salvar o template
   */
  async function salvar() {
    if (!pesoCorrecto) {
      setError(`O peso total deve ser 80%. Atual: ${pesoTotal}%`);
      return;
    }

    if (items.some((item) => !item.nome || item.peso <= 0)) {
      setError('Todos os itens devem ter nome e peso > 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await salvarTemplateAvaliacao(
        moduloId,
        items.map((item, index) => ({
          nome: item.nome,
          peso: item.peso,
          ordem: index + 1,
        }))
      );

      if (resultado.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setError(resultado.error || 'Erro ao salvar template');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Definir Componentes de Avaliação - {moduloNome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info sobre peso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold">ℹ Informação:</p>
            <p className="text-xs mt-1">
              Os componentes de avaliação podem totalizar até 80% da nota final.
              Os restantes 20% correspondem à assiduidade.
            </p>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Componentes de Avaliação</Label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-end">
                {/* Nome */}
                <div className="flex-1">
                  <Label className="text-xs text-gray-600">Nome</Label>
                  <Input
                    placeholder="Ex: Ficha, Projeto, Teste"
                    value={item.nome}
                    onChange={(e) => atualizarNome(index, e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Peso */}
                <div className="w-24">
                  <Label className="text-xs text-gray-600">Peso (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.peso}
                    onChange={(e) => atualizarPeso(index, parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                {/* Remover */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removerItem(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Visualização de peso total */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total de Peso:</span>
              <span className={pesoCorrecto ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {pesoTotal}%
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  pesoCorrecto ? 'bg-green-500' : pesoTotal > 80 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min((pesoTotal / 80) * 100, 100)}%` }}
              />
            </div>

            {!pesoCorrecto && (
              <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>O peso total deve ser exatamente 80%</span>
              </div>
            )}
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Botão para adicionar novo item */}
          <Button
            variant="outline"
            onClick={adicionarItem}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Item
          </Button>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={salvar}
              disabled={loading || !pesoCorrecto}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'A guardar...' : 'Guardar Template'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
