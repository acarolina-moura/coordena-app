## ESTRUTURA DO CÓDIGO

coordena-app/
├─ app/
│ ├─ api/
│ │ ├─ auth/
│ │ │ └─ [...nextauth]/
│ │ │ └─ route.ts
│ │ ├─ aulas/
│ │ │ └─ route.ts
│ │ ├─ cursos/
│ │ │ └─ route.ts
│ │ ├─ formadores/
│ │ │ └─ route.ts
│ │ ├─ modulos/
│ │ │ └─ route.ts
│ │ └─ notificacoes/
│ │ └─ route.ts ✅ NOVO
│ │
│ ├─ dashboard/
│ │ ├─ \_components/
│ │ │ ├─ coordenador-dashboard.tsx
│ │ │ ├─ formador-dashboard.tsx
│ │ │ └─ formando-dashboard.tsx
│ │ │
│ │ ├─ \_data/
│ │ │ ├─ coordenador.ts ✅ ATUALIZADO
│ │ │ ├─ documentos.ts
│ │ │ ├─ formador.ts
│ │ │ ├─ formadores.ts
│ │ │ └─ formando.ts
│ │ │
│ │ ├─ assiduidade/
│ │ │ ├─ \_components/
│ │ │ │ ├─ formando-assiduidade.tsx
│ │ │ │ └─ coordenador-assiduidade.tsx ✅ NOVO
│ │ │ └─ page.tsx ✅ ATUALIZADO
│ │ │
│ │ ├─ calendario/
│ │ │ ├─ \_components/
│ │ │ │ ├─ coordenador-calendario.tsx ✅ ATUALIZADO
│ │ │ │ ├─ formador-calendario.tsx
│ │ │ │ └─ formando-calendario.tsx
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ convites/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ cursos/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ disponibilidades/
│ │ │ ├─ \_components/
│ │ │ │ ├─ formador-disponibilidades.tsx ✅ NOVO
│ │ │ │ └─ coordenador-disponibilidades.tsx ✅ NOVO
│ │ │ └─ page.tsx ✅ ATUALIZADO
│ │ │
│ │ ├─ documentos/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ formadores/
│ │ │ ├─ \_components/
│ │ │ │ └─ formadores-client.tsx ✅ ATUALIZADO
│ │ │ ├─ [id]/
│ │ │ │ └─ page.tsx ✅ NOVO
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ formandos/
│ │ │ ├─ [id]/
│ │ │ │ └─ editar/
│ │ │ │ └─ page.tsx  NOVO
│ │ │ ├─ actions.ts
│ │ │ ├─ formandos-client.tsx
│ │ │ ├─ ver-perfil-dialog.tsx
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ meus-cursos/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ meus-cursos-formando/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ modulos/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ modulos-atribuidos/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ notas/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ perfil/
│ │ │ └─ page.tsx
│ │ │
│ │ ├─ layout.tsx ✅ ATUALIZADO
│ │ └─ page.tsx
│ │
│ └─ login/
│ └─ [role]/
│ └─ page.tsx
│
├─ components/
│ ├─ ui/
│ │ ├─ alert-dialog.tsx
│ │ ├─ avatar.tsx
│ │ ├─ button.tsx
│ │ ├─ dialog.tsx
│ │ ├─ dropdown-menu.tsx
│ │ ├─ input.tsx
│ │ ├─ label.tsx
│ │ ├─ progress.tsx
│ │ └─ textarea.tsx
│ ├─ app-sidebar.tsx ✅ ATUALIZADO
│ └─ top-bar.tsx ✅ ATUALIZADO
│
├─ lib/
│ ├─ documento-utils.ts
│ ├─ prisma.ts
│ └─ utils.ts
│
├─ prisma/
│ ├─ schema.prisma
│ └─ prisma.config.ts
│
├─ .env
├─ package.json
└─ tsconfig.json
