import type { ProjectOptions } from "../types.js";

export function generateAppVue(options: ProjectOptions): string {
  const has = (f: string) => options.features.includes(f as never);

  if (has("router")) {
    return `<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useRoute, RouterView } from "vue-router";

const layouts: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  guest: defineAsyncComponent(
    () => import("@/components/layouts/GuestLayout.vue"),
  ),
  auth: defineAsyncComponent(
    () => import("@/components/layouts/AuthLayout.vue"),
  ),
};

const route = useRoute();
const currentLayout = computed(() => {
  const name = route.matched.find((r) => r.meta.layout)?.meta.layout as
    | string
    | undefined;
  if (!name || name === "none") return null;
  return layouts[name] ?? null;
});
</script>

<template>
  <component :is="currentLayout" v-if="currentLayout">
    <RouterView />
  </component>
  <RouterView v-else />
</template>
`;
  }

  if (has("ui")) {
    return `<script setup lang="ts">
import { useColorMode } from "@/composables/use-color-mode";

const { mode, toggle } = useColorMode();
</script>

<template>
  <div class="relative flex min-h-svh items-center justify-center">
    <button
      class="absolute right-4 top-4 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
      @click="toggle"
    >
      {{ mode === "dark" ? "Light" : "Dark" }}
    </button>

    <div class="flex flex-col items-center gap-4 text-center">
      <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        bitred starter
      </p>
      <h1 class="text-4xl font-bold tracking-tight">
        You're all set.
      </h1>
      <p class="text-lg text-muted-foreground">
        Edit <code class="rounded bg-muted px-1.5 py-0.5 text-sm font-medium">src/App.vue</code> to get started.
      </p>
    </div>
  </div>
</template>
`;
  }

  return `<script setup lang="ts">
</script>

<template>
  <div class="home">
    <div class="home-content">
      <p class="home-badge">bitred starter</p>
      <h1 class="home-title">You're all set.</h1>
      <p class="home-description">
        Edit <code>src/App.vue</code> to get started.
      </p>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.home-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.home-badge {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-muted);
}

.home-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.home-description {
  color: var(--color-muted);
  font-size: 1.125rem;
}
</style>
`;
}
