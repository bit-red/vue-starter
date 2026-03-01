import { describe, it, expect } from "vitest";
import type { ProjectOptions } from "../src/types.js";
import { generateMainTs } from "../src/generators/main-ts.js";
import { generateAppVue } from "../src/generators/app-vue.js";
import { generateViteConfig } from "../src/generators/vite-config.js";

function makeOptions(
  overrides: Partial<ProjectOptions> = {},
): ProjectOptions {
  return {
    projectName: "test-project",
    packageName: "test-project",
    features: [],
    authPreset: "none",
    ...overrides,
  };
}

describe("generateMainTs", () => {
  it("generates bare main.ts with no features", () => {
    const result = generateMainTs(makeOptions());
    expect(result).toContain('import { createApp } from "vue"');
    expect(result).toContain('import App from "./App.vue"');
    expect(result).toContain('app.mount("#app")');
    expect(result).not.toContain("router");
    expect(result).not.toContain("pinia");
    expect(result).not.toContain("VueQueryPlugin");
  });

  it("includes router when selected", () => {
    const result = generateMainTs(makeOptions({ features: ["router"] }));
    expect(result).toContain('import { router } from "./router"');
    expect(result).toContain("app.use(router)");
  });

  it("includes pinia when selected", () => {
    const result = generateMainTs(makeOptions({ features: ["pinia"] }));
    expect(result).toContain('import { createPinia } from "pinia"');
    expect(result).toContain("app.use(createPinia())");
  });

  it("includes VueQueryPlugin when services selected", () => {
    const result = generateMainTs(makeOptions({ features: ["services"] }));
    expect(result).toContain(
      'import { VueQueryPlugin } from "@tanstack/vue-query"',
    );
    expect(result).toContain("app.use(VueQueryPlugin)");
  });

  it("always includes CSS import", () => {
    const bare = generateMainTs(makeOptions());
    expect(bare).toContain('import "./assets/index.css"');

    const withUi = generateMainTs(makeOptions({ features: ["ui"] }));
    expect(withUi).toContain('import "./assets/index.css"');
  });

  it("registers guards when auth preset with router", () => {
    const result = generateMainTs(
      makeOptions({
        features: ["router", "pinia", "services"],
        authPreset: "sanctum",
      }),
    );
    expect(result).toContain(
      'import { registerGuards } from "./router/guards"',
    );
    expect(result).toContain("registerGuards(router)");
  });

  it("does not register guards without auth", () => {
    const result = generateMainTs(makeOptions({ features: ["router"] }));
    expect(result).not.toContain("registerGuards");
  });

  it("includes all features together", () => {
    const result = generateMainTs(
      makeOptions({
        features: ["router", "pinia", "ui", "services", "forms", "eslint"],
      }),
    );
    expect(result).toContain("router");
    expect(result).toContain("createPinia");
    expect(result).toContain("VueQueryPlugin");
    expect(result).toContain("index.css");
  });
});

describe("generateAppVue", () => {
  it("generates layout system when router selected", () => {
    const result = generateAppVue(makeOptions({ features: ["router"] }));
    expect(result).toContain("useRoute");
    expect(result).toContain("RouterView");
    expect(result).toContain("defineAsyncComponent");
    expect(result).toContain("GuestLayout.vue");
    expect(result).toContain("AuthLayout.vue");
    expect(result).toContain("currentLayout");
  });

  it("generates simple placeholder without router", () => {
    const result = generateAppVue(makeOptions());
    expect(result).not.toContain("RouterView");
    expect(result).not.toContain("useRoute");
    expect(result).toContain("You're all set.");
  });
});

describe("generateViteConfig", () => {
  it("always includes vue plugin", () => {
    const result = generateViteConfig(makeOptions());
    expect(result).toContain('import vue from "@vitejs/plugin-vue"');
    expect(result).toContain("vue()");
  });

  it("always includes @ alias", () => {
    const result = generateViteConfig(makeOptions());
    expect(result).toContain('"@"');
    expect(result).toContain("./src");
  });

  it("includes tailwind plugin when ui selected", () => {
    const result = generateViteConfig(makeOptions({ features: ["ui"] }));
    expect(result).toContain('import tailwindcss from "@tailwindcss/vite"');
    expect(result).toContain("tailwindcss()");
  });

  it("does not include tailwind without ui", () => {
    const result = generateViteConfig(makeOptions({ features: ["router"] }));
    expect(result).not.toContain("tailwindcss");
  });
});
