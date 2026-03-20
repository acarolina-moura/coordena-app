## ESTRUTURA DO CÓDIGO

coordena-app/
├─ app/
│  ├─ api/
│  │  ├─ auth/
│  │  │  └─ [...nextauth]/
│  │  │      └─ route.ts
│  │  ├─ cursos/
│  │  │  └─ route.ts
│  │  ├─ formadores/
│  │  │  └─ route.ts
│  │  └─ notificacoes/
│  │      └─ route.ts              ✅ NOVO — GET notificações agregadas
│  │
│  ├─ dashboard/
│  │  ├─ _components/
│  │  │  ├─ coordenador-dashboard.tsx
│  │  │  ├─ formador-dashboard.tsx
│  │  │  └─ formando-dashboard.tsx
│  │  │
│  │  ├─ _data/
│  │  │  ├─ coordenador.ts
│  │  │  ├─ documentos.ts
│  │  │  ├─ formador.ts
│  │  │  ├─ formadores.ts
│  │  │  └─ formando.ts
│  │  │
│  │  ├─ assiduidade/
│  │  │  └─ page.tsx
│  │  ├─ calendario/
│  │  │  └─ page.tsx
│  │  ├─ convites/
│  │  │  └─ page.tsx
│  │  ├─ cursos/
│  │  │  └─ page.tsx
│  │  ├─ disponibilidades/
│  │  │  └─ page.tsx
│  │  ├─ documentos/
│  │  │  └─ page.tsx
│  │  ├─ formadores/
│  │  │  ├─ page.tsx
│  │  │  ├─ [id]/
│  │  │  │  └─ page.tsx           ✅ NOVO — perfil do formador
│  │  │  └─ _components/
│  │  │      └─ formadores-client.tsx
│  │  ├─ formandos/
│  │  │  └─ page.tsx
│  │  ├─ meus-cursos/
│  │  │  └─ page.tsx
│  │  ├─ meus-cursos-formando/
│  │  │  └─ page.tsx
│  │  ├─ modulos/
│  │  │  └─ page.tsx
│  │  ├─ modulos-atribuidos/
│  │  │  └─ page.tsx
│  │  ├─ notas/
│  │  │  └─ page.tsx
│  │  ├─ perfil/
│  │  │  └─ page.tsx
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  │
│  └─ login/
│     └─ [role]/
│         └─ page.tsx
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
│  └─ top-bar.tsx                  ✅ ATUALIZADO — sino de notificações funcional
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