import type { Router } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export function registerGuards(router: Router) {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return { name: "auth.login", query: { redirect: to.fullPath } };
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      return { name: "dashboard" };
    }
  });
}
