import axios from "axios";

// 1. Explicit Data Contracts matching Spring Boot Backend DTO mappings
export interface ShortenRequest {
  longUrl: string;
}

export interface ShortenResponse {
  shortKey: string;
  shortUrl: string;
  originalUrl: string;
  anonymousToken: string;
  tokenIssued: boolean;
}

export interface AnalyticsResponse {
  shortKey: string;
  totalClicks: number;
  deviceMap: Record<string, number>;
  referrerMap: Record<string, number>;
  browserMap: Record<string, number>;
  countryMap: Record<string, number>;
}

// 2. Instantiate a central Axios client
export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
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
