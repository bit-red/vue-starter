import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authKeys } from "../keys";
import { register } from "../services";
import type { RegisterPayload } from "../types";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}
