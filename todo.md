## ESTRUTURA DO PROJETO

coordena-app/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ api/
│     ├─ auth/
│     │  └─ [...nextauth]/
│     │     └─ route.ts
│     ├─ cursos/
│     │  └─ route.ts              ✅ NOVO — GET listar / POST criar cursos
│     └─ formadores/
│        └─ route.ts              
│
├─ dashboard/
│  ├─ components/
│  ├─ data/
│  ├─ assiduidade/
│  ├─ calendario/
│  ├─ convites/
│  ├─ cursos/
│  │  └─ page.tsx                 ✅ ATUALIZADO — dados reais da BD
│  ├─ disponibilidades/
│  ├─ documentos/
│  ├─ formadores/
│  ├─ formandos/
│  ├─ meus-cursos/
│  ├─ meus-cursos-formando/
│  ├─ modulos/
│  ├─ modulos-atribuidos/
│  ├─ notas/
│  └─ perfil/
│
├─ login/
│  └─ [role]/
│     └─ page.tsx
│
├─ components/
│  ├─ ui/
│  │  ├─ alert-dialog.tsx
│  │  ├─ avatar.tsx
│  │  ├─ button.tsx
│  │  ├─ dialog.tsx
│  │  ├─ dropdown-menu.tsx
│  │  ├─ input.tsx
│  │  ├─ label.tsx
│  │  ├─ progress.tsx
│  │  └─ textarea.tsx
│  ├─ app-sidebar.tsx
│  └─ topbar.tsx
│
├─ lib/
│  ├─ documento-utils.ts
│  ├─ prisma.ts
│  └─ utils.ts
│
├─ prisma/
│  ├─ schema.prisma
│  └─ prisma.config.ts
│
├─ .env
├─ package.json
└─ tsconfig.json
