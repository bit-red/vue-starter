import { http } from "@/services/http";
import type { RegisterPayload } from "../types";

export async function register(payload: RegisterPayload): Promise<void> {
  await http.post("/register", payload);
}
