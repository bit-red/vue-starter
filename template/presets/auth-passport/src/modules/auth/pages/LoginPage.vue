<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLogin } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const { mutateAsync, isPending } = useLogin();

const email = ref("");
const password = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await mutateAsync({ email: email.value, password: password.value });
    router.push({ name: "dashboard" });
  } catch (e: any) {
    error.value = e.response?.data?.message || "Login failed.";
  }
}
</script>

<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="isPending">
        {{ isPending ? "Logging in..." : "Login" }}
      </button>
    </form>
    <p>
      <RouterLink :to="{ name: 'auth.register' }">Create an account</RouterLink>
    </p>
    <p>
      <RouterLink :to="{ name: 'auth.forgot-password' }">Forgot password?</RouterLink>
    </p>
  </div>
</template>
