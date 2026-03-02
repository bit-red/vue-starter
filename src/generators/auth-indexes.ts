import type { AuthPage, AuthPreset } from "../types.js";

export function generateAuthServices(
  authPages: AuthPage[],
  authPreset: AuthPreset,
): string {
  const lines: string[] = [];

  // Imports
  if (authPreset === "sanctum") {
    lines.push('import axios from "axios";');
    lines.push('import { http } from "@/services/http";');
  } else {
    lines.push('import axios from "axios";');
    lines.push('import { http } from "@/services/http";');
  }

  // Build type imports
  const types: string[] = [];
  types.push("User");
  types.push("LoginPayload");
  if (authPages.includes("register")) types.push("RegisterPayload");
  if (authPages.includes("forgot-password")) types.push("ForgotPasswordPayload");
  if (authPages.includes("reset-password")) types.push("ResetPasswordPayload");
  if (authPreset === "passport") types.push("TokenResponse");
  lines.push(`import type { ${types.join(", ")} } from "./types";`);
  lines.push("");

  // --- getUser (always) ---
  lines.push("export async function getUser(): Promise<User> {");
  lines.push('  const { data } = await http.get<User>("/user");');
  lines.push("  return data;");
  lines.push("}");
  lines.push("");

  // --- login (preset-specific) ---
  if (authPreset === "sanctum") {
    lines.push("export async function login(payload: LoginPayload): Promise<void> {");
    lines.push("  await axios.get(");
    lines.push("    `${import.meta.env.VITE_API_URL?.replace(\"/api\", \"\") || \"http://localhost:8000\"}/sanctum/csrf-cookie`,");
    lines.push("    { withCredentials: true },");
    lines.push("  );");
    lines.push('  await http.post("/login", payload);');
    lines.push("}");
  } else {
    lines.push("export async function login(payload: LoginPayload): Promise<TokenResponse> {");
    lines.push('  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";');
    lines.push("");
    lines.push("  const { data } = await axios.post<TokenResponse>(");
    lines.push("    `${baseURL.replace(\"/api\", \"\")}/oauth/token`,");
    lines.push("    {");
    lines.push('      grant_type: "password",');
    lines.push("      client_id: import.meta.env.VITE_PASSPORT_CLIENT_ID,");
    lines.push("      username: payload.email,");
    lines.push("      password: payload.password,");
    lines.push('      scope: "",');
    lines.push("    },");
    lines.push("  );");
    lines.push("");
    lines.push('  localStorage.setItem("access_token", data.access_token);');
    lines.push('  localStorage.setItem("refresh_token", data.refresh_token);');
    lines.push("");
    lines.push("  return data;");
    lines.push("}");
  }
  lines.push("");

  // --- logout (preset-specific) ---
  if (authPreset === "sanctum") {
    lines.push("export async function logout(): Promise<void> {");
    lines.push('  await http.post("/logout");');
    lines.push("}");
  } else {
    lines.push("export async function logout(): Promise<void> {");
    lines.push("  try {");
    lines.push('    await http.post("/logout");');
    lines.push("  } finally {");
    lines.push('    localStorage.removeItem("access_token");');
    lines.push('    localStorage.removeItem("refresh_token");');
    lines.push("  }");
    lines.push("}");
  }
  lines.push("");

  // --- refreshToken (passport only) ---
  if (authPreset === "passport") {
    lines.push("export async function refreshToken(): Promise<TokenResponse> {");
    lines.push('  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";');
    lines.push('  const storedRefreshToken = localStorage.getItem("refresh_token");');
    lines.push("");
    lines.push("  const { data } = await axios.post<TokenResponse>(");
    lines.push("    `${baseURL.replace(\"/api\", \"\")}/oauth/token`,");
    lines.push("    {");
    lines.push('      grant_type: "refresh_token",');
    lines.push("      client_id: import.meta.env.VITE_PASSPORT_CLIENT_ID,");
    lines.push("      refresh_token: storedRefreshToken,");
    lines.push('      scope: "",');
    lines.push("    },");
    lines.push("  );");
    lines.push("");
    lines.push("  return data;");
    lines.push("}");
    lines.push("");
  }

  // --- Optional services based on authPages ---
  if (authPages.includes("register")) {
    lines.push("export async function register(payload: RegisterPayload): Promise<void> {");
    lines.push('  await http.post("/register", payload);');
    lines.push("}");
    lines.push("");
  }

  if (authPages.includes("forgot-password")) {
    lines.push("export async function forgotPassword(");
    lines.push("  payload: ForgotPasswordPayload,");
    lines.push("): Promise<void> {");
    lines.push('  await http.post("/forgot-password", payload);');
    lines.push("}");
    lines.push("");
  }

  if (authPages.includes("reset-password")) {
    lines.push("export async function resetPassword(");
    lines.push("  payload: ResetPasswordPayload,");
    lines.push("): Promise<void> {");
    lines.push('  await http.post("/reset-password", payload);');
    lines.push("}");
    lines.push("");
  }

  if (authPages.includes("email-verification")) {
    lines.push("export async function sendEmailVerification(): Promise<void> {");
    lines.push('  await http.post("/email/verification-notification");');
    lines.push("}");
    lines.push("");
  }

  return lines.join("\n");
}

export function generateAuthMutationsIndex(authPages: AuthPage[]): string {
  const lines: string[] = [];

  // Always included
  lines.push('export { useLogin } from "./use-login";');
  lines.push('export { useLogout } from "./use-logout";');

  if (authPages.includes("register")) {
    lines.push('export { useRegister } from "./use-register";');
  }

  if (authPages.includes("forgot-password")) {
    lines.push('export { useForgotPassword } from "./use-forgot-password";');
  }

  if (authPages.includes("reset-password")) {
    lines.push('export { useResetPassword } from "./use-reset-password";');
  }

  if (authPages.includes("email-verification")) {
    lines.push(
      'export { useSendEmailVerification } from "./use-send-email-verification";',
    );
  }

  lines.push("");
  return lines.join("\n");
}

export function generateAuthMainIndex(
  authPages: AuthPage[],
  authPreset: AuthPreset,
): string {
  const lines: string[] = [];

  lines.push('export { authKeys } from "./keys";');

  // Build type exports
  const types: string[] = ["User", "LoginPayload"];
  if (authPages.includes("register")) {
    types.push("RegisterPayload");
  }
  if (authPages.includes("forgot-password")) {
    types.push("ForgotPasswordPayload");
  }
  if (authPages.includes("reset-password")) {
    types.push("ResetPasswordPayload");
  }
  if (authPreset === "passport") {
    types.push("TokenResponse");
  }
  lines.push(`export type { ${types.join(", ")} } from "./types";`);

  // Queries
  lines.push('export { useUser } from "./queries";');

  // Mutations
  const mutations: string[] = ["useLogin", "useLogout"];
  if (authPages.includes("register")) {
    mutations.push("useRegister");
  }
  if (authPages.includes("forgot-password")) {
    mutations.push("useForgotPassword");
  }
  if (authPages.includes("reset-password")) {
    mutations.push("useResetPassword");
  }
  if (authPages.includes("email-verification")) {
    mutations.push("useSendEmailVerification");
  }
  lines.push(`export { ${mutations.join(", ")} } from "./mutations";`);

  lines.push("");
  return lines.join("\n");
}
