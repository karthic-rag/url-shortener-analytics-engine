import axios from "axios";

// 1. Explicit Data Contracts matching Spring Boot Backend DTO mappings
export interface ShortenRequest {
  longUrl: string;
}

export interface ShortenResponse {
  shortKey: string;
  fullShortUrl: string;
  originalUrl: string;
  anonymousToken: string;
  tokenIssued: boolean;
}

export interface AnalyticsResponse {
  shortKey: string;
  totalClicks: number;
  deviceBreakdown: Record<string, number>;
  referrerBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

export interface UserLinkItem {
  shortKey: string;
  shortUrl: string;
  clicks: number;
}

// 2. Instantiate a central Axios client
export const api = axios.create({
  baseURL: import.meta.env.VITE_API,
  headers: {
    "Content-Type": "application/json",
  },
});

// 3. Request Interceptor: Automatically injects security identity header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("anon_tracking_token");
  if (token) {
    config.headers["X-Anonymous-User-ID"] = token;
  }
  return config;
});

export const fetchUserLinks = async (): Promise<UserLinkItem[]> => {
  const response = await api.get<UserLinkItem[]>("/analytics/my-links");
  return response.data;
};

export const fetchAnalytics = async (
  shortKey: string,
): Promise<AnalyticsResponse> => {
  const response = await api.get<AnalyticsResponse>(`/analytics/${shortKey}`);
  return response.data;
};

export const deleteShortLink = async (shortKey: string): Promise<void> => {
  await api.delete(`/delete/${shortKey}`);
};
