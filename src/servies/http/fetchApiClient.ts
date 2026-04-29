import type { ApiClient, ApiRequest, ApiResult } from "./apiTypes";
import { LocalStorageAuthSessionStore } from "../auth/authSessionStore";
import type { AuthUser } from "../../types/auth";

interface BackendSuccess<TData> {
  success?: boolean;
  message?: string;
  data?: TData;
}

interface BackendError {
  success?: boolean;
  errors?: string[];
  message?: string;
}

const normalizeBaseUrl = (baseUrl: string): string => {
  return baseUrl.replace(/\/+$/, "");
};

interface RefreshResponsePayload {
  data?: {
    access_token?: string;
    user?: AuthUser;
  };
  message?: string;
}

const refreshAccessTokenPromisesByBaseUrl = new Map<string, Promise<string | null>>();

export class FetchApiClient implements ApiClient {
  private readonly baseUrl: string;
  private readonly authSessionStore = new LocalStorageAuthSessionStore();

  constructor(baseUrl: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async request<TData>(request: ApiRequest): Promise<ApiResult<TData>> {
    try {
      return await this.executeRequest<TData>(request, request.accessToken, false);
    } catch {
      return {
        success: false,
        status: 0,
        message: "Không thể kết nối đến server",
        errors: ["Không thể kết nối đến server"],
        data: null,
      };
    }
  }

  private async executeRequest<TData>(
    request: ApiRequest,
    accessToken: string | undefined,
    retriedAfterRefresh: boolean,
  ): Promise<ApiResult<TData>> {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (request.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${request.path}`, {
      method: request.method,
      headers,
      credentials: request.includeCredentials ? "include" : "same-origin",
      body: request.body !== undefined ? JSON.stringify(request.body) : undefined,
    });

    const payload = (await response.json().catch(() => null)) as BackendSuccess<TData> | BackendError | null;
    const message =
      payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : response.ok
          ? "Success"
          : `Request failed (${response.status})`;

    const errors =
      payload && "errors" in payload && Array.isArray(payload.errors)
        ? payload.errors.filter((value): value is string => typeof value === "string")
        : [];

    const shouldRefresh =
      response.status === 401 &&
      Boolean(accessToken) &&
      !request.skipAuthRefresh &&
      !retriedAfterRefresh;

    if (shouldRefresh) {
      const refreshedAccessToken = await this.refreshAccessToken();
      if (refreshedAccessToken) {
        return this.executeRequest<TData>(request, refreshedAccessToken, true);
      }
    }

    if (!response.ok || (payload && "success" in payload && payload.success === false)) {
      return {
        success: false,
        status: response.status,
        message: errors[0] ?? message,
        errors: errors.length ? errors : [message],
        data: payload && "data" in payload ? (payload.data as TData | null) : null,
      };
    }

    const data = payload && "data" in payload ? (payload.data as TData | null) : null;

    return {
      success: true,
      status: response.status,
      message,
      errors: [],
      data,
    };
  }

  private async refreshAccessToken(): Promise<string | null> {
    const existingPromise = refreshAccessTokenPromisesByBaseUrl.get(this.baseUrl);
    if (existingPromise) {
      return existingPromise;
    }

    const refreshPromise = this.executeRefreshAccessToken();
    refreshAccessTokenPromisesByBaseUrl.set(this.baseUrl, refreshPromise);

    try {
      return await refreshPromise;
    } finally {
      const currentPromise = refreshAccessTokenPromisesByBaseUrl.get(this.baseUrl);
      if (currentPromise === refreshPromise) {
        refreshAccessTokenPromisesByBaseUrl.delete(this.baseUrl);
      }
    }
  }

  private async executeRefreshAccessToken(): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    const payload = (await response.json().catch(() => null)) as RefreshResponsePayload | null;

    if (!response.ok) {
      this.authSessionStore.clearSession();
      return null;
    }

    const accessToken = payload?.data?.access_token;
    const user = payload?.data?.user;

    if (!accessToken || !user) {
      this.authSessionStore.clearSession();
      return null;
    }

    this.authSessionStore.writeSession({
      accessToken,
      user,
    });

    return accessToken;
  }
}
