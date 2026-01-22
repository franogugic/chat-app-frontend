import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "../types/auth.types";
import { authFetch } from "../api/authFetch";
import { logoutRequest } from "../api/auth.api";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (user: User) => {
    setUser(user);
    setIsLoading(false);
  };

  const logout = async () => {
  await logoutRequest();
  setUser(null);
  setIsLoading(false);
};

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await authFetch("/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser({ id: data.id, name: data.name, email: data.mail });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null); 
    } finally {
      setIsLoading(false);
    }
  };
  checkAuth();
}, []);


  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}