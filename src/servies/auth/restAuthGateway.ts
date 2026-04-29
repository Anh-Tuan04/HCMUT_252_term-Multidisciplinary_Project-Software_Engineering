import type { ApiClient } from "../http/apiTypes";
import type { AuthGateway, LoginResponseData, RegisterPayload } from "./authGateway";
import type { ApiResult } from "../http/apiTypes";
import type { LoginInput, ResetPasswordInput } from "../../types/auth";

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export class RestAuthGateway implements AuthGateway {
  constructor(private readonly apiClient: ApiClient) {}

  login(input: LoginInput): Promise<ApiResult<LoginResponseData>> {
    return this.apiClient.request<LoginResponseData>({
      method: "POST",
      path: "/auth/login",
      includeCredentials: true,
      body: {
        email: normalizeEmail(input.email),
        password: input.password,
      },
    });
  }

  register(payload: RegisterPayload): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "POST",
      path: "/auth/register",
      includeCredentials: true,
      body: {
        email: normalizeEmail(payload.email),
        password: payload.password,
        first_name: payload.first_name,
        last_name: payload.last_name,
      },
    });
  }

  refreshToken(): Promise<ApiResult<LoginResponseData>> {
    return this.apiClient.request<LoginResponseData>({
      method: "POST",
      path: "/auth/refresh-token",
      includeCredentials: true,
    });
  }

  logout(accessToken: string): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "POST",
      path: "/auth/logout",
      includeCredentials: true,
      accessToken,
    });
  }

  sendResetPassword(email: string): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "POST",
      path: "/auth/send-reset-password",
      includeCredentials: true,
      body: {
        email: normalizeEmail(email),
      },
    });
  }

  resendVerification(email: string): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "POST",
      path: "/auth/resend",
      includeCredentials: true,
      body: {
        email: normalizeEmail(email),
      },
    });
  }

  resetPassword(input: ResetPasswordInput): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "PATCH",
      path: "/auth/reset-password",
      includeCredentials: true,
      body: {
        email: normalizeEmail(input.email),
        code: input.code,
        new_password: input.newPassword,
        confirm_password: input.confirmPassword,
      },
    });
  }
}
