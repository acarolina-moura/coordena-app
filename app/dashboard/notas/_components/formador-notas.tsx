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
import { Search, Plus, Save, Eye, Download, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TemplateAvaliacoeModal } from './template-avaliacoes-modal';
import {
  obterTemplateAvaliacao,
  salvarNotasParciais,
  obterNotasParciaisAluno,
  calcularNotaFinal,
  obterModulosComAlunos,
  obterNotasFinais,
  obterTrabalhosPorAluno,
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

interface Trabalho {
  itemId: string;
  nome: string;
  ordem: number;
  peso: number;
  entregue: boolean;
  dataEntrega: string | null;
  ficheiro: string | null;
  comentario: string | null;
}

interface AlunoSelecionado {
  alunoId: string;
  alunoNome: string;
  moduloId: string;
}

export default function FormadorNotasPage() {
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoSelecionado | null>(null);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [carregandoTrabalhos, setCarregandoTrabalhos] = useState(false);
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
            if (!resultadoTemplate.success) {
              console.error(`Erro ao carregar template do módulo ${modulo.id}:`, resultadoTemplate.error);
            }
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
            // Criar chave única por módulo+aluno
            const chaveAluno = `${modulo.id}_${aluno.id}`;
            
            // NÃO resetar, fazer MERGE das notas
            if (!novasNotas[chaveAluno]) {
              novasNotas[chaveAluno] = {};
            }
            
            resultado.notas.forEach((nota: { item: { id: string }; valor: number }) => {
              // Se há template, só incluir notas cujos items existem
              // Se não há template, incluir todas as notas (podem ter sido criadas antes)
              if (templateAtual === null || itemsValidos.has(nota.item.id)) {
                novasNotas[chaveAluno][nota.item.id] = nota.valor;
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
          const notasAluno = notas[`${modulo.id}_${aluno.id}`] || {};

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
                setNotas((prev) => {
                  const chaveAluno = `${modulo.id}_${aluno.id}`;
                  return {
                    ...prev,
                    [chaveAluno]: {
                      ...(prev[chaveAluno] || {}),
                      ...resultadoRecarregar.notas.reduce((acc, nota) => {
                        acc[nota.item.id] = nota.valor;
                        return acc;
                      }, {} as Record<string, number>),
                    },
                  };
                });
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
   * Abrir popup com trabalhos do aluno
   */
  async function abrirTrabalhos(alunoId: string, alunoNome: string, moduloId: string) {
    setAlunoSelecionado({ alunoId, alunoNome, moduloId });
    setCarregandoTrabalhos(true);
    try {
      const resultado = await obterTrabalhosPorAluno(alunoId, moduloId);
      if (resultado.success) {
        setTrabalhos(resultado.trabalhos);
      }
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
    } finally {
      setCarregandoTrabalhos(false);
    }
  }

  /**
   * Fechar popup de trabalhos
   */
  function fecharTrabalhos() {
    setAlunoSelecionado(null);
    setTrabalhos([]);
  }

  /**
   * Quando template é salvo, recarregar módulos + templates + notas completamente
   */
  async function aoSalvarTemplate() {
    try {
      // Recarregar módulos e templates do zero
      const resultado = await obterModulosComAlunos();
      if (resultado.success && resultado.modulos) {
        setModulos(resultado.modulos);

        // Recarregar templates para cada módulo
        const novosTemplates: Record<string, Template | null> = {};
        for (const modulo of resultado.modulos) {
          const resultadoTemplate = await obterTemplateAvaliacao(modulo.id);
          novosTemplates[modulo.id] = resultadoTemplate.template || null;
        }
        setTemplates(novosTemplates);

        // Recarregar notas para os novos módulos
        const novasNotas: NotasState = {};
        for (const modulo of resultado.modulos) {
          for (const aluno of modulo.alunos) {
            const resultadoNotas = await obterNotasParciaisAluno(aluno.id, modulo.id);
            if (resultadoNotas.notas && resultadoNotas.notas.length > 0) {
              const chaveAluno = `${modulo.id}_${aluno.id}`;
              novasNotas[chaveAluno] = {};
              resultadoNotas.notas.forEach((nota: { item: { id: string }; valor: number }) => {
                novasNotas[chaveAluno][nota.item.id] = nota.valor;
              });
            }
          }
        }
        setNotas(novasNotas);
      }
    } catch (error) {
      console.error('Erro ao recarregar dados após salvar template:', error);
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
        {modulosFiltrados.length === 0 && !loading ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nenhum módulo encontrado</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Para lecionar um módulo, o coordenador deve associar-te a um módulo. Após a associação, o módulo aparecerá aqui com os alunos inscritos.
            </p>
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
                  {!template && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 mx-6 mt-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ⚠️ Nenhum template de avaliação definido para este módulo. Clica em &quot;Definir Template&quot; para poderes inserir notas.
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
                        const assiduidade = aluno.totalSessoes > 0
                          ? Math.round(
                              (aluno.presencas / aluno.totalSessoes) * 100
                            )
                          : 0;

                        return (
                          <tr key={aluno.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            {/* Nome do aluno */}
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                              <div className="flex items-center gap-2">
                                {aluno.nome}
                                {template && (
                                  <button
                                    onClick={() => abrirTrabalhos(aluno.id, aluno.nome, modulo.id)}
                                    className="p-1 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                    title="Ver trabalhos entregues"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
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
                                const valor = notas[`${modulo.id}_${aluno.id}`]?.[item.id];

                                return (
                                  <td key={item.id} className="px-4 py-4 text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      max="20"
                                      step="0.5"
                                      value={valor ?? ''}
                                      onChange={(e) => {
                                        const valorInput = e.target.value ? parseFloat(e.target.value) : 0;
                                        
                                        if (valorInput > 20) {
                                          toast.error('Nota máxima é 20');
                                          e.target.value = '20';
                                          setNotas((prev) => ({
                                            ...prev,
                                            [`${modulo.id}_${aluno.id}`]: {
                                              ...(prev[`${modulo.id}_${aluno.id}`] || {}),
                                              [item.id]: 20,
                                            },
                                          }));
                                          return;
                                        }
                                        
                                        setNotas((prev) => ({
                                          ...prev,
                                          [`${modulo.id}_${aluno.id}`]: {
                                            ...(prev[`${modulo.id}_${aluno.id}`] || {}),
                                            [item.id]: valorInput,
                                          },
                                        }));
                                      }}
                                      placeholder="—"
                                      className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                  </td>
                                );
                              })}

                            {/* Notas existentes (read-only se não há template) */}
                            {!template && Object.keys(notas).length > 0 && (
                              <td className="px-4 py-4 text-center text-xs text-gray-600 dark:text-gray-400">
                                {notas[`${modulo.id}_${aluno.id}`] && Object.values(notas[`${modulo.id}_${aluno.id}`]).length > 0
                                  ? Object.values(notas[`${modulo.id}_${aluno.id}`]).join(", ")
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

      {/* Modal de Trabalhos */}
      {alunoSelecionado && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Trabalhos Entregues</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{alunoSelecionado.alunoNome}</p>
              </div>
              <button
                onClick={fecharTrabalhos}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {carregandoTrabalhos ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">A carregar...</p>
                </div>
              ) : trabalhos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum trabalho definido para este módulo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trabalhos.map((trabalho) => (
                    <div
                      key={trabalho.itemId}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{trabalho.nome}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Peso: {trabalho.peso}%
                          </p>
                          {trabalho.entregue ? (
                            <>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                ✓ Entregue em {new Date(trabalho.dataEntrega!).toLocaleDateString('pt-PT')}
                              </p>
                              {trabalho.comentario && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                                  "{trabalho.comentario}"
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">✗ Não entregue</p>
                          )}
                        </div>
                        {trabalho.entregue && trabalho.ficheiro && (
                          <a
                            href={trabalho.ficheiro}
                            download
                            className="p-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            title="Descarregar ficheiro"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={fecharTrabalhos}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
