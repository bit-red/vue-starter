import fs from "node:fs";
import path from "node:path";

export function toValidPackageName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

export function sortDependencies(
  deps: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function deepMerge(
  target: Record<string, unknown>,
  obj: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key];
    const newVal = obj[key];

    if (
      typeof oldVal === "object" &&
      oldVal !== null &&
      !Array.isArray(oldVal) &&
      typeof newVal === "object" &&
      newVal !== null &&
      !Array.isArray(newVal)
    ) {
      target[key] = deepMerge(
        oldVal as Record<string, unknown>,
        newVal as Record<string, unknown>,
      );
    } else {
      target[key] = newVal;
    }
  }
  return target;
}

function renderFile(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    renderDirectory(src, dest);
    return;
  }
  fs.copyFileSync(src, dest);
}

function renderDirectory(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    renderFile(path.resolve(src, file), path.resolve(dest, file));
  }
}

export function renderTemplate(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) {
    throw new Error(`Template source must be a directory: ${src}`);
  }

  fs.mkdirSync(dest, { recursive: true });

  for (const file of fs.readdirSync(src)) {
    // Skip package.json — handled separately via merge
    if (file === "package.json") continue;

    const srcPath = path.resolve(src, file);
    // Rename _file → .file (e.g. _gitignore → .gitignore)
    const destFile = file.startsWith("_") ? `.${file.slice(1)}` : file;
    const destPath = path.resolve(dest, destFile);

    renderFile(srcPath, destPath);
  }

  // Merge package.json if present
  const srcPkg = path.resolve(src, "package.json");
  if (fs.existsSync(srcPkg)) {
    const destPkg = path.resolve(dest, "package.json");
    const newPkg = JSON.parse(fs.readFileSync(srcPkg, "utf-8"));

    if (fs.existsSync(destPkg)) {
      const existingPkg = JSON.parse(fs.readFileSync(destPkg, "utf-8"));
      const merged = deepMerge(existingPkg, newPkg);

      if (merged.dependencies) {
        merged.dependencies = sortDependencies(
          merged.dependencies as Record<string, string>,
        );
      }
      if (merged.devDependencies) {
        merged.devDependencies = sortDependencies(
          merged.devDependencies as Record<string, string>,
        );
      }

      fs.writeFileSync(destPkg, JSON.stringify(merged, null, 2) + "\n");
    } else {
      fs.copyFileSync(srcPkg, destPkg);
    }
  }
}
