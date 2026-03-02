import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authKeys } from "../keys";
import { logout } from "../services";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
