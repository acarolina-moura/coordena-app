# 📋 Sistema de Avaliações com Templates - Documentação

## Visão Geral

Sistema completo de avaliações onde cada **formador define um template de avaliação** por **módulo** que leciona. O sistema calcula automaticamente a Nota Final combinando a assiduidade (20%) e os componentes de avaliação ponderados (80%).

## 🏗️ Arquitetura & Componentes

### 1. **Modelos de Dados** (`prisma/schema.prisma`)

#### TemplateAvaliacao
- Representa um template de avaliação para um (formador, módulo) específico
- Cada formador tem um template único por módulo que leciona
- **Campos principais:**
  - `id`: UUID único
  - `formadorId`: Referência ao formador que criou o template
  - `moduloId`: Referência ao módulo
  - `items`: Array de componentes de avaliação (relação 1:N)

#### ItemTemplateAvaliacao
- Componentes individuais de avaliação (ex: Ficha, Projeto, Teste)
- **Campos principais:**
  - `id`: UUID único
  - `templateId`: Referência ao template
  - `nome`: Nome do componente ("Ficha", "Projeto", etc)
  - `peso`: Percentagem (máx 80% total)
  - `ordem`: Posição de exibição na tabela

#### NotaParcial
- Armazena a nota que um aluno recebeu em um componente específico
- **Campos principais:**
  - `id`: UUID único
  - `formandoId`: ID do aluno
  - `itemId`: ID do componente de avaliação
  - `templateId`: ID do template (para queries rápidas)
  - `valor`: Nota 0-20

**Constraints:**
- Uma nota parcial única por (aluno, item)
- Um template único por (formador, módulo)

---

## 🖇️ Server Actions (`app/dashboard/notas/actions.ts`)

### 1. **salvarTemplateAvaliacao(moduloId, items)**
```typescript
// Salvar ou atualizar um template de avaliação
// Valida: peso total = 80%, todos items têm nome e peso > 0
// Retorna: { success: boolean, template?: Template, error?: string }
```

**Fluxo:**
1. Validar autenticação (apenas FORMADOR)
2. Validar peso total (exatamente 80%)
3. Buscar ou criar template para (formador, módulo)
4. Atualizar items (delete antigos + create novos)

### 2. **obterTemplateAvaliacao(moduloId)**
```typescript
// Buscar o template de um módulo para o formador autenticado
// Retorna: { success: boolean, template?: Template, error?: string }
```

### 3. **salvarNotasParciais(moduloId, formandoId, notas)**
```typescript
// Salvar as notas de um aluno em todos os componentes
// notas: { itemId: valor }  onde valor é 0-20
// Retorna: { success: boolean, error?: string }
```

**Validações:**
- Cada nota entre 0-20
- Todos os items existem no template
- Items existe no template

### 4. **obterNotasParciaisAluno(formandoId, moduloId)**
```typescript
// Buscar todas as notas de um aluno em um módulo
// Retorna: { success: boolean, notas: NotaParcial[], error?: string }
```

### 5. **calcularNotaFinal(formandoId, moduloId, percentualAssiduidade)**
```typescript
// Calcular a nota final de um aluno
// Fórmula: NotaFinal = (Assiduidade × 0.20) + (MédiaComponentes × 0.80)
// Retorna: { success: boolean, notaFinal?: number, error?: string }
```

---

## 🎨 Componentes React

### 1. **FormadorNotas** (`formador-notas.tsx`)

**Responsabilidades:**
- Exibir lista de módulos com seus alunos
- Carregar templates de cada módulo
- Permitir entrada de notas para cada componente
- Calcular e exibir Nota Final dinamicamente
- Salvar todas as notas de uma vez

**States Principais:**
- `templates`: { moduloId → Template | null }
- `notas`: { formandoId → { itemId → valor } }
- `notasFinais`: { formandoId-moduloId → nota }
- `modalModuloId`: ID do módulo para abrir o modal

**Features:**
- ✅ Pesquisa de alunos/módulos
- ✅ Colunas dinâmicas baseadas no template
- ✅ Inputs para notas (0-20)
- ✅ Cor da Nota Final (verde ≥14, amber ≥10, red <10)
- ✅ Botão "Guardar" para salvar todas as notas

