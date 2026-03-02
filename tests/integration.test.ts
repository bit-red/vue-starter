import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import type { ProjectOptions, Feature, AuthPreset } from "../src/types.js";
import { renderTemplate } from "../src/utils.js";
import { generateMainTs } from "../src/generators/main-ts.js";
import { generateAppVue } from "../src/generators/app-vue.js";
import { generateViteConfig } from "../src/generators/vite-config.js";
import { generateAuthRouter } from "../src/generators/auth-router.js";
import {
  generateAuthServices,
  generateAuthMutationsIndex,
  generateAuthMainIndex,
} from "../src/generators/auth-indexes.js";

const templateDir = path.resolve("template");
let testRoot: string;

/** Maps auth page to its related files */
const AUTH_PAGE_FILES: Record<
  string,
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

function copyFile(src: string, dest: string): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function generateProject(options: ProjectOptions): string {
  const dest = path.join(testRoot, options.projectName);
  fs.mkdirSync(dest, { recursive: true });

  // 1. Base
  renderTemplate(path.join(templateDir, "base"), dest);

  // 2. Features
  for (const feature of options.features) {
    const dir = path.join(templateDir, "features", feature);
    if (fs.existsSync(dir)) renderTemplate(dir, dest);
  }

  // 3. Auth preset
  if (options.authPreset !== "none") {
    // Preset-specific overlay
    const presetDir = path.join(
      templateDir,
      "presets",
      `auth-${options.authPreset}`,
    );
    if (fs.existsSync(presetDir)) renderTemplate(presetDir, dest);

    // Common auth files
    const commonDir = path.join(templateDir, "presets", "auth-common");
    const srcDir = path.join(dest, "src");
    const hasUi = options.features.includes("ui");

    // Core files
    const coreFiles = [
      "src/router/guards.ts",
      "src/router/routes.ts",
      "src/router/types.ts",
      "src/services/auth/keys.ts",
      "src/services/auth/queries/use-user.ts",
      "src/services/auth/queries/index.ts",
      "src/modules/auth/index.ts",
      "src/modules/auth/composables/use-auth-routes.ts",
    ];
    for (const file of coreFiles) {
      const srcFile = path.join(commonDir, file);
      if (fs.existsSync(srcFile)) {
        copyFile(srcFile, path.join(dest, file));
      }
    }

    // Always copy login/logout mutations
    copyFile(
      path.join(commonDir, "src/services/auth/mutations/use-login.ts"),
      path.join(srcDir, "services/auth/mutations/use-login.ts"),
    );
    copyFile(
      path.join(commonDir, "src/services/auth/mutations/use-logout.ts"),
      path.join(srcDir, "services/auth/mutations/use-logout.ts"),
    );

    // Selective mutations and pages based on authPages
    for (const page of options.authPages) {
      const files = AUTH_PAGE_FILES[page];
      copyFile(
        path.join(commonDir, "src/services/auth/mutations", files.mutation),
        path.join(srcDir, "services/auth/mutations", files.mutation),
      );
      if (hasUi) {
        copyFile(
          path.join(commonDir, "src/modules/auth/pages/ui", files.page),
          path.join(srcDir, "modules/auth/pages", files.page),
        );
      }
    }

    // Login page (always)
    const pageVariant = hasUi ? "ui" : "plain";
    copyFile(
      path.join(commonDir, "src/modules/auth/pages", pageVariant, "LoginPage.vue"),
      path.join(srcDir, "modules/auth/pages/LoginPage.vue"),
    );

    // AuthPageLayout (only for UI variant)
    if (hasUi) {
      const layoutDir = "src/modules/auth/components/auth-page-layout";
      for (const file of ["AuthPageLayout.vue", "index.ts"]) {
        copyFile(
          path.join(commonDir, layoutDir, file),
          path.join(srcDir, "modules/auth/components/auth-page-layout", file),
        );
      }
    }

    // Dashboard page
    copyFile(
      path.join(commonDir, "src/pages", pageVariant, "DashboardPage.vue"),
      path.join(srcDir, "pages/DashboardPage.vue"),
    );

    // Dynamic files
    fs.writeFileSync(
      path.join(srcDir, "modules/auth/router.ts"),
      generateAuthRouter(options.authPages),
    );
    fs.writeFileSync(
      path.join(srcDir, "services/auth/services.ts"),
      generateAuthServices(options.authPages, options.authPreset),
    );
    fs.writeFileSync(
      path.join(srcDir, "services/auth/mutations/index.ts"),
      generateAuthMutationsIndex(options.authPages),
    );
    fs.writeFileSync(
      path.join(srcDir, "services/auth/index.ts"),
      generateAuthMainIndex(options.authPages, options.authPreset),
    );
  }

  // 4. Dynamic files
  const srcDir = path.join(dest, "src");
  fs.mkdirSync(srcDir, { recursive: true });
  fs.writeFileSync(path.join(srcDir, "main.ts"), generateMainTs(options));
  fs.writeFileSync(path.join(srcDir, "App.vue"), generateAppVue(options));
  fs.writeFileSync(
    path.join(dest, "vite.config.ts"),
    generateViteConfig(options),
  );

  // 5. Set name
  const pkgPath = path.join(dest, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = options.packageName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  return dest;
}

function install(dest: string) {
  execSync("npm install", { cwd: dest, stdio: "pipe", timeout: 120_000 });
}

function build(dest: string) {
  execSync("npx vue-tsc -b && npx vite build", {
    cwd: dest,
    stdio: "pipe",
    timeout: 120_000,
  });
}

beforeAll(() => {
  testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "bitred-integration-"));
});

