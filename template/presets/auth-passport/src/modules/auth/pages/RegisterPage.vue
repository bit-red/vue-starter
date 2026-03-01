<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRegister } from "@/services/auth";

const router = useRouter();
const { mutateAsync, isPending } = useRegister();

const name = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await mutateAsync({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    router.push({ name: "dashboard" });
  } catch (e: any) {
    error.value = e.response?.data?.message || "Registration failed.";
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Create an account</h1>
        <p class="auth-subtitle">Fill in the details to get started</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label class="form-label" for="name">Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="form-input"
            placeholder="John Doe"
            required
          />
        </div>

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

        <div class="form-field">
          <label class="form-label" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="********"
            required
          />
        </div>

        <div class="form-field">
          <label class="form-label" for="password_confirmation">Confirm password</label>
          <input
            id="password_confirmation"
            v-model="passwordConfirmation"
            type="password"
            class="form-input"
            placeholder="********"
            required
          />
        </div>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button type="submit" class="form-button" :disabled="isPending">
          {{ isPending ? "Creating account..." : "Sign up" }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <RouterLink :to="{ name: 'auth.login' }" class="form-link">Sign in</RouterLink>
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
