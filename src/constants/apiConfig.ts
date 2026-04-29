const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const serverOriginFromEnv = (import.meta.env.VITE_SERVER_URL as string | undefined)
  ?? (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?? "http://localhost:8080";
  // ?? "https://localhost";

export const API_SERVER_ORIGIN = trimTrailingSlash(serverOriginFromEnv);
export const API_BASE_URL = `${API_SERVER_ORIGIN}/api/v1`;