afterAll(() => {
  fs.rmSync(testRoot, { recursive: true, force: true });
});

describe("project generation: file structure", () => {
  it("bare project has required base files", () => {
    const dest = generateProject({
      projectName: "struct-bare",
      packageName: "struct-bare",
      features: [],
      authPreset: "none",
      authPages: [],
    });

    expect(fs.existsSync(path.join(dest, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "tsconfig.json"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "vite.config.ts"))).toBe(true);
    expect(fs.existsSync(path.join(dest, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "env.d.ts"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "src", "main.ts"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "src", "App.vue"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "CLAUDE.md"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "README.md"))).toBe(true);
  });

  it("router feature adds router files and layouts", () => {
    const dest = generateProject({
      projectName: "struct-router",
      packageName: "struct-router",
      features: ["router"],
      authPreset: "none",
      authPages: [],
    });

    expect(fs.existsSync(path.join(dest, "src", "router", "index.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(dest, "src", "router", "routes.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(dest, "src", "router", "guards.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(dest, "src", "router", "types.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(dest, "src", "pages", "HomePage.vue"))).toBe(
      true,
    );
    expect(
      fs.existsSync(
        path.join(dest, "src", "components", "layouts", "GuestLayout.vue"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(dest, "src", "components", "layouts", "AuthLayout.vue"),
      ),
    ).toBe(true);
  });

  it("services feature adds http and composables", () => {
    const dest = generateProject({
      projectName: "struct-services",
      packageName: "struct-services",
      features: ["services"],
      authPreset: "none",
      authPages: [],
    });

    expect(
      fs.existsSync(path.join(dest, "src", "services", "http.ts")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(dest, "src", "services", "types.ts")),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(dest, "src", "services", "index.ts")),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(dest, "src", "composables", "use-error-handler.ts"),
      ),
    ).toBe(true);
  });

  it("ui feature adds css, utils, and components.json", () => {
    const dest = generateProject({
      projectName: "struct-ui",
      packageName: "struct-ui",
      features: ["ui"],
      authPreset: "none",
      authPages: [],
    });

    expect(
      fs.existsSync(path.join(dest, "src", "assets", "index.css")),
    ).toBe(true);
    expect(fs.existsSync(path.join(dest, "src", "lib", "utils.ts"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(dest, "components.json"))).toBe(true);
  });

  it("eslint feature adds config files", () => {
    const dest = generateProject({
      projectName: "struct-eslint",
      packageName: "struct-eslint",
      features: ["eslint"],
      authPreset: "none",
      authPages: [],
    });

    expect(fs.existsSync(path.join(dest, "eslint.config.ts"))).toBe(true);
    expect(fs.existsSync(path.join(dest, ".prettierrc"))).toBe(true);
  });

  it("sanctum preset adds auth module and services", () => {
    const dest = generateProject({
      projectName: "struct-sanctum",
      packageName: "struct-sanctum",
      features: ["router", "pinia", "services"],
      authPreset: "sanctum",
      authPages: ["register", "forgot-password"],
    });

    expect(
      fs.existsSync(path.join(dest, "src", "modules", "auth", "router.ts")),
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(dest, "src", "modules", "auth", "pages", "LoginPage.vue"),
      ),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(dest, "src", "stores", "auth.ts")),
    ).toBe(true);
    // services.ts is now a single generated file
    expect(
      fs.existsSync(
        path.join(dest, "src", "services", "auth", "services.ts"),
      ),
    ).toBe(true);
    expect(fs.existsSync(path.join(dest, ".env.example"))).toBe(true);
  });

  it("passport preset includes refreshToken in services", () => {
    const dest = generateProject({
      projectName: "struct-passport",
      packageName: "struct-passport",
      features: ["router", "pinia", "services"],
      authPreset: "passport",
      authPages: [],
    });

    const services = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "services.ts"),
      "utf-8",
    );
    expect(services).toContain("export async function refreshToken()");
    expect(services).toContain("oauth/token");
  });
});

