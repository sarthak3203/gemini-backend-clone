import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const STORAGE_KEY = "token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));

  const login = useCallback((nextToken) => {
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  const value = useMemo(() => ({ token, login, logout, isAuthed: Boolean(token) }), [token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

