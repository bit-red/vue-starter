import type { ProjectOptions } from "../types.js";

export function generateViteConfig(options: ProjectOptions): string {
  const has = (f: string) => options.features.includes(f as never);

  const imports: string[] = [
    'import { defineConfig } from "vite";',
    'import vue from "@vitejs/plugin-vue";',
  ];
  const plugins: string[] = ["vue()"];

  if (has("ui")) {
    imports.push('import tailwindcss from "@tailwindcss/vite";');
    plugins.push("tailwindcss()");
  }

  const lines: string[] = [];
  lines.push(...imports);
  lines.push("");
  lines.push("export default defineConfig({");
  lines.push(`  plugins: [${plugins.join(", ")}],`);
  lines.push("  resolve: {");
  lines.push("    alias: {");
  lines.push('      "@": new URL("./src", import.meta.url).pathname,');
  lines.push("    },");
  lines.push("  },");
  lines.push("});");
  lines.push("");

  return lines.join("\n");
}
