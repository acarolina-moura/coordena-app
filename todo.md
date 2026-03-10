## ESTRUTURA DO PROJETO

coordena-app/
├─ app/
│ ├─ api/
│ │ └─ auth/
│ │ └─ [...nextauth]/
│ │ └─ route.ts
│ └─ formadores/
│
├─ dashboard/
│ ├─ components/
│ ├─ data/
│ ├─ assiduidade/
│ ├─ calendario/
│ ├─ convites/
│ ├─ cursos/
│ ├─ disponibilidades/
│ ├─ documentos/
│ ├─ formadores/
│ ├─ formandos/
│ ├─ meus-cursos/
│ ├─ meus-cursos-formando/
│ ├─ modulos/
│ ├─ modulos-atribuidos/
│ ├─ notas/
│ └─ perfil/
│
├─ login/
│ │ └─ [role]/
│ │ └─ pagetsx/
│ │ └─ page.tsx
|
├─ layout.tsx
├─ page.tsx
│
├─ components/
│ └─ ui/
│ ├─ alert-dialog.tsx
│ ├─ alert-dialog.tsx
│ ├─ avatar.tsx
│ ├─ button.tsx
│ ├─ dialog.tsx
│ ├─ dropdown-menu.tsx
│ ├─ input.tsx
│ ├─ label.tsx
│ ├─ progress.tsx
│ └─ textarea.tsx
├─ app-sidebar.tsx
├─ topbar.tsx
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
