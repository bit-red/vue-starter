import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw = {
  path: "/auth",
  meta: { layout: "guest", requiresGuest: true },
  children: [
    {
      path: "login",
      name: "auth.login",
      component: () => import("./pages/LoginPage.vue"),
    },
    {
      path: "register",
      name: "auth.register",
      component: () => import("./pages/RegisterPage.vue"),
    },
    {
      path: "forgot-password",
      name: "auth.forgot-password",
      component: () => import("./pages/ForgotPasswordPage.vue"),
    },
  ],
};
