import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LocationQueryValue } from "vue-router";

export function useQueryParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>() {
  const route = useRoute();
  const router = useRouter();

  const params = computed(() => {
    const result: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(route.query)) {
      result[key] = Array.isArray(value) ? value[0] ?? undefined : (value ?? undefined);
    }
    return result as T;
  });

  function set(updates: Partial<T>) {
    const query = { ...route.query };
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null || value === "") {
        delete query[key];
      } else {
        query[key] = value as LocationQueryValue;
      }
    }
    router.replace({ query });
  }

  return { params, set };
}
