import type { AuthPage } from "../types.js";

export function generateAuthRouter(authPages: AuthPage[]): string {
  const lines: string[] = [];
  lines.push('import type { RouteRecordRaw } from "vue-router";');
  lines.push("");
  lines.push("export const authRoutes: RouteRecordRaw = {");
  lines.push('  path: "/auth",');
  lines.push('  meta: { layout: "guest", requiresGuest: true },');
  lines.push("  children: [");

  // Login is always included
  lines.push("    {");
  lines.push('      path: "login",');
  lines.push('      name: "auth.login",');
  lines.push('      component: () => import("./pages/LoginPage.vue"),');
  lines.push("    },");

  if (authPages.includes("register")) {
    lines.push("    {");
    lines.push('      path: "register",');
    lines.push('      name: "auth.register",');
    lines.push('      component: () => import("./pages/RegisterPage.vue"),');
    lines.push("    },");
  }

  if (authPages.includes("forgot-password")) {
    lines.push("    {");
    lines.push('      path: "forgot-password",');
    lines.push('      name: "auth.forgot-password",');
    lines.push(
      '      component: () => import("./pages/ForgotPasswordPage.vue"),',
    );
    lines.push("    },");
  }

  if (authPages.includes("reset-password")) {
    lines.push("    {");
    lines.push('      path: "reset-password/:token",');
    lines.push('      name: "auth.reset-password",');
    lines.push(
      '      component: () => import("./pages/ResetPasswordPage.vue"),',
    );
    lines.push("    },");
  }

  if (authPages.includes("email-verification")) {
    lines.push("    {");
    lines.push('      path: "verify-email",');
    lines.push('      name: "auth.verify-email",');
    lines.push(
      '      component: () => import("./pages/EmailVerificationPage.vue"),',
    );
    lines.push("    },");
  }

  lines.push("  ],");
  lines.push("};");
  lines.push("");

  return lines.join("\n");
}
