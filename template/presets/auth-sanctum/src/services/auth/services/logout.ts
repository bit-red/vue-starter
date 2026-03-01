import { http } from "@/services/http";

export async function logout(): Promise<void> {
  await http.post("/logout");
}
