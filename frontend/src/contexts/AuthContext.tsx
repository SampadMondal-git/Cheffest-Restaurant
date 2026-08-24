import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
} from "../../api/authService";
import { getUserDetailsByToken } from "../../api/manageUser";
import Loader from "../../components/global/loader";

type User = any;

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (
    name: string,
    phone: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

const storeAuth = (authToken: string, authUser: User) => {
  clearAuthStorage();
  localStorage.setItem("token", authToken);
  localStorage.setItem("user", JSON.stringify(authUser));
};

const getTokenExpiration = (token: string): number | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = atob(padded);
    const parsed = JSON.parse(decoded);
    return parsed.exp ? parsed.exp * 1000 : null;
  } catch (err) {
    console.error("Invalid token format", err);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const logoutTimerRef = useRef<number | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
    clearLogoutTimer();
  };

  const expireAuth = () => {
    clearAuth();
    void apiLogout().catch((err) => {
      console.error("Automatic logout error", err);
    });
  };

  const scheduleAutoLogout = (authToken: string) => {
    clearLogoutTimer();
    const expiration = getTokenExpiration(authToken);
    if (!expiration) return;

    const scheduleNextCheck = () => {
      const remaining = expiration - Date.now();
      if (remaining <= 0) {
        expireAuth();
        return;
      }

      // setTimeout overflows for delays longer than roughly 24.8 days.
      const maxTimeoutDelay = 2_147_000_000;
      logoutTimerRef.current = window.setTimeout(scheduleNextCheck, Math.min(remaining, maxTimeoutDelay));
    };

    scheduleNextCheck();
  };

  useEffect(() => {
    const restoreAuth = async () => {
      const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      let parsedUser: User | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (err) {
          console.error("Failed to parse stored user", err);
          clearAuthStorage();
        }
      }

      if (parsedUser) {
        try {
          await getUserDetailsByToken(storedToken);
          setToken(storedToken);
          setUser(parsedUser);
          scheduleAutoLogout(storedToken);
        } catch (err) {
          console.error("Stored token is invalid", err);
          clearAuth();
        }
      } else {
        try {
          const response = await getUserDetailsByToken(storedToken);
          setToken(storedToken);
          setUser(response?.data ?? response?.user ?? response);
          scheduleAutoLogout(storedToken);
        } catch (err) {
          console.error("Failed to restore auth from token", err);
          clearAuth();
        }
      }

      setLoading(false);
    };

    restoreAuth();
    return () => {
      clearLogoutTimer();
    };
  }, []);

  const doLogin = async (identifier: string, password: string, rememberMe = false) => {
    setLoading(true);
    try {
      const res = await apiLogin(identifier, password, rememberMe);
      setToken(res.token);
      setUser(res.data);
      storeAuth(res.token, res.data);
      scheduleAutoLogout(res.token);
    } finally {
      setLoading(false);
    }
  };

  const doSignup = async (
    name: string,
    phone: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    setLoading(true);
    try {
      const res = await apiSignup(name, phone, email, password, confirmPassword);
      setToken(res.token);
      setUser(res.data);
      storeAuth(res.token, res.data);
      scheduleAutoLogout(res.token);
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    setLoading(true);
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error", err);
    }
    clearAuth();
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login: doLogin,
    signup: doSignup,
    logout: doLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loader fullPage message="Preparing your experience..." /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
