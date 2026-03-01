export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_admin: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}
