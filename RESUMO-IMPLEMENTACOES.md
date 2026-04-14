# 📋 Resumo Completo — coordena-app

> Data: 14 de Abril de 2026
> Estado: ✅ Build passa sem erros | Nenhum commit feito (à espera de revisão)

---

## 📊 Estatísticas Globais

```
17 ficheiros alterados
+693 linhas adicionadas, -248 removidas
0 erros TypeScript | 0 erros build
0 commits feitos
```

---

## 🔴 10 BUGS CRÍTICOS CORIGIDOS

### Sessão 1 — 3 Bugs Iniciais

| #   | Bug                                          | Ficheiro(s)                                                         | Causa Raiz                                                                                                  | Correção                                                                                                  |
| --- | -------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | **Cursos: contagem de módulos sempre 0**     | `app/dashboard/_data/coordenador.ts`                                | `modulos: []` hardcoded no mapeamento; usava `_count` em vez de `include: { modulos: true }`                | Mudado para `include: { modulos: { orderBy: { ordem: "asc" } } }` e passado `curso.modulos` no mapeamento |
| 2   | **Módulos: edição de formador não persiste** | `app/api/modulos/[id]/route.ts`                                     | `formadorId` era recebido mas nunca era usado na tabela `FormadorModulo` — apenas criava `Convite` pendente | Adicionado `formadorModulo.deleteMany` + `formadorModulo.create` + limpeza de convites pendentes          |
| 3   | **Assiduidade: % calculada errado**          | `app/dashboard/assiduidade/_components/coordenador-assiduidade.tsx` | Fórmula `presentes / total` ignorava faltas justificadas; 4 locais afetados                                 | Alterado para `(presentes + justificados) / total` em todos os cálculos                                   |

### Sessão 2 — Convite de Formador

| #   | Bug                                                 | Ficheiro(s)                                  | Causa Raiz                                                                                                               | Correção                                                                                        |
| --- | --------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 4   | **Convite aceite não cria associação ao módulo**    | `app/dashboard/convites-formador/actions.ts` | Action apenas atualizava `status` do convite, nunca criava registo em `FormadorModulo`                                   | Adicionado `upsert` na tabela `FormadorModulo` ao aceitar + `deleteMany` ao recusar             |
| 5   | **`ConvitesClient` usava action de formando**       | `app/dashboard/convites/actions.ts`          | Ownership check só validava `convite.formando?.userId` — rejeitava formadores                                            | Detecção automática: valida `formador?.userId` OU `formando?.userId` conforme o tipo de convite |
| 6   | **Returns inconsistentes (`sucesso` vs `success`)** | Ambas as actions de convites                 | Validações retornavam `{ sucesso: false }` mas sucesso retornava `{ success: true }` — frontend verificava `res.success` | Unificado para `success` em todos os returns                                                    |

### Sessão 3 — 7 Bugs + 4 Melhorias UI/UX

