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
├── types.ts          # Feature, AuthPreset, AuthPage, SharedComponent, ProjectOptions
├── prompts.ts        # Interactive prompts via @clack/prompts
├── generator.ts      # Orchestrates: base → features → shared → preset → auth-common → dynamic files
├── utils.ts          # renderTemplate, deepMerge, sortDependencies, toValidPackageName
└── generators/
    ├── main-ts.ts    # Generates src/main.ts with conditional imports/plugins
    ├── app-vue.ts    # Generates App.vue (layout system or simple placeholder)
    ├── vite-config.ts # Generates vite.config.ts with conditional plugins
    ├── auth-router.ts # Generates auth module router.ts based on selected pages
    ├── auth-indexes.ts # Generates auth services/mutations barrel indexes
    └── claude-md.ts  # Generates CLAUDE.md with conditional sections
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
│   ├── ui/           # Shadcn Vue + Tailwind v4, components.json, cn(), ThemeToggle
│   └── eslint/       # ESLint 9 flat config + Prettier
├── shared/           # Shared component overlays (selected when ui feature enabled)
│   ├── app-form-input/    # Input with label, error, mask (maska), tooltip
│   ├── app-form-datepicker/ # Date picker (vue-datepicker) with dark mode
│   ├── app-phone-input/   # International phone input (libphonenumber-js)
│   └── app-field/         # TanStack Form field wrapper (requires forms + ui)
└── presets/
    ├── auth-common/    # Shared auth files: pages (ui/plain), mutations, guards, routes
    ├── auth-sanctum/   # Cookie-based auth (withCredentials, CSRF) — http.ts, store, types
    └── auth-passport/  # Token-based auth (Bearer, auto-refresh) — http.ts, store, types
```

### Template Conventions

- Files starting with `_` are renamed to `.` at generation time (`_gitignore` → `.gitignore`)
- Each overlay has a `package.json` with only its extra deps — merged via `deepMerge` + `sortDependencies`
- Preset-specific overlays (`auth-sanctum/`, `auth-passport/`) only contain `http.ts`, `stores/auth.ts`, and `services/auth/types.ts`
- Common auth files (pages, guards, routes, mutations, queries) live in `auth-common/` and are copied selectively by `generator.ts`
- Shared component overlays follow the same pattern as features — each has a `package.json` for deps
- `app-field` has conditional logic: `AppFieldPhone.vue` only included if `app-phone-input` is also selected; its `index.ts` is generated dynamically
- `app-form-datepicker` appends `@import "./datepicker.css"` to `index.css` after overlay application
- Four files are always generated dynamically: `src/main.ts`, `src/App.vue`, `vite.config.ts`, `CLAUDE.md`
- Auth-specific files are also generated dynamically: `modules/auth/router.ts`, `services/auth/services.ts`, `services/auth/mutations/index.ts`, `services/auth/index.ts`

### Tests (`tests/`)

```
tests/
├── utils.test.ts        # Unit tests for toValidPackageName, sortDependencies, deepMerge, renderTemplate
├── generators.test.ts   # Unit tests for main-ts, app-vue, vite-config, auth-router, auth-indexes, claude-md generators
└── integration.test.ts  # Full project generation + npm install + vite build for 7 scenarios
```

Integration build tests are slow (~140s total) because they run `npm install` + `vue-tsc -b && vite build` for 7 scenarios.

## Key Design Decisions

- **Single mode**: Only modular mode (no simplified mode)
- **Template composition**: Features are overlays applied on top of base, not conditionally injected code
- **Auth requires features**: Selecting any auth preset auto-adds router, pinia, services
- **Auth page selection**: Users choose which auth pages to include (register, forgot-password, reset-password, email-verification); login is always included
- **Auth-common extraction**: Shared auth files (guards, routes, pages, mutations) live in `auth-common/`, while preset-specific files (http.ts, store, types) stay in `auth-sanctum/` and `auth-passport/`
- **Shared components**: When `ui` is selected, users can optionally add shared components; `app-field` requires `forms` and auto-includes `app-form-input`
- **Dynamic generation**: `main.ts`, `App.vue`, `vite.config.ts`, `CLAUDE.md`, and auth barrel indexes are code-generated because their content depends on the combination of selected features/pages/components
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

| Auth Page | Type in `types.ts` |
|-----------|-------------------|
| Register | `"register"` |
| Forgot Password | `"forgot-password"` |
| Reset Password | `"reset-password"` |
| Email Verification | `"email-verification"` |

| Shared Component | Type in `types.ts` | Requires |
|-----------------|-------------------|----------|
| AppFormInput | `"app-form-input"` | `ui` |
| AppFormDatePicker | `"app-form-datepicker"` | `ui` |
| AppPhoneInput | `"app-phone-input"` | `ui` |
| AppField | `"app-field"` | `ui` + `forms`, auto-includes `app-form-input` |

## Adding a New Feature

1. Create `template/features/<name>/` with a `package.json` (extra deps only)
2. Add source files under `template/features/<name>/src/`
3. Add the name to the `Feature` union type in `src/types.ts`
4. Add a multiselect option in `src/prompts.ts`
5. If needed: update `src/generators/main-ts.ts` (imports/plugins) and `src/generators/vite-config.ts` (plugins)
6. Add integration test scenarios in `tests/integration.test.ts`

## Adding a New Auth Preset

1. Create `template/presets/auth-<name>/` with only preset-specific files (`http.ts`, `stores/auth.ts`, `services/auth/types.ts`)
2. Add the name to the `AuthPreset` union type in `src/types.ts`
3. Add a select option in `src/prompts.ts`
4. Update `src/generators/auth-indexes.ts` if the preset has different service functions
5. Add build test in `tests/integration.test.ts`

## Adding a New Auth Page

1. Add the page name to the `AuthPage` union type in `src/types.ts` and `SELECTABLE_AUTH_PAGES`
2. Add UI variant in `template/presets/auth-common/src/modules/auth/pages/ui/`
3. Add mutation in `template/presets/auth-common/src/services/auth/mutations/`
4. Add entry in `AUTH_PAGE_FILES` map in `src/generator.ts`
5. Update `src/generators/auth-router.ts` and `src/generators/auth-indexes.ts`
6. Add a multiselect option in `src/prompts.ts`

## Adding a New Shared Component

1. Create `template/shared/<name>/` with a `package.json` (extra deps only)
2. Add source files under `template/shared/<name>/src/`
3. Add the name to the `SharedComponent` union type in `src/types.ts` and `SELECTABLE_SHARED_COMPONENTS`
4. If it requires `forms`, add to `SHARED_COMPONENT_REQUIRES_FORMS`
5. If it depends on other shared components, add to `SHARED_COMPONENT_DEPS`
6. Add label/hint in `SHARED_COMPONENT_LABELS` in `src/prompts.ts`
7. If special logic needed (conditional files), update `applySharedComponents` or `applyAppField` in `src/generator.ts`
8. Update `src/generators/claude-md.ts` to document the component in generated projects
9. Add build test in `tests/integration.test.ts`

## Code Style

- TypeScript strict mode, ES2023 target
- ESM only (`"type": "module"` in package.json)
- Semicolons, double quotes
- No linter configured for this repo itself (only generated projects get ESLint)
