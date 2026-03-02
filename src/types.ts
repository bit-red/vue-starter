export type Feature =
  | "router"
  | "pinia"
  | "ui"
  | "services"
  | "forms"
  | "eslint";

export type AuthPreset = "none" | "sanctum" | "passport";

export type AuthPage =
  | "register"
  | "forgot-password"
  | "reset-password"
  | "email-verification";

export interface ProjectOptions {
  projectName: string;
  packageName: string;
  features: Feature[];
  authPreset: AuthPreset;
  authPages: AuthPage[];
}

export const AUTH_REQUIRED_FEATURES: Feature[] = [
  "router",
  "pinia",
  "services",
];

export const SELECTABLE_AUTH_PAGES: AuthPage[] = [
  "register",
  "forgot-password",
  "reset-password",
  "email-verification",
];
