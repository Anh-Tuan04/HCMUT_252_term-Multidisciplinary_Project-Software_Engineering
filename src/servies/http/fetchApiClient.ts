import type { ApiClient, ApiRequest, ApiResult } from "./apiTypes";

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

export class FetchApiClient implements ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async request<TData>(request: ApiRequest): Promise<ApiResult<TData>> {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };

      if (request.body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      if (request.accessToken) {
        headers.Authorization = `Bearer ${request.accessToken}`;
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
}
