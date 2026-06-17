import type { ApiError } from './types';

export type HttpClient = {
  get: <T>(path: string) => Promise<T>
  post: <T>(path: string, body?: unknown) => Promise<T>
  del: <T>(path: string) => Promise<T>
};

type StorageArea = {
  get: (keys: string[]) => Promise<Record<string, string | undefined>>
  set: (items: Record<string, string>) => Promise<void>
  remove: (keys: string[]) => Promise<void>
};

const isChromeEnv = typeof chrome !== 'undefined' && chrome.storage?.local;

const storage: StorageArea = isChromeEnv
  ? {
    get: async (keys) => {
      const result = await chrome.storage.local.get(keys);
      return result as Record<string, string | undefined>;
    },
    set: async (items) => {
      await chrome.storage.local.set(items);
    },
    remove: async (keys) => {
      await chrome.storage.local.remove(keys);
    },
  }
  : {
    get: async (keys) => {
      const result: Record<string, string | undefined> = {};
      keys.forEach((key) => {
        const val = localStorage.getItem(key);
        result[key] = val ?? undefined;
      });
      return result;
    },
    set: async (items) => {
      Object.entries(items).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    },
    remove: async (keys) => {
      keys.forEach((key) => {
        localStorage.removeItem(key);
      });
    },
  };

const AUTH_TOKEN_KEY = 'vantageui-auth-token';

export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://vantageui.com';
}

async function getAuthToken(): Promise<string | null> {
  const result = await storage.get([AUTH_TOKEN_KEY]);
  return result[AUTH_TOKEN_KEY] ?? null;
}

async function setAuthToken(token: string): Promise<void> {
  await storage.set({ [AUTH_TOKEN_KEY]: token });
}

async function clearAuthToken(): Promise<void> {
  await storage.remove([AUTH_TOKEN_KEY]);
}

class ApiClientError extends Error {
  code: ApiError['code'];

  status: number;

  constructor(message: string, code: ApiError['code'], status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && auth) {
      await clearAuthToken();
    }

    const apiError = data as ApiError;
    throw new ApiClientError(
      apiError.error ?? 'An error occurred',
      apiError.code ?? 'unauthorized',
      response.status,
    );
  }

  return data as T;
}

export {
  storage, getAuthToken, setAuthToken, clearAuthToken, ApiClientError,
};

export const apiClient: HttpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