describe("auth pages: file structure", () => {
  it("auth + UI + all pages includes all auth page files and shadcn components", () => {
    const dest = generateProject({
      projectName: "struct-auth-ui-all",
      packageName: "struct-auth-ui-all",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "sanctum",
      authPages: ["register", "forgot-password", "reset-password", "email-verification"],
    });

    // Auth pages exist
    const authPagesDir = path.join(dest, "src", "modules", "auth", "pages");
    expect(fs.existsSync(path.join(authPagesDir, "LoginPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "RegisterPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "ForgotPasswordPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "ResetPasswordPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "EmailVerificationPage.vue"))).toBe(true);

    // Single services.ts file with all functions
    const services = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "services.ts"),
      "utf-8",
    );
    expect(services).toContain("export async function register(");
    expect(services).toContain("export async function forgotPassword(");
    expect(services).toContain("export async function resetPassword(");
    expect(services).toContain("export async function sendEmailVerification()");

    // Mutations exist
    const mutationsDir = path.join(dest, "src", "services", "auth", "mutations");
    expect(fs.existsSync(path.join(mutationsDir, "use-register.ts"))).toBe(true);
    expect(fs.existsSync(path.join(mutationsDir, "use-forgot-password.ts"))).toBe(true);
    expect(fs.existsSync(path.join(mutationsDir, "use-reset-password.ts"))).toBe(true);
    expect(fs.existsSync(path.join(mutationsDir, "use-send-email-verification.ts"))).toBe(true);

    // Shadcn components exist
    expect(fs.existsSync(path.join(dest, "src", "components", "ui", "button", "Button.vue"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "src", "components", "ui", "input", "Input.vue"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "src", "components", "ui", "card", "Card.vue"))).toBe(true);

    // Dashboard page exists
    expect(fs.existsSync(path.join(dest, "src", "pages", "DashboardPage.vue"))).toBe(true);

    // UI pages import shadcn components
    const loginContent = fs.readFileSync(path.join(authPagesDir, "LoginPage.vue"), "utf-8");
    expect(loginContent).toContain("@/components/ui/button");
    expect(loginContent).toContain("@/components/ui/input");
  });

  it("auth + no UI has only plain LoginPage", () => {
    const dest = generateProject({
      projectName: "struct-auth-plain",
      packageName: "struct-auth-plain",
      features: ["router", "pinia", "services"],
      authPreset: "sanctum",
      authPages: [],
    });

    const authPagesDir = path.join(dest, "src", "modules", "auth", "pages");
    expect(fs.existsSync(path.join(authPagesDir, "LoginPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "RegisterPage.vue"))).toBe(false);
    expect(fs.existsSync(path.join(authPagesDir, "ForgotPasswordPage.vue"))).toBe(false);

    // Plain LoginPage has scoped CSS, not shadcn imports
    const loginContent = fs.readFileSync(path.join(authPagesDir, "LoginPage.vue"), "utf-8");
    expect(loginContent).toContain("<style scoped>");
    expect(loginContent).not.toContain("@/components/ui/button");
  });

  it("auth + UI + selective pages only includes selected", () => {
    const dest = generateProject({
      projectName: "struct-auth-selective",
      packageName: "struct-auth-selective",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "sanctum",
      authPages: ["register"],
    });

    const authPagesDir = path.join(dest, "src", "modules", "auth", "pages");
    expect(fs.existsSync(path.join(authPagesDir, "LoginPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "RegisterPage.vue"))).toBe(true);
    expect(fs.existsSync(path.join(authPagesDir, "ForgotPasswordPage.vue"))).toBe(false);
    expect(fs.existsSync(path.join(authPagesDir, "ResetPasswordPage.vue"))).toBe(false);
    expect(fs.existsSync(path.join(authPagesDir, "EmailVerificationPage.vue"))).toBe(false);

    // services.ts has register but not others
    const services = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "services.ts"),
      "utf-8",
    );
    expect(services).toContain("register(");
    expect(services).not.toContain("forgotPassword(");
    expect(services).not.toContain("resetPassword(");
  });

  it("barrel indexes contain correct exports", () => {
    const dest = generateProject({
      projectName: "struct-auth-indexes",
      packageName: "struct-auth-indexes",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "passport",
      authPages: ["register", "forgot-password"],
    });

    // services.ts has the right functions
    const services = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "services.ts"),
      "utf-8",
    );
    expect(services).toContain("export async function login(");
    expect(services).toContain("export async function logout()");
    expect(services).toContain("export async function getUser()");
    expect(services).toContain("export async function register(");
    expect(services).toContain("export async function forgotPassword(");
    expect(services).toContain("export async function refreshToken()");
    expect(services).not.toContain("resetPassword(");

    const mutationsIndex = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "mutations", "index.ts"),
      "utf-8",
    );
    expect(mutationsIndex).toContain("useLogin");
    expect(mutationsIndex).toContain("useLogout");
    expect(mutationsIndex).toContain("useRegister");
    expect(mutationsIndex).toContain("useForgotPassword");
    expect(mutationsIndex).not.toContain("useResetPassword");

    const mainIndex = fs.readFileSync(
      path.join(dest, "src", "services", "auth", "index.ts"),
      "utf-8",
    );
    expect(mainIndex).toContain("TokenResponse");
    expect(mainIndex).toContain("RegisterPayload");
    expect(mainIndex).toContain("ForgotPasswordPayload");
    expect(mainIndex).not.toContain("ResetPasswordPayload");
  });
});

