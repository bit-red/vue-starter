<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useLogout } from "@/services/auth";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const authStore = useAuthStore();
const router = useRouter();
const { mutateAsync: doLogout, isPending } = useLogout();

async function handleLogout() {
  await doLogout();
  authStore.clear();
  router.push({ name: "auth.login" });
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-8">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <Button variant="outline" :disabled="isPending" @click="handleLogout">
        {{ isPending ? "Logging out..." : "Logout" }}
      </Button>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Welcome back, {{ authStore.user?.name ?? "User" }}.</CardTitle>
        <CardDescription>This is your dashboard. Start building from here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          Edit this page at <code class="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">src/pages/DashboardPage.vue</code>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
