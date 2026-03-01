import type { RouteRecordRaw } from "vue-router";
import { authRoutes } from "@/modules/auth/router";

const protectedRoutes: RouteRecordRaw = {
  path: "/",
  meta: { layout: "auth", requiresAuth: true },
  children: [
    {
      path: "",
      name: "home",
      redirect: { name: "dashboard" },
    },
    {
      path: "dashboard",
      name: "dashboard",
      component: () => import("@/pages/DashboardPage.vue"),
    },
  ],
};

export const routes: RouteRecordRaw[] = [
  authRoutes,
  protectedRoutes,
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/pages/NotFoundPage.vue"),
  },
];
