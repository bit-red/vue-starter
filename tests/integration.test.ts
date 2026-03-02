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

const templateDir = path.resolve("template");
let testRoot: string;

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
    const dir = path.join(templateDir, "presets", `auth-${options.authPreset}`);
    if (fs.existsSync(dir)) renderTemplate(dir, dest);
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
    expect(
      fs.existsSync(
        path.join(dest, "src", "services", "auth", "services", "login.ts"),
      ),
    ).toBe(true);
    expect(fs.existsSync(path.join(dest, ".env.example"))).toBe(true);
  });

  it("passport preset adds refresh-token service", () => {
    const dest = generateProject({
      projectName: "struct-passport",
      packageName: "struct-passport",
      features: ["router", "pinia", "services"],
      authPreset: "passport",
    });

    expect(
      fs.existsSync(
        path.join(
          dest,
          "src",
          "services",
          "auth",
          "services",
          "refresh-token.ts",
        ),
      ),
    ).toBe(true);
  });
});

describe("package.json merging", () => {
  it("merges dependencies from multiple features", () => {
    const dest = generateProject({
      projectName: "merge-deps",
      packageName: "merge-deps",
      features: ["router", "pinia", "services"],
      authPreset: "none",
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
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("sanctum auth builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-sanctum",
      packageName: "build-sanctum",
      features: ["router", "pinia", "services"],
      authPreset: "sanctum",
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });

  it("passport auth builds", { timeout: 180_000 }, () => {
    const dest = generateProject({
      projectName: "build-passport",
      packageName: "build-passport",
      features: ["router", "pinia", "services"],
      authPreset: "passport",
    });
    install(dest);
    expect(() => build(dest)).not.toThrow();
  });
});
