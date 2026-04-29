import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { API_BASE_URL } from "../constants/apiConfig";
import { LocalStorageAuthSessionStore } from "../servies/auth/authSessionStore";
import { RestAuthGateway } from "../servies/auth/restAuthGateway";
import { FetchApiClient } from "../servies/http/fetchApiClient";
import { RestUserGateway } from "../servies/user/restUserGateway";
import type { ApiResult } from "../servies/http/apiTypes";
import type {
  AuthSession,
  ChangePasswordInput,
  RecoverySession,
  RegisterInput,
  UserRole,
} from "../types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  recovery: RecoverySession | null;
  isAuthenticated: boolean;
  role: UserRole | "GUEST";
  signIn: (email: string, password: string) => Promise<ApiResult<AuthSession>>;
  signUp: (input: RegisterInput) => Promise<ApiResult<null>>;
  signOut: () => Promise<void>;
  sendResetPassword: (email: string) => Promise<ApiResult<null>>;
  resendVerification: (email: string) => Promise<ApiResult<null>>;
  setRecoveryCode: (code: string) => ApiResult<null>;
  resetPassword: (
    newPassword: string,
    confirmPassword: string,
  ) => Promise<ApiResult<null>>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<ApiResult<null>>;
  clearRecovery: () => void;
}

const authApiClient = new FetchApiClient(API_BASE_URL);
const authGateway = new RestAuthGateway(authApiClient);
const userGateway = new RestUserGateway(authApiClient);
const authSessionStore = new LocalStorageAuthSessionStore();

const createFailedResult = (message: string): ApiResult<null> => ({
  success: false,
  status: 0,
  message,
  errors: [message],
  data: null,
});

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(() =>
    authSessionStore.readSession(),
  );
  const [recovery, setRecovery] = useState<RecoverySession | null>(() =>
    authSessionStore.readRecovery(),
  );

  const signIn = async (
    email: string,
    password: string,
  ): Promise<ApiResult<AuthSession>> => {
    const result = await authGateway.login({ email, password });
    if (!result.success || !result.data) {
      return {
        ...result,
        data: null,
      };
    }

    const nextSession: AuthSession = {
      accessToken: result.data.access_token,
      user: result.data.user,
    };

    authSessionStore.writeSession(nextSession);
    setSession(nextSession);

    return {
      success: true,
      status: result.status,
      message: result.message,
      errors: [],
      data: nextSession,
    };
  };

  const signUp = async (input: RegisterInput): Promise<ApiResult<null>> => {
    return authGateway.register({
      email: input.email,
      password: input.password,
      first_name: input.firstName,
      last_name: input.lastName,
    });
  };

  const signOut = async (): Promise<void> => {
    if (session?.accessToken) {
      await authGateway.logout(session.accessToken);
    }

    authSessionStore.clearSession();
    setSession(null);
  };

  const sendResetPassword = async (email: string): Promise<ApiResult<null>> => {
    const result = await authGateway.sendResetPassword(email);
    if (!result.success) {
      return result;
    }

    const nextRecovery: RecoverySession = {
      email: email.trim().toLowerCase(),
      code: "",
      verified: false,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    authSessionStore.writeRecovery(nextRecovery);
    setRecovery(nextRecovery);

    return result;
  };

  const resendVerification = async (
    email: string,
  ): Promise<ApiResult<null>> => {
    return authGateway.resendVerification(email);
  };

  const setRecoveryCode = (code: string): ApiResult<null> => {
    if (!recovery) {
      return createFailedResult("Không tìm thấy phiên khôi phục");
    }

    if (Date.now() > recovery.expiresAt) {
      authSessionStore.clearRecovery();
      setRecovery(null);
      return createFailedResult(
        "Mã xác nhận đã hết hạn, vui lòng gửi lại mã mới",
      );
    }

    if (!code.trim()) {
      return createFailedResult("Vui lòng nhập mã xác nhận");
    }

    const nextRecovery: RecoverySession = {
      ...recovery,
      code: code.trim(),
      verified: true,
    };

    authSessionStore.writeRecovery(nextRecovery);
    setRecovery(nextRecovery);

    return {
      success: true,
      status: 200,
      message: "Mã xác nhận hợp lệ",
      errors: [],
      data: null,
    };
  };

  const resetPassword = async (
    newPassword: string,
    confirmPassword: string,
  ): Promise<ApiResult<null>> => {
    if (!recovery) {
      return createFailedResult("Không tìm thấy phiên khôi phục");
    }

    if (!recovery.verified || !recovery.code) {
      return createFailedResult("Bạn cần xác nhận mã khôi phục trước");
    }

    const result = await authGateway.resetPassword({
      email: recovery.email,
      code: recovery.code,
      newPassword,
      confirmPassword,
    });

    if (result.success) {
      authSessionStore.clearRecovery();
      setRecovery(null);
    }

    return result;
  };

  const changePassword = async (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<ApiResult<null>> => {
    if (!session?.accessToken) {
      return createFailedResult("Cần đăng nhập để đổi mật khẩu");
    }

    const input: ChangePasswordInput = {
      oldPassword,
      newPassword,
      confirmPassword,
    };

    return userGateway.changePassword(input, session.accessToken);
  };

  const clearRecovery = () => {
    authSessionStore.clearRecovery();
    setRecovery(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      recovery,
      isAuthenticated: Boolean(session?.accessToken),
      role: session?.user.role ?? "GUEST",
      signIn,
      signUp,
      signOut,
      sendResetPassword,
      resendVerification,
      setRecoveryCode,
      resetPassword,
      changePassword,
      clearRecovery,
    }),
    [session, recovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
