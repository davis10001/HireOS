export interface AuthSession {
  email: string;
  name: string;
  role: string;
}

const AUTH_KEY = "hireos.auth";

export type LoginResult =
  | { ok: true }
  | { ok: false; errors: { email?: string; password?: string } };

export function validateLogin(email: string, password: string): LoginResult {
  const errors: { email?: string; password?: string } = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email";
  }
  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true };
}

export function createSession(email: string): AuthSession {
  return {
    email,
    name: "Linh Tran",
    role: "HR Lead"
  };
}

export function loadAuthState(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveAuthState(session: AuthSession): void {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuthState(): void {
  window.localStorage.removeItem(AUTH_KEY);
}
