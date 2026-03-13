import { createContext } from "react";

import type { AuthSignupPayload, AuthUser } from "../types";

export type SignupInput = {
  email: string;
  confirm_email: string;
  password: string;
};

export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<AuthSignupPayload>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