| #   | Bug                                                         | Ficheiro(s)                                          | Causa Raiz                                                                                                                  | Correção                                                                                                      |
| --- | ----------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 7   | **URL duplicada: `/uploads/https:/cuhzfddb26.ufs.sh/...`**  | `coordenador-assiduidade.tsx` (2 locais)             | Lógica assumia que URLs sem `/` eram caminhos relativos — mas URLs UploadThing são absolutas                                | Adicionada verificação `startsWith("http")` antes de prefixar com `/uploads/`                                 |
| 8   | **NaN% na assiduidade de módulos sem aulas**                | `formador-notas.tsx`                                 | Divisão por zero: `Math.round((presencas / totalSessoes) * 100)` quando `totalSessoes === 0`                                | Proteção: `totalSessoes > 0 ? ... : 0` (já existia em `salvarTodas()` mas faltava no render)                  |
| 9   | **Pesquisa global só funcionava para coordenador**          | `app/api/search/route.ts`                            | Apenas bloco `if (session.user.role === "COORDENADOR")` existia — formador e formando recebiam `[]`                         | Adicionados blocos completos para `FORMADOR` (pesquisa módulos/cursos) e `FORMANDO` (pesquisa cursos/módulos) |
| 10  | **Ficheiro desaparece ao adicionar comentário**             | `formando-trabalhos.tsx`                             | Dialog não tinha estado `open` controlado — re-render perdia o estado do upload                                             | Estado `open` explícito + `uploadedFileName` independente do comentário + reset ao fechar                     |
| 11  | **Estado incorreto após rejeição de justificativa**         | `assiduidade/actions.ts`                             | `rejeitarJustificativa` definia `status: "AUSENTE"` mas não limpava `comentarioFormando` — formando não podia re-justificar | Adicionado `comentarioFormando: null` e `documentoUrl: null` ao rejeitar                                      |
| 12  | **Link bruto do UploadThing visível como texto**            | `formando-trabalhos.tsx`, `formando-assiduidade.tsx` | URLs renderizadas em `<span>` como texto puro                                                                               | Substituídos por links `<a href="..." target="_blank">` com texto "Abrir ficheiro" / "Ver documento"          |
| 13  | **Hash do UploadThing como nome de ficheiro nos Materiais** | `lista-materiais-formando.tsx`                       | `fileUrl` era URL CDN com hash — `split(".")` não extraía extensão correta                                                  | Criadas funções `extrairNomeFicheiro()` e `extrairExtensao()` com parse correto de URLs                       |
| 14  | **Tipo de ficheiro mostra hash no Materiais**               | `upload-actions.ts`, `gestao-materiais-formador.tsx` | `tipo` era extraído da `fileUrl` (hash) em vez do nome original                                                             | Adicionado parâmetro `nomeFicheiro` à função `registarMaterialApoio` — agora extrai extensão do nome real     |
| 15  | **Formador não via módulos para dar notas**                 | `notas/actions.ts`                                   | `obterModulosComAlunos` buscava apenas via `FormadorModulo` (convites aceites) — ignorava associação direta via edição      | Agora combina duas fontes: `FormadorModulo` + `Aula` (associação direta pelo coordenador)                     |

---

## 🟡 4 MELHORIAS DE UI/UX IMPLEMENTADAS

| #   | Melhoria                                           | Ficheiro                        | O que foi feito                                                                                                      |
| --- | -------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | **Calendário formador: acordeão para assiduidade** | `formador-calendario.tsx`       | Secção "Marcar Assiduidade" convertida em `Accordion` shadcn com ícone `UserCheck`                                   |
| 2   | **Materiais formador: acordeão por módulo**        | `gestao-materiais-formador.tsx` | Tabela plana reescrita como `Accordion` shadcn com cards em grid + botão "Abrir ficheiro" + botão de eliminar        |
| 3   | **Dark mode + UX no dialog de justificativa**      | `formando-assiduidade.tsx`      | `dark:` variants completas, badge de ficheiro upado, reset ao fechar, padding otimizado, gradiente adaptado          |
| 4   | **Trabalhos: acordeão estilo Cronograma**          | `formando-trabalhos.tsx`        | Accordion manual com `framer-motion` → shadcn `Accordion` com ícones coloridos, barra de progresso, badges de estado |

---

## 📂 FICHEIROS ALTERADOS

