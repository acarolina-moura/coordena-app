'use client';

/**
 * ============================================================================
 * COMPONENTE: Formador Notas
 * ============================================================================
 * 
 * Interface para que o formador:
 * 1. Veja os módulos que leciona
 * 2. Para cada módulo, veja os alunos inscritos
 * 3. Veja presenças e % assiduidade de cada aluno
 * 4. Defina um template de avaliação (Ficha, Projeto, etc)
 * 5. Preencha notas para os componentes
 * 6. Veja a Nota Final calculada automaticamente
 * 
 * Tabela Base (sempre visível):
 * - Aluno | Presenças | % Assiduidade | [Componentes dinâmicos] | Nota Final
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TemplateAvaliacoeModal } from './template-avaliacoes-modal';
import {
  obterTemplateAvaliacao,
  salvarNotasParciais,
  obterNotasParciaisAluno,
  calcularNotaFinal,
  obterModulosComAlunos,
  obterNotasFinais,
} from '../actions';
import { cn } from '@/lib/utils';

interface TemplateItem {
  id: string;
  nome: string;
  peso: number;
  ordem: number;
}

interface Template {
  id: string;
  items: TemplateItem[];
}

interface Aluno {
  id: string;
  nome: string;
  presencas: number;
  totalSessoes: number;
}

interface Modulo {
  id: string;
  nome: string;
  alunos: Aluno[];
}

interface NotasState {
  [formandoId: string]: {
    [itemId: string]: number;
  };
}

interface NotasFinaisState {
  [formandoId: string]: number | null;
}

export default function FormadorNotasPage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [templates, setTemplates] = useState<Record<string, Template | null>>({});
  const [notas, setNotas] = useState<NotasState>({});
  const [notasFinais, setNotasFinais] = useState<NotasFinaisState>({});
  const [loading, setLoading] = useState(true);
  const [modalTemplateAberto, setModalTemplateAberto] = useState(false);
  const [modalModuloId, setModalModuloId] = useState<string | null>(null);

  /**
   * Carregar módulos e templates ao montar o componente
   */
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // Obter módulos com alunos da BD via Server Action
        const resultado = await obterModulosComAlunos();
        
        if (resultado.success && resultado.modulos) {
          setModulos(resultado.modulos);

          // Carregar templates para cada módulo
          const novosTemplates: Record<string, Template | null> = {};
          for (const modulo of resultado.modulos) {
            const resultadoTemplate = await obterTemplateAvaliacao(modulo.id);
            novosTemplates[modulo.id] = resultadoTemplate.template || null;
          }
          setTemplates(novosTemplates);
        } else {
          console.error('Erro ao carregar módulos:', resultado.error);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  /**
   * Carregar notas finais ao montar
   */
  useEffect(() => {
    async function carregarNotasFinaisAoMontar() {
      try {
        const resultado = await obterNotasFinais();
        if (resultado.success && resultado.notasFinais) {
          setNotasFinais(resultado.notasFinais);
        }
      } catch (error) {
        console.error('Erro ao carregar notas finais:', error);
      }
    }

    carregarNotasFinaisAoMontar();
  }, []);

  /**
   * Quando receber módulos e templates estiverem prontos,
   * carregar apenas as notas existentes cujos items ainda estão no template
   * Nota final será calculada apenas ao guardar
   */
  useEffect(() => {
    async function carregarNotasExistentes() {
      const novasNotas: NotasState = {};

      for (const modulo of modulos) {
        // Obter IDs dos items válidos no template atual
        const templateAtual = templates[modulo.id];
        const itemsValidos = new Set(
          templateAtual?.items.map((item) => item.id) || []
        );

        for (const aluno of modulo.alunos) {
          const resultado = await obterNotasParciaisAluno(aluno.id, modulo.id);

          if (resultado.notas && resultado.notas.length > 0) {
            // NÃO resetar, fazer MERGE das notas
            if (!novasNotas[aluno.id]) {
              novasNotas[aluno.id] = {};
            }
            
            resultado.notas.forEach((nota: { item: { id: string }; valor: number }) => {
              // Se há template, só incluir notas cujos items existem
              // Se não há template, incluir todas as notas (podem ter sido criadas antes)
              if (templateAtual === null || itemsValidos.has(nota.item.id)) {
                novasNotas[aluno.id][nota.item.id] = nota.valor;
              }
            });
          }
        }
      }

      setNotas(novasNotas);
    }

    // Só carregar notas quando templates já estão prontos
    if (modulos.length > 0 && Object.keys(templates).length > 0) {
      carregarNotasExistentes();
    }
  }, [modulos, templates]);

  /**
   * Filtrar módulos por busca
   */
  const modulosFiltrados = modulos.filter((modulo) =>
    modulo.alunos.some((aluno) =>
      aluno.nome.toLowerCase().includes(search.toLowerCase())
    ) || modulo.nome.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Atualizar nota parcial
   */
  function atualizarNota(formandoId: string, itemId: string, valor: number) {
    setNotas((prev) => ({
      ...prev,
      [formandoId]: {
        ...(prev[formandoId] || {}),
        [itemId]: valor,
      },
    }));
  }

  /**
   * Salvar todas as notas da sessão
   */
  async function salvarTodas() {
    setSaved(false);

    try {
      for (const modulo of modulos) {
        // Obter template para validar items
        const template = templates[modulo.id];
        const itemsValidos = new Set(template?.items.map((item) => item.id) || []);

        for (const aluno of modulo.alunos) {
          const notasAluno = notas[aluno.id] || {};

          // Filtrar apenas items que existem no template atual
          // Se não há template, guardar todas as notas preenchidas
          const notasValidas = Object.entries(notasAluno)
            .filter(([itemId]) => {
              if (template) {
                // Se há template, só aceitar items do template
                return itemsValidos.has(itemId);
              }
              // Se não há template, aceitar todas as notas preenchidas
              return true;
            })
            .reduce((acc, [itemId, valor]) => {
              acc[itemId] = valor;
              return acc;
            }, {} as Record<string, number>);

          if (Object.keys(notasValidas).length > 0) {
            const resultado = await salvarNotasParciais(
              modulo.id,
              aluno.id,
              notasValidas
            );

            if (!resultado.success) {
              console.error(`Erro ao salvar notas de ${aluno.nome}:`, resultado.error);
            } else {
              // Recarregar as notas do servidor após guardar com sucesso
              const resultadoRecarregar = await obterNotasParciaisAluno(aluno.id, modulo.id);
              
              if (resultadoRecarregar.notas && resultadoRecarregar.notas.length > 0) {
                setNotas((prev) => ({
                  ...prev,
                  [aluno.id]: {
                    ...(prev[aluno.id] || {}),
                    ...resultadoRecarregar.notas.reduce((acc, nota) => {
                      acc[nota.item.id] = nota.valor;
                      return acc;
                    }, {} as Record<string, number>),
                  },
                }));
              }
            }
          }

          // Calcular nota final após salvar as notas
          const percentualAssiduidade = aluno.totalSessoes > 0
            ? Math.round((aluno.presencas / aluno.totalSessoes) * 100)
            : 0;

          const resultadoNotaFinal = await calcularNotaFinal(
            aluno.id,
            modulo.id,
            percentualAssiduidade
          );

          if (resultadoNotaFinal.success && resultadoNotaFinal.notaFinal !== undefined) {
            setNotasFinais((prev) => ({
              ...prev,
              [`${modulo.id}_${aluno.id}`]: resultadoNotaFinal.notaFinal || null,
            }));
          }
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    }
  }

  /**
   * Abrir modal para definir template
   */
  function abrirModalTemplate(moduloId: string) {
    setModalModuloId(moduloId);
    setModalTemplateAberto(true);
  }

  /**
   * Quando template é salvo, recarregar
   */
  function aoSalvarTemplate() {
    const modulo = modulos.find((m) => m.id === modalModuloId);
    if (modulo) {
      obterTemplateAvaliacao(modulo.id).then((resultado) => {
        setTemplates((prev) => ({
          ...prev,
          [modulo.id]: resultado.template || null,
        }));
      });
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando módulos...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">Avaliações e Notas</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Gerencie templates de avaliação e registre notas de alunos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar aluno ou módulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm rounded-xl dark:text-gray-200"
            />
          </div>
          <Button
            onClick={salvarTodas}
            className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-5"
          >
            <Save className="h-4 w-4" />
            {saved ? 'Guardado!' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Módulos */}
      <div className="space-y-4">
        {modulosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center text-gray-500 dark:text-gray-400">
            <p>Nenhum módulo encontrado.</p>
          </div>
        ) : (
          modulosFiltrados.map((modulo) => {
            const template = templates[modulo.id];
            const alunosFiltrados = modulo.alunos.filter((aluno) =>
              aluno.nome.toLowerCase().includes(search.toLowerCase())
            );

            if (alunosFiltrados.length === 0) return null;

            return (
              <div
                key={modulo.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
              >
                {/* Header do módulo */}
                <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">{modulo.nome}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {modulo.alunos.length} aluno{modulo.alunos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalTemplate(modulo.id)}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    {template ? 'Editar' : 'Definir'} Template
                  </Button>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                  {!template && Object.keys(notas).length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 mx-6 mt-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ Existem notas registadas mas nenhum template definido. Defina um template para poder editar as notas.
                      </p>
                    </div>
                  )}
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 px-6 py-3">
                          Aluno
                        </th>
                        <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-3">
                          Presenças
                        </th>
                        <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-3">
                          % Assiduidade
                        </th>

                        {/* Colunas dinâmicas dos componentes */}
                        {template?.items
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((item) => (
                            <th
                              key={item.id}
                              className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-3"
                            >
                              {item.nome}
                              <br />
                              <span className="font-normal text-gray-500">({item.peso}%)</span>
                            </th>
                          ))}

                        {!template && Object.keys(notas).length > 0 && (
                          <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 px-4 py-3">
                            Notas existentes
                          </th>
                        )}

                        <th className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 px-6 py-3">
                          Nota Final
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {alunosFiltrados.map((aluno) => {
                        const assiduidade = Math.round(
                          (aluno.presencas / aluno.totalSessoes) * 100
                        );

                        return (
                          <tr key={aluno.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            {/* Nome do aluno */}
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              {aluno.nome}
                            </td>

                            {/* Presenças */}
                            <td className="px-4 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">
                                {aluno.presencas}/{aluno.totalSessoes}
                              </span>
                            </td>

                            {/* % Assiduidade */}
                            <td className="px-4 py-4 text-center text-sm">
                              <span
                                className={cn(
                                  'font-medium',
                                  assiduidade >= 75
                                    ? 'text-green-600'
                                    : assiduidade >= 50
                                      ? 'text-amber-600'
                                      : 'text-red-600'
                                )}
                              >
                                {assiduidade}%
                              </span>
                            </td>

                            {/* Colunas dos componentes */}
                            {template?.items
                              .sort((a, b) => a.ordem - b.ordem)
                              .map((item) => {
                                const valor = notas[aluno.id]?.[item.id];

                                return (
                                  <td key={item.id} className="px-4 py-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      value={valor ?? ''}
                                      onChange={(e) =>
                                        atualizarNota(
                                          aluno.id,
                                          item.id,
                                          e.target.value
                                            ? parseFloat(e.target.value)
                                            : 0
                                        )
                                      }
                                      placeholder="—"
                                    className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                  </td>
                                );
                              })}

                            {/* Notas existentes (read-only se não há template) */}
                            {!template && Object.keys(notas).length > 0 && (
                              <td className="px-4 py-4 text-center text-xs text-gray-600 dark:text-gray-400">
                                {notas[aluno.id] && Object.values(notas[aluno.id]).length > 0
                                  ? Object.values(notas[aluno.id]).join(", ")
                                  : "—"}
                              </td>
                            )}

                            {/* Nota Final */}
                            <td className="px-6 py-4 text-center text-sm font-bold">
                              {notasFinais[`${modulo.id}_${aluno.id}`] !== undefined && notasFinais[`${modulo.id}_${aluno.id}`] !== null ? (
                                <span className={cn(
                                  notasFinais[`${modulo.id}_${aluno.id}`]! >= 10
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                )}>
                                  {notasFinais[`${modulo.id}_${aluno.id}`]}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalModuloId && (
        <TemplateAvaliacoeModal
          open={modalTemplateAberto}
          onOpenChange={setModalTemplateAberto}
          moduloId={modalModuloId}
          moduloNome={modulos.find((m) => m.id === modalModuloId)?.nome || ''}
          onSuccess={aoSalvarTemplate}
        />
      )}
    </div>
  );
}