describe("package.json merging", () => {
  it("merges dependencies from multiple features", () => {
    const dest = generateProject({
      projectName: "merge-deps",
      packageName: "merge-deps",
      features: ["router", "pinia", "services"],
      authPreset: "none",
      authPages: [],
    });

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );

    expect(pkg.dependencies["vue-router"]).toBeDefined();
    expect(pkg.dependencies["pinia"]).toBeDefined();
    expect(pkg.dependencies["axios"]).toBeDefined();
    expect(pkg.dependencies["@tanstack/vue-query"]).toBeDefined();
  });

  it("sets project name in package.json", () => {
    const dest = generateProject({
      projectName: "custom-name",
      packageName: "custom-name",
      features: [],
      authPreset: "none",
      authPages: [],
    });

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );
    expect(pkg.name).toBe("custom-name");
  });

  it("dependencies are sorted alphabetically", () => {
    const dest = generateProject({
      projectName: "sorted-deps",
      packageName: "sorted-deps",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "none",
      authPages: [],
    });

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );
    const keys = Object.keys(pkg.dependencies);
    const sorted = [...keys].sort((a, b) => a.localeCompare(b));
    expect(keys).toEqual(sorted);
  });
});

describe("project generation: builds", () => {
  it("bare project builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-bare",
      packageName: "build-bare",
      features: [],
      authPreset: "none",
      authPages: [],
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("all features build", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-full",
      packageName: "build-full",
      features: ["router", "pinia", "ui", "services", "forms", "eslint"],
      authPreset: "none",
      authPages: [],
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("sanctum auth with UI and all pages builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-sanctum-ui",
      packageName: "build-sanctum-ui",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "sanctum",
      authPages: ["register", "forgot-password", "reset-password", "email-verification"],
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("passport auth with UI and login only builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-passport-ui-login",
      packageName: "build-passport-ui-login",
      features: ["router", "pinia", "services", "ui"],
      authPreset: "passport",
      authPages: [],
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("sanctum auth without UI (plain) builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-sanctum-plain",
      packageName: "build-sanctum-plain",
      features: ["router", "pinia", "services"],
      authPreset: "sanctum",
      authPages: [],
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });
});
