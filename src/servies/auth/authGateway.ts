import type { ApiResult } from "../http/apiTypes";
import type { LoginInput, ResetPasswordInput } from "../../types/auth";

export interface LoginResponseData {
  access_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: "USER" | "MANAGER" | "ADMIN";
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthGateway {
  login(input: LoginInput): Promise<ApiResult<LoginResponseData>>;
  register(payload: RegisterPayload): Promise<ApiResult<null>>;
  refreshToken(): Promise<ApiResult<LoginResponseData>>;
  logout(accessToken: string): Promise<ApiResult<null>>;
  sendResetPassword(email: string): Promise<ApiResult<null>>;
  resendVerification(email: string): Promise<ApiResult<null>>;
  resetPassword(input: ResetPasswordInput): Promise<ApiResult<null>>;
}
