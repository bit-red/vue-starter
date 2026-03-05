<script setup lang="ts">
import { useRouter } from "vue-router";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";
import { useRegister } from "@/services/auth";
import { useApiFieldErrors } from "@/composables/use-api-field-errors";
import { useErrorHandler } from "@/composables/use-error-handler";
import { Button } from "@/components/ui/button";
import { AppField } from "@/components/shared/app-field";
import { AuthPageLayout } from "../components/auth-page-layout";

const router = useRouter();
const { mutateAsync } = useRegister();

const schema = {
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(1, "Please confirm your password"),
};

const { clearErrors } = useApiFieldErrors();
const { handleError } = useErrorHandler();

const form = useForm({
  defaultValues: {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  },
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
  <AuthPageLayout title="Create an account" subtitle="Fill in the details to get started">
    <form class="flex flex-col gap-6" @submit.prevent="form.handleSubmit">
      <div class="flex flex-col gap-3">
        <AppField
          :form="form"
          name="name"
          :schema="schema.name"
          label="Name"
          placeholder="John Doe"
        />

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

        <AppField
          :form="form"
          name="password_confirmation"
          :schema="schema.password_confirmation"
          label="Confirm password"
          type="password"
          placeholder="********"
          :listeners="{
            onChange: ({ value, fieldApi }: any) => {
              const password = fieldApi.form.getFieldValue('password');
              if (value !== password) return 'Passwords do not match';
              return undefined;
            },
          }"
        />
      </div>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? "Creating account..." : "Sign up" }}
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        Already have an account?
        <RouterLink
          :to="{ name: 'auth.login' }"
          class="underline underline-offset-2 hover:text-foreground"
        >
          Sign in
        </RouterLink>
      </p>
    </form>
  </AuthPageLayout>
</template>
