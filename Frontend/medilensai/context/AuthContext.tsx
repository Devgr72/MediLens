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
    // In a real app, you might want to verify the token here
    // For now, we'll assume if there's a token but no user, we might need to fetch user info
    // However, since we don't have a fetchUserProfile API yet, we'll rely on the login process
    // and potentially store user info in localStorage too for persistence across refreshes
    const savedUser = localStorage.getItem("medilens_user");
    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsInitialLoad(false);
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
