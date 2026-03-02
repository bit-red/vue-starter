import { useRouter } from "vue-router";

export function useAuthRoutes() {
  const router = useRouter();
  return { hasRoute: (name: string) => router.hasRoute(name) };
}
