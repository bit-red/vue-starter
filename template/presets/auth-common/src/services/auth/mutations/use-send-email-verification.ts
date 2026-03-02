import { useMutation } from "@tanstack/vue-query";
import { sendEmailVerification } from "../services";

export function useSendEmailVerification() {
  return useMutation({
    mutationFn: () => sendEmailVerification(),
  });
}
