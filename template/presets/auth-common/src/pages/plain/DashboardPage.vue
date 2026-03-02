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
  <div class="dashboard">
    <header class="dashboard-header">
      <h1 class="dashboard-title">Dashboard</h1>
      <button class="dashboard-logout" :disabled="isPending" @click="handleLogout">
        {{ isPending ? "Logging out..." : "Logout" }}
      </button>
    </header>

    <div class="dashboard-content">
      <div class="dashboard-card">
        <p class="dashboard-greeting">Welcome back, {{ authStore.user?.name ?? "User" }}.</p>
        <p class="dashboard-hint">This is your dashboard. Start building from here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 64rem;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.dashboard-logout {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s;
}

.dashboard-logout:hover:not(:disabled) {
  background: var(--color-border, #e5e5e5);
}

.dashboard-logout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-card {
  padding: 1.5rem;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 0.5rem;
}

.dashboard-greeting {
  font-size: 1.125rem;
  font-weight: 600;
}

.dashboard-hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted, #737373);
}
</style>
