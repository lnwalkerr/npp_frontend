"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  memo,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (userId: number, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = memo(function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem("admin_token");

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    } else {
      // Also check for token in cookies as fallback
      const cookies = document.cookie;
      const tokenMatch = cookies.match(/token=([^;]+)/);
      const cookieToken = tokenMatch ? tokenMatch[1] : null;

      if (cookieToken) {
        setToken(cookieToken);
        setIsAuthenticated(true);
        // Store in localStorage for consistency
        localStorage.setItem("admin_token", cookieToken);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (userId: number, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        const payload = {
          userId: userId,
          password: password,
          platformName: "admin", // hardcoded as requested
          platformToken:
            "$2b$10$jYyUG9kZfbM1KYTZHglwXOJwSXdW9jBP.6ak3YTlD/HJE9DgFXqM2", // hardcoded as requested
          deviceDetail: "postMan", // hardcoded as requested
        };

        const response = await fetch("/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          setToken(data.token);
          setIsAuthenticated(true);
          localStorage.setItem("admin_token", data.token);

          return true;
        } else {
          setIsAuthenticated(false);
          setToken(null);

          return false;
        }
      } catch (error) {
        console.error("Login error:", error);
        setIsAuthenticated(false);
        setToken(null);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }, [router]);

  const value = {
    isAuthenticated,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
});

AuthProvider.displayName = "AuthProvider";
