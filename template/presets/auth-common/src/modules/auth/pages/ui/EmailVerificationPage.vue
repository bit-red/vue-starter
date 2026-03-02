<script setup lang="ts">
import { ref } from "vue";
import { useSendEmailVerification } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthPageLayout from "../components/AuthPageLayout.vue";

const { mutateAsync, isPending } = useSendEmailVerification();

const success = ref(false);
const error = ref("");

async function handleResend() {
  error.value = "";
  try {
    await mutateAsync();
    success.value = true;
  } catch (e: any) {
    error.value = e.response?.data?.message || "Failed to send verification email.";
  }
}
</script>

<template>
  <AuthPageLayout title="Verify your email" subtitle="Check your inbox for the verification link we sent you.">
    <Alert v-if="success">
      <AlertDescription>A new verification link has been sent to your email.</AlertDescription>
    </Alert>

    <Alert v-if="error" variant="destructive">
      <AlertDescription>{{ error }}</AlertDescription>
    </Alert>

    <Button class="w-full" :disabled="isPending" @click="handleResend">
      {{ isPending ? "Sending..." : "Resend verification email" }}
    </Button>

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
