import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  apiClient,
  ApiClientError,
  clearAuthToken,
  setAuthToken,
} from '../lib/api-client';
import type { AuthResponse, MeResponse } from '../lib/types';
import { setBalanceSync } from './store-sync';

export type AuthState = 'unauthenticated' | 'loading' | 'authenticated';

interface PopupStore {
  authState: AuthState
  creditBalance: number
  userEmail: string | null
  userId: string | null
  user: { email: string } | null
  error: string | null
  inspectorActive: boolean
  setAuthState: (state: AuthState) => void
  setCreditBalance: (balance: number) => void
  setUserEmail: (email: string | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  toggleInspector: () => void
  setInspectorActive: (active: boolean) => void
}

const isChromeStorageAvailable = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

const chromeStorage = {
  getItem: async (name: string) => {
    if (isChromeStorageAvailable) {
      const result = await chrome.storage.local.get(name);
      const raw = result[name];
      if (raw === undefined || raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
    try {
      const val = localStorage.getItem(name);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: unknown) => {
    if (isChromeStorageAvailable) {
      await chrome.storage.local.set({ [name]: JSON.stringify(value) });
      return;
    }
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // noop
    }
  },
  removeItem: async (name: string) => {
    if (isChromeStorageAvailable) {
      await chrome.storage.local.remove(name);
      return;
    }
    try {
      localStorage.removeItem(name);
    } catch {
      // noop
    }
  },
};

export const usePopupStore = create<PopupStore>()(
  persist(
    (set) => {
      // Register balance sync callback to break circular dependency
      setBalanceSync((n) => set({ creditBalance: n }));
      return {
        authState: 'unauthenticated',
        creditBalance: 0,
        userEmail: null,
        userId: null,
        user: null,
        error: null,
        inspectorActive: false,

        setAuthState: (authState) => set({ authState }),
        setCreditBalance: (creditBalance) => set({ creditBalance }),
        setUserEmail: (userEmail) => set({ userEmail }),

        login: async (email: string, password: string) => {
          set({ authState: 'loading', error: null });

          try {
            const res = await apiClient.post<AuthResponse>('/api/auth/login', {
              email,
              password,
            });
            await setAuthToken(res.session.access_token);
            set({
              authState: 'authenticated',
              user: { email: res.user.email },
              userEmail: res.user.email,
              userId: res.user.id,
            });
          } catch (err) {
            const message = err instanceof ApiClientError
              ? err.message
              : 'Login failed. Please try again.';
            set({ authState: 'unauthenticated', error: message });
          }
        },

        signup: async (email: string, password: string) => {
          set({ authState: 'loading', error: null });

          try {
            const res = await apiClient.post<AuthResponse>('/api/auth/signup', {
              email,
              password,
            });
            await setAuthToken(res.session.access_token);
            set({
              authState: 'authenticated',
              user: { email: res.user.email },
              userEmail: res.user.email,
              userId: res.user.id,
            });
          } catch (err) {
            const message = err instanceof ApiClientError
              ? err.message
              : 'Signup failed. Please try again.';
            set({ authState: 'unauthenticated', error: message });
          }
        },

        logout: async () => {
          try {
            await apiClient.post('/api/auth/logout');
          } catch {
            // proceed with local logout even if API call fails
          }
          await clearAuthToken();
          set({
            authState: 'unauthenticated',
            user: null,
            userEmail: null,
            userId: null,
            error: null,
            inspectorActive: false,
          });
          if (isChromeStorageAvailable) {
            try {
              const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
              });
              if (tabs.length > 0 && tabs[0].id) {
                await chrome.tabs
                  .sendMessage(tabs[0].id, { type: 'TOGGLE_INSPECTOR' })
                  .catch(() => {});
              }
            } catch {
              // ignore
            }
          }
        },

        restoreSession: async () => {
          const storedToken = await (async () => {
            if (isChromeStorageAvailable) {
              const result = await chrome.storage.local.get(
                'vantageui-auth-token',
              );
              return result['vantageui-auth-token'] as string | undefined;
            }
            return localStorage.getItem('vantageui-auth-token') ?? undefined;
          })();

          if (!storedToken) {
            set({ authState: 'unauthenticated' });
            return;
          }

          set({ authState: 'loading' });

          try {
            const res = await apiClient.get<MeResponse>('/api/auth/me');
            set({
              authState: 'authenticated',
              user: { email: res.user.email },
              userEmail: res.user.email,
              userId: res.user.id,
              creditBalance: res.credits.balance,
            });
          } catch {
            await clearAuthToken();
            set({
              authState: 'unauthenticated',
              user: null,
              userEmail: null,
              userId: null,
            });
          }
        },

        toggleInspector: () => set((state) => ({
          inspectorActive: !state.inspectorActive,
        })),

        setInspectorActive: (active) => set({ inspectorActive: active }),
      };
    },
    {
      name: 'vantageui-auth',
      storage: chromeStorage,
      partialize: (state) => ({
        authState: state.authState,
        userEmail: state.userEmail,
        userId: state.userId,
        user: state.user,
        creditBalance: state.creditBalance,
        inspectorActive: state.inspectorActive,
      }),
    },
  ),
);
