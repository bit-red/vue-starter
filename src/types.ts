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

export type SharedComponent =
  | "app-form-input"
  | "app-form-datepicker"
  | "app-phone-input"
  | "app-field";

export interface ProjectOptions {
  projectName: string;
  packageName: string;
  features: Feature[];
  authPreset: AuthPreset;
  authPages: AuthPage[];
  sharedComponents: SharedComponent[];
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

export const SELECTABLE_SHARED_COMPONENTS: SharedComponent[] = [
  "app-form-input",
  "app-form-datepicker",
  "app-phone-input",
  "app-field",
];

export const SHARED_COMPONENT_REQUIRES_FORMS: SharedComponent[] = ["app-field"];

export const SHARED_COMPONENT_DEPS: Partial<
  Record<SharedComponent, SharedComponent[]>
> = {
  "app-field": ["app-form-input"],
};
