import { useQuery } from "@tanstack/vue-query";
import { authKeys } from "../keys";
import { getUser } from "../services";
import type { User } from "../types";

export function useUser() {
  return useQuery<User>({
    queryKey: authKeys.user(),
    queryFn: getUser,
    retry: false,
  });
}
