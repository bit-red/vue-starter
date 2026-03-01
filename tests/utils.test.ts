import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  toValidPackageName,
  sortDependencies,
  deepMerge,
  renderTemplate,
} from "../src/utils.js";

describe("toValidPackageName", () => {
  it("lowercases and trims", () => {
    expect(toValidPackageName("  My Project  ")).toBe("my-project");
  });

  it("replaces spaces with hyphens", () => {
    expect(toValidPackageName("hello world app")).toBe("hello-world-app");
  });

  it("strips leading dots and underscores", () => {
    expect(toValidPackageName(".hidden")).toBe("hidden");
    expect(toValidPackageName("_private")).toBe("private");
  });

  it("replaces invalid characters with hyphens", () => {
    expect(toValidPackageName("my@project!name")).toBe("my-project-name");
  });

  it("keeps valid characters", () => {
    expect(toValidPackageName("my-project~1")).toBe("my-project~1");
  });

  it("handles already valid names", () => {
    expect(toValidPackageName("create-app")).toBe("create-app");
  });
});

describe("sortDependencies", () => {
  it("sorts keys alphabetically", () => {
    const result = sortDependencies({
      zod: "^3.0.0",
      axios: "^1.0.0",
      vue: "^3.0.0",
    });
    expect(Object.keys(result)).toEqual(["axios", "vue", "zod"]);
  });

  it("handles empty object", () => {
    expect(sortDependencies({})).toEqual({});
  });

  it("preserves values", () => {
    const result = sortDependencies({ b: "^2.0.0", a: "^1.0.0" });
    expect(result).toEqual({ a: "^1.0.0", b: "^2.0.0" });
  });
});

describe("deepMerge", () => {
  it("merges flat objects", () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("overwrites primitive values", () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it("deep merges nested objects", () => {
    const result = deepMerge(
      { deps: { vue: "^3.0.0" } },
      { deps: { axios: "^1.0.0" } },
    );
    expect(result).toEqual({
      deps: { vue: "^3.0.0", axios: "^1.0.0" },
    });
  });

  it("overwrites arrays instead of merging them", () => {
    const result = deepMerge({ items: [1, 2] }, { items: [3] });
    expect(result).toEqual({ items: [3] });
  });

  it("handles multiple nesting levels", () => {
    const result = deepMerge(
      { a: { b: { c: 1, d: 2 } } },
      { a: { b: { c: 3 } } },
    );
    expect(result).toEqual({ a: { b: { c: 3, d: 2 } } });
  });
});

describe("renderTemplate", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bitred-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("copies files from source to destination", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, "index.html"), "<html></html>");

    renderTemplate(src, dest);

    expect(fs.existsSync(path.join(dest, "index.html"))).toBe(true);
    expect(fs.readFileSync(path.join(dest, "index.html"), "utf-8")).toBe(
      "<html></html>",
    );
  });

  it("renames _file to .file", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, "_gitignore"), "node_modules");

    renderTemplate(src, dest);

    expect(fs.existsSync(path.join(dest, ".gitignore"))).toBe(true);
    expect(fs.existsSync(path.join(dest, "_gitignore"))).toBe(false);
  });

  it("renames _vscode directory to .vscode", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(path.join(src, "_vscode"), { recursive: true });
    fs.writeFileSync(
      path.join(src, "_vscode", "extensions.json"),
      "{}",
    );

    renderTemplate(src, dest);

    expect(fs.existsSync(path.join(dest, ".vscode", "extensions.json"))).toBe(
      true,
    );
  });

  it("merges package.json when destination already has one", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);
    fs.mkdirSync(dest);

    fs.writeFileSync(
      path.join(dest, "package.json"),
      JSON.stringify({
        dependencies: { vue: "^3.0.0" },
      }),
    );
    fs.writeFileSync(
      path.join(src, "package.json"),
      JSON.stringify({
        dependencies: { axios: "^1.0.0" },
      }),
    );

    renderTemplate(src, dest);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );
    expect(pkg.dependencies).toEqual({
      axios: "^1.0.0",
      vue: "^3.0.0",
    });
  });

  it("sorts dependencies after merge", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);
    fs.mkdirSync(dest);

    fs.writeFileSync(
      path.join(dest, "package.json"),
      JSON.stringify({ dependencies: { zod: "^3.0.0" } }),
    );
    fs.writeFileSync(
      path.join(src, "package.json"),
      JSON.stringify({ dependencies: { axios: "^1.0.0" } }),
    );

    renderTemplate(src, dest);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );
    expect(Object.keys(pkg.dependencies)).toEqual(["axios", "zod"]);
  });

  it("copies package.json when destination has none", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(src);

    fs.writeFileSync(
      path.join(src, "package.json"),
      JSON.stringify({ name: "test" }),
    );

    renderTemplate(src, dest);

    const pkg = JSON.parse(
      fs.readFileSync(path.join(dest, "package.json"), "utf-8"),
    );
    expect(pkg.name).toBe("test");
  });

  it("copies subdirectories recursively", () => {
    const src = path.join(tmpDir, "src");
    const dest = path.join(tmpDir, "dest");
    fs.mkdirSync(path.join(src, "a", "b"), { recursive: true });
    fs.writeFileSync(path.join(src, "a", "b", "deep.txt"), "content");

    renderTemplate(src, dest);

    expect(
      fs.readFileSync(path.join(dest, "a", "b", "deep.txt"), "utf-8"),
    ).toBe("content");
  });

  it("throws if source is not a directory", () => {
    const file = path.join(tmpDir, "file.txt");
    fs.writeFileSync(file, "hello");

    expect(() => renderTemplate(file, tmpDir)).toThrow(
      "Template source must be a directory",
    );
  });
});
