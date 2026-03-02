<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLogin } from "@/services/auth";
import { useAuthRoutes } from "../composables/use-auth-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthPageLayout from "../components/AuthPageLayout.vue";

const router = useRouter();
const { hasRoute } = useAuthRoutes();
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
  <AuthPageLayout title="Welcome back" subtitle="Sign in to your account">
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <FieldGroup>
        <Field>
          <FieldLabel for="email">Email</FieldLabel>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field>
          <div class="flex items-center">
            <FieldLabel for="password">Password</FieldLabel>
            <RouterLink
              v-if="hasRoute('auth.forgot-password')"
              :to="{ name: 'auth.forgot-password' }"
              class="ml-auto text-sm underline-offset-2 hover:underline"
            >
              Forgot password?
            </RouterLink>
          </div>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="********"
            required
          />
        </Field>
      </FieldGroup>

      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? "Signing in..." : "Sign in" }}
      </Button>

      <p v-if="hasRoute('auth.register')" class="text-center text-sm text-muted-foreground">
        Don't have an account?
        <RouterLink
          :to="{ name: 'auth.register' }"
          class="underline underline-offset-2 hover:text-foreground"
        >
          Sign up
        </RouterLink>
      </p>
    </form>
  </AuthPageLayout>
</template>
