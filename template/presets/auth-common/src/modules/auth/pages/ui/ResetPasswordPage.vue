<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useResetPassword } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthPageLayout from "../components/AuthPageLayout.vue";

const route = useRoute();
const router = useRouter();
const { mutateAsync, isPending } = useResetPassword();

const email = ref((route.query.email as string) || "");
const password = ref("");
const passwordConfirmation = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";
  try {
    await mutateAsync({
      token: route.params.token as string,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    router.push({ name: "auth.login" });
  } catch (e: any) {
    error.value = e.response?.data?.message || "Failed to reset password.";
  }
}
</script>

<template>
  <AuthPageLayout title="Set new password" subtitle="Enter your new password below">
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <FieldGroup>
        <Field class="gap-1">
          <FieldLabel for="email">Email</FieldLabel>
          <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </Field>

        <Field class="gap-1">
          <FieldLabel for="password">New password</FieldLabel>
          <Input id="password" v-model="password" type="password" placeholder="********" required />
        </Field>

        <Field class="gap-1">
          <FieldLabel for="password_confirmation">Confirm password</FieldLabel>
          <Input id="password_confirmation" v-model="passwordConfirmation" type="password" placeholder="********" required />
        </Field>
      </FieldGroup>

      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <Button type="submit" class="w-full" :disabled="isPending">
        {{ isPending ? "Resetting..." : "Reset password" }}
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