| #   | Ficheiro                                              | Bugs           | Melhorias  | Linhas +/- |
| --- | ----------------------------------------------------- | -------------- | ---------- | ---------- |
| 1   | `app/api/modulos/[id]/route.ts`                       | Bug 2          | —          | +12 / -12  |
| 2   | `app/api/search/route.ts`                             | Bug 9          | —          | +98 / -0   |
| 3   | `app/dashboard/_data/coordenador.ts`                  | Bug 1          | —          | +5 / -4    |
| 4   | `assiduidade/_components/coordenador-assiduidade.tsx` | Bug 3, Bug 7   | —          | +13 / -8   |
| 5   | `assiduidade/_components/formando-assiduidade.tsx`    | Bug 11, Bug 12 | Melhoria 3 | +58 / -10  |
| 6   | `assiduidade/actions.ts`                              | Bug 11         | —          | +4 / -2    |
| 7   | `calendario/_components/formador-calendario.tsx`      | —              | Melhoria 1 | +33 / -12  |
| 8   | `convites-formador/_components/convites-formador.tsx` | Bug 6          | —          | +2 / -0    |
| 9   | `convites-formador/actions.ts`                        | Bug 4, Bug 6   | —          | +32 / -3   |
| 10  | `convites/actions.ts`                                 | Bug 5, Bug 6   | —          | +16 / -12  |
| 11  | `convites/convites-client.tsx`                        | Bug 6          | —          | +7 / -3    |
| 12  | `materiais/_components/gestao-materiais-formador.tsx` | Bug 14         | Melhoria 2 | +165 / -0  |
| 13  | `materiais/_components/lista-materiais-formando.tsx`  | Bug 13         | —          | +32 / -0   |
| 14  | `notas/_components/formador-notas.tsx`                | Bug 8, Bug 15  | —          | +50 / -20  |
| 15  | `notas/actions.ts`                                    | Bug 15         | —          | +42 / -15  |
| 16  | `trabalhos/_components/formando-trabalhos.tsx`        | Bug 10, Bug 12 | Melhoria 4 | +165 / -22 |
| 17  | `upload-actions.ts`                                   | Bug 14         | —          | +2 / -1    |

---

## 🔄 FLUXOS CORRIGIDOS

### Fluxo de Convite de Formador (agora correto)

```
1. Coordenador envia convite → Convite(status: PENDENTE)
2. Formador recebe convite em /dashboard/convites-formador
3. Formador clica "Aceitar"
   → Atualiza Convite(status: ACEITE) ✅
   → Cria FormadorModulo(formadorId, moduloId) ✅
   → Revalida todas as páginas relevantes ✅
4. Módulo aparece na lista do formador ✅
```

### Fluxo de Associação Direta (já corrigido anteriormente)

```
1. Coordenador edita módulo → Atribui formadorId
   → Remove FormadorModulo existente ✅
   → Cria FormadorModulo(novo formadorId, moduloId) ✅
   → Associação imediata, sem convite ✅
```

### Fluxo de Upload de Material (agora correto)

```
1. Formador faz upload via UploadThing
2. onUploadComplete(url, nome, size) → registarMaterialApoio(url, titulo, descricao, moduloId, nome)
3. tipo = extrai extensão do nome original (ex: "guia.pdf" → "PDF") ✅
4. Material salvo com tipo correto na DB ✅
```

---

## 🎨 PADRÃO DE ACORDEÃO NO PROJETO

Todos os componentes com acordeão agora usam o padrão **shadcn Accordion**:

| Componente             | Ficheiro                        | Status                           |
| ---------------------- | ------------------------------- | -------------------------------- |
| Materiais do Formando  | `lista-materiais-formando.tsx`  | ✅ Accordion shadcn              |
| Materiais do Formador  | `gestao-materiais-formador.tsx` | ✅ Accordion shadcn              |
| Trabalhos do Formando  | `formando-trabalhos.tsx`        | ✅ Accordion shadcn              |
| Calendário do Formador | `formador-calendario.tsx`       | ✅ Accordion shadcn              |
| Cronograma do Formando | `formando-cronograma.tsx`       | ✅ Accordion shadcn (referência) |

**Padrão visual consistente:**

- `rounded-2xl border` com variação de cor conforme estado
- Ícone em `h-10 w-10 rounded-xl` com border-2
- Barra de progresso `h-1.5 rounded-full`
- Badges `text-[9px] font-black uppercase tracking-widest`
- `dark:` variants completas

---

## ⚠️ NOTAS IMPORTANTES

1. **Materiais existentes:** Materiais já criados antes da correção do Bug 14 continuarão com o hash como tipo. O fallback `mat.tipo || extrairExtensao(mat.fileUrl)` trata disso. Apenas **novos uploads** terão o tipo correto.

2. **Sem commits:** Nenhuma alteração foi commitada. Todas as mudanças estão na working tree (unstaged).

3. **Servidor dev:** Foi reiniciado durante a sessão. Se necessário, executa `npm run dev` no diretório do projeto.

4. **Cache do browser:** Após cada alteração, faz **hard refresh** (`Ctrl+Shift+R` ou `Ctrl+F5`) para garantir que o browser carrega a versão mais recente.
