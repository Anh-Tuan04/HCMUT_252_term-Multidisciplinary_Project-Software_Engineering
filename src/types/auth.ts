export type UserRole = "USER" | "MANAGER" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface RecoverySession {
  email: string;
  code: string;
  verified: boolean;
  expiresAt: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  role: "user" | "manager";
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
