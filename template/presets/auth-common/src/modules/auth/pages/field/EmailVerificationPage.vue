<script setup lang="ts">
import { ref } from "vue";
import { useSendEmailVerification } from "@/services/auth";
import { useErrorHandler } from "@/composables/use-error-handler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthPageLayout } from "../components/auth-page-layout";

const { mutateAsync, isPending } = useSendEmailVerification();
const { handleError } = useErrorHandler();

const success = ref(false);

async function handleResend() {
  try {
    await mutateAsync();
    success.value = true;
  } catch (error) {
    handleError(error);
  }
}
</script>

<template>
  <AuthPageLayout title="Verify your email" subtitle="Check your inbox for the verification link we sent you.">
    <Alert v-if="success">
      <AlertDescription>A new verification link has been sent to your email.</AlertDescription>
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
