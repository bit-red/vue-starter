<script setup lang="ts">
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">Page not found</h1>
      <p class="not-found-description">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <RouterLink to="/" class="not-found-link">Go back home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.not-found-code {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--color-border);
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.not-found-description {
  color: var(--color-muted);
}

.not-found-link {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary-fg);
  background-color: var(--color-primary);
  border-radius: 0.375rem;
  transition: opacity 0.15s;
}

.not-found-link:hover {
  opacity: 0.9;
  text-decoration: none;
}
</style>
