import type { ProjectOptions } from "../types.js";

export function generateMainTs(options: ProjectOptions): string {
  const { features, authPreset } = options;
  const has = (f: string) => features.includes(f as never);

  const imports: string[] = ['import { createApp } from "vue";', 'import App from "./App.vue";'];
  const uses: string[] = [];

  if (has("router")) {
    imports.push('import { router } from "./router";');
    uses.push("app.use(router);");
  }

  if (has("pinia")) {
    imports.push('import { createPinia } from "pinia";');
    uses.push("app.use(createPinia());");
  }

  if (has("services")) {
    imports.push('import { VueQueryPlugin } from "@tanstack/vue-query";');
    uses.push("app.use(VueQueryPlugin);");
  }

  if (authPreset !== "none" && has("router")) {
    imports.push('import { registerGuards } from "./router/guards";');
  }

  const lines: string[] = [];
  lines.push(...imports);
  lines.push("");
  lines.push('import "./assets/index.css";');
  lines.push("");

  lines.push('const app = createApp(App);');
  lines.push("");

  for (const use of uses) {
    lines.push(use);
  }

  if (uses.length > 0) {
    lines.push("");
  }

  if (authPreset !== "none" && has("router")) {
    lines.push("registerGuards(router);");
    lines.push("");
  }

  lines.push('app.mount("#app");');
  lines.push("");

  return lines.join("\n");
}
