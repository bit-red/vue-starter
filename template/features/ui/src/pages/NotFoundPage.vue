<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-svh items-center justify-center">
    <div class="flex flex-col items-center gap-3 text-center">
      <p class="text-8xl font-extrabold leading-none tracking-tighter text-border">
        404
      </p>
      <h1 class="text-2xl font-bold">Page not found</h1>
      <p class="text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <RouterLink
        to="/"
        class="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go back home
      </RouterLink>
    </div>
  </div>
</template>
