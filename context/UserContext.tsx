"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

type AuthModalMode = "login" | "signup";

interface UserContextType {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode: AuthModalMode) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  authModalOpen: false,
  authModalMode: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
  isAdmin: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const openAuthModal = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider
      value={{ user, loading, isAdmin: isAdmin(user), authModalOpen, authModalMode, openAuthModal, closeAuthModal, signOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
