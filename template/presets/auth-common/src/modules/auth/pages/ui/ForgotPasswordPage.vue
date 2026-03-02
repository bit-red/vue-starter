<script setup lang="ts">
import { ref } from "vue";
import { useForgotPassword } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthPageLayout from "../components/AuthPageLayout.vue";

const { mutateAsync, isPending } = useForgotPassword();

const email = ref("");
const success = ref(false);
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await mutateAsync({ email: email.value });
    success.value = true;
  } catch (e: any) {
    error.value = e.response?.data?.message || "Failed to send reset link.";
  }
}
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

    <form v-else class="flex flex-col gap-6" @submit.prevent="handleSubmit">
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
      </FieldGroup>

      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? "Sending..." : "Send reset link" }}
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
