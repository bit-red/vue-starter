import { useMutation } from "@tanstack/vue-query";
import { resetPassword } from "../services";
import type { ResetPasswordPayload } from "../types";

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}
