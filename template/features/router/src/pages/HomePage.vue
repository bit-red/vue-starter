<script setup lang="ts">
</script>

<template>
  <div class="home">
    <div class="home-content">
      <p class="home-badge">bitred starter</p>
      <h1 class="home-title">You're all set.</h1>
      <p class="home-description">
        Edit <code>src/pages/HomePage.vue</code> to get started.
      </p>
      <div class="home-links">
        <a href="https://vuejs.org" target="_blank" rel="noopener">Vue Docs</a>
        <span class="home-separator">&middot;</span>
        <a href="https://vite.dev" target="_blank" rel="noopener">Vite Docs</a>
      </div>
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

.home-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.home-separator {
  color: var(--color-border);
}
</style>
