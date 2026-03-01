<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/services/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const { mutateAsync: doLogout, isPending } = useLogout();

async function handleLogout() {
  await doLogout();
  authStore.clear();
  router.push({ name: "auth.login" });
}
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p>Welcome, {{ authStore.user?.name ?? "User" }}!</p>
    <button :disabled="isPending" @click="handleLogout">
      {{ isPending ? "Logging out..." : "Logout" }}
    </button>
  </div>
</template>
