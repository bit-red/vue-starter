[English](#english) | [Português](#português)

---

# English

## create-bitred-vue

CLI scaffolding tool that generates modular Vue 3 + TypeScript projects with selectable features and Laravel authentication presets.

```bash
npx create-bitred-vue my-project
```

### Features

The CLI prompts you to select which features to include:

| Feature | What you get |
|---------|-------------|
| **Router** | Vue Router 4, dynamic layouts (`guest`/`auth`), `useQueryParams` composable |
| **Pinia** | Pinia 3, `stores/` directory |
| **UI** | Shadcn Vue, Tailwind CSS v4, `cn()` utility, `ThemeToggle`, dark mode |
| **Services** | Axios + TanStack Vue Query, typed API layer (`http.ts`, `ApiResponse<T>`, `ApiPaginatedResponse<T>`), `useErrorHandler` |
| **Forms** | TanStack Vue Form + Zod |
| **ESLint** | ESLint 9 flat config + Prettier (semi, double quotes, trailing commas, 100 width) |

#### Authentication Presets

| Preset | Description |
|--------|-------------|
| **None** | No authentication |
| **Laravel Sanctum** | Cookie-based auth with `withCredentials`, CSRF cookie flow, `POST /login` |
| **Laravel Passport** | Bearer token auth, request/response interceptors, automatic token refresh on 401 |

Selecting an auth preset automatically enables **Router**, **Pinia**, and **Services**.

Both presets generate a complete auth module:
- **Login page** (always included)
- **Selectable pages**: Register, Forgot Password, Reset Password, Email Verification
- Auth store (Pinia) with `isAuthenticated` and `isAdmin`
- TanStack Query services, queries, and mutations
- Navigation guards (`requiresAuth`, `requiresGuest`)
- Route-based layouts (`guest` for auth pages, `auth` for protected pages)
- Dashboard placeholder page

When the **UI** feature is enabled, auth pages use Shadcn Vue components with a shared `AuthPageLayout` wrapper (card + image panel + dark mode toggle). Without UI, plain CSS pages are generated.

### How It Works

```
npx create-bitred-vue my-project

? Project name: my-project
? Select features: Router, Pinia, UI, Services, Forms, ESLint
? Authentication: None | Sanctum | Passport
? Auth pages: Register, Forgot Password, Reset Password, Email Verification

-> Copies base template
-> Applies selected feature overlays
-> Applies auth preset (if any)
-> Copies auth-common files selectively based on chosen pages
-> Generates main.ts, App.vue, vite.config.ts dynamically
-> Runs npm install
```

Each feature is a template overlay with its own `package.json` (merged automatically) and source files. Features are independent and composable.

### Generated Project

```
my-project/
├── src/
│   ├── main.ts              # Generated — imports only what you selected
│   ├── App.vue              # Generated — layout system if Router, plain div otherwise
│   ├── assets/
│   ├── components/
│   │   ├── layouts/         # GuestLayout, AuthLayout (Router feature)
│   │   ├── shared/
│   │   └── ui/              # Shadcn Vue components (UI feature)
│   │       ├── button/
│   │       ├── card/
│   │       ├── theme-toggle/ # Dark/light mode toggle
│   │       └── ...
│   ├── composables/
│   │   └── use-theme.ts     # Color mode management (UI feature)
│   ├── lib/
│   ├── modules/             # Feature modules (auth preset)
│   │   └── auth/
│   │       ├── pages/
│   │       ├── components/
│   │       │   └── auth-page-layout/  # Shared auth page wrapper (UI variant)
│   │       ├── composables/
│   │       └── router.ts
│   ├── pages/
│   ├── router/              # Router feature
│   ├── services/            # Services feature
│   └── stores/              # Pinia feature
├── vite.config.ts            # Generated — plugins based on features
├── package.json              # Merged from all selected features
├── tsconfig.json
├── CLAUDE.md                 # AI assistant context for the project
└── README.md
```

### Repository Structure

```
vue-starter/
├── src/                      # CLI source code
│   ├── index.ts              # Entry point (#!/usr/bin/env node)
│   ├── types.ts              # Feature, AuthPreset, AuthPage, ProjectOptions
│   ├── prompts.ts            # Interactive prompts (@clack/prompts)
│   ├── generator.ts          # Template orchestration
│   ├── utils.ts              # renderTemplate, deepMerge, sortDependencies
│   └── generators/
│       ├── main-ts.ts        # Generates src/main.ts
│       ├── app-vue.ts        # Generates src/App.vue
│       ├── vite-config.ts    # Generates vite.config.ts
│       ├── auth-router.ts    # Generates auth module router
│       └── auth-indexes.ts   # Generates auth service barrel indexes
├── template/
│   ├── base/                 # Always included
│   ├── features/
│   │   ├── router/
│   │   ├── pinia/
│   │   ├── ui/
│   │   ├── services/
│   │   ├── forms/
│   │   └── eslint/
│   └── presets/
│       ├── auth-common/      # Shared auth files (pages, guards, routes, mutations)
│       ├── auth-sanctum/     # Sanctum-specific (http.ts, store, types)
│       └── auth-passport/    # Passport-specific (http.ts, store, types)
├── tests/
│   ├── utils.test.ts
│   ├── generators.test.ts
│   └── integration.test.ts
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

### Development

#### Prerequisites

- Node.js 20+
- npm

#### Setup

```bash
git clone https://github.com/bit-red/vue-starter.git
cd vue-starter
npm install
```

#### Build

```bash
npm run build
```

This compiles the CLI to `dist/index.js` using tsup (ESM, target node20).

#### Watch Mode

```bash
npm run dev
```

Rebuilds automatically on file changes.

#### Testing

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run only unit tests (fast)
npx vitest run tests/utils.test.ts tests/generators.test.ts

# Run only integration tests (slow — generates + builds real projects)
npx vitest run tests/integration.test.ts
```

Tests cover:
- **Unit**: `toValidPackageName`, `sortDependencies`, `deepMerge`, `renderTemplate`, all code generators (main-ts, app-vue, vite-config, auth-router, auth-indexes)
- **Integration**: file structure verification for every feature/preset combo, package.json merging, and full `npm install` + `vite build` for 5 scenarios (bare, all features, sanctum+UI, passport+UI, sanctum plain)

#### Manual Testing

You can also test the CLI interactively after building:

```bash
npm run build
node dist/index.js test-project
```

#### Template Conventions

- Files prefixed with `_` are renamed to `.` (e.g. `_gitignore` becomes `.gitignore`, `_prettierrc` becomes `.prettierrc`)
- Each feature overlay has a `package.json` with only its extra dependencies — these are deep-merged with the base `package.json`
- Feature overlays can overwrite files from the base template or from other features (last applied wins)
- Preset-specific overlays (`auth-sanctum/`, `auth-passport/`) only contain `http.ts`, `stores/auth.ts`, and `services/auth/types.ts`
- Common auth files (guards, routes, pages, mutations, queries) live in `auth-common/` and are copied selectively by `generator.ts`

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm test` — all tests must pass
5. Commit your changes
6. Open a Pull Request

CI runs automatically on push/PR: build, unit tests, then integration tests.

#### Adding a New Feature

1. Create `template/features/<name>/` with a `package.json` listing extra dependencies
2. Add source files under `template/features/<name>/src/`
3. Add the feature name to the `Feature` type in `src/types.ts`
4. Add a prompt option in `src/prompts.ts`
5. If the feature needs dynamic imports in `main.ts`, update `src/generators/main-ts.ts`
6. If the feature adds Vite plugins, update `src/generators/vite-config.ts`

#### Adding a New Auth Preset

1. Create `template/presets/auth-<name>/` with preset-specific files (`http.ts`, `stores/auth.ts`, `services/auth/types.ts`)
2. Add the preset name to the `AuthPreset` type in `src/types.ts`
3. Add a prompt option in `src/prompts.ts`
4. Update `src/generators/auth-indexes.ts` if the preset has different service functions

#### Adding a New Auth Page

1. Add the page name to `AuthPage` type and `SELECTABLE_AUTH_PAGES` in `src/types.ts`
2. Add UI variant in `template/presets/auth-common/src/modules/auth/pages/ui/`
3. Add mutation in `template/presets/auth-common/src/services/auth/mutations/`
4. Add entry in `AUTH_PAGE_FILES` map in `src/generator.ts`
5. Update `src/generators/auth-router.ts` and `src/generators/auth-indexes.ts`
6. Add a multiselect option in `src/prompts.ts`

### License

MIT

---

# Português

## create-bitred-vue

Ferramenta CLI de scaffolding que gera projetos modulares Vue 3 + TypeScript com features selecionáveis e presets de autenticação Laravel.

```bash
npx create-bitred-vue my-project
```

### Features

O CLI solicita que você selecione quais features incluir:

| Feature | O que você recebe |
|---------|-------------------|
| **Router** | Vue Router 4, layouts dinâmicos (`guest`/`auth`), composable `useQueryParams` |
| **Pinia** | Pinia 3, diretório `stores/` |
| **UI** | Shadcn Vue, Tailwind CSS v4, utilitário `cn()`, `ThemeToggle`, dark mode |
| **Services** | Axios + TanStack Vue Query, camada de API tipada (`http.ts`, `ApiResponse<T>`, `ApiPaginatedResponse<T>`), `useErrorHandler` |
| **Forms** | TanStack Vue Form + Zod |
| **ESLint** | ESLint 9 flat config + Prettier (semi, aspas duplas, trailing commas, largura 100) |

#### Presets de Autenticação

| Preset | Descrição |
|--------|-----------|
| **None** | Sem autenticação |
| **Laravel Sanctum** | Auth baseada em cookie com `withCredentials`, fluxo CSRF, `POST /login` |
| **Laravel Passport** | Auth por token Bearer, interceptors de request/response, refresh automático em 401 |

Selecionar um preset de auth habilita automaticamente **Router**, **Pinia** e **Services**.

Ambos presets geram um módulo de auth completo:
- **Página de login** (sempre incluída)
- **Páginas selecionáveis**: Register, Forgot Password, Reset Password, Email Verification
- Auth store (Pinia) com `isAuthenticated` e `isAdmin`
- Serviços, queries e mutations TanStack Query
- Guards de navegação (`requiresAuth`, `requiresGuest`)
- Layouts baseados em rota (`guest` para páginas de auth, `auth` para páginas protegidas)
- Página placeholder de Dashboard

Quando a feature **UI** está habilitada, as páginas de auth usam componentes Shadcn Vue com um wrapper compartilhado `AuthPageLayout` (card + painel de imagem + toggle dark mode). Sem UI, páginas CSS puro são geradas.

### Como Funciona

```
npx create-bitred-vue my-project

? Project name: my-project
? Select features: Router, Pinia, UI, Services, Forms, ESLint
? Authentication: None | Sanctum | Passport
? Auth pages: Register, Forgot Password, Reset Password, Email Verification

-> Copia template base
-> Aplica overlays das features selecionadas
-> Aplica preset de auth (se houver)
-> Copia arquivos auth-common seletivamente baseado nas páginas escolhidas
-> Gera main.ts, App.vue, vite.config.ts dinamicamente
-> Executa npm install
```

Cada feature é um overlay de template com seu próprio `package.json` (mesclado automaticamente) e arquivos fonte. Features são independentes e combináveis.

### Projeto Gerado

```
my-project/
├── src/
│   ├── main.ts              # Gerado — importa apenas o que foi selecionado
│   ├── App.vue              # Gerado — sistema de layout se Router, div simples caso contrário
│   ├── assets/
│   ├── components/
│   │   ├── layouts/         # GuestLayout, AuthLayout (feature Router)
│   │   ├── shared/
│   │   └── ui/              # Componentes Shadcn Vue (feature UI)
│   │       ├── button/
│   │       ├── card/
│   │       ├── theme-toggle/ # Toggle dark/light mode
│   │       └── ...
│   ├── composables/
│   │   └── use-theme.ts     # Gerenciamento de modo de cor (feature UI)
│   ├── lib/
│   ├── modules/             # Módulos de funcionalidade (preset auth)
│   │   └── auth/
│   │       ├── pages/
│   │       ├── components/
│   │       │   └── auth-page-layout/  # Wrapper compartilhado de auth (variante UI)
│   │       ├── composables/
│   │       └── router.ts
│   ├── pages/
│   ├── router/              # Feature Router
│   ├── services/            # Feature Services
│   └── stores/              # Feature Pinia
├── vite.config.ts            # Gerado — plugins baseados nas features
├── package.json              # Mesclado de todas as features selecionadas
├── tsconfig.json
├── CLAUDE.md                 # Contexto de assistente IA para o projeto
└── README.md
```

### Estrutura do Repositório

```
vue-starter/
├── src/                      # Código fonte do CLI
│   ├── index.ts              # Entry point (#!/usr/bin/env node)
│   ├── types.ts              # Feature, AuthPreset, AuthPage, ProjectOptions
│   ├── prompts.ts            # Prompts interativos (@clack/prompts)
│   ├── generator.ts          # Orquestração de templates
│   ├── utils.ts              # renderTemplate, deepMerge, sortDependencies
│   └── generators/
│       ├── main-ts.ts        # Gera src/main.ts
│       ├── app-vue.ts        # Gera src/App.vue
│       ├── vite-config.ts    # Gera vite.config.ts
│       ├── auth-router.ts    # Gera router do módulo auth
│       └── auth-indexes.ts   # Gera barrel indexes dos serviços auth
├── template/
│   ├── base/                 # Sempre incluído
│   ├── features/
│   │   ├── router/
│   │   ├── pinia/
│   │   ├── ui/
│   │   ├── services/
│   │   ├── forms/
│   │   └── eslint/
│   └── presets/
│       ├── auth-common/      # Arquivos auth compartilhados (pages, guards, routes, mutations)
│       ├── auth-sanctum/     # Específico Sanctum (http.ts, store, types)
│       └── auth-passport/    # Específico Passport (http.ts, store, types)
├── tests/
│   ├── utils.test.ts
│   ├── generators.test.ts
│   └── integration.test.ts
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

### Desenvolvimento

#### Pré-requisitos

- Node.js 20+
- npm

#### Setup

```bash
git clone https://github.com/bit-red/vue-starter.git
cd vue-starter
npm install
```

#### Build

```bash
npm run build
```

Compila o CLI para `dist/index.js` usando tsup (ESM, target node20).

#### Watch Mode

```bash
npm run dev
```

Recompila automaticamente quando arquivos são alterados.

#### Testes

```bash
# Rodar todos os testes
npm test

# Rodar em watch mode
npm run test:watch

# Rodar apenas testes unitários (rápido)
npx vitest run tests/utils.test.ts tests/generators.test.ts

# Rodar apenas testes de integração (lento — gera + builda projetos reais)
npx vitest run tests/integration.test.ts
```

Testes cobrem:
- **Unitários**: `toValidPackageName`, `sortDependencies`, `deepMerge`, `renderTemplate`, todos os geradores de código (main-ts, app-vue, vite-config, auth-router, auth-indexes)
- **Integração**: verificação de estrutura de arquivos para cada combo feature/preset, merge de package.json, e `npm install` + `vite build` completo para 5 cenários (bare, all features, sanctum+UI, passport+UI, sanctum plain)

#### Teste Manual

Você também pode testar o CLI interativamente após o build:

```bash
npm run build
node dist/index.js test-project
```

#### Convenções de Template

- Arquivos com prefixo `_` são renomeados para `.` (ex: `_gitignore` vira `.gitignore`, `_prettierrc` vira `.prettierrc`)
- Cada overlay de feature tem um `package.json` com apenas suas dependências extras — estas são deep-merged com o `package.json` base
- Overlays de feature podem sobrescrever arquivos do template base ou de outras features (último aplicado vence)
- Overlays específicos de preset (`auth-sanctum/`, `auth-passport/`) contêm apenas `http.ts`, `stores/auth.ts` e `services/auth/types.ts`
- Arquivos auth comuns (guards, routes, pages, mutations, queries) ficam em `auth-common/` e são copiados seletivamente pelo `generator.ts`

### Contribuindo

1. Fork o repositório
2. Crie uma branch de feature (`git checkout -b feat/my-feature`)
3. Faça suas alterações
4. Execute `npm test` — todos os testes devem passar
5. Commit suas alterações
6. Abra um Pull Request

CI roda automaticamente em push/PR: build, testes unitários, depois testes de integração.

#### Adicionando uma Nova Feature

1. Crie `template/features/<name>/` com um `package.json` listando dependências extras
2. Adicione arquivos fonte em `template/features/<name>/src/`
3. Adicione o nome da feature ao tipo `Feature` em `src/types.ts`
4. Adicione uma opção de prompt em `src/prompts.ts`
5. Se a feature precisar de imports dinâmicos no `main.ts`, atualize `src/generators/main-ts.ts`
6. Se a feature adicionar plugins Vite, atualize `src/generators/vite-config.ts`

#### Adicionando um Novo Preset de Auth

1. Crie `template/presets/auth-<name>/` com arquivos específicos do preset (`http.ts`, `stores/auth.ts`, `services/auth/types.ts`)
2. Adicione o nome do preset ao tipo `AuthPreset` em `src/types.ts`
3. Adicione uma opção de prompt em `src/prompts.ts`
4. Atualize `src/generators/auth-indexes.ts` se o preset tiver funções de serviço diferentes

#### Adicionando uma Nova Página de Auth

1. Adicione o nome da página ao tipo `AuthPage` e `SELECTABLE_AUTH_PAGES` em `src/types.ts`
2. Adicione variante UI em `template/presets/auth-common/src/modules/auth/pages/ui/`
3. Adicione mutation em `template/presets/auth-common/src/services/auth/mutations/`
4. Adicione entrada no mapa `AUTH_PAGE_FILES` em `src/generator.ts`
5. Atualize `src/generators/auth-router.ts` e `src/generators/auth-indexes.ts`
6. Adicione uma opção multiselect em `src/prompts.ts`

### Licença

MIT
