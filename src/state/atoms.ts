"use client";
import { CustomSession } from "@/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSession = create<{
  user: CustomSession | Partial<CustomSession> | undefined;
  setUser: (user: CustomSession | Partial<CustomSession>) => void;
}>()(persist(
  (set) => ({
    user: undefined,
    setUser: (user) => set({ user }),
  }),
  {
    name: "session",
  }));