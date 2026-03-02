<script setup lang="ts">
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
        Edit <code class="rounded bg-muted px-1.5 py-0.5 text-sm font-medium">src/pages/HomePage.vue</code> to get started.
      </p>
      <div class="mt-2 flex items-center gap-3 text-sm">
        <a
          href="https://vuejs.org"
          target="_blank"
          rel="noopener"
          class="text-foreground underline-offset-4 hover:underline"
        >
          Vue Docs
        </a>
        <span class="text-border">&middot;</span>
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener"
          class="text-foreground underline-offset-4 hover:underline"
        >
          Vite Docs
        </a>
        <span class="text-border">&middot;</span>
        <a
          href="https://www.shadcn-vue.com"
          target="_blank"
          rel="noopener"
          class="text-foreground underline-offset-4 hover:underline"
        >
          shadcn-vue
        </a>
      </div>
    </div>
  </div>
</template>
