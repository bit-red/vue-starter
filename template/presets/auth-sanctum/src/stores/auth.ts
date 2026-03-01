import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/services/auth/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.is_admin ?? false);

  function setUser(userData: User | null) {
    user.value = userData;
  }

  function clear() {
    user.value = null;
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    setUser,
    clear,
  };
});
