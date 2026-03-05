import { describe, it, expect } from "vitest";
import type { ProjectOptions } from "../src/types.js";
import { generateMainTs } from "../src/generators/main-ts.js";
import { generateAppVue } from "../src/generators/app-vue.js";
import { generateViteConfig } from "../src/generators/vite-config.js";
import { generateAuthRouter } from "../src/generators/auth-router.js";
import {
  generateAuthServices,
  generateAuthMutationsIndex,
  generateAuthMainIndex,
} from "../src/generators/auth-indexes.js";
import { generateClaudeMd } from "../src/generators/claude-md.js";

function makeOptions(
  overrides: Partial<ProjectOptions> = {},
): ProjectOptions {
  return {
    projectName: "test-project",
    packageName: "test-project",
    features: [],
    authPreset: "none",
    authPages: [],
    sharedComponents: [],
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

describe("generateAuthRouter", () => {
  it("always includes login route", () => {
    const result = generateAuthRouter([]);
    expect(result).toContain('"auth.login"');
    expect(result).toContain("LoginPage.vue");
  });

  it("includes register route when selected", () => {
    const result = generateAuthRouter(["register"]);
    expect(result).toContain('"auth.register"');
    expect(result).toContain("RegisterPage.vue");
  });

  it("includes forgot-password route when selected", () => {
    const result = generateAuthRouter(["forgot-password"]);
    expect(result).toContain('"auth.forgot-password"');
    expect(result).toContain("ForgotPasswordPage.vue");
  });

  it("includes reset-password route with token param", () => {
    const result = generateAuthRouter(["reset-password"]);
    expect(result).toContain('"reset-password/:token"');
    expect(result).toContain('"auth.reset-password"');
    expect(result).toContain("ResetPasswordPage.vue");
  });

  it("includes email-verification route when selected", () => {
    const result = generateAuthRouter(["email-verification"]);
    expect(result).toContain('"verify-email"');
    expect(result).toContain('"auth.verify-email"');
    expect(result).toContain("EmailVerificationPage.vue");
  });

  it("excludes unselected routes", () => {
    const result = generateAuthRouter(["register"]);
    expect(result).not.toContain("ForgotPasswordPage");
    expect(result).not.toContain("ResetPasswordPage");
    expect(result).not.toContain("EmailVerificationPage");
  });

  it("includes all routes when all pages selected", () => {
    const result = generateAuthRouter([
      "register",
      "forgot-password",
      "reset-password",
      "email-verification",
    ]);
    expect(result).toContain("LoginPage.vue");
    expect(result).toContain("RegisterPage.vue");
    expect(result).toContain("ForgotPasswordPage.vue");
    expect(result).toContain("ResetPasswordPage.vue");
    expect(result).toContain("EmailVerificationPage.vue");
  });
});

describe("generateAuthServices", () => {
  it("always includes getUser, login, logout for sanctum", () => {
    const result = generateAuthServices([], "sanctum");
    expect(result).toContain("export async function getUser()");
    expect(result).toContain("export async function login(");
    expect(result).toContain("export async function logout()");
  });

  it("generates sanctum login with CSRF cookie", () => {
    const result = generateAuthServices([], "sanctum");
    expect(result).toContain("sanctum/csrf-cookie");
    expect(result).toContain("withCredentials");
    expect(result).not.toContain("oauth/token");
  });

  it("generates passport login with OAuth token", () => {
    const result = generateAuthServices([], "passport");
    expect(result).toContain("oauth/token");
    expect(result).toContain("grant_type");
    expect(result).toContain("VITE_PASSPORT_CLIENT_ID");
    expect(result).not.toContain("csrf-cookie");
  });

  it("includes register when selected", () => {
    const result = generateAuthServices(["register"], "sanctum");
    expect(result).toContain("export async function register(");
    expect(result).toContain("RegisterPayload");
  });

  it("includes forgotPassword when selected", () => {
    const result = generateAuthServices(["forgot-password"], "sanctum");
    expect(result).toContain("export async function forgotPassword(");
  });

  it("includes resetPassword when selected", () => {
    const result = generateAuthServices(["reset-password"], "sanctum");
    expect(result).toContain("export async function resetPassword(");
  });

  it("includes sendEmailVerification when selected", () => {
    const result = generateAuthServices(["email-verification"], "sanctum");
    expect(result).toContain("export async function sendEmailVerification()");
  });

  it("includes refreshToken for passport", () => {
    const result = generateAuthServices([], "passport");
    expect(result).toContain("export async function refreshToken()");
    expect(result).toContain("TokenResponse");
  });

  it("does not include refreshToken for sanctum", () => {
    const result = generateAuthServices([], "sanctum");
    expect(result).not.toContain("refreshToken");
    expect(result).not.toContain("TokenResponse");
  });

  it("excludes unselected services", () => {
    const result = generateAuthServices([], "sanctum");
    expect(result).not.toContain("register(");
    expect(result).not.toContain("forgotPassword(");
    expect(result).not.toContain("resetPassword(");
    expect(result).not.toContain("sendEmailVerification()");
  });

  it("imports all required types", () => {
    const result = generateAuthServices(
      ["register", "forgot-password", "reset-password"],
      "passport",
    );
    expect(result).toContain("User");
    expect(result).toContain("LoginPayload");
    expect(result).toContain("RegisterPayload");
    expect(result).toContain("ForgotPasswordPayload");
    expect(result).toContain("ResetPasswordPayload");
    expect(result).toContain("TokenResponse");
  });
});

describe("generateAuthMutationsIndex", () => {
  it("always exports useLogin, useLogout", () => {
    const result = generateAuthMutationsIndex([]);
    expect(result).toContain('export { useLogin }');
    expect(result).toContain('export { useLogout }');
  });

  it("exports useRegister when selected", () => {
    const result = generateAuthMutationsIndex(["register"]);
    expect(result).toContain('export { useRegister }');
  });

  it("exports useForgotPassword when selected", () => {
    const result = generateAuthMutationsIndex(["forgot-password"]);
    expect(result).toContain('export { useForgotPassword }');
  });

  it("exports useResetPassword when selected", () => {
    const result = generateAuthMutationsIndex(["reset-password"]);
    expect(result).toContain('export { useResetPassword }');
  });

  it("exports useSendEmailVerification when selected", () => {
    const result = generateAuthMutationsIndex(["email-verification"]);
    expect(result).toContain('export { useSendEmailVerification }');
  });

  it("excludes unselected mutations", () => {
    const result = generateAuthMutationsIndex([]);
    expect(result).not.toContain("useRegister");
    expect(result).not.toContain("useForgotPassword");
    expect(result).not.toContain("useResetPassword");
    expect(result).not.toContain("useSendEmailVerification");
  });
});

describe("generateAuthMainIndex", () => {
  it("always exports authKeys, User, LoginPayload, useUser, useLogin, useLogout", () => {
    const result = generateAuthMainIndex([], "sanctum");
    expect(result).toContain('export { authKeys }');
    expect(result).toContain("User");
    expect(result).toContain("LoginPayload");
    expect(result).toContain('export { useUser }');
    expect(result).toContain("useLogin");
    expect(result).toContain("useLogout");
  });

  it("includes RegisterPayload when register selected", () => {
    const result = generateAuthMainIndex(["register"], "sanctum");
    expect(result).toContain("RegisterPayload");
    expect(result).toContain("useRegister");
  });

  it("includes ForgotPasswordPayload when forgot-password selected", () => {
    const result = generateAuthMainIndex(["forgot-password"], "sanctum");
    expect(result).toContain("ForgotPasswordPayload");
    expect(result).toContain("useForgotPassword");
  });

  it("includes TokenResponse for passport", () => {
    const result = generateAuthMainIndex([], "passport");
    expect(result).toContain("TokenResponse");
  });

  it("does not include TokenResponse for sanctum", () => {
    const result = generateAuthMainIndex([], "sanctum");
    expect(result).not.toContain("TokenResponse");
  });
});

describe("generateClaudeMd", () => {
  it("generates base CLAUDE.md without forms or shared components", () => {
    const result = generateClaudeMd(makeOptions());
    expect(result).toContain("# CLAUDE.md");
    expect(result).toContain("create-bitred-vue");
    expect(result).not.toContain("TanStack Form");
    expect(result).not.toContain("Shared Components");
  });

  it("includes TanStack Form section when forms feature enabled", () => {
    const result = generateClaudeMd(makeOptions({ features: ["forms"] }));
    expect(result).toContain("## TanStack Form");
    expect(result).toContain("No adapter");
    expect(result).toContain("useForm");
  });

  it("includes shared components section when components selected", () => {
    const result = generateClaudeMd(
      makeOptions({
        features: ["ui"],
        sharedComponents: ["app-form-input"],
      }),
    );
    expect(result).toContain("## Shared Components");
    expect(result).toContain("### AppFormInput");
    expect(result).toContain("mask presets");
  });

  it("includes AppField patterns when app-field selected", () => {
    const result = generateClaudeMd(
      makeOptions({
        features: ["ui", "forms"],
        sharedComponents: ["app-form-input", "app-field"],
      }),
    );
    expect(result).toContain("### AppField");
    expect(result).toContain("useApiFieldErrors");
    expect(result).toContain("Always use AppField");
  });

  it("includes AppFieldPhone when both app-field and app-phone-input selected", () => {
    const result = generateClaudeMd(
      makeOptions({
        features: ["ui", "forms"],
        sharedComponents: ["app-form-input", "app-phone-input", "app-field"],
      }),
    );
    expect(result).toContain("### AppFieldPhone");
  });

  it("does not include AppFieldPhone when app-phone-input not selected", () => {
    const result = generateClaudeMd(
      makeOptions({
        features: ["ui", "forms"],
        sharedComponents: ["app-form-input", "app-field"],
      }),
    );
    expect(result).not.toContain("### AppFieldPhone");
  });

  it("includes useApiFieldErrors in form setup when app-field selected", () => {
    const result = generateClaudeMd(
      makeOptions({
        features: ["ui", "forms"],
        sharedComponents: ["app-form-input", "app-field"],
      }),
    );
    expect(result).toContain('import { useApiFieldErrors }');
    expect(result).toContain('import { useErrorHandler }');
  });
});
