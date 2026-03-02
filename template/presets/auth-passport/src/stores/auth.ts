import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import type { User } from "@/services/auth/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = useLocalStorage<string | null>("access_token", null);
  const refreshToken = useLocalStorage<string | null>("refresh_token", null);

  const isAuthenticated = computed(() => !!accessToken.value);
  const isAdmin = computed(() => user.value?.is_admin ?? false);

  function setUser(userData: User | null) {
    user.value = userData;
  }

  function setAccessToken(token: string | null) {
    accessToken.value = token;
  }

  function clear() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    setUser,
    setAccessToken,
    clear,
  };
});
