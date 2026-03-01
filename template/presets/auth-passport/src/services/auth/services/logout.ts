import { http } from "@/services/http";

export async function logout(): Promise<void> {
  try {
    await http.post("/logout");
  } finally {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}
