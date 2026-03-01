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
  <div>
    <h1>Register</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Name</label>
        <input id="name" v-model="name" type="text" required />
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <div>
        <label for="password_confirmation">Confirm Password</label>
        <input id="password_confirmation" v-model="passwordConfirmation" type="password" required />
      </div>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="isPending">
        {{ isPending ? "Creating account..." : "Register" }}
      </button>
    </form>
    <p>
      <RouterLink :to="{ name: 'auth.login' }">Already have an account?</RouterLink>
    </p>
  </div>
</template>
