import axios from "axios";
import { http } from "@/services/http";
import type { LoginPayload } from "../types";

export async function login(payload: LoginPayload): Promise<void> {
  // Sanctum requires CSRF cookie before login
  await axios.get(
    `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000"}/sanctum/csrf-cookie`,
    { withCredentials: true },
  );
  await http.post("/login", payload);
}
