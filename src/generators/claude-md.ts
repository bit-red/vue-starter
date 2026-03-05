import type { ProjectOptions } from "../types.js";

export function generateClaudeMd(options: ProjectOptions): string {
  const { features, sharedComponents } = options;
  const hasForms = features.includes("forms");
  const hasUi = features.includes("ui");
  const hasAppField = sharedComponents.includes("app-field");
  const hasAppFormInput = sharedComponents.includes("app-form-input");
  const hasAppFormDatePicker = sharedComponents.includes("app-form-datepicker");
  const hasAppPhoneInput = sharedComponents.includes("app-phone-input");

  const lines: string[] = [];

  // ─── Base CLAUDE.md ───
  lines.push(`# CLAUDE.md

This file provides context for Claude Code (claude.ai/claude-code) when working on this project.

## Project Overview

This is a Vue 3 + TypeScript application scaffolded with **create-bitred-vue**. It uses Vite as the build tool and follows a modular architecture designed for Laravel-backed SPAs.

## Commands

\`\`\`bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check with vue-tsc then build for production
npm run preview   # Preview production build locally
\`\`\`

## Architecture

### Directory Structure

\`\`\`
src/
├── assets/          # Static assets and global CSS
├── components/
│   ├── layouts/     # Layout components (GuestLayout, AuthLayout)
│   ├── shared/      # Shared/reusable components
│   └── ui/          # Shadcn Vue UI components (if UI feature enabled)
│       └── <kebab-case>/   # e.g. button/, card/, theme-toggle/
│           ├── ComponentName.vue
│           └── index.ts     # Barrel export
├── composables/     # Vue composables (reusable reactive logic)
│   └── use-theme.ts # Dark/light mode toggle (UI feature)
├── lib/             # Utility functions (e.g. cn() for class merging)
├── modules/         # Feature modules (e.g. auth/)
│   └── <module>/
│       ├── pages/
│       ├── components/
│       │   └── <kebab-case>/   # Same pattern as ui/ components
│       │       ├── ComponentName.vue
│       │       └── index.ts
│       ├── composables/
│       └── router.ts
├── pages/           # Top-level page components
├── router/          # Vue Router config, routes, guards
├── services/        # API layer (Axios + TanStack Query)
│   ├── http.ts      # Axios instance
│   ├── types.ts     # Shared API types
│   └── <domain>/    # Domain-specific services
│       ├── keys.ts      # TanStack Query keys
│       ├── types.ts     # Domain types
│       ├── services.ts  # API call functions
│       ├── queries/     # useQuery composables
│       └── mutations/   # useMutation composables
└── stores/          # Pinia stores
\`\`\`

### Component Patterns

**UI components** follow the Shadcn Vue convention: each component lives in \`components/ui/<kebab-case>/\` with a \`ComponentName.vue\` and an \`index.ts\` barrel export. Import via \`@/components/ui/<name>\`:

\`\`\`ts
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
\`\`\`

**Module components** follow the same pattern inside their module:

\`\`\`ts
import { AuthPageLayout } from "../components/auth-page-layout";
\`\`\`

### Key Patterns

**Layouts**: The app uses dynamic layouts via \`route.meta.layout\`. Each route can specify \`layout: "guest"\` or \`layout: "auth"\` in its meta. The \`App.vue\` component resolves and renders the correct layout automatically.

**Dark mode**: The \`useTheme()\` composable (from \`@/composables/use-theme\`) manages color mode via \`@vueuse/core\`. It stores the preference in localStorage under \`app-theme\` and applies classes to \`<html>\`. The \`ThemeToggle\` component provides a floating sun/moon button.

**Services layer**: API services follow a strict structure:
- \`services/<domain>/keys.ts\` — TanStack Query key factories
- \`services/<domain>/services.ts\` — API call functions (return promises)
- \`services/<domain>/queries/\` — \`useQuery\` composables wrapping services
- \`services/<domain>/mutations/\` — \`useMutation\` composables wrapping services

**Routes**: Route names follow dot notation for namespacing (e.g. \`auth.login\`, \`auth.register\`). Protected routes use \`meta: { requiresAuth: true }\`, guest-only routes use \`meta: { requiresGuest: true }\`.

**Stores**: Pinia stores use the composition API style (\`defineStore\` with setup function).

### Auth Module

When an auth preset is selected, the following module is generated:

- **Login page** is always included
- **Additional pages** are selectable: Register, Forgot Password, Reset Password, Email Verification
- **UI variant** (with Shadcn components) uses \`AuthPageLayout\` wrapper for consistent card + image layout
- **Plain variant** (without UI feature) uses minimal CSS-only pages
- Auth store (Pinia) with \`isAuthenticated\` and \`isAdmin\`
- TanStack Query services, queries, and mutations
- Navigation guards (\`requiresAuth\`, \`requiresGuest\`)
- Route-based layouts (\`guest\` for auth pages, \`auth\` for protected pages)
- Dashboard placeholder page

## Tech Stack

- **Vue 3** with \`<script setup>\` and Composition API
- **TypeScript** with strict mode
- **Vite** as build tool
- **Vue Router** for routing (if enabled)
- **Pinia** for state management (if enabled)
- **Axios** + **TanStack Vue Query** for API calls (if enabled)
- **TanStack Vue Form** + **Zod** for form handling and validation (if enabled)
- **Shadcn Vue** + **Tailwind CSS v4** for UI components (if enabled)
- **VueUse** for utility composables (if UI enabled)
- **ESLint 9** + **Prettier** for linting and formatting (if enabled)

## Code Style

- Semicolons: yes
- Quotes: double quotes
- Trailing commas: all
- Print width: 100
- Components use \`<script setup lang="ts">\` exclusively
- File naming: kebab-case for files (\`use-query-params.ts\`), PascalCase for Vue components (\`HomePage.vue\`)
- Page components are suffixed with \`Page\` (e.g. \`LoginPage.vue\`, \`DashboardPage.vue\`)
- Layout components are suffixed with \`Layout\` (e.g. \`GuestLayout.vue\`)
- Composables are prefixed with \`use-\` (e.g. \`use-error-handler.ts\`)

## Environment Variables

All environment variables are prefixed with \`VITE_\` and accessed via \`import.meta.env\`.

\`\`\`
VITE_API_URL=http://localhost:8000/api
\`\`\`

## Adding a New Feature Module

1. Create \`src/modules/<name>/\` with \`pages/\`, \`components/\`, \`composables/\`, and \`router.ts\`
2. Add service layer in \`src/services/<name>/\` following the keys/services/queries/mutations pattern
3. Import routes in \`src/router/routes.ts\`
4. Add any required store in \`src/stores/<name>.ts\`

## Adding Shadcn Vue Components

\`\`\`bash
npx shadcn-vue@latest add <component-name>
\`\`\`

Components are installed to \`src/components/ui/\`. The \`cn()\` utility is available at \`@/lib/utils\`.`);

  // ─── TanStack Form section ───
  if (hasForms) {
    lines.push(`

## TanStack Form

### Setup Pattern

\`\`\`vue
<script setup lang="ts">
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";${hasAppField ? `
import { useApiFieldErrors } from "@/composables/use-api-field-errors";
import { useErrorHandler } from "@/composables/use-error-handler";` : ""}

const schema = {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
};
${hasAppField ? `
const { setErrors, clearErrors } = useApiFieldErrors();
const { handleError } = useErrorHandler();
` : ""}
const form = useForm({
  defaultValues: { name: "", email: "" },
  onSubmit: async ({ value }) => {${hasAppField ? `
    clearErrors();` : ""}
    try {
      await myMutation.mutateAsync(value);
    } catch (error) {${hasAppField ? `
      handleError(error);` : `
      // handle error`}
    }
  },
});

