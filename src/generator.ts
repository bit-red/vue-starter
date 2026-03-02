import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import type { ProjectOptions, AuthPage } from "./types.js";
import { renderTemplate } from "./utils.js";
import { generateMainTs } from "./generators/main-ts.js";
import { generateAppVue } from "./generators/app-vue.js";
import { generateViteConfig } from "./generators/vite-config.js";
import { generateAuthRouter } from "./generators/auth-router.js";
import {
  generateAuthServices,
  generateAuthMutationsIndex,
  generateAuthMainIndex,
} from "./generators/auth-indexes.js";

function getTemplateDir(): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
    "..",
    "template",
  );
}

function copyFile(src: string, dest: string): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/** Maps auth page to its mutation and page files */
const AUTH_PAGE_FILES: Record<
  AuthPage,
  { mutation: string; page: string }
> = {
  register: {
    mutation: "use-register.ts",
    page: "RegisterPage.vue",
  },
  "forgot-password": {
    mutation: "use-forgot-password.ts",
    page: "ForgotPasswordPage.vue",
  },
  "reset-password": {
    mutation: "use-reset-password.ts",
    page: "ResetPasswordPage.vue",
  },
  "email-verification": {
    mutation: "use-send-email-verification.ts",
    page: "EmailVerificationPage.vue",
  },
};

function applyAuthCommon(
  templateDir: string,
  dest: string,
  options: ProjectOptions,
): void {
  const { features, authPreset, authPages } = options;
  const hasUi = features.includes("ui");
  const commonDir = path.resolve(templateDir, "presets", "auth-common");
  const srcDir = path.resolve(dest, "src");

  // a. Copy core shared files
  const coreFiles = [
    ["src/router/guards.ts", "src/router/guards.ts"],
    ["src/router/routes.ts", "src/router/routes.ts"],
    ["src/router/types.ts", "src/router/types.ts"],
    ["src/services/auth/keys.ts", "src/services/auth/keys.ts"],
    ["src/services/auth/queries/use-user.ts", "src/services/auth/queries/use-user.ts"],
    ["src/services/auth/queries/index.ts", "src/services/auth/queries/index.ts"],
    ["src/modules/auth/index.ts", "src/modules/auth/index.ts"],
    ["src/modules/auth/composables/use-auth-routes.ts", "src/modules/auth/composables/use-auth-routes.ts"],
  ];

  for (const [from, to] of coreFiles) {
    const srcFile = path.resolve(commonDir, from);
    if (fs.existsSync(srcFile)) {
      copyFile(srcFile, path.resolve(dest, to));
    }
  }

  // Always copy login mutation
  copyFile(
    path.resolve(commonDir, "src/services/auth/mutations/use-login.ts"),
    path.resolve(srcDir, "services/auth/mutations/use-login.ts"),
  );
  copyFile(
    path.resolve(commonDir, "src/services/auth/mutations/use-logout.ts"),
    path.resolve(srcDir, "services/auth/mutations/use-logout.ts"),
  );

  // b. Copy selective mutations and pages based on authPages
  for (const page of authPages) {
    const files = AUTH_PAGE_FILES[page];

    // Mutation
    copyFile(
      path.resolve(commonDir, "src/services/auth/mutations", files.mutation),
      path.resolve(srcDir, "services/auth/mutations", files.mutation),
    );

    // Page (ui or plain)
    if (hasUi) {
      copyFile(
        path.resolve(commonDir, "src/modules/auth/pages/ui", files.page),
        path.resolve(srcDir, "modules/auth/pages", files.page),
      );
    }
  }

  // c. Copy LoginPage (always) — from plain or ui
  const pageVariant = hasUi ? "ui" : "plain";
  copyFile(
    path.resolve(commonDir, "src/modules/auth/pages", pageVariant, "LoginPage.vue"),
    path.resolve(srcDir, "modules/auth/pages/LoginPage.vue"),
  );

  // d. Copy AuthPageLayout (only for UI variant)
  if (hasUi) {
    copyFile(
      path.resolve(commonDir, "src/modules/auth/components/AuthPageLayout.vue"),
      path.resolve(srcDir, "modules/auth/components/AuthPageLayout.vue"),
    );
  }

  // e. Copy DashboardPage — from plain or ui
  copyFile(
    path.resolve(commonDir, "src/pages", pageVariant, "DashboardPage.vue"),
    path.resolve(srcDir, "pages/DashboardPage.vue"),
  );

  // f. Generate dynamic files
  fs.writeFileSync(
    path.resolve(srcDir, "modules/auth/router.ts"),
    generateAuthRouter(authPages),
  );

  fs.writeFileSync(
    path.resolve(srcDir, "services/auth/services.ts"),
    generateAuthServices(authPages, authPreset),
  );

  fs.writeFileSync(
    path.resolve(srcDir, "services/auth/mutations/index.ts"),
    generateAuthMutationsIndex(authPages),
  );

  fs.writeFileSync(
    path.resolve(srcDir, "services/auth/index.ts"),
    generateAuthMainIndex(authPages, authPreset),
  );
}

export async function generateProject(options: ProjectOptions): Promise<void> {
  const { projectName, packageName, features, authPreset } = options;
  const cwd = process.cwd();
  const dest = path.resolve(cwd, projectName);
  const templateDir = getTemplateDir();

  // 1. Create destination directory
  if (fs.existsSync(dest)) {
    const files = fs.readdirSync(dest);
    if (files.length > 0) {
      p.log.error(`Directory "${projectName}" is not empty.`);
      process.exit(1);
    }
  } else {
    fs.mkdirSync(dest, { recursive: true });
  }

  // 2. Scaffold project
  const scaffold = p.spinner();
  scaffold.start("Scaffolding project...");

  const baseDir = path.resolve(templateDir, "base");
  if (fs.existsSync(baseDir)) {
    renderTemplate(baseDir, dest);
  }

  for (const feature of features) {
    scaffold.message(`Applying feature: ${feature}`);
    const featureDir = path.resolve(templateDir, "features", feature);
    if (fs.existsSync(featureDir)) {
      renderTemplate(featureDir, dest);
    }
  }

  if (authPreset !== "none") {
    scaffold.message(`Applying auth preset: ${authPreset}`);

    // Apply preset-specific overlay (http.ts, login.ts, logout.ts, store, types, etc.)
    const presetDir = path.resolve(
      templateDir,
      "presets",
      `auth-${authPreset}`,
    );
    if (fs.existsSync(presetDir)) {
      renderTemplate(presetDir, dest);
    }

    // Apply common auth files + selective pages/services/mutations
    applyAuthCommon(templateDir, dest, options);
  }

  scaffold.message("Generating main.ts, App.vue, vite.config.ts");
  const srcDir = path.resolve(dest, "src");
  fs.mkdirSync(srcDir, { recursive: true });

  fs.writeFileSync(path.resolve(srcDir, "main.ts"), generateMainTs(options));
  fs.writeFileSync(path.resolve(srcDir, "App.vue"), generateAppVue(options));
  fs.writeFileSync(
    path.resolve(dest, "vite.config.ts"),
    generateViteConfig(options),
  );

  const pkgPath = path.resolve(dest, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    pkg.name = packageName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 3. Initialize git
  scaffold.message("Initializing git repository");
  try {
    execSync("git init", { cwd: dest, stdio: "pipe" });
  } catch {
    // git not available — skip silently
  }

  scaffold.stop("Project scaffolded");
}
