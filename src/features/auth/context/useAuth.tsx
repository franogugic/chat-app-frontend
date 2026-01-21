import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

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

  // Funkcija za login (kad korisnik unese podatke na formi)
  const login = (user: User) => {
    setUser(user);
    setIsLoading(false);
  };

  // Funkcija za logout
  const logout = () => {
    setUser(null);
    setIsLoading(false);
  };

  // AUTOMATSKA PROVJERA PRI REFRESHU
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5078/api/auth/me", {
          method: "GET",
          credentials: "include", // Šalje HttpOnly kolačiće backendu
        });

        if (res.ok) {
          const data = await res.json();
          // Mapiranje: backend šalje 'mail', ti na frontu koristiš 'email'
          setUser({ 
            id: data.id, 
            name: data.name, 
            email: data.mail 
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Greška pri provjeri sesije:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Prazan niz [] znači da se pokreće samo JEDNOM kod paljenja app-a

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