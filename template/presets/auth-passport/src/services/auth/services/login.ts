import axios from "axios";
import type { LoginPayload, TokenResponse } from "../types";

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const { data } = await axios.post<TokenResponse>(
    `${baseURL.replace("/api", "")}/oauth/token`,
    {
      grant_type: "password",
      client_id: import.meta.env.VITE_PASSPORT_CLIENT_ID,
      username: payload.email,
      password: payload.password,
      scope: "",
    },
  );

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}
