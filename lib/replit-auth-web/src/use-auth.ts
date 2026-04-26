import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

export interface SignupInput {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  remember?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (input: SignupInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (input: LoginInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const body = (await res.json().catch(() => ({}))) as {
        user?: AuthUser;
        error?: string;
      };
      if (!res.ok) {
        return { ok: false as const, error: body.error ?? "حدث خطأ، حاول تاني." };
      }
      setUser(body.user ?? null);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "تعذّر الاتصال بالسيرفر." };
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const body = (await res.json().catch(() => ({}))) as {
        user?: AuthUser;
        error?: string;
      };
      if (!res.ok) {
        return { ok: false as const, error: body.error ?? "حدث خطأ، حاول تاني." };
      }
      setUser(body.user ?? null);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "تعذّر الاتصال بالسيرفر." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* ignore */
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };
}
