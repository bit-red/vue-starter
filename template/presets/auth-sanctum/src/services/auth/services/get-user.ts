import { http } from "@/services/http";
import type { User } from "../types";

export async function getUser(): Promise<User> {
  const { data } = await http.get<User>("/user");
  return data;
}
