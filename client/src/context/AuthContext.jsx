import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/api/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    let active = true;

    api.get("/api/auth/me")
      .then(({ data }) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post("/api/auth/login", credentials);
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem("cl_token", data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => {
    const { data } = await api.post("/api/auth/register", details);
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem("cl_token", data.token);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("cl_token");
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}