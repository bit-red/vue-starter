<script setup lang="ts">
import { useTheme } from "@/composables/use-theme";

const { isDark, toggle } = useTheme();
</script>

<template>
  <div class="relative flex min-h-svh items-center justify-center">
    <button
      class="absolute right-5 top-5 flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Toggle color mode"
      @click="toggle"
    >
      <svg
        v-if="isDark"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>

    <div class="flex flex-col items-center gap-6 text-center">
      <svg width="60" height="61" viewBox="0 0 85 86" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M72.2965 0H12.6697C5.6724 0 0 5.67705 0 12.68V72.3557C0 79.3587 5.6724 85.0358 12.6697 85.0358H72.2965C79.2937 85.0358 84.9661 79.3587 84.9661 72.3557V12.68C84.9661 5.67705 79.2937 0 72.2965 0Z" :fill="isDark ? '#F3F5F9' : '#1A1A1A'"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M55.8751 42.517C56.4854 43.6676 56.9665 44.8838 57.3061 46.1406C57.7058 47.6205 57.9075 49.1482 57.9075 50.6812C57.9075 55.3369 56.0538 59.7624 52.7674 63.0515C49.4811 66.3405 45.0592 68.1957 40.4073 68.1957H36.3975C33.9124 68.1957 31.5511 67.2133 29.793 65.4537C28.0366 63.6959 27.0567 61.3308 27.0567 58.8437C27.0567 56.3565 28.0366 53.9933 29.793 52.2355C31.5493 50.4759 33.9106 49.4934 36.3975 49.4934H40.4073C43.0551 49.4934 45.6375 48.8013 47.9298 47.4754C50.0294 46.261 51.8176 44.5545 53.13 42.517C51.8176 40.4795 50.0294 38.773 47.9298 37.5586C45.6375 36.2327 43.0551 35.5406 40.4073 35.5406H36.3975C33.9124 35.5406 31.5511 34.5581 29.793 32.7985C28.0366 31.0407 27.0567 28.6757 27.0567 26.1903C27.0567 23.7032 28.0366 21.3399 29.793 19.5803C31.5493 17.8207 33.9106 16.8383 36.3975 16.8383H40.4073C45.0592 16.8383 49.4811 18.6935 52.7674 21.9825C56.0538 25.2716 57.9075 29.6971 57.9075 34.3527C57.9075 35.8858 57.7058 37.4135 57.3061 38.8934C56.9665 40.1502 56.4854 41.3664 55.8751 42.5152V42.517ZM54.3717 44.8749C52.9496 46.7567 51.1596 48.3446 49.1167 49.5271C46.4636 51.0618 43.4726 51.8673 40.4073 51.8673H36.3975C34.5438 51.8673 32.7822 52.5948 31.4697 53.9066C30.1573 55.2201 29.4286 56.985 29.4286 58.8419C29.4286 60.6989 30.1573 62.4638 31.4697 63.7773C32.7804 65.089 34.5421 65.8165 36.3975 65.8165H40.4073C44.4295 65.8165 48.2482 64.2127 51.0889 61.368C53.9295 58.525 55.5338 54.7014 55.5338 50.6777C55.5338 49.3518 55.3622 48.033 55.0155 46.7531C54.8422 46.1123 54.6264 45.4839 54.3717 44.8732V44.8749ZM54.3717 40.1591C54.6282 39.5483 54.844 38.9199 55.0155 38.2791C55.3604 36.9993 55.5338 35.6804 55.5338 34.3545C55.5338 30.3291 53.9313 26.5072 51.0889 23.6642C48.2482 20.8195 44.4295 19.2156 40.4073 19.2156H36.3975C34.5438 19.2156 32.7822 19.9432 31.4697 21.2549C30.1573 22.5684 29.4286 24.3334 29.4286 26.1903C29.4286 28.0473 30.1573 29.8122 31.4697 31.1257C32.7804 32.4391 34.5421 33.1649 36.3975 33.1649H40.4073C43.4726 33.1649 46.4636 33.9704 49.1167 35.5052C51.1614 36.6877 52.9514 38.2756 54.3717 40.1573V40.1591Z" fill="#C72429"/>
      </svg>

      <div class="flex flex-col items-center gap-1">
        <h1 class="text-3xl font-bold tracking-tight">
          You're all set.
        </h1>
        <p class="text-muted-foreground">
          Edit <code class="rounded bg-muted px-1.5 py-0.5 text-sm font-medium">src/pages/HomePage.vue</code> to get started.
        </p>
      </div>

      <div class="flex items-center gap-3 text-sm">
        <a
          href="https://vuejs.org"
          target="_blank"
          rel="noopener"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          Vue
        </a>
        <span class="text-border">&middot;</span>
        <a
          href="https://vite.dev"
          target="_blank"
          rel="noopener"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          Vite
        </a>
        <span class="text-border">&middot;</span>
        <a
          href="https://www.shadcn-vue.com"
          target="_blank"
          rel="noopener"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          shadcn-vue
        </a>
      </div>
    </div>
  </div>
</template>
