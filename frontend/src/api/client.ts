import axios from "axios";

// In development, this is your FastAPI local address.
// In production, this should be the public API URL.
const isProd = import.meta.env.PROD;
const API_BASE_URL = isProd ? "/api/v1" : (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1");

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
