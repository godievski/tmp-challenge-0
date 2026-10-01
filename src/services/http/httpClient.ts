import { HttpError } from "./httpError";

export type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

function buildUrl(baseUrl: string, params?: RequestOptions["params"]): string {
  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  if (!queryString) return baseUrl;

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${queryString}`;
}

export const httpClient = {
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    const fullUrl = buildUrl(url, options?.params);
    const response = await fetch(fullUrl, {
      method: "GET",
      signal: options?.signal,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        // ignore json parse error
      }
      throw new HttpError(response.status, response.statusText, body);
    }

    return (await response.json()) as T;
  },
};
