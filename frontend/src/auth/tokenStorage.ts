const AUTH_TOKEN_KEY = "hiring_dashboard_auth_token";

let inMemoryToken: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAuthToken(): string | null {
  if (inMemoryToken) {
    return inMemoryToken;
  }
  if (!canUseStorage()) {
    return null;
  }
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  inMemoryToken = token;
  return token;
}

export function setAuthToken(token: string) {
  inMemoryToken = token;
  if (canUseStorage()) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  inMemoryToken = null;
  if (canUseStorage()) {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}
