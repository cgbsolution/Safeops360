"use client";

import { create } from "zustand";
import type { Industry } from "./industry";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string | null;
  organization_name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: AuthUser | null;
  industry: Industry | null;
  setUser: (u: AuthUser | null) => void;
  setIndustry: (i: Industry | null) => void;
  reset: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  industry: null,
  setUser: (user) => set({ user }),
  setIndustry: (industry) => set({ industry }),
  reset: () => set({ user: null, industry: null }),
}));
