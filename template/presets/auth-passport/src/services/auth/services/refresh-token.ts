import axios from "axios";
import type { TokenResponse } from "../types";

export async function refreshToken(): Promise<TokenResponse> {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const storedRefreshToken = localStorage.getItem("refresh_token");

  const { data } = await axios.post<TokenResponse>(
    `${baseURL.replace("/api", "")}/oauth/token`,
    {
      grant_type: "refresh_token",
      client_id: import.meta.env.VITE_PASSPORT_CLIENT_ID,
      refresh_token: storedRefreshToken,
      scope: "",
    },
  );

  return data;
}
