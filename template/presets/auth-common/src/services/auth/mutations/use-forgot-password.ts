import { useMutation } from "@tanstack/vue-query";
import { forgotPassword } from "../services";
import type { ForgotPasswordPayload } from "../types";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}
