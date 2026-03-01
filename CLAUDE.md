# CLAUDE.md

This file provides context for Claude Code (claude.ai/claude-code) when working on this repository.

## What This Is

**create-bitred-vue** is a CLI scaffolding tool that generates modular Vue 3 + TypeScript projects with selectable features and Laravel authentication presets. It is published to npm and invoked via `npx create-bitred-vue my-project`.

This repo contains both the CLI source code (`src/`) and the project templates (`template/`).

## Commands

```bash
npm run build       # Build CLI with tsup → dist/index.js
npm run dev         # Build in watch mode
npm test            # Run all tests (vitest)
npm run test:watch  # Run tests in watch mode
```

## Architecture

### CLI Source (`src/`)

```
src/
├── index.ts          # Entry point — intro → prompts → generate → outro
├── types.ts          # Feature, AuthPreset, ProjectOptions, AUTH_REQUIRED_FEATURES
├── prompts.ts        # Interactive prompts via @clack/prompts
├── generator.ts      # Orchestrates: base → features → preset → dynamic files → npm install
├── utils.ts          # renderTemplate, deepMerge, sortDependencies, toValidPackageName
└── generators/
    ├── main-ts.ts    # Generates src/main.ts with conditional imports/plugins
    ├── app-vue.ts    # Generates App.vue (layout system or simple placeholder)
    └── vite-config.ts # Generates vite.config.ts with conditional plugins
```

**Key flow:** `index.ts` → `prompts.ts` (collects options) → `generator.ts` (copies templates + generates dynamic files)

### Templates (`template/`)

```
template/
├── base/             # Always included: index.html, tsconfigs, package.json, src/ skeleton
├── features/         # Overlay directories — each adds files + package.json deps
│   ├── router/       # Vue Router, layouts, pages, guards, useQueryParams
│   ├── pinia/        # Pinia store setup
│   ├── services/     # Axios + TanStack Query, http.ts, typed API layer
│   ├── forms/        # TanStack Form + Zod (deps only)
│   ├── ui/           # Shadcn Vue + Tailwind v4, components.json, cn(), CSS
│   └── eslint/       # ESLint 9 flat config + Prettier
└── presets/
    ├── auth-sanctum/   # Cookie-based auth (withCredentials, CSRF)
    └── auth-passport/  # Token-based auth (Bearer, auto-refresh interceptor)
```

### Template Conventions

- Files starting with `_` are renamed to `.` at generation time (`_gitignore` → `.gitignore`)
- Each overlay has a `package.json` with only its extra deps — merged via `deepMerge` + `sortDependencies`
- Auth presets overwrite `services/http.ts`, `router/routes.ts`, and `router/guards.ts` from their feature counterparts
- Three files are always generated dynamically: `src/main.ts`, `src/App.vue`, `vite.config.ts`

### Tests (`tests/`)

```
tests/
├── utils.test.ts        # Unit tests for toValidPackageName, sortDependencies, deepMerge, renderTemplate
├── generators.test.ts   # Unit tests for main-ts, app-vue, vite-config generators
└── integration.test.ts  # Full project generation + npm install + vite build for all scenarios
```

Integration build tests are slow (~60s total) because they run `npm install` + `vue-tsc -b && vite build` for 4 scenarios.

## Key Design Decisions

- **Single mode**: Only modular mode (no simplified mode)
- **Template composition**: Features are overlays applied on top of base, not conditionally injected code
- **Auth requires features**: Selecting any auth preset auto-adds router, pinia, services
- **Dynamic generation**: `main.ts`, `App.vue`, and `vite.config.ts` are code-generated (not templated) because their content depends on the combination of all selected features
- **Package manager**: npm only (hardcoded `npm install` in generator)

## Features and Auth Presets

| Feature | Type in `types.ts` |
|---------|-------------------|
| Router | `"router"` |
| Pinia | `"pinia"` |
| UI (Shadcn + Tailwind) | `"ui"` |
| Services (Axios + TanStack Query) | `"services"` |
| Forms (TanStack Form + Zod) | `"forms"` |
| ESLint + Prettier | `"eslint"` |

| Auth Preset | Type in `types.ts` |
|-------------|-------------------|
| None | `"none"` |
| Laravel Sanctum | `"sanctum"` |
| Laravel Passport | `"passport"` |

## Adding a New Feature

1. Create `template/features/<name>/` with a `package.json` (extra deps only)
2. Add source files under `template/features/<name>/src/`
3. Add the name to the `Feature` union type in `src/types.ts`
4. Add a multiselect option in `src/prompts.ts`
5. If needed: update `src/generators/main-ts.ts` (imports/plugins) and `src/generators/vite-config.ts` (plugins)
6. Add integration test scenarios in `tests/integration.test.ts`

## Adding a New Auth Preset

1. Create `template/presets/auth-<name>/` following the sanctum/passport structure
2. Add the name to the `AuthPreset` union type in `src/types.ts`
3. Add a select option in `src/prompts.ts`
4. Add build test in `tests/integration.test.ts`

## Code Style

- TypeScript strict mode, ES2023 target
- ESM only (`"type": "module"` in package.json)
- Semicolons, double quotes
- No linter configured for this repo itself (only generated projects get ESLint)
