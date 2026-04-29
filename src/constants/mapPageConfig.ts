import { API_SERVER_ORIGIN } from "./apiConfig";

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const MAP_PAGE_CONFIG = {
  apiBaseUrl: API_SERVER_ORIGIN,
  webTransportUrl:
    (import.meta.env.VITE_WEBTRANSPORT_URL as string | undefined) ?? "https://localhost:8443/wt",//"https://localhost/wt",
  lotId: parseNumber(import.meta.env.VITE_PARKING_LOT_ID as string | undefined, 1),
  enableApiSnapshot: ((import.meta.env.VITE_USE_API_SNAPSHOT as string | undefined) ?? "true") === "true",
};
