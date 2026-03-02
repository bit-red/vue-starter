<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRegister } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthPageLayout } from "../components/auth-page-layout";

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
  <AuthPageLayout title="Create an account" subtitle="Fill in the details to get started">
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <FieldGroup class="gap-3">
        <Field class="gap-1">
          <FieldLabel for="name">Name</FieldLabel>
          <Input id="name" v-model="name" type="text" placeholder="John Doe" required />
        </Field>

        <Field class="gap-1">
          <FieldLabel for="email">Email</FieldLabel>
          <Input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </Field>

        <Field class="gap-1">
          <FieldLabel for="password">Password</FieldLabel>
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
        {{ isPending ? "Creating account..." : "Sign up" }}
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
