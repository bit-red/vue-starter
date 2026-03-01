import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authKeys } from "../keys";
import { login } from "../services";
import type { LoginPayload } from "../types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}
