# Sistema Multi-tenancy - Coordenadores

## Visão Geral

O sistema **Multi-tenancy** foi implementado para garantir que cada coordenador tenha acesso **apenas** aos seus próprios cursos e dados relacionados (alunos, formadores, módulos, etc.), isolando completamente os dados entre diferentes coordenadores.

## Arquitetura

### Modelo de Dados

#### 1. **Modelo `Coordenador`**
```prisma
model Coordenador {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  cursos        Curso[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 2. **Relação `Curso` → `Coordenador`**
```prisma
model Curso {
  // ... outros campos
  coordenadorId  String?
  coordenador    Coordenador? @relation(fields: [coordenadorId], references: [id], onDelete: SetNull)
  // ...
}
```

### Fluxo de Autenticação

1. Quando um usuário com role `COORDENADOR` faz login:
   - O sistema busca o registro `Coordenador` associado ao `userId`
   - O `coordenadorId` é armazenado no **token JWT** da sessão
   - Este ID é usado em todas as queries para filtrar dados

### Arquivos Principais

#### 1. **`lib/coordenador-utils.ts`**
Funções utilitárias para isolamento de dados:

- `getCoordenadorLogado()` - Obtém o coordenador logado a partir da sessão
- `getCoordenadorIdOrNull()` - Retorna o ID do coordenador ou null
- `filtroCursosCoordenador()` - Filtra cursos do coordenador logado
- `filtroInscricoesCoordenador()` - Filtra inscrições dos cursos do coordenador
- `filtroModulosCoordenador()` - Filtra módulos dos cursos do coordenador
- `filtroFormadoresCoordenador()` - Filtra formadores atribuídos aos cursos do coordenador
- `filtroFormandosCoordenador()` - Filtra formandos inscritos nos cursos do coordenador

#### 2. **`app/dashboard/_data/coordenador.ts`**
Todas as funções de consulta foram atualizadas para usar os filtros de multi-tenancy:

- ✅ `getCoordenadorStats()` - Estatísticas apenas do coordenador
- ✅ `getProximasSessoes()` - Sessões dos módulos dos cursos do coordenador
- ✅ `getFormandosEmRisco()` - Alunos em risco apenas dos cursos do coordenador
- ✅ `getDocumentosEmFalta()` - Documentos dos formadores dos cursos do coordenador
- ✅ `getFormadores()` - Formadores atribuídos aos cursos do coordenador
- ✅ `getFormadorById()` - Detalhes do formador (apenas se atribuído aos cursos do coordenador)
- ✅ `getDisponibilidadesFormadores()` - Disponibilidades dos formadores dos cursos do coordenador
- ✅ `getAssiduidadeCoordenador()` - Assiduidade dos formandos dos cursos do coordenador
- ✅ `getJustificativasPendentesCoordenador()` - Justificativas dos cursos do coordenador
- ✅ `getModulos()` - Módulos dos cursos do coordenador
- ✅ `getCursos()` - Cursos criados pelo coordenador
- ✅ `getFormandos()` - Formandos inscritos nos cursos do coordenador
- ✅ `getFormandoPerfil()` - Perfil detalhado do formando (apenas se inscrito nos cursos do coordenador)

#### 3. **Outros Arquivos Atualizados**

- ✅ `_data/formadores.ts` - Funções de CRUD de formadores com filtros de tenant
- ✅ `_data/documentos.ts` - Documentos dos formadores dos cursos do coordenador
- ✅ `convites/page.tsx` - Convites, formadores e cursos filtrados por coordenador

## Como Funciona o Isolamento

### Exemplo: Consulta de Cursos

```typescript
// ANTES (sem multi-tenancy)
export async function getCursos() {
  return await prisma.curso.findMany({ ... });
}