const isSubmitting = form.useStore((s) => s.isSubmitting);
</script>
\`\`\`

### Rules

- **No adapter** — Use Zod Standard Schema directly (do NOT use \`@tanstack/zod-form-adapter\`)
- **Reactivity** — Use \`form.useStore((s) => s.someValue)\` for reactive form state in template
- **isSubmitting** — Use \`form.useStore((s) => s.isSubmitting)\` instead of mutation's \`isPending\` to disable submit button
- **Listeners** — Use \`listeners\` prop for cross-field validation (e.g. confirm password depends on password)`);
  }

  // ─── Shared Components section ───
  if (sharedComponents.length > 0 && hasUi) {
    lines.push(`

## Shared Components

**Shared components take priority over raw Shadcn UI.** Always prefer shared components over composing Shadcn primitives manually.`);

    if (hasAppFormInput) {
      lines.push(`

### AppFormInput

Input with label, error display, mask support, prefix/suffix slots, and disabled tooltip.

\`\`\`vue
<AppFormInput
  v-model="value"
  label="CPF"
  :error="errorMsg"
  mask="cpf"
  placeholder="000.000.000-00"
/>

<!-- With prefix/suffix -->
<AppFormInput v-model="price" label="Price" mask="currency">
  <template #prefix>R$</template>
</AppFormInput>
\`\`\`

Available mask presets: \`cpf\`, \`cnpj\`, \`cpf_cnpj\`, \`phone\`, \`cep\`, \`date\`, \`currency\`, \`rg\`.`);
    }

    if (hasAppFormDatePicker) {
      lines.push(`

### AppFormDatePicker

Date picker with dark mode support, range selection, and multiple picker types.

\`\`\`vue
<AppFormDatePicker
  v-model="date"
  label="Birth Date"
  :error="errorMsg"
  model-type="yyyy-MM-dd"
/>

<!-- Range picker -->
<AppFormDatePicker v-model="range" label="Period" range />
\`\`\``);
    }

    if (hasAppPhoneInput) {
      lines.push(`

### AppFormPhoneInput

International phone input with country selector and E.164 format output.

\`\`\`vue
<AppFormPhoneInput
  v-model="phone"
  label="Phone"
  :error="errorMsg"
  default-country="BR"
/>
\`\`\`

The \`v-model\` value is always in E.164 format (e.g. \`+5511999887766\`).`);
    }

    if (hasAppField) {
      lines.push(`

### AppField

TanStack Form field wrapper that auto-connects to form validation and API field errors.
**Always use AppField instead of raw \`form.Field\`.**

\`\`\`vue
<AppField
  :form="form"
  name="email"
  :schema="schema.email"
  label="Email"
  placeholder="email@example.com"
/>

<!-- With mask -->
<AppField
  :form="form"
  name="cpf"
  :schema="schema.cpf"
  label="CPF"
  mask="cpf"
/>
\`\`\``);

      if (hasAppPhoneInput) {
        lines.push(`

### AppFieldPhone

TanStack Form wrapper for phone input.

\`\`\`vue
<AppFieldPhone
  :form="form"
  name="phone"
  :schema="schema.phone"
  label="Phone"
  default-country="BR"
/>
\`\`\``);
      }

      lines.push(`

### AppField Patterns

#### useApiFieldErrors + useErrorHandler

This pattern automatically handles 422 validation errors from the API:

1. \`useApiFieldErrors()\` — Call in the page/form component to provide context
2. \`useErrorHandler()\` — Call after \`useApiFieldErrors\` to auto-integrate
3. On 422 errors, field errors are automatically displayed on the correct AppField
4. Field errors auto-clear when the user edits the field

#### Schema vs Validators

- Use \`:schema="schema.fieldName"\` for simple Zod validation (applies onBlur + onSubmit)
- Use \`:validators="{ onChange: customFn }"\` for custom validator functions
- Use \`:listeners="{ onChange: fn }"\` for cross-field dependencies`);
    }
  }

  lines.push("\n");

  return lines.join("");
}
