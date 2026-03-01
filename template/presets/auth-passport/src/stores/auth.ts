import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/services/auth/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("access_token"));

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.is_admin ?? false);

  function setUser(userData: User | null) {
    user.value = userData;
  }

  function setToken(accessToken: string | null) {
    token.value = accessToken;
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  function clear() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    setUser,
    setToken,
    clear,
  };
});