// DEPOIS (com multi-tenancy)
export async function getCursos() {
  const cursosFilter = await filtroCursosCoordenador();
  return await prisma.curso.findMany({
    where: cursosFilter, // ← Adiciona: { coordenadorId: "xyz" }
    ...
  });
}
```

### Filtros Automáticos

As funções de filtro automaticamente:

1. **Obtêm o `coordenadorId` da sessão do usuário logado**
2. **Retornam um objeto `where` pronto para usar nas queries do Prisma**
3. **Se o usuário não for coordenador, retornam filtro que não encontra dados**

```typescript
// Exemplo interno de filtro
export async function filtroCursosCoordenador(where = {}) {
  const coordenadorId = await getCoordenadorIdOrNull();
  
  if (!coordenadorId) {
    // Usuário não é coordenador → retorna filtro vazio
    return { ...where, coordenadorId: null };
  }

  // Usuário é coordenador → filtra por seu ID
  return { ...where, coordenadorId };
}
```

## Segurança

### Camadas de Proteção

1. **Autenticação** - Verificação de sessão em todas as funções
2. **Autorização** - Verificação de role (`COORDENADOR`)
3. **Isolamento** - Filtros automáticos por `coordenadorId`
4. **Validação** - Verificação de pertencimento antes de retornar dados

### Exemplo de Validação

```typescript
// Ao buscar um formador específico
export async function getFormadorById(id: string) {
  const formador = await prisma.formador.findUnique({ ... });
  
  // Verificar se o formador tem módulos nos cursos do coordenador
  if (formador && formador.modulosLecionados.length === 0) {
    const temAcesso = verificarAcessoAoCurso(formador);
    if (!temAcesso) return null; // ← Bloqueia acesso
  }
  
  return formador;
}
```

## Migração do Banco de Dados

A migration `20260409190947_add_multi_tenancy_coordenador` foi criada com:

- Tabela `Coordenador`
- Campo `coordenadorId` na tabela `Curso`
- Índice e constraints de relação

## Como Testar

### 1. Criar Dois Coordenadores

```typescript
// Coordenador A
const coordA = await prisma.user.create({
  data: {
    nome: "Coordenador A",
    email: "coordA@test.com",
    senha: "hash123",
    role: "COORDENADOR",
    coordenador: { create: {} }
  }
});

// Coordenador B
const coordB = await prisma.user.create({
  data: {
    nome: "Coordenador B",
    email: "coordB@test.com",
    senha: "hash123",
    role: "COORDENADOR",
    coordenador: { create: {} }
  }
});
```

### 2. Criar Cursos para Cada Coordenador

```typescript
// Curso do Coordenador A
await prisma.curso.create({
  data: {
    nome: "Curso A1",
    coordenadorId: coordA.coordenador.id
  }
});

// Curso do Coordenador B
await prisma.curso.create({
  data: {
    nome: "Curso B1",
    coordenadorId: coordB.coordenador.id
  }
});
```

### 3. Verificar Isolamento

- Fazer login como `coordA` → Deve ver apenas "Curso A1"
- Fazer login como `coordB` → Deve ver apenas "Curso B1"
- Nenhum coordenador deve ver os cursos do outro

## Limitações e Considerações

### 1. **Formadores Compartilhados**
Um formador pode lecionar módulos em cursos de diferentes coordenadores. O acesso é controlado por:
- Módulos atribuídos aos cursos do coordenador logado
- Se um formador não tem módulos nos cursos do coordenador, não é visível

### 2. **Formandos em Múltiplos Cursos**
Similar aos formadores, formandos podem estar inscritos em cursos de diferentes coordenadores. Apenas dados dos cursos do coordenador logado são visíveis.

### 3. **Registros sem Coordenador**
Cursos criados antes desta implementação podem ter `coordenadorId = null`. Estes não serão visíveis por nenhum coordenador até que sejam atribuídos.

## Futuras Melhorias

1. **API de Transferência** - Permitir transferir cursos entre coordenadores
2. **Auditoria** - Log de acesso e modificação de dados por coordenador
3. **Permissões Granulares** - Controle de acesso mais fino (ex: coordenador assistente)
4. **Admin Global** - Role de administrador que pode ver todos os dados
5. **Cache Otimizado** - Cache separado por tenant para melhor performance

## Referências

- **Arquivo Principal**: `lib/coordenador-utils.ts`
- **Dados do Dashboard**: `app/dashboard/_data/coordenador.ts`
- **Schema**: `prisma/schema.prisma`
- **Autenticação**: `auth.ts`
- **Tipagem**: `next-auth.d.ts`
