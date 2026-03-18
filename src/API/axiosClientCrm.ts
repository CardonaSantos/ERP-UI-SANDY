import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: { start: number };
  }
  interface InternalAxiosRequestConfig {
    metadata?: { start: number };
  }
}

function fullUrlFrom(cfg?: AxiosRequestConfig) {
  try {
    return new URL(cfg?.url ?? "", cfg?.baseURL ?? "").toString();
  } catch {
    return `${cfg?.baseURL ?? ""}${cfg?.url ?? ""}`;
  }
}

function attachLogging(client: AxiosInstance, name: string) {
  client.interceptors.request.use((cfg) => {
    // Guard rápido por si algún día corres en entorno sin performance
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    (cfg as any).metadata = { start: now };

    const url = fullUrlFrom(cfg);

    console.groupCollapsed(
      `➡️ [${name}] ${String(cfg.method).toUpperCase()} ${url}`,
    );
    console.log("params:", cfg.params);
    if (cfg.data) console.log("data:", cfg.data);
    console.log("headers:", cfg.headers);
    console.groupEnd();

    return cfg;
  });

  client.interceptors.response.use(
    (res: AxiosResponse) => {
      const start = (res.config as any).metadata?.start as number | undefined;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const ms =
        typeof start === "number" ? Math.round(now - start) : undefined;

      const url = fullUrlFrom(res.config);

      console.groupCollapsed(
        `✅ [${name}] ${res.status} ${res.statusText} — ${String(
          res.config.method,
        ).toUpperCase()} ${url}` + (ms != null ? ` (${ms} ms)` : ""),
      );
      console.log("data:", res.data);
      console.log("headers:", res.headers);
      console.groupEnd();

      return res;
    },
    (error: unknown) => {
      if (!axios.isAxiosError(error)) {
        console.groupCollapsed(`⛔ [${name}] Error no-Axios`);
        console.error(error);
        console.groupEnd();
        return Promise.reject(error);
      }

      const ax = error;
      const cfg = ax.config as AxiosRequestConfig | undefined;
      const url = fullUrlFrom(cfg);
      const method = String(cfg?.method ?? "GET").toUpperCase();

      const start = (cfg as any)?.metadata?.start as number | undefined;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const ms =
        typeof start === "number" ? Math.round(now - start) : undefined;

      console.groupCollapsed(
        `⛔ [${name}] Axios error — ${method} ${url}` +
          (ms != null ? ` (${ms} ms)` : ""),
      );
      console.error("message:", ax.message);
      console.error("code:", ax.code);
      console.error("status:", ax.response?.status ?? "(sin status)");
      console.error("response data:", ax.response?.data);
      console.groupEnd();

      return Promise.reject(error);
    },
  );
}

// SOLO API CRM
export const erpApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 10000,
  headers: { Accept: "application/json" },
});

attachLogging(erpApi, "ERP");