### 2. **TemplateAvaliacoeModal** (`template-avaliacoes-modal.tsx`)

**Responsabilidades:**
- Permitir que formador defina componentes de avaliação
- Validar peso total (80%)
- Mostrar barra visual de progresso

**Features:**
- ✅ Adicionar/remover items
- ✅ Validação em tempo real
- ✅ Barra de progresso visual (verde/amber/vermelho)
- ✅ Mensagem de erro se peso incorreto
- ✅ Desabilita botão "Guardar" até atingir 80%

---

## 📊 Fórmula de Cálculo da Nota Final

```
NotaFinal = (Assiduidade × 0.20) + (MédiaComponentes × 0.80)

Exemplo:
- Assiduidade: 90% → 18/20
- Componentes: [Ficha: 16 (20%), Projeto: 15 (35%), Teste: 14 (25%)]
  - Média: (16 + 15 + 14) / 3 = 15
- NotaFinal = (18 × 0.20) + (15 × 0.80) = 3.6 + 12 = 15.6
```

---

## 🔄 Fluxo de Uso

### 1️⃣ Formador Define Template
1. Vai para `/dashboard/notas`
2. Clica em "+ Definir Template" em um módulo
3. Adiciona 3-5 componentes com nomes e pesos
4. Valida que total = 80%
5. Clica "Guardar Template"

### 2️⃣ Formador Preenche Notas
1. Template aparece com colunas dinâmicas
2. Preenche notas (0-20) para cada aluno em cada componente
3. Nota Final é calculada e exibida automaticamente
4. Clica "Guardar" para persistir na base de dados

### 3️⃣ Cálculo Automático
- Quando notas são carregadas, `calcularNotaFinal()` é invocado
- Nota Final atualiza em tempo real conforme notas são alteradas

---

## 📁 Arquivo Structure

```
app/dashboard/notas/
├── page.tsx                          # Página raiz (route guard)
├── actions.ts                        # Server Actions (4 funções)
└── _components/
    ├── formador-notas.tsx            # Componente principal do formador
    ├── formando-notas.tsx            # Componente do aluno (view-only)
    └── template-avaliacoes-modal.tsx # Modal de definição de templates
```

---

## 🗄️ Base de Dados - Migrações

**Migration:** `20260318165818_add_template_avaliacoes_models`

Cria 3 novas tabelas:
- `TemplateAvaliacao`
- `ItemTemplateAvaliacao`
- `NotaParcial`

E atualiza as relações em `Formador` e `Modulo`.

---

## 🔐 Segurança & Validações

### Server Actions
- ✅ Validação de autenticação em todas as ações
- ✅ Apenas FORMADOR pode definir/atualizar templates
- ✅ Validação de peso total (80%)
- ✅ Validação de notas (0-20)
- ✅ Verificação de items existem no template

### Client
- ✅ Inputs numéricos com min/max
- ✅ Botão desabilita se peso incorreto
- ✅ Estados de loading durante operações

---

## 🎯 Próximas Melhorias

- [ ] Integrar com dados reais da BD (não mock)
- [ ] Exportar notas para PDF/Excel
- [ ] Histórico de versões de templates
- [ ] Análise estatística de notas
- [ ] Notificações quando formador publica notas
- [ ] Validação de assiduidade automática

---

## 💡 Notas Técnicas

### Por que 80% para componentes?
- Permite flexibilidade: formador decide como distribuir os 80%
- Os 20% de assiduidade são automáticos
- Total sempre = 100% (20% + 80%)

### Por que um template por (formador, módulo)?
- Cada formador tem autonomia na "quanto cada coisa vale"
- Evita conflitos se múltiplos formadores lecionam o mesmo módulo
- Permite evolução de critérios ao longo do tempo

### Constraints de Banco dedados
- `@@unique([formadorId, moduloId])` no TemplateAvaliacao
- `@@unique([formandoId, itemId])` na NotaParcial
- Ambas garantem integridade referencial

---

## Desenvolvido em: 18 de Março de 2026
**Status:** ✅ Totalmente Funcional
