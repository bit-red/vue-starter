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
  <div>
    <h1>Forgot Password</h1>
    <div v-if="success">
      <p>Password reset link sent to your email.</p>
      <RouterLink :to="{ name: 'auth.login' }">Back to login</RouterLink>
    </div>
    <form v-else @submit.prevent="handleSubmit">
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="isPending">
        {{ isPending ? "Sending..." : "Send Reset Link" }}
      </button>
    </form>
    <p>
      <RouterLink :to="{ name: 'auth.login' }">Back to login</RouterLink>
    </p>
  </div>
</template>
