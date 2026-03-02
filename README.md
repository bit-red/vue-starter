# create-bitred-vue

CLI scaffolding tool that generates modular Vue 3 + TypeScript projects with selectable features and Laravel authentication presets.

```bash
npx create-bitred-vue my-project
```

## Features

The CLI prompts you to select which features to include:

| Feature | What you get |
|---------|-------------|
| **Router** | Vue Router 4, dynamic layouts (`guest`/`auth`), `useQueryParams` composable |
| **Pinia** | Pinia 3, `stores/` directory |
| **UI** | Shadcn Vue, Tailwind CSS v4, `cn()` utility, `components.json` ready |
| **Services** | Axios + TanStack Vue Query, typed API layer (`http.ts`, `ApiResponse<T>`, `ApiPaginatedResponse<T>`), `useErrorHandler` |
| **Forms** | TanStack Vue Form + Zod |
| **ESLint** | ESLint 9 flat config + Prettier (semi, double quotes, trailing commas, 100 width) |

### Authentication Presets

| Preset | Description |
|--------|-------------|
| **None** | No authentication |
| **Laravel Sanctum** | Cookie-based auth with `withCredentials`, CSRF cookie flow, `POST /login` |
| **Laravel Passport** | Bearer token auth, request/response interceptors, automatic token refresh on 401 |

Selecting an auth preset automatically enables **Router**, **Pinia**, and **Services**.

Both presets generate a complete auth module:
- Login, Register, and Forgot Password pages
- Auth store (Pinia) with `isAuthenticated` and `isAdmin`
- TanStack Query services, queries, and mutations
- Navigation guards (`requiresAuth`, `requiresGuest`)
- Route-based layouts (`guest` for auth pages, `auth` for protected pages)
- Dashboard placeholder page

## How It Works

```
npx create-bitred-vue my-project

? Project name: my-project
? Select features: Router, Pinia, UI, Services, Forms, ESLint
? Authentication: None | Sanctum | Passport

-> Copies base template
-> Applies selected feature overlays
-> Applies auth preset (if any)
-> Generates main.ts, App.vue, vite.config.ts dynamically
-> Runs npm install
```

Each feature is a template overlay with its own `package.json` (merged automatically) and source files. Features are independent and composable.

## Generated Project

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
│   ├── composables/
│   ├── lib/
│   ├── modules/             # Feature modules (auth preset)
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

## Repository Structure

```
vue-starter/
├── src/                      # CLI source code
│   ├── index.ts              # Entry point (#!/usr/bin/env node)
│   ├── types.ts              # Feature, AuthPreset, ProjectOptions
│   ├── prompts.ts            # Interactive prompts (@clack/prompts)
│   ├── generator.ts          # Template orchestration
│   ├── utils.ts              # renderTemplate, deepMerge, sortDependencies
│   └── generators/
│       ├── main-ts.ts        # Generates src/main.ts
│       ├── app-vue.ts        # Generates src/App.vue
│       └── vite-config.ts    # Generates vite.config.ts
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
│       ├── auth-sanctum/
│       └── auth-passport/
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/bit-red/vue-starter.git
cd vue-starter
npm install
```

### Build

```bash
npm run build
```

This compiles the CLI to `dist/index.js` using tsup (ESM, target node20).

### Watch Mode

```bash
npm run dev
```

Rebuilds automatically on file changes.

### Testing

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
- **Unit**: `toValidPackageName`, `sortDependencies`, `deepMerge`, `renderTemplate`, all code generators
- **Integration**: file structure verification for every feature/preset combo, package.json merging, and full `npm install` + `vite build` for 4 scenarios (bare, all features, sanctum, passport)

### Manual Testing

You can also test the CLI interactively after building:

```bash
npm run build
node dist/index.js test-project
```

### Template Conventions

- Files prefixed with `_` are renamed to `.` (e.g. `_gitignore` becomes `.gitignore`, `_prettierrc` becomes `.prettierrc`)
- Each feature overlay has a `package.json` with only its extra dependencies — these are deep-merged with the base `package.json`
- Feature overlays can overwrite files from the base template or from other features (last applied wins)
- Auth presets overwrite `router/routes.ts`, `router/guards.ts`, and `services/http.ts` from their respective features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run `npm test` — all 51 tests must pass
5. Commit your changes
6. Open a Pull Request

CI runs automatically on push/PR: build, unit tests, then integration tests.

### Adding a New Feature

1. Create `template/features/<name>/` with a `package.json` listing extra dependencies
2. Add source files under `template/features/<name>/src/`
3. Add the feature name to the `Feature` type in `src/types.ts`
4. Add a prompt option in `src/prompts.ts`
5. If the feature needs dynamic imports in `main.ts`, update `src/generators/main-ts.ts`
6. If the feature adds Vite plugins, update `src/generators/vite-config.ts`

### Adding a New Auth Preset

1. Create `template/presets/auth-<name>/` mirroring the Sanctum/Passport structure
2. Add the preset name to the `AuthPreset` type in `src/types.ts`
3. Add a prompt option in `src/prompts.ts`

## License

MIT
