import * as p from "@clack/prompts";
import pc from "picocolors";
import type {
  Feature,
  AuthPreset,
  AuthPage,
  SharedComponent,
  ProjectOptions,
} from "./types.js";
import {
  AUTH_REQUIRED_FEATURES,
  SELECTABLE_AUTH_PAGES,
  SELECTABLE_SHARED_COMPONENTS,
  SHARED_COMPONENT_REQUIRES_FORMS,
  SHARED_COMPONENT_DEPS,
} from "./types.js";
import { toValidPackageName } from "./utils.js";

export async function runPrompts(
  argv: string[],
): Promise<ProjectOptions | null> {
  const argProjectName = argv[0];

  const result = await p.group(
    {
      projectName: () =>
        argProjectName
          ? Promise.resolve(argProjectName)
          : p.text({
              message: "Project name:",
              placeholder: "my-project",
              validate(value) {
                if (!value.trim()) return "Project name is required.";
              },
            }),

      features: () =>
        p.multiselect<{ value: Feature; label: string }[], Feature>({
          message: "Select features:",
          initialValues: [
            "router",
            "pinia",
            "ui",
            "services",
            "forms",
            "eslint",
          ],
          options: [
            { value: "router", label: "Router", hint: "Vue Router + layouts" },
            { value: "pinia", label: "Pinia", hint: "State management" },
            {
              value: "ui",
              label: "UI",
              hint: "Shadcn Vue + Tailwind v4",
            },
            {
              value: "services",
              label: "Services",
              hint: "Axios + TanStack Query",
            },
            {
              value: "forms",
              label: "Forms",
              hint: "TanStack Form + Zod",
            },
            {
              value: "eslint",
              label: "ESLint",
              hint: "ESLint 9 + Prettier",
            },
          ],
          required: false,
        }),

      authPreset: () =>
        p.select<{ value: AuthPreset; label: string }[], AuthPreset>({
          message: "Authentication preset:",
          options: [
            { value: "none", label: "None" },
            {
              value: "sanctum",
              label: "Laravel Sanctum",
              hint: "Cookie-based",
            },
            {
              value: "passport",
              label: "Laravel Passport",
              hint: "Token-based",
            },
          ],
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  const projectName = (result.projectName as string).trim();
  const authPreset = result.authPreset as AuthPreset;
  const features = resolveFeatures(
    result.features as Feature[],
    authPreset,
  );

  // Auth pages prompt: only shown when auth + UI
  let authPages: AuthPage[] = [];

  if (authPreset !== "none" && features.includes("ui")) {
    const selectedPages = await p.multiselect<
      { value: AuthPage; label: string }[],
      AuthPage
    >({
      message: "Auth pages (Login is always included):",
      initialValues: [...SELECTABLE_AUTH_PAGES],
      options: [
        { value: "register", label: "Register" },
        { value: "forgot-password", label: "Forgot Password" },
        { value: "reset-password", label: "Reset Password" },
        { value: "email-verification", label: "Email Verification" },
      ],
      required: false,
    });

    if (p.isCancel(selectedPages)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    authPages = selectedPages;
  }

  // Shared components prompt: only shown when ui is selected
  let sharedComponents: SharedComponent[] = [];

  if (features.includes("ui")) {
    const componentOptions = SELECTABLE_SHARED_COMPONENTS.filter(
      (c) =>
        !SHARED_COMPONENT_REQUIRES_FORMS.includes(c) ||
        features.includes("forms"),
    ).map((c) => ({
      value: c,
      label: SHARED_COMPONENT_LABELS[c].label,
      hint: SHARED_COMPONENT_LABELS[c].hint,
    }));

    if (componentOptions.length > 0) {
      const selectedComponents = await p.multiselect<
        { value: SharedComponent; label: string; hint?: string }[],
        SharedComponent
      >({
        message: "Shared components:",
        options: componentOptions,
        required: false,
      });

      if (p.isCancel(selectedComponents)) {
        p.cancel("Operation cancelled.");
        process.exit(0);
      }

      sharedComponents = resolveSharedComponentDeps(selectedComponents);
    }
  }

  return {
    projectName,
    packageName: toValidPackageName(projectName),
    features,
    authPreset,
    authPages,
    sharedComponents,
  };
}

const SHARED_COMPONENT_LABELS: Record<
  SharedComponent,
  { label: string; hint: string }
> = {
  "app-form-input": { label: "AppFormInput", hint: "Input with label, error, mask" },
  "app-form-datepicker": {
    label: "AppFormDatePicker",
    hint: "Date picker with dark mode",
  },
  "app-phone-input": {
    label: "AppPhoneInput",
    hint: "International phone input",
  },
  "app-field": { label: "AppField", hint: "TanStack Form field wrapper" },
};

function resolveSharedComponentDeps(
  selected: SharedComponent[],
): SharedComponent[] {
  const resolved = new Set(selected);
  for (const c of selected) {
    const deps = SHARED_COMPONENT_DEPS[c];
    if (deps) {
      for (const dep of deps) {
        if (!resolved.has(dep)) {
          p.log.info(
            `Auto-adding ${pc.cyan(dep)} (required by ${pc.yellow(c)})`,
          );
          resolved.add(dep);
        }
      }
    }
  }
  return [...resolved];
}

function resolveFeatures(features: Feature[], auth: AuthPreset): Feature[] {
  const resolved = new Set(features);

  if (auth !== "none") {
    for (const f of AUTH_REQUIRED_FEATURES) {
      if (!resolved.has(f)) {
        p.log.info(
          `Auto-adding ${pc.cyan(f)} (required by ${pc.yellow(auth)} auth)`,
        );
        resolved.add(f);
      }
    }
  }

  return [...resolved];
}
