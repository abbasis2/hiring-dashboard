import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import client from "../api/client";
import type { ApiResponse, AuthLoginPayload, AuthSignupPayload, AuthUser } from "../types";
import { AuthContext, type AuthContextValue, type SignupInput } from "./AuthContextStore";
import { clearAuthToken, getAuthToken, setAuthToken } from "./tokenStorage";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setToken(null);
      setUser(null);
      return;
    }
    const response = await client.get<ApiResponse<AuthUser>>("/api/auth/me");
    setToken(currentToken);
    setUser(response.data.data);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await client.get<ApiResponse<AuthUser>>("/api/auth/me");
        setToken(currentToken);
        setUser(response.data.data);
      } catch {
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await client.post<ApiResponse<AuthLoginPayload>>("/api/auth/login", { email, password });
    const payload = response.data.data;
    setAuthToken(payload.access_token);
    setToken(payload.access_token);
    setUser(payload.user);
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const response = await client.post<ApiResponse<AuthSignupPayload>>("/api/auth/signup", input);
    return response.data.data;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isSuperAdmin: user?.role === "super_admin",
      login,
      signup,
      refreshUser,
      logout,
    }),
    [isLoading, login, logout, refreshUser, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
