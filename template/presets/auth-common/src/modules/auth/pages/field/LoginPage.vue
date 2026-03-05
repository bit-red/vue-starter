<script setup lang="ts">
import { useRouter } from "vue-router";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";
import { useLogin } from "@/services/auth";
import { useApiFieldErrors } from "@/composables/use-api-field-errors";
import { useErrorHandler } from "@/composables/use-error-handler";
import { useAuthRoutes } from "../composables/use-auth-routes";
import { Button } from "@/components/ui/button";
import { AppField } from "@/components/shared/app-field";
import { AuthPageLayout } from "../components/auth-page-layout";

const router = useRouter();
const { hasRoute } = useAuthRoutes();
const { mutateAsync } = useLogin();

const schema = {
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
};

const { clearErrors } = useApiFieldErrors();
const { handleError } = useErrorHandler();

const form = useForm({
  defaultValues: { email: "", password: "" },
  onSubmit: async ({ value }) => {
    clearErrors();
    try {
      await mutateAsync(value);
      router.push({ name: "dashboard" });
    } catch (error) {
      handleError(error);
    }
  },
});

const isSubmitting = form.useStore((s) => s.isSubmitting);
</script>

<template>
  <AuthPageLayout title="Welcome back" subtitle="Sign in to your account">
    <form class="flex flex-col gap-6" @submit.prevent="form.handleSubmit">
      <div class="flex flex-col gap-3">
        <AppField
          :form="form"
          name="email"
          :schema="schema.email"
          label="Email"
          type="email"
          placeholder="you@example.com"
        />

        <AppField
          :form="form"
          name="password"
          :schema="schema.password"
          label="Password"
          type="password"
          placeholder="********"
        />
      </div>

      <div v-if="hasRoute('auth.forgot-password')" class="text-right">
        <RouterLink
          :to="{ name: 'auth.forgot-password' }"
          class="text-sm underline-offset-2 hover:underline"
        >
          Forgot password?
        </RouterLink>
      </div>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? "Signing in..." : "Sign in" }}
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
