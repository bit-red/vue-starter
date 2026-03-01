export type Feature =
  | "router"
  | "pinia"
  | "ui"
  | "services"
  | "forms"
  | "eslint";

export type AuthPreset = "none" | "sanctum" | "passport";

export interface ProjectOptions {
  projectName: string;
  packageName: string;
  features: Feature[];
  authPreset: AuthPreset;
}

export const AUTH_REQUIRED_FEATURES: Feature[] = [
  "router",
  "pinia",
  "services",
];
