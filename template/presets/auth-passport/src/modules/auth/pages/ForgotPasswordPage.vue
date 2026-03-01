<script setup lang="ts">
import { ref } from "vue";
import { http } from "@/services/http";

const email = ref("");
const success = ref(false);
const error = ref("");
const isPending = ref(false);

async function handleSubmit() {
  error.value = "";
  isPending.value = true;
  try {
    await http.post("/forgot-password", { email: email.value });
    success.value = true;
  } catch (e: any) {
    error.value = e.response?.data?.message || "Failed to send reset link.";
  } finally {
    isPending.value = false;
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">We'll send a reset link to your email</p>
      </div>

      <div v-if="success" class="auth-success">
        <p class="auth-success-text">Check your inbox for the reset link.</p>
        <RouterLink :to="{ name: 'auth.login' }" class="form-button-outline">
          Back to sign in
        </RouterLink>
      </div>

      <form v-else class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="form-label" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="form-button" :disabled="isPending">
          {{ isPending ? "Sending..." : "Send reset link" }}
        </button>
      </form>

      <p class="auth-footer">
        <RouterLink :to="{ name: 'auth.login' }" class="form-link">Back to sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-header {
  text-align: center;
}

.auth-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.auth-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-muted, #737373);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-success {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.auth-success-text {
  font-size: 0.875rem;
  color: var(--color-muted, #737373);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus {
  border-color: var(--color-primary, #171717);
}

.form-error {
  font-size: 0.875rem;
  color: #dc2626;
}

.form-button {
  padding: 0.5rem 1rem;
  background: var(--color-primary, #171717);
  color: var(--color-primary-fg, #fff);
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.form-button:hover:not(:disabled) {
  opacity: 0.9;
}

.form-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-button-outline {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.15s;
}

.form-button-outline:hover {
  background: var(--color-border, #e5e5e5);
  text-decoration: none;
}

.form-link {
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-muted, #737373);
}
</style>
