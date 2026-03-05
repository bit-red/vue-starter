<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";
import { useResetPassword } from "@/services/auth";
import { useApiFieldErrors } from "@/composables/use-api-field-errors";
import { useErrorHandler } from "@/composables/use-error-handler";
import { Button } from "@/components/ui/button";
import { AppField } from "@/components/shared/app-field";
import { AuthPageLayout } from "../components/auth-page-layout";

const route = useRoute();
const router = useRouter();
const { mutateAsync } = useResetPassword();

const schema = {
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  password_confirmation: z.string().min(1, "Please confirm your password"),
};

const { clearErrors } = useApiFieldErrors();
const { handleError } = useErrorHandler();

const form = useForm({
  defaultValues: {
    email: (route.query.email as string) || "",
    password: "",
    password_confirmation: "",
  },
  onSubmit: async ({ value }) => {
    clearErrors();
    try {
      await mutateAsync({
        token: route.params.token as string,
        ...value,
      });
      router.push({ name: "auth.login" });
    } catch (error) {
      handleError(error);
    }
  },
});

const isSubmitting = form.useStore((s) => s.isSubmitting);
</script>

<template>
  <AuthPageLayout title="Set new password" subtitle="Enter your new password below">
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
          label="New password"
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
        {{ isSubmitting ? "Resetting..." : "Reset password" }}
      </Button>

      <p class="text-center text-sm text-muted-foreground">
        <RouterLink
          :to="{ name: 'auth.login' }"
          class="underline underline-offset-2 hover:text-foreground"
        >
          Back to sign in
        </RouterLink>
      </p>
    </form>
  </AuthPageLayout>
</template>
