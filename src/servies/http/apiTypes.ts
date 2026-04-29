export interface ApiResult<TData> {
  success: boolean;
  status: number;
  message: string;
  errors: string[];
  data: TData | null;
}

export interface ApiRequest {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  accessToken?: string;
  includeCredentials?: boolean;
}

export interface ApiClient {
  request<TData>(request: ApiRequest): Promise<ApiResult<TData>>;
}
