import * as p from "@clack/prompts";
import pc from "picocolors";
import type { Feature, AuthPreset, ProjectOptions } from "./types.js";
import { AUTH_REQUIRED_FEATURES } from "./types.js";
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
  const features = resolveFeatures(
    result.features as Feature[],
    result.authPreset as AuthPreset,
  );
  const authPreset = result.authPreset as AuthPreset;

  return {
    projectName,
    packageName: toValidPackageName(projectName),
    features,
    authPreset,
  };
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
