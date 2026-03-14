"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse } from "@/components/api/auth";

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: AuthResponse["user"] | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  login: (token: string, user: AuthResponse["user"]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthResponse["user"] | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("medilens_token");
    const savedUser = localStorage.getItem("medilens_user");

    // Clear stale mock tokens that won't work with the real backend.
    // Real JWTs are always 3-part dot-separated strings (header.payload.signature).
    if (token && token.startsWith("mock-")) {
      localStorage.removeItem("medilens_token");
      localStorage.removeItem("medilens_user");
      setIsInitialLoad(false);
      return;
    }

    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsInitialLoad(false);

    // Listen for session expiry events triggered by API fetchers (401 Unauthorized)
    const handleAuthExpired = () => {
      setCurrentUser(null);
      setIsAuthModalOpen(true); // Optional: Prompt them to log back in
    };
    window.addEventListener("auth_expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth_expired", handleAuthExpired);
    };
  }, []);

  const login = (token: string, user: AuthResponse["user"]) => {
    localStorage.setItem("medilens_token", token);
    localStorage.setItem("medilens_user", JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("medilens_token");
    localStorage.removeItem("medilens_user");
    setCurrentUser(null);
  };

  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      currentUser,
      isAuthModalOpen,
      setIsAuthModalOpen,
      login,
      logout
    }}>
      {!isInitialLoad && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
