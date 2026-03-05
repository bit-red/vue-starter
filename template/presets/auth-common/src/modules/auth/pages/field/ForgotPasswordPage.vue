<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "@tanstack/vue-form";
import { z } from "zod";
import { useForgotPassword } from "@/services/auth";
import { useApiFieldErrors } from "@/composables/use-api-field-errors";
import { useErrorHandler } from "@/composables/use-error-handler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppField } from "@/components/shared/app-field";
import { AuthPageLayout } from "../components/auth-page-layout";

const { mutateAsync } = useForgotPassword();
const success = ref(false);

const schema = {
  email: z.string().min(1, "Email is required").email("Invalid email"),
};

const { clearErrors } = useApiFieldErrors();
const { handleError } = useErrorHandler();

const form = useForm({
  defaultValues: { email: "" },
  onSubmit: async ({ value }) => {
    clearErrors();
    try {
      await mutateAsync(value);
      success.value = true;
    } catch (error) {
      handleError(error);
    }
  },
});

const isSubmitting = form.useStore((s) => s.isSubmitting);
</script>

<template>
  <AuthPageLayout title="Reset password" subtitle="We'll send a reset link to your email">
    <div v-if="success" class="flex flex-col items-center gap-4">
      <Alert>
        <AlertDescription>Check your inbox for the reset link.</AlertDescription>
      </Alert>
      <RouterLink :to="{ name: 'auth.login' }" class="w-full">
        <Button variant="outline" class="w-full">Back to sign in</Button>
      </RouterLink>
    </div>

    <form v-else class="flex flex-col gap-6" @submit.prevent="form.handleSubmit">
      <AppField
        :form="form"
        name="email"
        :schema="schema.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? "Sending..." : "Send reset link" }}
      </Button>
    </form>

    <p class="text-center text-sm text-muted-foreground">
      <RouterLink
        :to="{ name: 'auth.login' }"
        class="underline underline-offset-2 hover:text-foreground"
      >
        Back to sign in
      </RouterLink>
    </p>
  </AuthPageLayout>
</template>
