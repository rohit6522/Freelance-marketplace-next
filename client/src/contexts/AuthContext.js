"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "@/services/authService";

export const AuthContext = createContext(null);

const GUEST = { status: "unauthenticated", user: null, freelancerProfile: null };

export function AuthProvider({ children }) {
  const [session, setSession] = useState({ status: "loading", user: null, freelancerProfile: null });

  const applySession = useCallback((data) => {
    if (!data?.user) return setSession(GUEST);
    setSession({
      status: "authenticated",
      user: data.user,
      freelancerProfile: data.freelancerProfile ?? null,
    });
  }, []);

  // Guest ke liye /me 401 deta hai. Ye error nahi, normal hai.
  const refresh = useCallback(async () => {
    try {
      const res = await authService.getMe();
      applySession(res.data);
    } catch (err) {
      if (err.status !== 401) console.error("Could not load session:", err.message);
      setSession(GUEST);
    }
  }, [applySession]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (credentials) => {
      await authService.login(credentials);
      const res = await authService.getMe(); // freelancerProfile bhi chahiye
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (input) => {
      await authService.register(input);
      const res = await authService.getMe();
      applySession(res.data);
      return res.data.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setSession(GUEST); // API fail ho tab bhi UI se logout
    }
  }, []);

  const value = useMemo(
    () => ({ ...session, refresh, login, register, logout }),
    [session, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}