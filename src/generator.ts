import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import type { ProjectOptions } from "./types.js";
import { renderTemplate } from "./utils.js";
import { generateMainTs } from "./generators/main-ts.js";
import { generateAppVue } from "./generators/app-vue.js";
import { generateViteConfig } from "./generators/vite-config.js";

function getTemplateDir(): string {
  return path.resolve(
    new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"),
    "..",
    "template",
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
    const presetDir = path.resolve(
      templateDir,
      "presets",
      `auth-${authPreset}`,
    );
    if (fs.existsSync(presetDir)) {
      renderTemplate(presetDir, dest);
    }
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
