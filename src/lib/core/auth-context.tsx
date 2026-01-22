"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import type {
  User,
  AuthState,
  LoginCredentials,
  OtpVerification,
  RegistrationData,
} from "@/types/auth";
import { useTenant } from "./tenant-context";

// =============================================================================
// Context Types
// =============================================================================

interface AuthContextValue extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ requiresOtp: boolean }>;
  verifyOtp: (data: OtpVerification) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// Storage keys
// =============================================================================

const STORAGE_KEYS = {
  user: "selfcare_user",
  pendingAuth: "selfcare_pending_auth",
} as const;

// =============================================================================
// Provider
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { tenant } = useTenant();

  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        // Verify user belongs to current tenant
        if (user.tenantId === tenant.id) {
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      } catch {
        // Invalid stored user
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, [tenant.id]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ requiresOtp: boolean }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-ID": tenant.id,
          },
          body: JSON.stringify({ phone: credentials.phone }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to send verification code");
        }

        // Store pending auth session
        sessionStorage.setItem(
          STORAGE_KEYS.pendingAuth,
          JSON.stringify({ phone: credentials.phone })
        );

        setState((prev) => ({ ...prev, isLoading: false }));
        return { requiresOtp: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    [tenant.id]
  );

  const verifyOtp = useCallback(
    async (data: OtpVerification): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-ID": tenant.id,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const resData = await response.json();
          throw new Error(resData.error || "Invalid verification code");
        }

        const { user } = await response.json();

        // Clear pending auth
        sessionStorage.removeItem(STORAGE_KEYS.pendingAuth);

        // Store user
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        router.push("/dashboard");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    [tenant.id, router]
  );

  const register = useCallback(
    async (data: RegistrationData): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-ID": tenant.id,
          },
          body: JSON.stringify({ ...data, tenantId: tenant.id }),
        });

        if (!response.ok) {
          const resData = await response.json();
          throw new Error(resData.error || "Registration failed");
        }

        const { user } = await response.json();

        // Store user
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        router.push("/dashboard");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
        throw error;
      }
    },
    [tenant.id, router]
  );

  const logout = useCallback(async (): Promise<void> => {
    // Clear stored data
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.pendingAuth);

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    router.push("/login");
  }, [router]);

  const refreshSession = useCallback(async (): Promise<void> => {
    // In a real app, this would refresh the JWT token
    // For now, just verify the stored user is still valid
    const storedUser = localStorage.getItem(STORAGE_KEYS.user);
    if (!storedUser) {
      await logout();
    }
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      verifyOtp,
      register,
      logout,
      refreshSession,
      clearError,
    }),
    [state, login, verifyOtp, register, logout, refreshSession, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hooks
// =============================================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// =============================================================================
// Helper: Get pending auth phone
// =============================================================================

export function getPendingAuthPhone(): string | null {
  if (typeof window === "undefined") return null;

  const pending = sessionStorage.getItem(STORAGE_KEYS.pendingAuth);
  if (!pending) return null;

  try {
    const { phone } = JSON.parse(pending);
    return phone;
  } catch {
    return null;
  }
}
